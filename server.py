"""海上有信 · local, dependency-free application server."""

import argparse
import base64
import binascii
import getpass
import hashlib
import hmac
import json
import mimetypes
import re
import secrets
import sqlite3
import time
import unicodedata
from contextlib import closing
from datetime import datetime, timedelta, timezone
from http.cookies import SimpleCookie, CookieError
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit
import moon_workshop as workshop
from moon_workshop import ApiError


HERE = Path(__file__).resolve().parent
PUBLIC = HERE / "public"
DEFAULT_DB = HERE / "data" / "letters.sqlite3"
ART = {"wave", "lantern", "mountain", "leaf", "boat", "moon"}
COVER_ART = ART | {"harbor", "postdesk", "sampan", "courtyard"}
PAPERS = {"ivory", "sea", "peach", "ledger", "rice", "tide", "linen"}
STAMPS = {"moon", "sail", "flower", "beacon", "postmark", "junk", "window"}
SESSION_SECONDS = 60 * 60 * 24 * 30
MAX_MEDIA = 4 * 1024 * 1024
MAX_COVER = 2 * 1024 * 1024
MAX_REQUEST = 9 * 1024 * 1024
FALLBACK_HASH = "00" * 16 + ":" + "00" * 32


def now():
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def new_id(prefix):
    return prefix + "_" + secrets.token_hex(12)


def connect(path):
    db = sqlite3.connect(path, timeout=10)
    db.row_factory = sqlite3.Row
    db.execute("PRAGMA foreign_keys = ON")
    return db


SCHEMA = """
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY, name TEXT UNIQUE NOT NULL COLLATE NOCASE,
    region TEXT NOT NULL DEFAULT '', password TEXT, demo INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id),
    expires INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS letters (
    id TEXT PRIMARY KEY, parent_id TEXT REFERENCES letters(id),
    author TEXT NOT NULL REFERENCES users(id), title TEXT NOT NULL, body TEXT NOT NULL,
    region TEXT NOT NULL, theme TEXT NOT NULL, art TEXT NOT NULL, created TEXT NOT NULL,
    is_open INTEGER NOT NULL, exhibit INTEGER NOT NULL, status TEXT NOT NULL,
    mime TEXT, attachment BLOB, drift TEXT NOT NULL DEFAULT 'free'
);
CREATE TABLE IF NOT EXISTS letter_covers (
    letter_id TEXT PRIMARY KEY REFERENCES letters(id) ON DELETE CASCADE,
    mime TEXT NOT NULL, content BLOB NOT NULL
);
CREATE INDEX IF NOT EXISTS letters_parent ON letters(parent_id);
CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY, letter_id TEXT NOT NULL REFERENCES letters(id),
    sender TEXT NOT NULL REFERENCES users(id), recipient TEXT NOT NULL REFERENCES users(id),
    body TEXT NOT NULL, created TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS messages_recipient ON messages(recipient);
CREATE TABLE IF NOT EXISTS favorites (
    user_id TEXT NOT NULL REFERENCES users(id), letter_id TEXT NOT NULL REFERENCES letters(id),
    PRIMARY KEY (user_id, letter_id)
);
CREATE TABLE IF NOT EXISTS reports (
    user_id TEXT NOT NULL REFERENCES users(id), letter_id TEXT NOT NULL REFERENCES letters(id),
    reason TEXT NOT NULL, created TEXT NOT NULL, resolved INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (user_id, letter_id)
);
"""


