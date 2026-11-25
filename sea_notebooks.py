"""Theme notebooks, independent submissions, and authorized drawing ancestry."""

import json
import re
from pathlib import Path
from uuid import uuid4

from moon_workshop import ApiError, stamp
import notebook_collection as collection

TOPICS = (
    ("moon", "同一片月光", "把一处月色、一张节日照片或一句祝福，留给海另一边的读者。", "/art/midautumn.png"),
    ("table", "家乡的味道", "从早餐、节日餐桌和海外厨房写起，记下一道让你想起家的味道。", "/art/courtyard.webp"),
    ("voices", "听见故乡", "收录街巷里的声音、日常问候和想念一个地方时会想到的话。", "/art/exhibit-sounds.webp"),
) + collection.TOPICS

SCHEMA = """
CREATE TABLE IF NOT EXISTS notebooks (
    id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT NOT NULL, cover TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS notebook_pages (
    id TEXT PRIMARY KEY, notebook_id TEXT NOT NULL REFERENCES notebooks(id),
    author TEXT NOT NULL REFERENCES users(id), title TEXT NOT NULL, body TEXT NOT NULL,
    region TEXT NOT NULL, tags TEXT NOT NULL, scene TEXT NOT NULL,
    reply_to TEXT REFERENCES notebook_pages(id), quote TEXT NOT NULL DEFAULT '',
    base_id TEXT REFERENCES notebook_pages(id), allow_remix INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL, created TEXT NOT NULL, updated TEXT NOT NULL, page_no INTEGER,
    UNIQUE(notebook_id, page_no)
);
CREATE INDEX IF NOT EXISTS notebook_pages_listing ON notebook_pages(notebook_id, status, page_no);
CREATE INDEX IF NOT EXISTS notebook_authors ON notebook_pages(author, status);
CREATE TABLE IF NOT EXISTS notebook_media (
    page_id TEXT NOT NULL REFERENCES notebook_pages(id) ON DELETE CASCADE,
    kind TEXT NOT NULL, mime TEXT NOT NULL, content BLOB NOT NULL, PRIMARY KEY(page_id, kind)
);
"""

SELECT_PAGE = """SELECT p.*,u.name AS author_name,u.demo FROM notebook_pages p
                 JOIN users u ON u.id=p.author"""


def install_topics(db):
    db.executemany("INSERT OR IGNORE INTO notebooks VALUES(?,?,?,?)", TOPICS)


def row_for(db, key):
    return db.execute(SELECT_PAGE + " WHERE p.id=?", (key,)).fetchone()


def visible(row, uid):
    return row and (row["status"] == "published" or row["author"] == uid)


def library(db, uid):
    books = db.execute("""SELECT n.*,count(p.id) AS pages,count(DISTINCT p.author) AS authors,
        count(DISTINCT nullif(p.region,'')) AS regions,max(p.updated) AS updated
        FROM notebooks n LEFT JOIN notebook_pages p ON p.notebook_id=n.id AND p.status='published'
        GROUP BY n.id ORDER BY n.rowid""")
    mine = db.execute("""SELECT id,notebook_id,title,status FROM notebook_pages
        WHERE author=? AND status IN ('draft','pending','published','rejected')
        ORDER BY updated DESC""", (uid,))
    return {"books": [dict(row) for row in books], "mine": [dict(row) for row in mine]}


def book(db, notebook):
    entry = db.execute("SELECT * FROM notebooks WHERE id=?", (notebook,)).fetchone()
    if not entry:
        raise ApiError(404, "找不到这本手账。")
    pages = db.execute("""SELECT p.id,p.title,p.region,p.page_no AS number,p.updated,u.name AS author,
        (p.scene <> '[]' OR p.base_id IS NOT NULL) AS drawing,
        EXISTS(SELECT 1 FROM notebook_media WHERE page_id=p.id AND kind='image') AS image,
        EXISTS(SELECT 1 FROM notebook_media WHERE page_id=p.id AND kind='audio') AS audio
        FROM notebook_pages p JOIN users u ON u.id=p.author
        WHERE p.notebook_id=? AND p.status='published' ORDER BY p.page_no""", (notebook,))
    return {"book": dict(entry), "pages": [dict(row) for row in pages]}


