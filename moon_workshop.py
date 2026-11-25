"""Shared scroll panels, provenance, author consent and local review."""

import collection_seeds
import hashlib
import json
import re
import secrets
import time
from datetime import datetime, timezone


class ApiError(Exception):
    def __init__(self, status, message):
        self.status = status
        super().__init__(message)


def stamp():
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


PANELS = [
    ("m1", "月升海峡", "写下你所在的地方，月亮升起时的第一眼。", "moon"),
    ("m2", "灶边团圆", "留下一道中秋菜，或一段厨房里的对话。", "leaf"),
    ("m3", "巷口灯影", "挑一盏灯，写下那条边走边看的小路。", "lantern"),
    ("m4", "一桌家书", "讲讲团聚时你想留住的一种声音。", "boat"),
    ("m5", "隔海望月", "写给远方正在抬头看月亮的那个人。", "wave"),
    ("m6", "把月光寄出", "给下一位加入长卷的伙伴留一句祝福。", "mountain"),
    ("m7", "港湾夜渡", "画下夜里搭船时，从水上望见的一岸灯光。", "boat"),
    ("m8", "檐下月色", "记录屋檐、窗框或骑楼投下的一道月影。", "courtyard"),
    ("m9", "听见团圆", "用图形和文字画出一段想留在中秋夜的声音。", "postdesk"),
    ("m10", "归舟灯火", "为尚在水面上或归途中的人画一盏灯。", "lantern"),
]
SOURCES = [
    ("moon_qz", None, "qiu", "泉州的中秋，月光落进茶盏里", "福建泉州", "moon",
     "晚饭后，阿公把小方桌搬到天井，家人陆续添上茶杯和月饼。月光落进茶盏里，连说话的声音也慢了下来。\n\n我负责把一块月饼切成八小份。阿公指指空着的位置，说那一份留给晚些回来的姑姑。中秋在我们家，就是桌上总有一个等人的位置。",
     ["中秋", "月饼", "团圆", "茶"]),
    ("moon_tn", "moon_qz", "he", "台南的中秋，月亮挂在柚子树上", "台湾台南", "leaf",
     "你说桌上会留一个位置。我想起台南外婆家的院子，外婆也总会多摆一张小凳。表弟剥开一颗柚子，把柚皮折成小帽，给还没到家的妹妹留着。\n\n等我们把院里的灯调暗，月亮刚好挂在柚子树上。海那边的你，此刻看到的是同一片月光吗？",
     ["中秋", "柚子", "团圆", "赏月"]),
]
MIGRATE = """
CREATE TABLE IF NOT EXISTS scroll_panels (
    id TEXT PRIMARY KEY, claimed_by TEXT REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS scroll_versions (
    id TEXT PRIMARY KEY, panel_id TEXT NOT NULL REFERENCES scroll_panels(id),
    version INTEGER NOT NULL, author TEXT NOT NULL REFERENCES users(id), region TEXT NOT NULL,
    title TEXT NOT NULL, body TEXT NOT NULL, art TEXT NOT NULL, source_id TEXT REFERENCES letters(id),
    status TEXT NOT NULL, exhibit INTEGER NOT NULL, created TEXT NOT NULL, UNIQUE(panel_id,version)
);
CREATE TABLE IF NOT EXISTS review_tokens (
    digest TEXT PRIMARY KEY, expires INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS review_sessions (
    digest TEXT PRIMARY KEY REFERENCES sessions(token_hash) ON DELETE CASCADE,
    expires INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS review_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT, target TEXT NOT NULL, kind TEXT NOT NULL,
    decision TEXT NOT NULL, created TEXT NOT NULL, channel TEXT NOT NULL, actor TEXT NOT NULL DEFAULT ''
);
"""


def migrate(db):
    _migrate_scroll(db)
    db.executemany("INSERT INTO scroll_panels(id) VALUES(?) ON CONFLICT(id) DO NOTHING",
                   [(panel[0],) for panel in PANELS])
    collection_seeds.install(db)