# Editorial sample letters; all author names and exchanges are fictional.
PEOPLE = [
    ("qiu", "阿秋", "福建泉州"), ("he", "禾禾", "台湾台南"), ("yun", "林予安", "新加坡"),
    ("xu", "小屿", "福建厦门"), ("lin", "林间", "马来西亚"), ("ye", "叶青", "台湾台中"),
    ("song", "闻潮", "浙江宁波"), ("zhou", "舟舟", "加拿大"), ("lu", "阿鹿", "广东潮州"),
]
SEEDS = [
    ("r1", None, "qiu", "记忆里，那碗热腾腾的面线", "家乡风物", "wave",
     "在泉州，清晨是从巷口那锅面线糊醒来的。外公总把油条掰成小段，等我自己一块块浸进去。油条软了，胡椒的香味才慢慢浮上来。\n\n离家以后我试过照着做，味道却总差一点。后来才发现，少的是那张矮桌，还有对面催我趁热吃的人。你家也有这样一碗面吗？"),
    ("r2", None, "he", "外婆家的灯，又亮了", "节日习俗", "lantern",
     "元宵前一天，外婆翻出一对旧灯笼。纸面掉了色，竹骨上还留着我小时候用铅笔写歪的名字。她把灯挂回门口，说这样走夜路的人就知道快到家了。\n\n今年我第一次自己糊灯纸。点灯的时候，隔着巷子看见邻居家的红光，我忽然懂了外婆说的那个“家”。"),
    ("r3", None, "yun", "在异乡，种下一盆九层塔", "海外日常", "leaf",
     "厨房窗台只有一掌宽，刚好放得下一盆九层塔。扦插的第一周我每天去看，直到杯底探出一根细白的根，才敢跟妈妈说它活了。\n\n下班回家摘两片叶子放进煎蛋里，整个房间都是小时候的味道。这是我在新城市学会的第一种安家方法。"),
    ("r4", None, "xu", "渡船靠岸前的那声汽笛", "家乡风物", "boat",
     "从鼓浪屿回厦门的渡船快到岸时，汽笛总会响一下。小时候我以为那是在叫岸上的家人来接。如今我也成了接人的那个，会在码头栏杆旁多等一阵，看白色的船慢慢靠近。\n\n想知道你们那里的港口，又是什么声音？"),
    ("r5", None, "ye", "山路尽头的那一盏茶", "家乡风物", "mountain",
     "阿公背着茶篓上坡，我跟在后面数石阶。后来他的步子慢下来，换成我在转弯处等他。那天我们用山泉水泡刚做好的茶，没有说太多话，只听见风从茶垄间过去。\n\n我把那片山写给远方的你，也想听听你记得的山路。"),
    ("r6", None, "zhou", "隔着时差，听同一场月亮", "节日习俗", "moon",
     "中秋那天，我在清晨接到家里的电话。屏幕那边的月亮已经升起来，我这边的水壶才刚响。爸爸把手机靠在窗边，让我听楼下孩子跑来跑去的脚步声。\n\n我们约好等到我这里天黑，再给他回拨一次。"),
    ("n1", "r1", "he", "台南的面线，有另一种温柔", "家乡风物", "wave",
     "读到“趁热吃”我就笑了。台南的阿嬷煮麻油面线，会先把姜片慢慢煸香。我以前嫌等太久，后来在宿舍里第一次做，才发现等待的那一小会儿也是味道的一部分。"),
    ("n2", "r1", "lin", "南洋厨房里的生日面", "家乡风物", "leaf",
     "在槟城，生日早上总有一碗红蛋面线等着我。试着问妈妈配方，她只说盐放一点点。现在我在笔记本上贴了第一张自己煮面的照片，旁边照写：盐，一点点。"),
    ("n3", "n1", "lu", "一勺姜香，两地餐桌", "家乡风物", "boat",
     "我们家的面汤也放姜。读你的信时我给外婆打了个电话，把她讲的做法一点点记下来。下一次回家，我想换我煮一碗给她。"),
    ("n4", "r2", "lin", "从骑楼飘来的灯谜", "节日习俗", "lantern",
     "我们街上的灯会也在元宵。骑楼下挂着灯谜，邻居会一起搬凳子给小朋友猜。去年我把外公最喜欢的谜语写在红纸上挂了一天，竟然遇见另一个知道答案的人。"),
    ("n5", "r3", "zhou", "我在窗台留了一格阳光", "海外日常", "leaf",
     "窗外还在下雪，我的窗台却已经冒出了葱尖。读过你的信，我把空出来的玻璃瓶留给了九层塔。或许我们可以隔着海，交换一份窗台上的季节记录。"),
    ("n6", "r4", "song", "宁波老码头的风", "家乡风物", "boat",
     "我们小时候去码头，总先听见绳索磨过木桩的响声。外公会把我的围巾系紧一点，让我站在背风的地方看船。他已经退休很多年，却还记得那里的每一个泊位。"),
]


def setup(path):
    path.parent.mkdir(parents=True, exist_ok=True)
    with closing(connect(path)) as db, db:
        db.execute("PRAGMA journal_mode=WAL")
        db.executescript(SCHEMA + workshop.MIGRATE)
        db.execute("BEGIN IMMEDIATE")
        if "drift" not in {col["name"] for col in db.execute("PRAGMA table_info(letters)")}:
            db.execute("ALTER TABLE letters ADD COLUMN drift TEXT NOT NULL DEFAULT 'free'")
            db.execute("""UPDATE letters SET drift='theme'
                WHERE id IN ('r2','r5','r6','n2','n4','n6')""")
        if db.execute("SELECT 1 FROM users WHERE demo=1 LIMIT 1").fetchone():
            workshop.migrate(db)
            return
        db.executemany("INSERT INTO users(id,name,region,demo) VALUES(?,?,?,1)", PEOPLE)
        regions = {p[0]: p[2] for p in PEOPLE}
        today = datetime.now(timezone.utc)
        for i, (key, parent, author, title, theme, art, body) in enumerate(SEEDS):
            stamp = (today - timedelta(days=15-i)).isoformat(timespec="seconds")
            db.execute("""INSERT INTO letters(id,parent_id,author,title,body,region,theme,
                art,created,is_open,exhibit,status,drift) VALUES(?,?,?,?,?,?,?,?,?,1,1,'published',?)""",
                       (key, parent, author, title, body, regions[author], theme, art, stamp,
                        "theme" if key in {"r2","r5","r6","n2","n4","n6"} else "free"))
        workshop.migrate(db)