def drawing_chain(db, page):
    drawings = []
    seen = {page["id"]}
    key = page["base_id"]
    while key:
        base = row_for(db, key)
        if (not base or key in seen or len(drawings) >= 8 or base["status"] != "published"
                or not base["allow_remix"] or base["notebook_id"] != page["notebook_id"]):
            return None
        seen.add(key)
        drawings.append({"id": key, "author": base["author_name"], "layers": json.loads(base["scene"])})
        key = base["base_id"]
    return drawings[::-1]


def detail(db, row, uid, admin=False):
    if not row or (not admin and not visible(row, uid)):
        raise ApiError(404, "这页手账暂时无法阅读。")
    identifier = row["id"]
    ancestor = row_for(db, row["reply_to"]) if row["reply_to"] else None
    origin = row_for(db, row["base_id"]) if row["base_id"] else None
    ancestors = drawing_chain(db, row)
    base_link = None
    if ancestors and origin:
        base_link = {"id": origin["id"], "title": origin["title"], "author": origin["author_name"], "number": origin["page_no"]}
    assets = {r[0]: f"/api/{'admin/' if admin else ''}notebooks/media/{identifier}/{r[0]}"
              for r in db.execute("SELECT kind FROM notebook_media WHERE page_id=?", (identifier,))}
    audio_source = collection.AUDIO_SOURCES.get(identifier) if row["demo"] and "audio" in assets else None
    return {"id": identifier, "notebook": row["notebook_id"], "author": row["author_name"],
            "audioSource": audio_source,
            "baseId": row["base_id"] if row["author"] == uid else None,
            "replyId": row["reply_to"] if row["author"] == uid else None,
            "mine": row["author"] == uid, "demo": bool(row["demo"]), "title": row["title"],
            "body": row["body"], "region": row["region"], "tags": json.loads(row["tags"]),
            "layers": json.loads(row["scene"]), "ancestors": ancestors or [], "base": base_link,
            "baseUnavailable": bool(row["base_id"] and ancestors is None),
            "reply": {"id": ancestor["id"], "title": ancestor["title"], "number": ancestor["page_no"],
                      "body": ancestor["body"], "quote": row["quote"]}
            if ancestor and ancestor["status"] == "published" else None,
            "allowRemix": bool(row["allow_remix"]), "status": row["status"], "number": row["page_no"],
            "created": row["created"], "updated": row["updated"], "assets": assets}


def valid_num(value, limit, minimum=None):
    return type(value) in (int, float) and (minimum if minimum is not None else -limit) <= value <= limit


def valid_color(value):
    return isinstance(value, str) and re.fullmatch(r"#[0-9a-fA-F]{6}", value)


BRUSHES = {"pencil", "ink", "marker", "brush", "watercolor", "spray", "eraser"}
SHAPES = {"line", "rect", "ellipse", "polygon"}


def validate_drawing(layers):
    error = ApiError(400, "绘画数据无效或超出单幅作品容量，请精简图层后重试。")
    if not isinstance(layers, list) or len(layers) > 24:
        raise error
    point_count = 0
    item_count = 0
    clean = []
    for layer in layers:
        if not isinstance(layer, dict) or not isinstance(layer.get("name"), str) or not isinstance(layer.get("items"), list):
            raise error
        name = layer["name"].strip()
        visible_now, locked = layer.get("visible", True), layer.get("locked", False)
        if not name or len(name) > 40 or type(visible_now) is not bool or type(locked) is not bool:
            raise error
        output = []
        for item in layer["items"]:
            item_count += 1
            if not isinstance(item, dict) or item_count > 2400:
                raise error
            kind = item.get("tool")
            points = item.get("points")
            color, size, alpha = item.get("color"), item.get("size"), item.get("opacity")
            fill = item.get("fill", False)
            if (not isinstance(kind, str) or kind not in BRUSHES | SHAPES or not isinstance(points, list)
                    or not points or type(fill) is not bool or not valid_color(color)
                    or not valid_num(size, 240, 0.75) or not valid_num(alpha, 1, 0.05)):
                raise error
            if kind in {"line", "rect", "ellipse"} and len(points) != 2:
                raise error
            if kind == "polygon" and not 3 <= len(points) <= 240:
                raise error
            point_count += len(points)
            if point_count > 26000 or any(not isinstance(p, list) or len(p) != 3 or
                    not valid_num(p[0], 1_000_000) or not valid_num(p[1], 1_000_000) or
                    not valid_num(p[2], 1, 0.02) for p in points):
                raise error
            output.append({"tool": kind, "points": points, "color": color, "size": size,
                           "opacity": alpha, "fill": fill})
        clean.append({"name": name, "visible": visible_now, "locked": locked, "items": output})
    return clean


