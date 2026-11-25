"""Serve the atlas browser key and proxy the AMap requests used by the atlas."""

import json
import re
from contextlib import closing
from http.client import HTTPException, HTTPSConnection
from pathlib import Path
from urllib.parse import parse_qsl, urlencode, urlsplit

from moon_workshop import ApiError


PROXY_PREFIX = "/_AMapService/"
CONFIG_FILE = Path(__file__).resolve().parent / "data" / "amap.local.json"
AMAP_HOST = "restapi.amap.com"
ENDPOINTS = {"v3/log/init", "v3/assistant/coordinate/convert"}
MAX_RESPONSE = 256 * 1024


def _settings():
    try:
        config = json.loads(CONFIG_FILE.read_text(encoding="utf-8"))
        key, code = config["key"].strip(), config["securityCode"].strip()
        if all(re.fullmatch(r"[a-fA-F0-9]{32}", value) for value in (key, code)):
            return key, code
    except (OSError, ValueError, KeyError, TypeError, AttributeError):
        pass
    raise ApiError(503, "请在服务端配置高德地图的 Web 端 Key 和安全密钥。")


def browser_config():
    key, _ = _settings()
    return {"key": key}


def proxy(path, query, request_headers):
    endpoint = path.removeprefix(PROXY_PREFIX)
    if endpoint not in ENDPOINTS:
        raise ApiError(404, "找不到这个地图接口。")
    if request_headers.get("Sec-Fetch-Site") not in {None, "same-origin"}:
        raise ApiError(403, "地图请求来源不匹配。")
    try:
        if len(query) > 4096:
            raise ValueError()
        params = parse_qsl(query, keep_blank_values=True, max_num_fields=40)
    except ValueError:
        raise ApiError(400, "地图请求参数无效。") from None

    key, code = _settings()
    if any(name == "key" and value != key for name, value in params):
        raise ApiError(403, "地图请求 Key 不匹配。")
    callbacks = [value for name, value in params if name == "callback"]
    if callbacks and (
        len(callbacks) != 1
        or len(callbacks[0]) > 120
        or not re.fullmatch(r"[A-Za-z_$][\w$]*(\.[A-Za-z_$][\w$]*)*", callbacks[0], re.ASCII)
    ):
        raise ApiError(400, "地图回调参数无效。")

    referer = urlsplit(request_headers.get("Referer", ""))
    headers = {"Accept": "*/*"}
    if referer.scheme in {"http", "https"} and referer.netloc == request_headers.get("Host"):
        headers["Referer"] = f"{referer.scheme}://{referer.netloc}/"
    forwarded = [(name, value) for name, value in params if name != "jscode"]
    if not any(name == "key" for name, _ in forwarded):
        forwarded.append(("key", key))
    forwarded.append(("jscode", code))

    try:
        with closing(HTTPSConnection(AMAP_HOST, timeout=8)) as connection:
            connection.request("GET", "/" + endpoint + "?" + urlencode(forwarded), headers=headers)
            with connection.getresponse() as response:
                if response.status != 200:
                    raise ApiError(502, "高德地图服务暂时不可用。")
                body = response.read(MAX_RESPONSE + 1)
    except (OSError, HTTPException):
        raise ApiError(502, "高德地图服务暂时不可用。") from None
    if len(body) > MAX_RESPONSE or code.encode("ascii") in body:
        raise ApiError(502, "高德地图响应无效。")

    mime = "application/javascript" if callbacks else "application/json"
    return body, mime + "; charset=utf-8"