def field(data, key, maximum, *, default=None, minimum=1, strip=True):
    value = data.get(key, default)
    if not isinstance(value, str):
        raise ApiError(400, "请填写完整的信息。")
    if strip:
        value = value.strip()
    if not minimum <= len(value) <= maximum:
        raise ApiError(400, f"输入内容的长度须在 {minimum} 至 {maximum} 字之间。")
    return value


def flag(data, key, default):
    value = data.get(key, default)
    if type(value) is not bool:
        raise ApiError(400, "公开设置有误。")
    return value


REGIONS = {
    "福建泉州": ("大陆", "泉州|福建泉州|福建省泉州市"), "福建厦门": ("大陆","厦门|福建厦门|福建省厦门市"),
    "福建福州": ("大陆", "福州|福建福州|福建省福州市"), "福建": ("大陆","福建|福建省|闽南"),
    "广东潮州": ("大陆","广东潮州|潮州|广东省潮州市"), "浙江宁波": ("大陆","浙江宁波|宁波|浙江省宁波市"),
    "台湾台南": ("台湾","台湾台南|台南"), "台湾台中": ("台湾","台湾台中|台中"),
    "台湾台北": ("台湾","台湾台北|台北"), "台湾高雄": ("台湾","台湾高雄|高雄"),
    "台湾": ("台湾","台湾|中国台湾"), "香港": ("港澳","香港|中国香港"),
    "澳门": ("港澳","澳门|中国澳门"), "港澳": ("港澳","港澳"),
    "大陆": ("大陆","中国大陆|大陆|内地"), "海外": ("海外","海外|海外华人"),
    "马来西亚槟城": ("海外", "马来西亚槟城|槟城|槟城市|槟州|penang"),
    "福建湄洲岛": ("大陆","福建湄洲岛|湄洲岛|湄洲|meizhouisland"),
    "浙江龙泉": ("大陆","浙江龙泉|龙泉|longquan"),
    "马来西亚乔治市": ("海外","马来西亚乔治市|乔治市|槟城乔治市|georgetown"),
    "马来西亚马六甲": ("海外","马来西亚马六甲|马六甲|melaka|malacca"),
    "越南会安": ("海外","越南会安|会安|hoian|hộian"),
}
for place in "浙江 广东 江苏 北京 上海 天津 重庆 云南 山东 江西 吉林 安徽 湖北 湖南 河南 河北 海南 黑龙江 辽宁 贵州 四川 广西 青海 山西 陕西 甘肃 宁夏 新疆 西藏 内蒙古".split():
    REGIONS[place] = ("大陆", place)
for place in "新加坡 马来西亚 加拿大 美国 英国 日本 法国 德国 澳大利亚 新西兰 印度尼西亚 泰国 菲律宾 越南 韩国 意大利 巴西".split():
    REGIONS[place] = ("海外", place)
REGION_LOOKUP = {s:(name,group) for name,(group, options) in REGIONS.items() for s in options.split("|")}
REGION_LOOKUP["singapore"] = ("新加坡", "海外")
REGION_CHARS = str.maketrans("臺灣廈門廣東馬來亞紐蘭國澳門寧蘇貴遼慶陝肅龍檳島會喬", "台湾厦门广东马来亚纽兰国澳门宁苏贵辽庆陕肃龙槟岛会乔")


def regional(value):
    label = re.sub(r"[\s·•/／、-]", "", unicodedata.normalize("NFKC", value).translate(REGION_CHARS))
    label = label.casefold()
    clean = label.replace("省", "").removesuffix("市")
    return REGION_LOOKUP.get(label, REGION_LOOKUP.get(clean, ("", "未公开")))


def submitted_region(data, user):
    """Keep a legacy profile label on reuse; flag unfamiliar new labels before publication."""
    previous = user["region"]
    value = field(data, "region", 30, minimum=0, default=previous)
    if not value or value == "未公开":
        return ""
    canonical, _ = regional(value)
    if canonical:
        return canonical
    if value == previous:
        return previous
    raise ApiError(400, "请从公开地域建议中选择，或填写大陆、台湾、港澳、海外；不公开可留空。")


def chosen_tags(value):
    if not isinstance(value, list) or len(value)>5:
        raise ApiError(400, "每封信最多可确认五个标签。")
    tags = []
    for tag in value:
        if not isinstance(tag, str) or not 1<=len(tag.strip())<=12 or any(ord(c)<32 for c in tag):
            raise ApiError(400, "每个标签需为 1 至 12 字的单行文字。")
        if tag.strip() not in tags:
            tags.append(tag.strip())
    return tags


def hash_password(value, salt):
    return hashlib.pbkdf2_hmac("sha256", value.encode(), bytes.fromhex(salt), 300000).hex()