def has_drawing(layers):
    return any(layer["visible"] and any(item["tool"] != "eraser" for item in layer["items"])
               for layer in layers)

def save(db, user, action, data, field, parse_media, chosen_tags):
    uid = user["id"]
    key = field(data, "id", 60, default="", minimum=0)
    old = row_for(db, key) if key else None
    if key and (not old or old["author"] != uid):
        raise ApiError(404, "找不到你的手账草稿。")
    if action == "withdraw":
        if not old or old["status"] == "withdrawn":
            raise ApiError(409, "这页已经撤回。")
        db.execute("UPDATE notebook_pages SET status='withdrawn',allow_remix=0,updated=? WHERE id=?", (stamp(), key))
        return {"ok": True}
    if action == "permission":
        if not old or old["status"] != "published" or not has_drawing(json.loads(old["scene"])):
            raise ApiError(409, "这页暂无可设置授权的公开绘画。")
        allow = data.get("allowRemix")
        if type(allow) is not bool:
            raise ApiError(400, "请选择二创授权。")
        db.execute("UPDATE notebook_pages SET allow_remix=?,updated=? WHERE id=?", (allow, stamp(), key))
        return {"ok": True}
    if action not in {"draft", "submit"}:
        raise ApiError(404, "找不到这个手账操作。")
    sending = action == "submit"
    if old and old["status"] not in {"draft", "rejected"}:
        raise ApiError(409, "这页已送审，请刷新查看当前状态。")
    notebook = field(data, "notebook", 30)
    if not db.execute("SELECT 1 FROM notebooks WHERE id=?", (notebook,)).fetchone() or (old and old["notebook_id"] != notebook):
        raise ApiError(404, "找不到这本手账。")
    title = field(data, "title", 100, minimum=int(sending), default="")
    body = field(data, "body", 8000, minimum=0, strip=False, default="")
    region = field(data, "region", 30, minimum=0, default="")
    tags = chosen_tags(data.get("tags", []))
    layers = validate_drawing(data.get("layers", []))
    reply = field(data, "reply", 60, default="", minimum=0) or None
    base = field(data, "base", 60, default="", minimum=0) or None
    quote = field(data, "quote", 240, default="", minimum=0)
    if reply or quote:
        target = row_for(db, reply)
        if (not target or target["notebook_id"] != notebook or target["id"] == key
                or (quote and quote not in target["body"])
                or (target["status"] != "published" and (sending or not old or old["reply_to"] != reply))):
            raise ApiError(409, "引用或回应的原页已不可用，请移除后再提交。")
    traits = {"id": key, "notebook_id": notebook, "base_id": base}
    if base:
        ancestry = drawing_chain(db, traits)
        if (not ancestry or not any(has_drawing(x["layers"]) for x in ancestry)) and (
                sending or not old or old["base_id"] != base):
            raise ApiError(409, "原图的二创授权已失效，请移除原图后再提交。")
    media = data.get("media", {})
    if not isinstance(media, dict) or not set(media) <= {"image", "audio"}:
        raise ApiError(400, "附件格式有误。")
    assets = {r[0] for r in db.execute("SELECT kind FROM notebook_media WHERE page_id=?", (key,))}
    decoded = {}
    for kind, value in media.items():
        mime, content = parse_media(value)
        if mime and not mime.startswith(kind + "/"):
            raise ApiError(400, "请选择对应类型的照片或录音。")
        if mime:
            assets.add(kind)
        else:
            assets.discard(kind)
        decoded[kind] = (mime, content)
    if sending and data.get("exhibit") is not True:
        raise ApiError(400, "提交审核前请确认公开展示授权。")
    drawing = has_drawing(layers)
    if sending and not (body.strip() or assets or drawing):
        raise ApiError(400, "请写下文字，或添加照片、录音、手绘作品。")
    allow = data.get("allowRemix") is True and drawing
    key = key or ("nb_" + uuid4().hex)
    timestamp = stamp()
    db.execute("""INSERT INTO notebook_pages
        (id,notebook_id,author,title,body,region,tags,scene,reply_to,quote,base_id,allow_remix,status,created,updated)
        VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        ON CONFLICT(id) DO UPDATE SET title=excluded.title,body=excluded.body,region=excluded.region,
        tags=excluded.tags,scene=excluded.scene,reply_to=excluded.reply_to,quote=excluded.quote,
        base_id=excluded.base_id,allow_remix=excluded.allow_remix,status=excluded.status,updated=excluded.updated""",
               (key, notebook, uid, title, body, region, json.dumps(tags, ensure_ascii=False),
                json.dumps(layers, ensure_ascii=False, separators=(",", ":")), reply, quote, base,
                allow, "pending" if sending else "draft", timestamp, timestamp))
    for kind, (mime, content) in decoded.items():
        if mime:
            db.execute("INSERT OR REPLACE INTO notebook_media VALUES(?,?,?,?)", (key, kind, mime, content))
        else:
            db.execute("DELETE FROM notebook_media WHERE page_id=? AND kind=?", (key, kind))
    return {"id": key, "assets": {kind: f"/api/notebooks/media/{key}/{kind}" for kind in sorted(assets)}}