def _migrate_scroll(db):
    fields = {r["name"] for r in db.execute("PRAGMA table_info(scroll_versions)")}
    for name, definition in (("scene", "TEXT"), ("base_id", "TEXT REFERENCES scroll_versions(id)"),
                             ("allow_remix", "INTEGER NOT NULL DEFAULT 0")):
        if name not in fields:
            db.execute(f"ALTER TABLE scroll_versions ADD COLUMN {name} {definition}")
    if "actor" not in {row["name"] for row in db.execute("PRAGMA table_info(review_log)")}:
        db.execute("ALTER TABLE review_log ADD COLUMN actor TEXT NOT NULL DEFAULT ''")
    existing = {row["name"] for row in db.execute("PRAGMA table_info(letters)")}
    for name, definition in (("quote_text", "TEXT"), ("tags", "TEXT NOT NULL DEFAULT '[]'"),
                             ("paper", "TEXT NOT NULL DEFAULT 'ivory'"),
                             ("stamp", "TEXT NOT NULL DEFAULT 'sail'")):
        if name not in existing:
            db.execute(f"ALTER TABLE letters ADD COLUMN {name} {definition}")
    if db.execute("SELECT 1 FROM scroll_panels LIMIT 1").fetchone():
        seed_drawings(db)
        return
    created = stamp()
    for key, parent, author, title, region, art, body, tags in SOURCES:
        quote = "月光落进茶盏里，连说话的声音也慢了下来。" if parent else None
        db.execute("""INSERT INTO letters(id,parent_id,author,title,body,region,theme,art,
            created,is_open,exhibit,status,drift,tags,quote_text,stamp)
            VALUES(?,?,?,?,?,?,'节日习俗',?,?,1,1,'published','theme',?,?,'moon')""",
                   (key, parent, author, title, body, region, art, created, json.dumps(tags), quote))
    db.executemany("INSERT INTO scroll_panels(id) VALUES(?)", [(p[0],) for p in PANELS])
    for key, i, title, body in (
        ("m1", 0, "天井里的第一束月光", "把方桌上的一盏茶，留给走得慢些的月亮。"),
        ("m4", 1, "给妹妹留的小凳", "柚子树下摆了四只小凳，最后一张是给晚归的妹妹。"),
    ):
        source, _, author, _, region, art, _, _ = SOURCES[i]
        db.execute("""INSERT INTO scroll_versions
            (id,panel_id,version,author,region,title,body,art,source_id,status,exhibit,created)
            VALUES(?,?,1,?,?,?,?,?,?,'published',1,?)""",
                   ("sample_" + key, key, author, region, title, body, art, source, created))
    seed_drawings(db)
    tags = {"r1": ["面线","饮食"], "r2": ["元宵","灯笼"], "r3":["九层塔","饮食"],
            "r4":["渡船"], "r5":["茶"], "r6":["中秋","赏月"], "n1":["面线","饮食"],
            "n2":["面线","生日"], "n3":["饮食"], "n4":["元宵","灯谜"], "n5":["九层塔"],
            "n6":["渡船"]}
    for key, values in tags.items():
        db.execute("""UPDATE letters SET tags=? WHERE id=? AND tags='[]'
            AND author IN (SELECT id FROM users WHERE demo=1)""", (json.dumps(values), key))