def parse_media(value):
    if value is None:
        return None, None
    if not isinstance(value, dict) or not isinstance(value.get("url"), str):
        raise ApiError(400, "附件格式有误。")
    header, _, encoded = value["url"].partition(",")
    match = re.fullmatch(r"data:(image/(?:png|jpeg|webp|gif)|audio/(?:mpeg|mp3|wav|x-wav|ogg|webm|mp4));base64", header)
    if not match:
        raise ApiError(400, "请选择 JPG、PNG、WebP、GIF 图片或常见音频文件。")
    try:
        content = base64.b64decode(encoded, validate=True)
    except (ValueError, binascii.Error):
        raise ApiError(400, "无法识别附件。")
    if not content or len(content) > MAX_MEDIA:
        raise ApiError(400, "附件须小于等于 4 MB。")
    mime = match.group(1)
    valid = {
        "image/png": content.startswith(b"\x89PNG\r\n\x1a\n"),
        "image/jpeg": content.startswith(b"\xff\xd8\xff"),
        "image/gif": content.startswith((b"GIF87a", b"GIF89a")),
        "image/webp": content[:4] == b"RIFF" and content[8:12] == b"WEBP",
        "audio/mpeg": content.startswith(b"ID3") or (len(content) > 1 and content[0] == 255 and content[1] & 224 == 224),
        "audio/wav": content[:4] == b"RIFF" and content[8:12] == b"WAVE",
        "audio/ogg": content.startswith(b"OggS"),
        "audio/webm": content.startswith(b"\x1aE\xdf\xa3"),
        "audio/mp4": content[4:8] == b"ftyp",
    }
    if not valid.get({"audio/mp3": "audio/mpeg", "audio/x-wav": "audio/wav"}.get(mime, mime)):
        raise ApiError(400, "附件内容与文件类型不符。")
    return mime, content


def me(user):
    return {"id": user["id"], "name": user["name"], "region": user["region"],
            "regionGroup": regional(user["region"])[1], "guest": user["password"] is None}


def letter_object(row):
    item = {
        "id": row["id"], "parentId": row["parent_id"], "authorId": row["author"],
        "author": row["name"], "title": row["title"], "body": row["body"],
        "region": row["region"], "theme": row["theme"], "art": row["art"],
        "created": row["created"], "open": bool(row["is_open"]), "exhibit": bool(row["exhibit"]),
        "status": row["status"], "drift": row["drift"], "demo": bool(row["demo"]), "media": None,
        "coverUrl": "/api/covers/" + row["id"] if row["has_cover"] else None,
        "paper": row["paper"], "stamp": row["stamp"], "tags": json.loads(row["tags"]),
        "quote": {"sourceId":row["parent_id"], "text":row["visible_quote"]} if row["visible_quote"] else None,
        "regionGroup": regional(row["region"])[1], "regionKey": regional(row["region"])[0],
    }
    if row["mime"]:
        item["media"] = {"type": row["mime"].split("/")[0], "url": "/api/media/" + row["id"]}
    return item


def state(db, user):
    uid = user["id"]
    rows = db.execute("""SELECT l.id,l.parent_id,l.author,l.title,l.body,l.region,l.theme,
        EXISTS(SELECT 1 FROM letter_covers c WHERE c.letter_id=l.id) AS has_cover,
        l.art,l.created,l.is_open,l.exhibit,l.status,l.drift,l.mime,u.name,u.demo,l.tags,l.paper,l.stamp,
        CASE WHEN p.status='published' THEN l.quote_text END AS visible_quote
        FROM letters l JOIN users u ON u.id=l.author LEFT JOIN letters p ON p.id=l.parent_id ORDER BY l.rowid""")
    public, mine, removed = [], [], {}
    for row in rows:
        item = letter_object(row)
        if row["author"] == uid:
            mine.append(item)
        if row["status"] == "published":
            public.append(item)
        elif row["status"] == "withdrawn":
            removed[row["id"]] = item
    # Keep only structural placeholders referenced by surviving branches.
    for item in public:
        parent = removed.pop(item["parentId"], None)
        if parent:
            public.append(dict(parent, title="已撤下的信件", body="", author="匿名",
                               authorId="",region="",regionGroup="未公开",regionKey="",open=False,
                               exhibit=False,media=None,coverUrl=None,tags=[],quote=None,theme="",paper="ivory",stamp="sail"))
    messages = db.execute("""SELECT m.id,m.letter_id AS letterId,
        CASE WHEN l.status='published' THEN l.title ELSE '已撤下的信件' END AS title,
        m.body,m.sender AS fromId,s.name AS fromName,m.recipient AS toId,r.name AS toName,m.created
        FROM messages m JOIN letters l ON l.id=m.letter_id
        JOIN users s ON s.id=m.sender JOIN users r ON r.id=m.recipient
        WHERE m.sender=? OR m.recipient=? ORDER BY m.created DESC,m.rowid DESC""", (uid, uid))
    favorites = db.execute("""SELECT f.letter_id FROM favorites f JOIN letters l ON l.id=f.letter_id
        WHERE f.user_id=? AND l.status='published' ORDER BY f.rowid DESC""", (uid,))
    return {"me": me(user), "regions": list(REGIONS), "letters": public, "inbox": [dict(m) for m in messages],
            "favorites": [r[0] for r in favorites], "mine": mine, "workshop": workshop.view(db, uid)}


