"""Shared transport for the site's Chat Completions endpoints."""

import ipaddress
import json
import urllib.request
from urllib.parse import urlsplit


class _DirectEndpoint(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *args):
        return None


def chat_completion(endpoint, api_key, payload, *, timeout):
    url = urlsplit(endpoint)
    try:
        loopback = url.hostname == "localhost" or ipaddress.ip_address(url.hostname or "").is_loopback
    except ValueError:
        loopback = False
    if (not url.hostname or url.username or url.password or url.fragment
            or (url.scheme != "https" and not (url.scheme == "http" and loopback))):
        raise ValueError("Invalid model service URL")

    headers = {"Content-Type": "application/json", "Accept": "application/json"}
    if api_key:
        headers["Authorization"] = "Bearer " + api_key
    request = urllib.request.Request(
        endpoint, data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
        headers=headers, method="POST",
    )
    with urllib.request.build_opener(_DirectEndpoint()).open(request, timeout=timeout) as response:
        raw = response.read(65537)
    if len(raw) > 65536:
        raise ValueError("Oversized model response")
    return json.loads(raw)["choices"][0]
