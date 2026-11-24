"""On-demand label suggestions for public-letter drafts. No external dependencies."""

import ipaddress
import json
import os
import re
import urllib.error
import urllib.request
from urllib.parse import urlsplit


# Specific labels precede broad terms in a tie. Repeat mentions do not inflate scores.
VOCABULARY = {
    "面线": ("面线", "麵線", "面線", "麵线"),
    "红龟粿": ("红龟粿", "紅龜粿", "红龟糕"),
    "九层塔": ("九层塔", "九層塔", "罗勒", "羅勒"),
    "南音": ("南音", "南管", "南曲"),
    "闽南语": ("闽南语", "閩南語", "闽南话", "閩南話", "泉州话", "泉州話"),
    "元宵": ("元宵", "灯谜", "燈謎", "灯会", "燈會", "蜂炮"),
    "中秋": ("中秋", "月饼", "月餅", "赏月", "賞月"),
    "端午": ("端午", "龙舟", "龍舟", "粽子"),
    "春节": ("春节", "春節", "过年", "過年", "年夜饭", "年夜飯"),
    "灯笼": ("灯笼", "燈籠", "糊灯纸", "糊燈紙"),
    "海港": ("渡船", "码头", "碼頭", "港口", "汽笛", "渔港", "漁港"),
    "茶事": ("茶山", "茶园", "茶園", "泡茶", "茶叶", "茶葉", "茶篓", "茶簍", "采茶"),
    "方言": ("方言", "乡音", "鄉音", "童谣", "童謠", "母语", "母語"),
    "骑楼": ("骑楼", "騎樓"),
    "小贩文化": ("小贩", "小販", "熟食中心"),
    "家常饮食": ("食谱", "食譜", "配方", "煮面", "煮麵", "饭桌", "飯桌", "餐桌", "煎蛋", "厨房", "廚房"),
    "园艺": ("盆栽", "扦插", "花盆", "菜园", "菜園", "种花", "種花"),
    "家族记忆": ("外婆", "外公", "阿嬷", "阿嬤", "祖母", "爷爷", "爺爺", "奶奶", "阿公"),
    "手艺": ("手艺", "手藝", "竹编", "竹編", "剪纸", "剪紙", "刺绣", "刺繡"),
    "异乡生活": ("异乡", "異鄉", "离家", "離家", "时差", "時差", "海外"),
}


def local_tags(title, body):
    ranked = []
    for label, variants in VOCABULARY.items():
        score = sum(3 * (term in title) + (term in body) for term in variants)
        if score:
            ranked.append((score, label))
    ranked.sort(key=lambda item: -item[0])
    return [label for _, label in ranked[:5]]


def _fallback(title, body, notice=""):
    return {"tags": local_tags(title, body), "source": "local", "sourceLabel": "本地词表", "notice": notice}


class _DirectEndpoint(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *args):
        return None


def _model_tags(endpoint, model, title, body):
    url = urlsplit(endpoint)
    try:
        local = url.hostname == "localhost" or ipaddress.ip_address(url.hostname or "").is_loopback
    except ValueError:
        local = False
    if not url.hostname or url.username or url.password or url.fragment or (
            url.scheme != "https" and not (url.scheme == "http" and local)):
        raise ValueError("Invalid model service URL")
    headers = {"Content-Type": "application/json", "Accept": "application/json"}
    api_key = os.environ.get("SEA_TAG_MODEL_KEY")
    if api_key:
        headers["Authorization"] = "Bearer " + api_key
    messages = [
        {"role": "system", "content": "只为所给书信提取文中明确涉及的文化元素。返回一个 JSON 对象，"
         "格式为 {\"tags\":[\"标签\"]}。零至五项，每项一至十二字。不要生成介绍、姓名或地址。"},
        {"role": "user", "content": json.dumps({"title": title, "body": body}, ensure_ascii=False)},
    ]
    request = urllib.request.Request(endpoint, data=json.dumps({
        "model": model, "messages": messages, "temperature": 0, "max_tokens": 160,
    }).encode("utf-8"), headers=headers, method="POST")
    with urllib.request.build_opener(_DirectEndpoint()).open(request, timeout=8) as response:
        raw = response.read(65537)
    if len(raw) > 65536:
        raise ValueError("Oversized model response")
    content = json.loads(raw)["choices"][0]["message"]["content"]
    if not isinstance(content, str):
        raise ValueError("Invalid model response")
    content = re.sub(r"^\x60\x60\x60(?:json)?\s*|\s*\x60\x60\x60$", "", content.strip(), flags=re.I)
    tags = json.loads(content)["tags"]
    if not isinstance(tags, list):
        raise ValueError("Invalid model labels")
    return list(dict.fromkeys(t.strip() for t in tags if isinstance(t, str)
                              and re.fullmatch(r"[\w· -]{1,12}", t.strip()) and t.strip()))[:5]


def suggest_tags(data):
    """Suggest labels only. Draft text and suggestions are never written to disk."""
    if not isinstance(data, dict):
        raise ValueError("请提交书信的标题或正文。")
    title, body, allow = data.get("title", ""), data.get("body", ""), data.get("allowModel", False)
    if not isinstance(title, str) or not isinstance(body, str) or type(allow) is not bool:
        raise ValueError("标题、正文或模型授权格式有误。")
    if len(title) > 100 or len(body) > 5000:
        raise ValueError("标题最多 100 字，正文最多 5000 字。")
    if not (title.strip() or body.strip()):
        return _fallback(title, body, "先写下几句，再识别文化元素。")
    if not allow:
        return _fallback(title, body)
    endpoint = os.environ.get("SEA_TAG_MODEL_URL", "").strip()
    model = os.environ.get("SEA_TAG_MODEL_NAME", "").strip()
    if not endpoint or not model:
        return _fallback(title, body, "本站尚未配置模型，本次使用本地词表。")
    try:
        tags = _model_tags(endpoint, model, title, body)
    except (OSError, ValueError, KeyError, IndexError, TypeError, OverflowError, RecursionError):
        return _fallback(title, body, "模型暂时无法返回标签，本次使用本地词表。")
    return {"tags": tags, "source": "model", "sourceLabel": "模型建议", "notice": ""}