def get_letter(db, letter_id, user_id=None):
    if not isinstance(letter_id, str):
        raise ApiError(400, "请选择一封信。")
    row = db.execute("""SELECT id,author,parent_id,theme,status,is_open,art,body FROM letters
        WHERE id=?""", (letter_id,)).fetchone()
    if not row or (row["status"] != "published" and row["author"] != user_id):
        raise ApiError(404, "这封信暂时无法查看。")
    return row


def write_letter(db, user, data):
    parent_id = data.get("parentId") or None
    parent = get_letter(db, parent_id) if parent_id is not None else None
    if parent and not parent["is_open"]:
        raise ApiError(409, "这封信已经关闭接力。")
    title = field(data, "title", 100)
    body = field(data, "body", 5000)
    theme = field(data, "theme", 30, default=parent["theme"] if parent else "家乡风物")
    region = submitted_region(data, user)
    art = field(data, "art", 20, default=parent["art"] if parent else "wave")
    if art not in COVER_ART:
        raise ApiError(400, "请选择可用的信件图案。")
    drift = field(data, "drift", 10, default="free")
    if drift not in {"free", "theme"}:
        raise ApiError(400, "请选择自由漂流或主题漂流。")
    is_open, exhibit = flag(data, "open", True), flag(data, "exhibit", False)
    quote = None
    if data.get("quote") is not None:
        if not isinstance(data["quote"], dict) or not parent:
            raise ApiError(400, "请选择上游公开信中的原文。")
        quote = field(data["quote"], "text", 240)
        if quote not in parent["body"] or data["quote"].get("sourceId", parent_id) != parent_id:
            raise ApiError(400, "引文与当前回应的公开信不一致。")
    tags = chosen_tags(data.get("tags", []))
    paper = field(data, "paper", 10, default="ivory")
    sticker = field(data, "stamp", 10, default="sail")
    if paper not in PAPERS or sticker not in STAMPS:
        raise ApiError(400, "请选择可用的信纸和邮票。")
    cover_mime, cover = parse_media(data.get("cover"))
    if cover is not None and (cover_mime not in {"image/jpeg", "image/png", "image/webp"} or len(cover) > MAX_COVER):
        raise ApiError(400, "封面须为 2 MB 以内的 JPG、PNG 或 WebP 图片。")
    mime, media = parse_media(data.get("media"))
    key = new_id("l")
    db.execute("""INSERT INTO letters(id,parent_id,author,title,body,region,theme,art,
        created,is_open,exhibit,status,mime,attachment,drift,quote_text,tags,paper,stamp)
        VALUES(?,?,?,?,?,?,?,?,?,?,?,'pending',?,?,?,?,?,?,?)""",
               (key, parent_id, user["id"], title, body, region, theme, art, now(),
                is_open, exhibit, mime, media, drift, quote, json.dumps(tags,ensure_ascii=False), paper, sticker))
    if cover is not None:
        db.execute("INSERT INTO letter_covers(letter_id,mime,content) VALUES(?,?,?)", (key, cover_mime, cover))
    return {"ok": True, "id": key, "status": "pending"}


def write_reply(db, user, data):
    body = field(data, "body", 5000)
    letter_id = field(data, "letterId", 100)
    if data.get("replyTo"):
        previous = db.execute("""SELECT * FROM messages WHERE id=? AND letter_id=?
            AND (sender=? OR recipient=?)""", (field(data, "replyTo", 100), letter_id,
                                                user["id"], user["id"])).fetchone()
        if not previous:
            raise ApiError(404, "找不到这封私人回信。")
        recipient = previous["sender"] if previous["recipient"] == user["id"] else previous["recipient"]
    else:
        recipient = get_letter(db, letter_id)["author"]
    if recipient == user["id"]:
        raise ApiError(400, "请选择其他人的来信回复。")
    key = new_id("m")
    db.execute("INSERT INTO messages VALUES(?,?,?,?,?,?)",
               (key, letter_id, user["id"], recipient, body, now()))
    return {"ok": True, "id": key}


def update_profile(db, user, data, create_account):
    if create_account and user["password"] is not None:
        raise ApiError(409, "当前已经登录。")
    name = field(data, "name", 24, minimum=2)
    region = submitted_region(data, user)
    if any(ord(c) < 32 for c in name + region):
        raise ApiError(400, "昵称和地域只支持单行文本。")
    occupied = db.execute("SELECT 1 FROM users WHERE name=? AND id<>?", (name, user["id"])).fetchone()
    if occupied:
        raise ApiError(409, "这个昵称已经有人使用。")
    password = user["password"]
    if create_account:
        value = field(data, "password", 128, minimum=8, strip=False)
        salt = secrets.token_hex(16)
        password = salt + ":" + hash_password(value, salt)
    db.execute("UPDATE users SET name=?,region=?,password=? WHERE id=?", (name, region, password, user["id"]))
    return {"ok": True}


def session_key(token):
    return hashlib.sha256(token.encode()).hexdigest()


