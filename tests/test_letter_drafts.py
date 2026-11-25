"""Exercise generation against a Chat Completions server on the loopback network."""

import json
import tempfile
import threading
import unittest
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from unittest import mock

import server
from test_midautumn import Client


class DraftTest(unittest.TestCase):
    def start_listener(self, handler):
        listener = ThreadingHTTPServer(("127.0.0.1", 0), handler)
        threading.Thread(target=listener.serve_forever, daemon=True).start()
        self.addCleanup(listener.server_close)
        self.addCleanup(listener.shutdown)
        return listener

    def setUp(self):
        directory = tempfile.TemporaryDirectory()
        self.addCleanup(directory.cleanup)
        database = Path(directory.name) / "letters.sqlite3"
        self.deepseek_key_file = database.with_name("deepseek.local.key")
        key_file = mock.patch("letter_drafts.DEEPSEEK_KEY_FILE", self.deepseek_key_file)
        key_file.start()
        self.addCleanup(key_file.stop)
        server.setup(database)

        case = self

        class QuietHandler(server.Handler):
            def log_message(self, *args):
                pass

        class CompletionHandler(BaseHTTPRequestHandler):
            def do_POST(self):
                raw = self.rfile.read(int(self.headers["Content-Length"]))
                case.requests.append((self.path, self.headers.get("Authorization"), json.loads(raw)))
                data = json.dumps({"choices": [case.choice]}, ensure_ascii=False).encode()
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Content-Length", str(len(data)))
                self.end_headers()
                self.wfile.write(data)

            def log_message(self, *args):
                pass

        self.requests = []
        self.choice = {"finish_reason": "stop", "message": {"content": "远方的你，\n\n想跟你说说故乡的茶。"}}
        model = self.start_listener(CompletionHandler)
        app = self.start_listener(QuietHandler)
        app.db_path = database
        self.client = Client(f"http://127.0.0.1:{app.server_port}")
        self.model_env = {
            "SEA_DRAFT_MODEL_URL": f"http://127.0.0.1:{model.server_port}/chat/completions",
            "SEA_DRAFT_MODEL_NAME": "test-draft",
            "SEA_DRAFT_MODEL_KEY": "test-credential",
        }
        self.details = {"title": "故乡的茶", "theme": "家乡风物", "region": "臺南", "tags": ["茶香"]}

    def test_local_key_enables_deepseek_for_letter_drafts(self):
        self.deepseek_key_file.write_text("test-deepseek-key\n", encoding="utf-8")
        with (mock.patch.dict("os.environ", {}, clear=True),
              mock.patch("letter_drafts.chat_completion", return_value=self.choice) as complete):
            state = self.client.call("state")
            self.assertTrue(state["writeAI"])
            self.assertNotIn("test-deepseek-key", json.dumps(state))
            self.assertEqual(self.client.call("generate-draft", self.details),
                             {"body": self.choice["message"]["content"]})
            endpoint, key, payload = complete.call_args.args
            self.assertEqual(endpoint, "https://api.deepseek.com/chat/completions")
            self.assertEqual(key, "test-deepseek-key")
            self.assertEqual(payload["model"], "deepseek-flash")
            self.assertEqual(payload["thinking"], {"type": "disabled"})

    def test_preview_uses_only_letter_details_and_does_not_publish(self):
        with mock.patch.dict("os.environ", self.model_env, clear=True):
            state = self.client.call("state")
            self.assertTrue(state["writeAI"])
            self.assertNotIn("test-credential", json.dumps(state))
            result = self.client.call("generate-draft", {
                **self.details, "body": "已有私密草稿", "quoteText": "引用正文", "coverData": "封面",
            })
            path, authorization, payload = self.requests.pop()
            self.assertEqual(path, "/chat/completions")
            self.assertEqual(authorization, "Bearer test-credential")
            self.assertEqual(payload["model"], "test-draft")
            self.assertEqual(json.loads(payload["messages"][-1]["content"]),
                             {**self.details, "region": "台湾台南"})
            self.assertEqual(result, {"body": self.choice["message"]["content"]})
            self.assertEqual(self.client.call("state")["mine"], [])

    def test_notebook_draft_uses_the_server_topic_and_no_existing_content(self):
        with mock.patch.dict("os.environ", self.model_env, clear=True):
            self.client.call("notebooks/generate-draft", {"notebook":"missing","title":"茶"}, 404)
            payload = {"notebook":"moon","title":"看月亮","region":"泉州","tags":["月亮"],
                       "theme":"客户端主题","body":"旧正文","media":"私有附件","quote":"手账引文"}
            result = self.client.call("notebooks/generate-draft", payload)
            _, _, model_request = self.requests.pop()
            self.assertIn("中文主题手账",model_request["messages"][0]["content"])
            self.assertEqual(json.loads(model_request["messages"][1]["content"]),
                             {"title":"看月亮","theme":"同一片月光","region":"泉州","tags":["月亮"]})
            self.assertEqual(result["body"],self.choice["message"]["content"])
            self.assertEqual(self.client.call("notebooks")["mine"],[])

    def test_validation_disabled_model_and_incomplete_output(self):
        with mock.patch.dict("os.environ", {}, clear=True):
            self.assertFalse(self.client.call("state")["writeAI"])
            self.client.call("generate-draft", self.details, 503)
        with mock.patch.dict("os.environ", self.model_env, clear=True):
            self.client.call("generate-draft", {**self.details, "title": " "}, 400)
            self.client.call("generate-draft", {**self.details, "region": "私密地址"}, 400)
            self.client.call("generate-draft", {**self.details, "tags": [str(i) for i in range(6)]}, 400)
            self.assertEqual(self.requests, [])
            self.choice["finish_reason"] = "length"
            self.client.call("generate-draft", self.details, 502)
        tag_env = {key.replace("DRAFT", "TAG"): value for key, value in self.model_env.items()}
        self.choice["finish_reason"] = "stop"
        with mock.patch.dict("os.environ", tag_env, clear=True):
            self.assertTrue(self.client.call("state")["writeAI"])
            self.client.call("generate-draft", {**self.details, "region": ""})
            self.assertEqual(json.loads(self.requests[-1][2]["messages"][-1]["content"])["region"], "")