def seed_drawings(db):
    # Only project-authored sample illustrations carry pre-granted remix permission.
    layouts = {"sample_m1": [("moon", 560, 96, 150, "#c58a49"),
                             ("mountain", 210, 253, 300, "#73938c"),
                             ("mountain", 638, 284, 360, "#355e59"),
                             ("boat", 340, 307, 164, "#a7513f"),
                             ("wave", 510, 348, 215, "#527c79")],
               "sample_m4": [("moon", 180, 100, 136, "#bd874b"),
                             ("mountain", 510, 230, 340, "#6e8c78"),
                             ("lantern", 320, 165, 180, "#af5544"),
                             ("wave", 230, 329, 240, "#678d89")]}
    for key, layout in layouts.items():
        scene = [dict(kind="stamp", symbol=s, x=x, y=y, size=w, color=c)
                 for s, x, y, w, c in layout]
        early_sample = json.dumps(scene)
        if key == "sample_m1":
            scene[1:1] = [dict(kind="stamp", symbol="mountain", x=436, y=267, size=340, color="#aab5a3")]
            scene.extend([
                dict(kind="text", x=127, y=93, size=34, text="月 升 海 峡", color="#355e59"),
                dict(kind="text", x=128, y=121, size=14, text="泉 州  ·  八 月 十 五", color="#8c775c"),
                dict(kind="stamp", symbol="wave", x=156, y=328, size=106, color="#899c93"),
                dict(kind="stamp", symbol="wave", x=695, y=352, size=90, color="#899c93"),
            ])
        else:
            scene.extend([
                dict(kind="stamp", symbol="leaf", x=699, y=115, size=172, color="#6c856a"),
                dict(kind="text", x=534, y=93, size=30, text="柚 花 庭 月", color="#355e59"),
                dict(kind="text", x=534, y=119, size=14, text="台 南  ·  仲 秋", color="#8c775c"),
            ])
        db.execute("""UPDATE scroll_versions SET scene=?,allow_remix=1 WHERE id=?
                      AND (scene IS NULL OR scene=?) AND author IN (SELECT id FROM users WHERE demo=1)""",
                   (json.dumps(scene), key, early_sample))


def drawing(value):
    """Return a small, closed drawing format in an 800 × 380 coordinate system."""
    def number(n, lo, hi):
        if type(n) is not int or not lo <= n <= hi:
            raise ApiError(400, "画面坐标或笔触大小超出范围。")
        return n
    if not isinstance(value, list) or len(value) > 80:
        raise ApiError(400, "每个创作图层最多可保存 80 个元素。")
    result, point_count = [], 0
    for obj in value:
        if not isinstance(obj, dict):
            raise ApiError(400, "无效的画面元素。")
        kind, color = obj.get("kind"), obj.get("color")
        if not isinstance(color, str) or not re.fullmatch(r"#[0-9a-fA-F]{6}", color):
            raise ApiError(400, "无效的画面颜色。")
        el = {"kind": kind, "color": color.lower()}
        if kind == "stroke":
            points = obj.get("points")
            if not isinstance(points, list) or not 1 <= len(points) <= 300:
                raise ApiError(400, "每笔可保存 1 至 300 个坐标。")
            point_count += len(points)
            if point_count > 4800:
                raise ApiError(400, "当前图层的笔迹过多，请分版接续。")
            el["width"] = number(obj.get("width"), 1, 24)
            el["points"] = []
            for pt in points:
                if not isinstance(pt, list) or len(pt) != 2:
                    raise ApiError(400, "无效的笔迹坐标。")
                el["points"].append([number(pt[0], 0, 800), number(pt[1], 0, 380)])
        elif kind in ("stamp", "text"):
            el.update(x=number(obj.get("x"), 0, 800), y=number(obj.get("y"), 0, 380),
                      size=number(obj.get("size"), 12, 400 if kind == "stamp" else 80))
            if kind == "stamp":
                if obj.get("symbol") not in ("moon", "mountain", "lantern", "boat", "wave", "leaf"):
                    raise ApiError(400, "请选择工坊提供的文化图章。")
                el["symbol"] = obj["symbol"]
            else:
                text = obj.get("text")
                if not isinstance(text, str) or not 1 <= len(text.strip()) <= 40 or not text.isprintable():
                    raise ApiError(400, "题字限 1 至 40 个可见字符。")
                el["text"] = text.strip()
        else:
            raise ApiError(400, "不支持的画面元素。")
        result.append(el)
    return result


def public_source(row):
    return not row["source_id"] or (row["source_status"] == "published" and row["allowed"])


def version_rows(db):
    return {r["id"]: r for r in db.execute("""SELECT v.*,u.name,u.demo,l.exhibit AS allowed,
        l.status AS source_status FROM scroll_versions v JOIN users u ON v.author=u.id
        LEFT JOIN letters l ON l.id=v.source_id ORDER BY v.version""")}