class Handler(BaseHTTPRequestHandler):
    server_version = "SeaLetters"

    def log_message(self, fmt, *args):
        # Do not log personal messages or password bodies.
        super().log_message(fmt, *args)

    def get_identity(self, db):
        self.new_token = None
        self.old_hash = None
        cookie = SimpleCookie()
        try:
            cookie.load(self.headers.get("Cookie", ""))
        except CookieError:
            pass
        if "sea_session" in cookie:
            token = cookie["sea_session"].value
            if re.fullmatch("[0-9a-f]{64}", token):
                self.old_hash = session_key(token)
                found = db.execute("""SELECT u.* FROM users u JOIN sessions s ON s.user_id=u.id
                    WHERE s.token_hash=? AND s.expires>?""", (self.old_hash, int(time.time()))).fetchone()
                if found:
                    return found
        return self.new_guest(db)

    def new_guest(self, db):
        key = new_id("g")
        db.execute("INSERT INTO users(id,name) VALUES(?,?)", (key, "海上旅人" + key[2:12]))
        self.set_user(db, key)
        return db.execute("SELECT * FROM users WHERE id=?", (key,)).fetchone()

    def set_user(self, db, uid):
        if self.old_hash:
            db.execute("DELETE FROM sessions WHERE token_hash=?", (self.old_hash,))
        timestamp = int(time.time())
        db.execute("DELETE FROM sessions WHERE expires<=?", (timestamp,))
        self.new_token = secrets.token_hex(32)
        self.old_hash = session_key(self.new_token)
        db.execute("INSERT INTO sessions VALUES(?,?,?)", (self.old_hash, uid, timestamp + SESSION_SECONDS))

    def send_content(self, code, body, kind):
        self.send_response(code)
        self.send_header("Content-Type", kind)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store" if self.path.startswith("/api/") else "no-cache")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "same-origin")
        self.send_header("X-Frame-Options", "SAMEORIGIN")
        if getattr(self, "new_token", None):
            self.send_header("Set-Cookie", f"sea_session={self.new_token}; Path=/; HttpOnly; SameSite=Lax; Max-Age={SESSION_SECONDS}")
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(body)

    def json(self, code, data):
        self.send_content(code, json.dumps(data, ensure_ascii=False).encode(), "application/json; charset=utf-8")

    def validate_request(self):
        host = self.headers.get("Host", "")
        if self.server.server_address[0] in {"127.0.0.1", "::1"}:
            if host.partition(":")[0].lower() not in {"127.0.0.1", "localhost"}:
                raise ApiError(403, "请通过本机服务地址访问。")
        if self.command == "POST":
            origin = self.headers.get("Origin")
            if origin and (urlsplit(origin).netloc != host or urlsplit(origin).scheme not in {"http", "https"}):
                raise ApiError(403, "请求来源不匹配。")
            if self.headers.get_content_type() != "application/json":
                raise ApiError(415, "请提交 JSON 格式的数据。")

    def read_json(self):
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if not 0 < length <= MAX_REQUEST:
                raise ApiError(413, "提交内容为空或过大。")
            data = json.loads(self.rfile.read(length))
            if not isinstance(data, dict):
                raise ValueError()
            return data
        except (ValueError, UnicodeError, RecursionError):
            raise ApiError(400, "请求内容格式有误。")

    def mutate(self, db, path, user, data):
        uid = user["id"]
        if path.startswith("/api/workshop/"):
            return workshop.mutate(db, user, path.removeprefix("/api/workshop/"), data, field, ART)
        if path == "/api/letters":
            return write_letter(db, user, data)
        if path == "/api/replies":
            return write_reply(db, user, data)
        if path in {"/api/account", "/api/profile"}:
            result = update_profile(db, user, data, path == "/api/account")
            if path == "/api/account":
                self.set_user(db, uid)
            return result
        if path == "/api/logout":
            if user["password"] is None:
                # A duplicate logout request must not invalidate a guest identity.
                return {"ok": True}
            self.new_guest(db)
            return {"ok": True}
        if path == "/api/login":
            name = field(data, "name", 24, minimum=2)
            password = field(data, "password", 128, minimum=1, strip=False)
            match = db.execute("SELECT id,password FROM users WHERE name=? AND password IS NOT NULL", (name,)).fetchone()
            salt, stored_hash = (match["password"] if match else FALLBACK_HASH).split(":")
            valid = hmac.compare_digest(stored_hash, hash_password(password, salt))
            if not match or not valid:
                raise ApiError(403, "昵称或密码有误。")
            if user["password"] is None:
                activity = db.execute("""SELECT EXISTS(SELECT 1 FROM letters WHERE author=?)
                    OR EXISTS(SELECT 1 FROM messages WHERE sender=? OR recipient=?)
                    OR EXISTS(SELECT 1 FROM favorites WHERE user_id=?)
                    OR EXISTS(SELECT 1 FROM scroll_panels WHERE claimed_by=?)
                    OR EXISTS(SELECT 1 FROM scroll_versions WHERE author=?)""",
                                      (uid, uid, uid, uid, uid, uid)).fetchone()[0]
                if activity:
                    raise ApiError(409, "这个访客已参与书信或共创，请先「保存为账号」，再切换登录。")
            self.set_user(db, match["id"])
            return {"ok": True}
        if path not in {"/api/favorites", "/api/withdraw", "/api/report", "/api/permissions"}:
            raise ApiError(404, "找不到这个操作。")
        letter_id = field(data, "letterId", 100)
        if path in {"/api/withdraw", "/api/permissions"}:
            letter = get_letter(db, letter_id, uid)
            if letter["author"] != uid:
                raise ApiError(403, "只有作者可以修改这封信。")
            if path == "/api/withdraw":
                db.execute("UPDATE letters SET status='withdrawn',is_open=0,exhibit=0 WHERE id=?", (letter_id,))
                db.execute("UPDATE reports SET resolved=1 WHERE letter_id=?", (letter_id,))
            else:
                if letter["status"] not in {"published", "pending"}:
                    raise ApiError(409, "这封信已经下架。")
                updates = {key: flag(data, key, False) for key in ("open", "exhibit") if key in data}
                if "open" in updates:
                    db.execute("UPDATE letters SET is_open=? WHERE id=?", (updates["open"], letter_id))
                if "exhibit" in updates:
                    db.execute("UPDATE letters SET exhibit=? WHERE id=?", (updates["exhibit"], letter_id))
            return {"ok": True}
        get_letter(db, letter_id)
        if path == "/api/report":
            reason = field(data, "reason", 500, default="申请内容复核")
            db.execute("""INSERT INTO reports VALUES(?,?,?,?,0)
                ON CONFLICT(user_id,letter_id) DO UPDATE
                SET reason=excluded.reason,created=excluded.created,resolved=0
                WHERE reports.resolved=1""", (uid, letter_id, reason, now()))
            return {"ok": True}
        deleted = db.execute("DELETE FROM favorites WHERE user_id=? AND letter_id=?", (uid, letter_id))
        if not deleted.rowcount:
            db.execute("INSERT INTO favorites VALUES(?,?)", (uid, letter_id))
        return {"ok": True, "favorite": not bool(deleted.rowcount)}

    def require_local_admin_host(self):
        host = urlsplit("//" + self.headers.get("Host", "")).hostname
        if self.client_address[0] not in {"127.0.0.1","::1"} or host not in {"127.0.0.1","::1","localhost"}:
            raise ApiError(403, "审核台只接受本机访问。")

    def moderator(self, db, user, path, data):
        self.require_local_admin_host()
        if path == "/api/admin/login" and data is not None:
            workshop.admin_login(db,field(data,"token",200),self.old_hash)
            return {"ok":True}
        workshop.check_admin(db,self.old_hash)
        if path == "/api/admin/logout" and data is not None:
            db.execute("DELETE FROM review_sessions WHERE digest=?", (self.old_hash,))
            return {"ok":True}
        if path == "/api/admin/review" and data is not None:
            return workshop.review(db,field(data,"id",100),field(data,"decision",10),"web",user["id"])
        if path == "/api/admin/queue" and data is None:
            items = workshop.queue(db)
            for item in items:
                if item["kind"] in {"letter", "report"} and db.execute(
                    "SELECT 1 FROM letter_covers WHERE letter_id=?", (item["id"],)
                ).fetchone():
                    item["coverUrl"] = "/api/admin/covers/" + item["id"]
            return {"items":items}
        if path == "/api/admin/history" and data is None:
            return {"items":[dict(r) for r in db.execute("""SELECT target AS id,kind,decision,created,channel,actor
                FROM review_log ORDER BY review_log.id DESC LIMIT 100""")]}
        raise ApiError(404, "找不到这个审核操作。")

    def api(self, path):
        data = self.read_json() if self.command == "POST" else None
        if path == "/api/suggest-tags" and data is not None:
            from culture_tags import suggest_tags
            try:
                result = suggest_tags(data)
            except ValueError as exc:
                raise ApiError(400, str(exc))
            self.json(200, result)
            return
        with closing(connect(self.server.db_path)) as db, db:
            if self.command == "POST":
                db.execute("BEGIN IMMEDIATE")
            user = self.get_identity(db)
            if data is None and path.startswith(("/api/covers/", "/api/admin/covers/")):
                letter_id = path.rsplit("/", 1)[1]
                if path.startswith("/api/admin/"):
                    self.require_local_admin_host()
                    workshop.check_admin(db, self.old_hash)
                    allowed = db.execute("""SELECT 1 FROM letters WHERE id=? AND (status='pending'
                        OR EXISTS(SELECT 1 FROM reports WHERE letter_id=letters.id AND resolved=0))""", (letter_id,)).fetchone()
                    if not allowed:
                        raise ApiError(404, "没有可审核的封面。")
                else:
                    get_letter(db, letter_id, user["id"])
                row = db.execute("SELECT mime,content FROM letter_covers WHERE letter_id=?", (letter_id,)).fetchone()
                if not row:
                    raise ApiError(404, "没有可查看的上传封面。")
                db.commit()
                self.send_content(200, row["content"], row["mime"])
                return
            if path.startswith("/api/admin/media/") and data is None:
                self.require_local_admin_host()
                workshop.check_admin(db,self.old_hash)
                row = db.execute("""SELECT mime,attachment FROM letters WHERE id=? AND mime IS NOT NULL
                    AND (status='pending' OR EXISTS(SELECT 1 FROM reports WHERE letter_id=letters.id AND resolved=0))""",
                                 (path.removeprefix("/api/admin/media/"),)).fetchone()
                if not row:
                    raise ApiError(404, "没有可审核的附件。")
                db.commit()
                self.send_content(200,row["attachment"],row["mime"])
                return
            if path.startswith("/api/admin/"):
                result = self.moderator(db,user,path,data)
            elif data is not None:
                result = self.mutate(db, path, user, data)
            elif path == "/api/state":
                if not db.in_transaction:
                    db.execute("BEGIN")
                result = state(db, user)
            elif path.startswith("/api/media/"):
                letter_id = path.removeprefix("/api/media/")
                get_letter(db, letter_id, user["id"])
                row = db.execute("SELECT mime,attachment FROM letters WHERE id=?", (letter_id,)).fetchone()
                if not row["mime"]:
                    raise ApiError(404, "没有可查看的附件。")
                db.commit()
                self.send_content(200, row["attachment"], row["mime"])
                return
            else:
                raise ApiError(404, "找不到这个接口。")
        self.json(200, result)

    def handle_request(self):
        try:
            self.validate_request()
            path = unquote(urlsplit(self.path).path)
            if path.startswith("/api/"):
                self.api(path)
                return
            if self.command == "POST":
                raise ApiError(404, "找不到这个接口。")
            target = (PUBLIC / (path.lstrip("/") or "index.html")).resolve()
            if not target.is_relative_to(PUBLIC) or not target.is_file():
                raise ApiError(404, "找不到这个文件。")
            kind = mimetypes.guess_type(target.name)[0] or "application/octet-stream"
            if kind.startswith("text/") or target.suffix == ".js":
                kind += "; charset=utf-8"
            self.send_content(200, target.read_bytes(), kind)
        except ApiError as error:
            # A transaction that raised has rolled back; avoid sending its provisional session token.
            self.new_token = None
            self.json(error.status, {"error": str(error)})
        except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError):
            pass
        except (OSError, sqlite3.Error, ValueError):
            self.new_token = None
            self.log_error("Request failed for %s", self.command)
            self.json(500, {"error": "操作暂时无法完成，请稍后重试。"})

    do_GET = handle_request
    do_POST = handle_request
    do_HEAD = handle_request