def media(db, path, uid, admin):
    parts = path.rsplit("/", 2)
    if len(parts) != 3:
        raise ApiError(404, "找不到该素材。")
    row = row_for(db, parts[1])
    allowed = row and (row["status"] == "pending" if admin else visible(row, uid))
    if not allowed:
        raise ApiError(404, "找不到该素材。")
    asset = db.execute("SELECT mime,content FROM notebook_media WHERE page_id=? AND kind=?",
                       (row["id"], parts[2])).fetchone()
    if not asset:
        raise ApiError(404, "找不到该素材。")
    return asset["mime"], asset["content"]


def queue(db):
    rows = db.execute(SELECT_PAGE + " WHERE p.status='pending' ORDER BY p.created").fetchall()
    return [dict(detail(db, row, "", admin=True), kind="notebook") for row in rows]


def review(db, key, decision, channel, actor):
    row = row_for(db, key)
    if not row:
        raise ApiError(404, "找不到审核对象。")
    if row["status"] != "pending" or decision not in {"approve", "reject"}:
        raise ApiError(409, "这页手账已经处理或撤回。")
    approved = decision == "approve"
    if approved and row["base_id"] and drawing_chain(db, row) is None:
        raise ApiError(409, "原图的二创授权已经失效。")
    if approved and row["reply_to"] and not db.execute("SELECT 1 FROM notebook_pages WHERE id=? AND status='published'",
                                                        (row["reply_to"],)).fetchone():
        raise ApiError(409, "原页已经撤回，请退回这份投稿。")
    number = db.execute("SELECT coalesce(max(page_no),0)+1 FROM notebook_pages WHERE notebook_id=?",
                        (row["notebook_id"],)).fetchone()[0] if approved else None
    db.execute("UPDATE notebook_pages SET status=?,page_no=?,updated=? WHERE id=?",
               ("published" if approved else "rejected", number, stamp(), key))
    db.execute("INSERT INTO review_log(target,kind,decision,created,channel,actor) VALUES(?,'notebook',?,?,?,?)",
               (key, decision, stamp(), channel, actor))
    return {"ok": True}


def seed_pages(db):
    _seed_first_pages(db)
    _install_second_collection(db)