def ancestry(row, rows):
    """Resolve live exhibition and remix grants for every referenced layer."""
    layers = []
    parent = row["base_id"]
    while parent:
        r = rows.get(parent)
        if (not r or len(layers) >= 15 or r["panel_id"] != row["panel_id"] or
                r["version"] >= row["version"] or r["status"] != "published" or
                not r["exhibit"] or not r["allow_remix"] or not public_source(r)):
            return None
        layers.append(r)
        parent = r["base_id"]
    return list(reversed(layers))


def public_layer(row):
    return {"id": row["id"], "version": row["version"], "author": row["name"],
            "authorId": row["author"], "region": row["region"], "sourceId": row["source_id"],
            "items": json.loads(row["scene"] or "[]")}


def read_version(row, parents):
    return {"id": row["id"], "version": row["version"], "panelId": row["panel_id"],
            "title": row["title"], "body": row["body"], "art": row["art"], "sourceId": row["source_id"],
            "region": row["region"], "authorId": row["author"], "author": row["name"],
            "exhibit": bool(row["exhibit"]), "status": row["status"], "created": row["created"],
            "demo": bool(row["demo"]), "allowRemix": bool(row["allow_remix"]),
            "baseId": row["base_id"], "baseAvailable": parents is not None,
            "layers": [public_layer(r) for r in (parents or []) + [row]] if row["scene"] is not None else []}


def view(db, uid):
    claims = {r["id"]: r["claimed_by"] for r in db.execute("SELECT * FROM scroll_panels")}
    by_panel = {key: {"id": key, "title": title, "prompt": prompt, "art": art, "claimedBy": claims[key],
                      "current": None, "mine": None, "versions": [], "myVersions": []}
                for key, title, prompt, art in PANELS}
    rows = version_rows(db)
    for row in rows.values():
        parents = ancestry(row, rows)
        public = row["status"] == "published" and row["exhibit"] and public_source(row) and parents is not None
        if not public and row["author"] != uid:
            continue
        item = read_version(row, parents)
        panel = by_panel[row["panel_id"]]
        if row["author"] == uid:
            panel["mine"] = item
            panel["myVersions"].append(item)
        if public:
            panel["current"] = item
            panel["versions"].append(item)
    sources = [r[0] for r in db.execute("""SELECT id FROM letters WHERE id IN ('moon_qz','moon_tn')
        AND status='published' ORDER BY rowid""")]
    return {"id": "midautumn", "title": "同一片月光", "panels": list(by_panel.values()), "sourceIds": sources}


