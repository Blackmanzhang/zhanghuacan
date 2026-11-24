"""Integration coverage for independently uploaded covers and letter attachments."""
import base64
import pathlib
import tempfile
import threading
import unittest
from contextlib import closing

import moon_workshop
import server
from test_midautumn import Client


class StationeryTest(unittest.TestCase):
    def setUp(self):
        tmp = tempfile.TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        self.path = pathlib.Path(tmp.name) / "letters.sqlite3"
        server.setup(self.path)

        class Quiet(server.Handler):
            def log_message(self, *args):
                pass

        listener = server.ThreadingHTTPServer(("127.0.0.1", 0), Quiet)
        listener.db_path = self.path
        threading.Thread(target=listener.serve_forever, daemon=True).start()
        self.addCleanup(listener.server_close)
        self.addCleanup(listener.shutdown)
        url = "http://127.0.0.1:" + str(listener.server_port)
        self.author, self.reader, self.mod = (Client(url) for _ in range(3))

    def test_independent_cover_and_audio_follow_letter_visibility(self):
        png = (server.PUBLIC / "art" / "wave.png").read_bytes()
        wav = b"RIFF" + bytes(4) + b"WAVE" + bytes(32)
        def upload(mime, data):
            return {"url": "data:" + mime + ";base64," + base64.b64encode(data).decode("ascii")}

        payload = {"title":"封面测试", "body":"沿岸的声音", "art":"harbor", "paper":"ledger", "stamp":"beacon",
                   "cover":upload("image/png", png), "media":upload("audio/wav", wav)}
        self.author.call("letters", {**payload, "cover":payload["media"]}, 400)
        self.author.call("letters", {**payload, "paper":"unknown"}, 400)
        post = self.author.call("letters", payload)["id"]
        mine = self.author.call("state")["mine"][0]
        self.assertEqual((mine["art"], mine["paper"], mine["stamp"]), ("harbor","ledger","beacon"))
        self.assertEqual(mine["coverUrl"], "/api/covers/" + post)
        self.assertEqual(mine["media"]["type"], "audio")
        self.assertEqual(self.author.call("covers/"+post), png)
        self.reader.call("covers/"+post, status=404)
        self.reader.call("admin/covers/"+post, status=403)
        with closing(server.connect(self.path)) as db, db:
            token = moon_workshop.create_token(db)
        self.mod.call("admin/login", {"token":token})
        item = next(i for i in self.mod.call("admin/queue")["items"] if i["id"] == post)
        self.assertEqual(item["coverUrl"], "/api/admin/covers/"+post)
        self.assertEqual(self.mod.call("admin/covers/"+post), png)
        self.mod.call("admin/review", {"id":post, "decision":"approve"})
        self.assertEqual(self.reader.call("covers/"+post), png)
        self.assertEqual(self.reader.call("media/"+post), wav)
        self.mod.call("admin/covers/"+post, status=404)
        self.author.call("withdraw", {"letterId":post})
        self.reader.call("covers/"+post, status=404)
        self.reader.call("media/"+post, status=404)