def _seed_first_pages(db):
    if db.execute("SELECT 1 FROM notebook_pages LIMIT 1").fetchone():
        return
    authors = [r[0] for r in db.execute("SELECT id FROM users WHERE demo=1 ORDER BY rowid LIMIT 4")]
    if len(authors) < 4:
        return
    illustrations = [{"name": "海岸线", "visible": True, "locked": False, "items": [
        {"tool": "ellipse", "points": [[520, 55, 1], [642, 177, 1]], "color": "#c68c47", "size": 5, "opacity": .83, "fill": True},
        {"tool": "polygon", "points": [[0, 310, 1], [180, 150, 1], [345, 292, 1], [480, 205, 1], [690, 320, 1]],
         "color": "#37666a", "size": 5, "opacity": .8, "fill": True},
        *[{"tool": "brush", "points": [[x - 20, y, .55], [x + 50, y - 10, 1], [x + 145, y + 2, .35]],
           "color": "#6a9291", "size": 11, "opacity": .58, "fill": False}
          for x, y in [(13, 341), (205, 368), (420, 348), (168, 402), (480, 395)]],
    ]}]
    examples = (
        ("moon", "檐角升起一轮月亮", "小时候，月亮总是从外婆家的屋檐上升起来。我们搬出两张竹椅，切开一只月饼，一边吃一边等远处的屋子亮灯。今晚我在海边重新画下了那轮月亮。", "泉州", ["中秋", "家乡记忆"], illustrations, None, ""),
        ("moon", "骑楼下留了一把椅子", "看到你写的屋檐，我想起台南老家的骑楼。小时候总觉那把竹椅太重，如今每次回家，第一个动作是把它搬到能看见月亮的地方。", "台南", ["中秋", "老街"], [], "nb_demo_1", "小时候，月亮总是从外婆家的屋檐上升起来。"),
        ("table", "一碗清早的面线糊", "码头还没热闹起来，外婆已经在小摊旁坐下。她把油条掰成两半叠在碗边，说慢一点吃，海上的风吹过来时汤就不烫了。", "厦门", ["家乡味道", "早餐"], [], None, ""),
        ("table", "把早餐的香气带到海那边", "在槟城住久了，我终于知道为什么清早听到瓷碗碰响就会觉得安心。隔壁的阿姨叫我先喝口汤，再尝她刚炸出来的东西。我们交换了各自童年的早餐。", "槟城", ["南洋", "早餐"], [], "nb_demo_3", "码头还没热闹起来，外婆已经在小摊旁坐下。"),
        ("voices", "先听见海，再听见早安", "早上醒来，先是窗外晾衣绳敲着栏杆，接着才有人在楼下用家乡话道早安。说话的人走远了，屋里仍然记得那个上扬的尾音。", "香港", ["家乡话", "早安"], [], None, ""),
    )
    numbers = {}
    for i, (book_id, title, body, region, tags, layers, reply, quote) in enumerate(examples, start=1):
        numbers[book_id] = numbers.get(book_id, 0) + 1
        timestamp = stamp()
        db.execute("""INSERT INTO notebook_pages
            (id,notebook_id,author,title,body,region,tags,scene,reply_to,quote,allow_remix,status,created,updated,page_no)
            VALUES(?,?,?,?,?,?,?,?,?,?,?,'published',?,?,?)""",
                   (f"nb_demo_{i}", book_id, authors[(i-1) % len(authors)], title, body, region,
                    json.dumps(tags, ensure_ascii=False), json.dumps(layers, ensure_ascii=False),
                    reply, quote, bool(layers), timestamp, timestamp, numbers[book_id]))



def _install_second_collection(db):
    db.execute("CREATE TABLE IF NOT EXISTS sample_editions (id TEXT PRIMARY KEY)")
    if not db.execute("""INSERT INTO sample_editions(id) VALUES('notebook-collection-2')
                         ON CONFLICT(id) DO NOTHING""").rowcount:
        return

    authors = [r[0] for r in db.execute("SELECT id FROM users WHERE demo=1 ORDER BY rowid LIMIT 12")]
    if not authors:
        raise RuntimeError("Notebook samples require demo authors")
    public = Path(__file__).resolve().parent / "public"
    timestamp = stamp()
    for book_index, (book, pages) in enumerate(collection.PAGES.items()):
        last = db.execute("SELECT coalesce(max(page_no),0) FROM notebook_pages WHERE notebook_id=?",
                          (book,)).fetchone()[0]
        for index, (title, region, tags, text) in enumerate(pages, start=1):
            key = collection.page_id(book, index)
            layers = []
            if (drawing := collection.DRAWINGS.get((book, index))) is not None:
                name, items = drawing
                layers = validate_drawing([{"name": name, "items": [
                    {"tool": tool, "color": color, "size": 5, "opacity": .9, "fill": fill,
                     "points": [[x, y, 1] for x, y in points]} for tool, color, fill, points in items
                ]}])
            db.execute("""INSERT INTO notebook_pages
                (id,notebook_id,author,title,body,region,tags,scene,allow_remix,status,created,updated,page_no)
                VALUES(?,?,?,?,?,?,?,?,?,'published',?,?,?)""",
                       (key, book, authors[(3*book_index + index) % len(authors)], title, text, region,
                        json.dumps(tags, ensure_ascii=False), json.dumps(layers, ensure_ascii=False),
                        bool(layers), timestamp, timestamp, last+index))
            if (attachment := collection.ATTACHMENTS.get((book, index))) is not None:
                kind, filename, mime, _ = attachment
                content = (public / "audio" / filename).read_bytes()
                db.execute("INSERT INTO notebook_media VALUES(?,?,?,?)", (key, kind, mime, content))