def mutate(db, user, action, data, field, art_styles):
    uid = user["id"]
    if action == "withdraw":
        version_id = field(data, "versionId", 100)
        row = db.execute("SELECT * FROM scroll_versions WHERE id=? AND author=?", (version_id, uid)).fetchone()
        if not row:
            raise ApiError(403, "只能撤回自己的画格投稿。")
        if row["status"] == "published":
            # An older public revision by this author must not silently replace a revoked work.
            db.execute("""UPDATE scroll_versions SET exhibit=0,status='withdrawn'
                WHERE panel_id=? AND author=? AND version<=? AND status='published'""",
                       (row["panel_id"], uid, row["version"]))
        else:
            db.execute("UPDATE scroll_versions SET exhibit=0,status='withdrawn' WHERE id=?", (version_id,))
        return {"ok": True}
    key = field(data, "panelId", 10)
    panel = db.execute("SELECT * FROM scroll_panels WHERE id=?", (key,)).fetchone()
    if not panel:
        raise ApiError(404, "找不到这格画。")
    owner = panel["claimed_by"]
    if action == "claim":
        if owner and owner != uid:
            raise ApiError(409, "其他伙伴已经认领这格画，请刷新后选另一格。")
        db.execute("UPDATE scroll_panels SET claimed_by=? WHERE id=?", (uid, key))
        return {"ok": True}
    if action not in {"release", "submit"}:
        raise ApiError(404, "找不到这个操作。")
    if owner != uid:
        raise ApiError(409, "请先认领这格画。")
    pending = db.execute("SELECT id FROM scroll_versions WHERE panel_id=? AND status='pending'", (key,)).fetchone()
    if action == "release":
        if pending:
            raise ApiError(409, "请先撤回待审稿，或等待审核结果，再释放画格。")
        db.execute("UPDATE scroll_panels SET claimed_by=NULL WHERE id=?", (key,))
        return {"ok": True}
    if pending:
        raise ApiError(409, "这格画已有待审稿，待审核或撤回后可以继续修订。")
    title = field(data, "title", 100)
    body = field(data, "body", 2000)
    art = field(data, "art", 16)
    if art not in art_styles or data.get("exhibit") is not True:
        raise ApiError(400, "请选择图案并确认署名展出授权。")
    source = data.get("sourceId") or None
    if source is not None:
        if not isinstance(source, str) or not db.execute("""SELECT 1 FROM letters WHERE id=?
            AND author=? AND status='published' AND exhibit=1""", (source,uid)).fetchone():
            raise ApiError(400, "来源须为本人已公开且已授权展示的书信。")
    scene = drawing(data["scene"]) if "scene" in data else None
    base = data.get("baseId")
    remix = data.get("allowRemix", False)
    if type(remix) is not bool or (base is not None and not isinstance(base, str)):
        raise ApiError(400, "请检查接续来源和二创授权。")
    if base:
        rows = version_rows(db)
        predecessor = rows.get(base)
        if (scene is None or not predecessor or predecessor["panel_id"] != key or
                predecessor["status"] != "published" or not predecessor["exhibit"] or
                not predecessor["allow_remix"] or not public_source(predecessor)):
            raise ApiError(409, "来源版本已失效或尚未开放二创。")
        parents = ancestry(predecessor, rows)
        if parents is None or len(parents) >= 15:
            raise ApiError(409, "来源授权已失效或已达接续图层上限。")
    if scene is not None and not scene:
        raise ApiError(400, "请先画一笔、落一个图章或写下题字。")
    number = db.execute("SELECT COALESCE(MAX(version),0)+1 FROM scroll_versions WHERE panel_id=?", (key,)).fetchone()[0]
    version_id = "v_" + secrets.token_hex(12)
    db.execute("""INSERT INTO scroll_versions
        (id,panel_id,version,author,region,title,body,art,source_id,status,exhibit,created,scene,base_id,allow_remix)
        VALUES(?,?,?,?,?,?,?,?,?,'pending',1,?,?,?,?)""",
               (version_id,key,number,uid,user["region"],title,body,art,source,stamp(),
                json.dumps(scene,ensure_ascii=False,separators=(",",":")) if scene is not None else None,
                base or None,int(remix and scene is not None)))
    return {"ok": True,"id":version_id,"version":number,"status":"pending"}


def queue(db, *, include_panels=True):
    items = [dict(r) for r in db.execute("""SELECT v.id,'panel' AS kind,v.title,v.body,u.name AS author,
        v.created,v.panel_id AS panelId,v.source_id AS sourceId,v.art,v.version FROM scroll_versions v
        JOIN users u ON u.id=v.author WHERE v.status='pending'""")] if include_panels else []
    if items:
        rows = version_rows(db)
        for item in items:
            v = rows[item["id"]]
            detail = read_version(v, ancestry(v, rows))
            item.update(layers=detail["layers"], baseAvailable=detail["baseAvailable"])
    for row in db.execute("""SELECT l.id,l.title,l.body,l.created,u.name AS author,l.mime,l.tags,l.parent_id,
        CASE WHEN p.status='published' THEN l.quote_text END AS quote FROM letters l
        JOIN users u ON u.id=l.author LEFT JOIN letters p ON p.id=l.parent_id WHERE l.status='pending'"""):
        item = dict(row)
        item.update(kind="letter",tags=json.loads(row["tags"]),sourceId=row["parent_id"],
                    media={"type":row["mime"].split("/")[0],"url":"/api/admin/media/"+row["id"]} if row["mime"] else None)
        items.append(item)
    for row in db.execute("""SELECT l.id,'report' AS kind,l.title,l.body,l.mime,u.name AS author,
        MIN(r.created) AS created,GROUP_CONCAT(r.reason, char(10)) AS reason FROM reports r
        JOIN letters l ON l.id=r.letter_id JOIN users u ON u.id=l.author WHERE r.resolved=0 GROUP BY l.id"""):
        item = dict(row)
        mime = item.pop("mime")
        item["media"] = {"type":mime.split("/")[0],"url":"/api/admin/media/"+row["id"]} if mime else None
        items.append(item)
    return sorted(items,key=lambda item:item["created"])


