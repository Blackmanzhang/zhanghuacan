import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
from urllib.parse import parse_qs, urlsplit

import amap_api
from moon_workshop import ApiError


class AMapApiTest(unittest.TestCase):
    def setUp(self):
        directory = tempfile.TemporaryDirectory()
        self.addCleanup(directory.cleanup)
        self.key, self.code = "a" * 32, "b" * 32
        self.config = Path(directory.name) / "amap.local.json"
        self.config.write_text(json.dumps({"key": self.key, "securityCode": self.code}))
        patcher = patch.object(amap_api, "CONFIG_FILE", self.config)
        patcher.start()
        self.addCleanup(patcher.stop)
        self.path = amap_api.PROXY_PREFIX + "v3/assistant/coordinate/convert"

    def test_browser_receives_key_only(self):
        self.assertEqual(amap_api.browser_config(), {"key": self.key})
        self.config.unlink()
        with self.assertRaises(ApiError) as error:
            amap_api.browser_config()
        self.assertEqual(error.exception.status, 503)

    def test_proxy_keeps_the_secret_server_side(self):
        with patch.object(amap_api, "HTTPSConnection") as https:
            upstream = https.return_value.getresponse.return_value.__enter__.return_value
            upstream.status = 200
            upstream.read.return_value = b'amap.callback({"info":"OK"})'
            response, mime = amap_api.proxy(
                self.path, f"key={self.key}&jscode=ignore&callback=amap.callback",
                {"Host": "localhost:8765", "Referer": "http://localhost:8765/atlas-map.html"},
            )
            https.assert_called_once_with("restapi.amap.com", timeout=8)
            request = https.return_value.request.call_args
            self.assertEqual(request.args[0], "GET")
            self.assertEqual(urlsplit(request.args[1]).path, "/v3/assistant/coordinate/convert")
            self.assertEqual(parse_qs(urlsplit(request.args[1]).query), {
                "key": [self.key], "jscode": [self.code], "callback": ["amap.callback"],
            })
            self.assertEqual(request.kwargs["headers"]["Referer"], "http://localhost:8765/")
            self.assertEqual(mime, "application/javascript; charset=utf-8")
            self.assertNotIn(self.code.encode(), response)
            upstream.read.return_value = self.code.encode()
            with self.assertRaises(ApiError) as error:
                amap_api.proxy(self.path, "", {})
            self.assertEqual(error.exception.status, 502)

    def test_rejects_unrelated_paths_and_cross_site_requests(self):
        with patch.object(amap_api, "HTTPSConnection") as https:
            for path, query, headers, status in (
                (amap_api.PROXY_PREFIX + "v3/place/text", "", {}, 404),
                (self.path, "", {"Sec-Fetch-Site": "cross-site"}, 403),
                (self.path, "key=unconfigured", {}, 403),
                (self.path, "callback=alert%281%29", {}, 400),
            ):
                with self.subTest(path=path, status=status), self.assertRaises(ApiError) as error:
                    amap_api.proxy(path, query, headers)
                self.assertEqual(error.exception.status, status)
            https.assert_not_called()
