"""Generate an editable letter from the four fields the writer selected."""

import json
import os
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlsplit

from model_api import chat_completion
from moon_workshop import ApiError


DEEPSEEK_KEY_FILE = Path(__file__).resolve().parent / "data" / "deepseek.local.key"


def _settings():
    draft_url = os.environ.get("SEA_DRAFT_MODEL_URL", "").strip()
    draft_model = os.environ.get("SEA_DRAFT_MODEL_NAME", "").strip()
    if draft_url or draft_model:
        return draft_url, draft_model, os.environ.get("SEA_DRAFT_MODEL_KEY", "").strip()
    try:
        deepseek_key = DEEPSEEK_KEY_FILE.read_text(encoding="utf-8").strip()
    except FileNotFoundError:
        deepseek_key = ""
    except (OSError, UnicodeError):
        return "", "", ""
    if deepseek_key:
        return "https://api.deepseek.com/chat/completions", "deepseek-flash", deepseek_key
    return (os.environ.get("SEA_TAG_MODEL_URL", "").strip(),
            os.environ.get("SEA_TAG_MODEL_NAME", "").strip(),
            os.environ.get("SEA_TAG_MODEL_KEY", "").strip())


def configured():
    endpoint, model, _ = _settings()
    return bool(endpoint and model)


def generate(details, *, notebook=False):
    endpoint, model, key = _settings()
    if not endpoint or not model:
        raise ApiError(503, "AI 正文生成尚未配置。请按项目 README 配置模型后重启服务。")

    notebook_instruction = (
        "为「海上手账」的一位参与者起草一页中文主题手账。"
        "用输入 JSON 的标题、手账主题、公开地域和文化标签构思正文。"
        "写 250 到 450 字，分成几段，语气自然，像一页可供作者编辑补充的笔记。"
        "直接输出正文，使用手账的叙述方式，不使用书信称呼、落款、重复标题或 Markdown。"
        "不要把推测写成作者真实经历，不能编造姓名、身份、联系方式或地方文化史实。"
    )
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": notebook_instruction if notebook else (
                "为「海上有信」的写信人起草一封面向远方读者的中文书信。"
                "把输入 JSON 中的标题、主题、公开地域和文化标签作为写作素材。"
                "写 250 到 450 字，语气自然，分成几段，留出可以由作者补充真实细节的空间。"
                "直接输出书信正文，可有称呼和结语。不要重复标题，不要输出 Markdown、分析或署名。"
                "不要编造写信人的姓名、身份、联系方式、具体经历或地方文化史实。"
            )},
            {"role": "user", "content": json.dumps(details, ensure_ascii=False)},
        ],
        "max_tokens": 1800,
        "stream": False,
    }
    try:
        if urlsplit(endpoint).hostname == "api.deepseek.com":
            payload["thinking"] = {"type": "disabled"}
        choice = chat_completion(endpoint, key, payload, timeout=35)
        body = choice["message"]["content"]
        if not isinstance(body, str) or choice.get("finish_reason") not in {None, "stop"}:
            raise ValueError("Missing or incomplete letter")
        body = body.strip()
        if not body or len(body.encode("utf-16-le")) // 2 > 5000:
            raise ValueError("Invalid letter length")
    except HTTPError as exc:
        if exc.code in {401, 403}:
            raise ApiError(502, "模型服务未通过认证。请核对服务端 API Key 和模型权限。") from None
        if exc.code == 402:
            raise ApiError(502, "模型服务余额不足。请检查账户余额后重试。") from None
        if exc.code == 429:
            raise ApiError(429, "模型服务请求较多，请稍后再试。") from None
        raise ApiError(502, "模型服务暂时不可用，请稍后再试。") from None
    except (TimeoutError, URLError):
        raise ApiError(502, "暂时连不上模型服务，请稍后再试。") from None
    except (OSError, ValueError, KeyError, IndexError, TypeError, OverflowError, RecursionError):
        message = "模型未返回完整的手账正文，请重试。" if notebook else "模型未返回完整的书信正文，请重试。"
        raise ApiError(502, message) from None
    return {"body": body}