def review(db, key, decision, channel, actor, *, include_panels=True):
    if decision not in {"approve","reject"}:
        raise ApiError(400, "请选择有效的审核结果。")
    v = db.execute("SELECT * FROM scroll_versions WHERE id=?", (key,)).fetchone() if include_panels else None
    if v:
        if v["status"] != "pending":
            raise ApiError(409, "这一版本已处理或撤回。")
        if decision == "approve" and v["source_id"] and not db.execute("""SELECT 1 FROM letters
            WHERE id=? AND status='published' AND exhibit=1""",(v["source_id"],)).fetchone():
            raise ApiError(409, "来源书信的授权已失效，无法展出。")
        if decision == "approve" and v["base_id"] and ancestry(v, version_rows(db)) is None:
            raise ApiError(409, "前序画面的授权已失效，请退回投稿。")
        db.execute("UPDATE scroll_versions SET status=? WHERE id=?",
                   ("published" if decision=="approve" else "rejected",key))
        if decision == "approve" and v["scene"] is not None:
            db.execute("UPDATE scroll_panels SET claimed_by=NULL WHERE id=? AND claimed_by=?",
                       (v["panel_id"],v["author"]))
        kind = "panel"
    else:
        letter = db.execute("SELECT status,parent_id FROM letters WHERE id=?", (key,)).fetchone()
        if not letter:
            raise ApiError(404, "找不到审核对象。")
        if letter["status"] not in {"published","pending"}:
            raise ApiError(409, "该信件已处理。")
        report = db.execute("SELECT 1 FROM reports WHERE letter_id=? AND resolved=0", (key,)).fetchone()
        kind = "report" if report else "letter"
        if letter["status"] == "published" and not report and (channel == "web" or decision == "approve"):
            # A browser queue item may already have been approved in another tab.
            # CLI moderators can still explicitly take down a named published letter.
            raise ApiError(409, "这封信已处理，请刷新审核队列。")
        if decision == "approve" and letter["status"] == "pending":
            parent = letter["parent_id"]
            if parent and not db.execute("""SELECT 1 FROM letters WHERE id=? AND status='published'
                    AND is_open=1""", (parent,)).fetchone():
                raise ApiError(409, "上游信件已关闭接力或已撤下。")
            db.execute("UPDATE letters SET status='published' WHERE id=?", (key,))
        if decision == "reject":
            new_status = "rejected" if letter["status"]=="pending" else "withdrawn"
            db.execute("UPDATE letters SET status=?,is_open=0,exhibit=0 WHERE id=?", (new_status,key))
        db.execute("UPDATE reports SET resolved=1 WHERE letter_id=?", (key,))
    db.execute("INSERT INTO review_log(target,kind,decision,created,channel,actor) VALUES(?,?,?,?,?,?)",
               (key,kind,decision,stamp(),channel,actor))
    return {"ok":True}


def create_token(db):
    token = secrets.token_urlsafe(32)
    db.execute("DELETE FROM review_tokens WHERE expires<=?", (int(time.time()),))
    db.execute("INSERT INTO review_tokens VALUES(?,?)",
               (hashlib.sha256(token.encode()).hexdigest(),int(time.time())+600))
    return token


def admin_login(db, token, session_hash):
    digest = hashlib.sha256(token.encode()).hexdigest()
    used = db.execute("DELETE FROM review_tokens WHERE digest=? AND expires>?", (digest,int(time.time())))
    if not used.rowcount:
        raise ApiError(403, "凭证已失效，请重新生成。")
    db.execute("INSERT OR REPLACE INTO review_sessions VALUES(?,?)", (session_hash,int(time.time())+3600))


def check_admin(db, session_hash):
    if not db.execute("SELECT 1 FROM review_sessions WHERE digest=? AND expires>?",
                      (session_hash,int(time.time()))).fetchone():
        raise ApiError(403, "请先使用本机审核凭证登录。")
