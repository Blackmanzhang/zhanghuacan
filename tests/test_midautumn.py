"""Run from the project folder: python -m unittest discover -s tests"""

import concurrent.futures
import contextlib
import http.cookiejar
import io
import json
import pathlib
import tempfile
import threading
import unittest
from unittest import mock
import urllib.error
import urllib.request

import server
import moon_workshop
import culture_tags


class Client:
    def __init__(self, origin):
        self.origin = origin
        self.opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))

    def call(self, path, data=None, status=200):
        request = urllib.request.Request(self.origin+"/api/"+path,
            data=None if data is None else json.dumps(data).encode(), headers={"Content-Type":"application/json"})
        try:
            response = self.opener.open(request)
        except urllib.error.HTTPError as exc:
            response = exc
        with response:
            body = response.read()
            if response.status != status:
                raise AssertionError((path,response.status,status,body))
            return json.loads(body) if response.headers.get_content_type()=="application/json" else body

class MidAutumnTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.path = pathlib.Path(self.tmp.name)/"test.sqlite3"
        server.setup(self.path)

        class Quiet(server.Handler):
            def log_message(self, *args):
                pass
        listener = server.ThreadingHTTPServer(("127.0.0.1",0),Quiet)
        listener.db_path=self.path
        thread=threading.Thread(target=listener.serve_forever,daemon=True)
        thread.start()
        self.addCleanup(listener.server_close)
        self.addCleanup(listener.shutdown)
        base = "http://127.0.0.1:"+str(listener.server_port)
        self.a,self.b,self.mod = (Client(base) for _ in range(3))
        self.aid=self.a.call("state")["me"]["id"]
        self.bid=self.b.call("state")["me"]["id"]

    def cli(self, key, approve=True):
        with contextlib.redirect_stdout(io.StringIO()):
            server.admin_review(self.path,key if approve else None,None if approve else key)

    def token(self):
        with contextlib.closing(server.connect(self.path)) as db,db:
            return moon_workshop.create_token(db)

    def test_migrate_existing_db(self):
        old = pathlib.Path(self.tmp.name)/"prior.sqlite3"
        with contextlib.closing(server.connect(old)) as db,db:
            db.executescript(server.SCHEMA)
            db.executemany("INSERT INTO users(id,name,region,demo) VALUES(?,?,?,1)",server.PEOPLE)
            password = "33"*16 + ":" + server.hash_password("example-pass","33"*16)
            db.execute("INSERT INTO users(id,name,region,password) VALUES('original','老用户','福建',?)",(password,))
            db.execute("""INSERT INTO letters(id,author,title,body,region,theme,art,created,is_open,exhibit,status)
                VALUES('existing','original','已有来信','保留内容','福建','家乡风物','wave','2025-05-01',1,0,'published')""")
            db.execute("INSERT INTO messages VALUES('original-message','existing','original','qiu','私人回信','2025-05-02')")
        server.setup(old)
        server.setup(old)
        with contextlib.closing(server.connect(old)) as db:
            user=db.execute("SELECT * FROM users WHERE id='original'").fetchone()
            result=server.state(db,user)
            self.assertEqual(user["password"],password)
            self.assertEqual(result["mine"][0]["body"],"保留内容")
            self.assertEqual(result["mine"][0]["tags"],[])
            self.assertEqual(result["inbox"][0]["body"],"私人回信")
            self.assertNotIn("workshop",result)
            self.assertEqual(db.execute("SELECT count(*) FROM scroll_panels").fetchone()[0],10)

    def test_retired_workshop_and_independent_notebook_pages(self):
        self.a.call("workshop/claim", {"panelId":"m2"}, 404)
        self.a.call("workshop/submit", {"panelId":"m2"}, 404)
        previous = self.b.call("notebooks/book/moon")["pages"][-1]["number"]
        template = {"notebook":"moon","body":"跨海的中秋记忆","exhibit":True}
        def submit(client, title):
            return client.call("notebooks/submit", {**template,"title":title})["id"]
        with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
            first, second = list(pool.map(lambda pair: submit(*pair),
                                          [(self.a,"第一张手账"),(self.b,"第二张手账")]))
        self.mod.call("notebooks/page/"+first, status=404)
        self.mod.call("admin/login", {"token":self.token()})
        ids = [row["id"] for row in self.mod.call("admin/queue")["items"]]
        self.assertCountEqual(ids,[first,second])
        self.cli(second)
        self.mod.call("admin/review", {"id":first,"decision":"approve"})
        pages = self.mod.call("notebooks/book/moon")["pages"]
        self.assertEqual([(row["id"],row["number"]) for row in pages[-2:]],[(second,previous+1),(first,previous+2)])
        self.a.call("notebooks/withdraw", {"id":first})
        self.b.call("notebooks/page/"+first, status=404)

    def test_quote_tags_permissions_and_moderation(self):
        self.a.call("account",{"name":"测试甲","password":"test-pass-a","region":"臺南市"})
        raw=self.a.call("letters",{"title":"原信","body":"一颗柚子，分给全家。","region":"福建·泉州"})
        self.cli(raw["id"])
        post={"parentId":raw["id"],"title":"回应","body":"我家的做法","tags":["柚子","中秋"],
              "paper":"peach","stamp":"moon","quote":{"text":"一颗柚子，分给全家。"}}
        self.b.call("letters",{**post,"quote":{"text":"伪造引文"}},400)
        self.b.call("letters",{**post,"tags":["x"]*6},400)
        self.b.call("letters",{**post,"quote":{"text":"一颗柚子","sourceId":"r1"}},400)
        # This tiny PNG is used only to check the authorization boundary of the attachment routes.
        png="iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg=="
        child=self.b.call("letters",{**post,"media":{"type":"image","url":"data:image/png;base64,"+png}})["id"]
        self.mod.call("admin/queue",status=403)
        self.a.call("media/"+child,status=404)
        self.a.call("admin/media/"+child,status=403)
        value=self.token()
        self.mod.call("admin/login",{"token":value})
        self.a.call("admin/login",{"token":value},403)
        self.assertEqual(self.mod.call("admin/queue")["items"][0]["id"],child)
        self.assertTrue(self.mod.call("admin/media/"+child).startswith(b"\x89PNG"))
        self.mod.call("admin/review",{"id":child,"decision":"approve"})
        self.mod.call("admin/review",{"id":child,"decision":"approve"},409)
        self.mod.call("admin/review",{"id":child,"decision":"reject"},409)
        self.assertEqual(self.mod.call("admin/history")["items"][0]["id"],child)
        read=lambda:next(l for l in self.a.call("state")["letters"] if l["id"]==child)
        self.assertEqual(read()["quote"],{"sourceId":raw["id"],"text":post["quote"]["text"]})
        self.assertEqual((read()["paper"],read()["stamp"],read()["tags"]),("peach","moon",["柚子","中秋"]))
        self.a.call("withdraw",{"letterId":raw["id"]})
        self.assertIsNone(read()["quote"])
        self.assertNotIn("一颗柚子，分给全家。",json.dumps(self.b.call("state"),ensure_ascii=False))
        self.mod.call("admin/logout",{})
        self.mod.call("admin/history",status=403)
        self.assertEqual(server.regional("臺南市"),("台湾台南","台湾"))
        self.assertEqual(server.regional("福建·泉州"),("福建泉州","大陆"))

    def test_guest_logout_preserves_identity_and_region_input(self):
        self.a.call("logout", {})
        self.assertEqual(self.a.call("state")["me"]["id"], self.aid)
        template = {"title":"中秋记忆", "body":"故乡的月色。"}
        self.a.call("letters", {**template, "region":"未识别的城市"}, 400)
        self.a.call("letters", {**template, "region":"馬來西亞檳城"})
        self.assertEqual(self.a.call("state")["mine"][-1]["region"], "马来西亚槟城")
        self.assertEqual(server.regional("台灣省臺南市"), ("台湾台南","台湾"))

    def test_model_consent_and_manual_labels(self):
        data = {"title":"记忆里的中秋","body":"外婆把一块月饼分给大家。"}
        with mock.patch.dict("os.environ", {
            "SEA_TAG_MODEL_URL":"http://127.0.0.1:1111/model",
            "SEA_TAG_MODEL_NAME":"test",
        }), mock.patch.object(culture_tags, "_model_tags", return_value=["团圆"]) as model:
            local = self.a.call("suggest-tags", data)
            self.assertEqual(local["source"], "local")
            self.assertIn("中秋", local["tags"])
            model.assert_not_called()
            result = self.a.call("suggest-tags", {**data,"allowModel":True})
            self.assertEqual((result["source"],result["tags"]), ("model",["团圆"]))
            model.side_effect=TimeoutError()
            fallback=self.a.call("suggest-tags",{**data,"allowModel":True})
            self.assertEqual(fallback["source"],"local")
            self.assertTrue(fallback["notice"])
        self.assertEqual(self.a.call("state")["mine"],[])


if __name__ == "__main__":
    unittest.main()