def admin_review(db_path, approve, reject):
    with closing(connect(db_path)) as db, db:
        db.execute("BEGIN IMMEDIATE")
        key = approve or reject
        if not key:
            print("待审书信、画格投稿与举报")
            for row in workshop.queue(db):
                print(f"{row['kind']}  {row['id']}  {row['author']}  {row['title']}\n{row['body']}")
                if row.get("media"):
                    print("附件可使用 review --export-media ID 文件路径 查看。")
                if row.get("reason"):
                    print("举报理由",row["reason"])
            return
        try:
            workshop.review(db,key,"approve" if approve else "reject","cli",getpass.getuser())
        except ApiError as exc:
            raise SystemExit(str(exc))
        print("已处理", key, flush=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--db", type=Path, default=DEFAULT_DB)
    parser.add_argument("--port", type=int, default=8765)
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--open", action="store_true", help="在浏览器中打开本地网页")
    cmd = parser.add_subparsers(dest="command")
    cmd.add_parser("admin-token", help="签发十分钟内有效的一次性本机审核登录凭证")
    review = cmd.add_parser("review", help="查看待审书信和举报，或处理指定信件")
    action = review.add_mutually_exclusive_group()
    action.add_argument("--approve", metavar="ID")
    action.add_argument("--reject", metavar="ID")
    action.add_argument("--export-media", nargs=2, metavar=("ID", "FILE"))
    args = parser.parse_args()
    setup(args.db)
    if args.command == "admin-token":
        with closing(connect(args.db)) as db, db:
            print(workshop.create_token(db), flush=True)
        return
    if args.command == "review":
        if args.export_media:
            key, destination = args.export_media
            with closing(connect(args.db)) as db:
                row = db.execute("SELECT attachment FROM letters WHERE id=?", (key,)).fetchone()
                if not row or not row["attachment"]:
                    raise SystemExit("这封信没有附件。")
                with Path(destination).open("xb") as target:
                    target.write(row["attachment"])
            print("已导出。")
        else:
            admin_review(args.db, args.approve, args.reject)
        return
    if args.open:
        import webbrowser
        from urllib.request import urlopen
        preview_url = f"http://{args.host}:{args.port}/"
        try:
            with urlopen(preview_url, timeout=1) as response:
                if b"LETTERS ACROSS THE SEA" in response.read(8192):
                    webbrowser.open(preview_url)
                    return
        except OSError:
            pass
    with ThreadingHTTPServer((args.host, args.port), Handler) as server:
        server.db_path = args.db
        if args.open:
            webbrowser.open(f"http://{args.host}:{server.server_port}/")
        print(f"海上有信 http://{args.host}:{server.server_port}/", flush=True)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass


if __name__ == "__main__":
    main()
