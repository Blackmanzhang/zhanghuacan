"""Original, fictional letters and scroll contributions for the maritime collection."""

import json
from datetime import datetime, timedelta, timezone
from typing import NamedTuple


EDITION = "harbour-letters-1"

# These contributors are fictional. Public API responses identify them via users.demo.
PEOPLE = {
    "archive_yu": ("雨岑", "台湾台北"),
    "archive_ki": ("阿琪", "香港"),
    "archive_liu": ("小榴", "马来西亚槟城"),
    "archive_zhi": ("纸荔", "澳门"),
    "archive_huan": ("环仔", "福建福州"),
    "archive_en": ("恩桥", "台湾高雄"),
    "archive_ning": ("宁可", "英国"),
    "archive_xian": ("弦仔", "澳大利亚"),
    "archive_shu": ("舒笃", "德国"),
    "archive_wei": ("阿纬", "日本"),
    "archive_xi": ("小席", "浙江"),
    "archive_mei": ("美蓉", "越南"),
}


class Letter(NamedTuple):
    key: str
    author: str
    title: str
    body: str
    theme: str
    tags: tuple
    art: str
    paper: str
    stamp: str
    parent: str = ""
    quote: str = ""


# Parents precede their replies. Quotes, when present, are transcribed from that parent.
LETTERS = (
    Letter("tea_scale", "archive_yu", "一张带着茶香的秤纸",
           "周六在大稻埕陪阿姨看店，我的任务是把用过的包茶纸抚平。她在迪化街做了几十年生意，折纸时几乎不看手。今天换我折，一提起来，茶叶就从纸角漏出三颗。\n\n阿姨捡起那三颗茶，另外泡了一小杯。她把杯子推给我：“做坏的这一包，师傅请客。”我把第一张漏过茶的纸夹进了书里。",
           "成长记忆", ("大稻埕", "迪化街", "茶", "茶行"), "postdesk", "linen", "postmark"),
    Letter("tea_rim", "lu", "茶盘边上最小的那只杯",
           "你那三颗茶让我想起家里的工夫茶。爷爷让我负责烫杯，我老是把最小的那只漏掉。他就在茶盘底垫了一只小木圈，让它站得和别的一样高。现在我收拾茶盘还会下意识把杯子排成那一列。",
           "家乡风物", ("潮州", "工夫茶", "茶具"), "courtyard", "rice", "window", "tea_scale", "阿姨捡起那三颗茶，另外泡了一小杯。"),
    Letter("tea_word", "archive_shu", "德语课上的包茶作业",
           "看到你写下折茶包的过程，我也拿报纸折了一个。在语言班介绍家乡时，原本背不熟的那段话全忘了，干脆让大家跟着我折。一个同学在纸包上画了杯热茶；第二天他真的带来一小袋薄荷叶。",
           "海外日常", ("手作", "茶", "家乡话"), "leaf", "ledger", "postmark", "tea_scale"),
    Letter("glaze_rim", "archive_xi", "杯底留了一块指甲大的素胎",
           "你给小杯垫高的办法真好。我在龙泉的工作室捏了一只茶杯，师傅叫我把底足的釉擦干净，免得烧好后粘在窑板上。出窑那天，手指摸到那圈留白，才想起它在泥坯上是什么手感。",
           "成长记忆", ("龙泉青瓷", "茶具", "陶瓷"), "mountain", "rice", "window", "tea_rim"),
    Letter("shophouse", "archive_liu", "五脚基下的雨线",
           "乔治市老店屋的木百叶坏了一片。我替舅舅扶梯子，看他从里面把叶片抽出来，记下尺寸，再慢慢推回去。雨点敲在屋檐上，一把蓝伞从柱子间挪到下一家。\n\n等雨停，地上留下笔直的一条干湿分界。我沿着那条线画下这排店屋：柱子里头是回家的路，柱子外头是雨。",
           "家乡风物", ("乔治市", "槟城", "店屋", "五脚基"), "courtyard", "ledger", "window"),
    Letter("hoian", "archive_mei", "把门板一块块卸下来",
           "看你画的五脚基，我也画了会安家附近那家木铺。店主每天早上把门板一块块卸下来，按顺序靠在柱子上；晚上装回去，街道的脸又变了。我没画招牌，只画了早上和傍晚那两摞木板。",
           "海外日常", ("会安", "木构", "街屋"), "courtyard", "linen", "junk", "shophouse", "柱子里头是回家的路，柱子外头是雨。"),
    Letter("rain_mark", "archive_zhi", "窗外那条不会印上地图的小路",
           "我试着照你的干湿分界画了一张回家图。澳门下雨的傍晚，我会借杂货店的雨棚走到转角，再沿对街屋檐跑三步。弟弟说画上没有街名，我就补了一行小字：“第三步会溅水。”",
           "家乡风物", ("街巷", "雨棚", "手绘地图"), "sampan", "ledger", "postmark", "shophouse"),
    Letter("dragon", "archive_ki", "火龙过后，我才看清他的手",
           "中秋在大坑，我和细佬提前找了一个能看见街口的位置。舞火龙的队伍转过弯来，香火在头顶拖出一条红线，他踮起脚，我反而低头盯着抬龙人的鞋。\n\n后来坐下喝水，旁边一位帮手伸手接纸杯，掌心磨红了一块。我回家画那条龙时，特意把举着它的手也画了进去。",
           "节日习俗", ("中秋", "大坑舞火龙", "舞火龙", "灯火"), "harbor", "peach", "beacon"),
    Letter("dragon_thread", "he", "在你画的街角加一盏灯",
           "我喜欢你把举着龙的人也画下来的那句。我们家中秋夜只有一盏矮纸灯，是妹妹用上次元宵剩下的竹圈做的。我画了一条灯绳，想替你把画上的街角照亮，给刚抬完龙的人找一个歇脚的门口。",
           "节日习俗", ("灯笼", "中秋", "纸灯"), "lantern", "peach", "moon", "dragon", "特意把举着它的手也画了进去。"),
    Letter("sleeve", "archive_ki", "一截水袖在晾衣绳上等风",
           "收到你那条灯绳！我替练粤剧的表姐收戏服时，也被一根绳子绊住过：长长的水袖不能随便往衣架上一挂，她把它轻轻摊平，叮嘱我等布料干透。我把晾衣绳接在你的小灯旁边，下一张画就有院子了。",
           "成长记忆", ("粤剧", "水袖", "院子"), "courtyard", "rice", "window", "dragon_thread"),
    Letter("ferry_green", "archive_en", "最后一班渡轮留了一扇绿窗",
           "在高雄搭渡轮回家，岸灯很容易被船窗切成一小方一小方。我喜欢坐在边上，等第一道水痕碰到岸边，才把书合起来。\n\n昨晚跟对岸的朋友约好，各自画下同一分钟看到的窗。回家一比，她画的是岸上的橘方格，我画的是水里的绿方格。同一分钟，我们各收了一张底片。",
           "家乡风物", ("高雄", "渡轮", "港口", "夜航"), "harbor", "tide", "beacon"),
    Letter("wharf_blue", "archive_ning", "把河上的蓝光寄到高雄",
           "我晚上骑车过桥，桥下系了一排窄船。有一扇船窗亮着蓝灯，河水一动，窗就像被折成两张纸。我照你们的方法定好一分钟，画完才发现自己连车灯也留在纸上了。",
           "海外日常", ("河港", "灯光", "速写"), "sampan", "tide", "junk", "ferry_green", "同一分钟，我们各收了一张底片。"),
    Letter("boat_return", "xu", "你的绿窗旁，再靠一条白船",
           "上次我写过厦门渡船的汽笛，原来还可以寄一张窗户！我给你画另一侧：乘客举起手机的一瞬间，舷窗映出他的手，又映回海湾。下船时我把画纸对折，那只手刚好搭在白船上。",
           "成长记忆", ("厦门湾", "渡船", "素描"), "boat", "ledger", "sail", "ferry_green"),
    Letter("names", "archive_huan", "把阿婆叫我的尾音写下来",
           "福州的老屋准备换门铃。阿婆问我喜欢什么声音，我说最好还是你在天井里叫我。她先不肯开口，去厨房端了盘切好的梨，又很自然地叫出我的小名。\n\n这回我没赶着开手机，只拿铅笔把最后那个尾音画成一条往上走的线。夹在家书里，这张纸也能自己响一会儿。",
           "成长记忆", ("福州话", "方言", "家书"), "postdesk", "linen", "window"),
    Letter("name_sign", "archive_wei", "我的便当袋多了一张小名签",
           "看到你的尾音线，我想起妈妈寄来的便当袋。她用日语写了收件地址，却在内袋别了一张用家乡话叫我的小名签。开午饭时没人看见，我自己小声念了一遍，像在异乡碰见一个熟人。",
           "海外日常", ("方言", "便当", "姓名"), "postdesk", "linen", "postmark", "names"),
    Letter("phonetic", "archive_liu", "给方言留一格空白",
           "外公在槟城卖布，几种语言的数目都叫得顺。我给他做了一本价目小册，每行故意留一格，让他画个记得住的符号。后来才知道，画勾的地方并非缺货，是他答应把那块布给街坊留到周五。",
           "家乡风物", ("方言", "店屋", "手记"), "courtyard", "ledger", "window", "names"),
    Letter("sky_split", "archive_xian", "南边的月亮值夜班",
           "今年中秋，我在澳大利亚的住处用纸筒做了个小取景框。阳台栏杆、晾衣架和月亮，怎么挪都挤在一个圆里。发给姐姐，她回了我一张北边的天空，月亮旁恰好也横着一根晾衣杆。\n\n我们约好下次各留半张纸，画完一起折成对页。想来接班的人，把你的窗沿也放进来吧。",
           "未来心愿", ("中秋", "赏月", "南半球", "手绘"), "moon", "tide", "moon"),
    Letter("sky_fold", "archive_zhi", "一张可对折的天空",
           "我拿起半张纸，在澳门的露台上等月亮。最先进入取景框的是一排夹袜子的木夹，等我画完，月亮刚从屋檐左边冒头。我把纸的左沿空出来，准备和你寄来的右半边对上。",
           "未来心愿", ("月亮", "中秋", "拼画"), "harbor", "tide", "beacon", "sky_split", "想来接班的人，把你的窗沿也放进来吧。"),
    Letter("moon_log", "zhou", "第三张对页从清晨开始",
           "你们的两半天空到我这里时，水壶又在响。我把厨房钟面描在空白封底，顺手记了来信到达的时间。等到夜里补上月亮，这本对页小册的背面也算有人值班。",
           "海外日常", ("时差", "中秋", "家书"), "postdesk", "ledger", "postmark", "sky_fold"),
    Letter("station_box", "archive_ning", "车站失物箱里的蓝纽扣",
           "我在社区缝补小组值班。有人拿来一件校服，问在英国读书的第一天掉的那粒蓝纽扣可不可以换回来。盒里配得上颜色的只剩一粒四孔扣，原来那种却是两孔。\n\n小孩自己选了两条颜色不同的线，说这样远远看见衣架就能认出是哪一件。我把这组颜色记下来，想寄给也喜欢修东西的人。",
           "海外日常", ("缝补", "校服", "纽扣"), "courtyard", "linen", "window"),
    Letter("mending", "archive_yu", "我有一件补了三次的围裙",
           "那件校服应该特别好认。阿姨的茶行围裙补过三次，最后一块补丁剪自一条旧桌布。我小时候总以为胸前格子里还放着吃饭的筷子。如今轮到我穿，第一件做的事是检查口袋里有没有碎茶。",
           "成长记忆", ("茶行", "缝补", "围裙"), "leaf", "linen", "window", "station_box"),
    Letter("ferry_ticket", "archive_zhi", "渡轮票背面画着回家的楼梯",
           "搬家前我从饼干盒底翻出一张旧船票，背面画了一截扶手和两级楼梯。看了半天才认出，是小时候第一次独自去找姨姨，她怕我走错门，在票背上画的路标。\n\n我想把这些小地图做成抽屉里的薄册。以后只要有人问“往哪儿走”，我就能抽出一张给他看。",
           "未来心愿", ("澳门", "船票", "地图"), "sampan", "ledger", "junk"),
    Letter("ticket_shadow", "archive_en", "先找到门口那块阴影",
           "我也有姨妈画的路。她在小纸片上只标了一棵榕树和一块阴影，说下午看到哪家门口最凉，那里就是。我按图找到她时太阳下山了，指路的是树下那个扇风的人。",
           "成长记忆", ("手绘地图", "榕树", "高雄"), "mountain", "rice", "window", "ferry_ticket"),
    Letter("parcel", "archive_shu", "给明年的自己寄一张空清单",
           "去德国前我把箱子装了三次，清单密密麻麻。今天整理柜子，最常用的却是最后塞进侧袋的一叠薄信封。我决定给明年的自己写封信，正面留出三个空格，写上想重新学会的三件小事。\n\n第一格已经填好：跟爸爸学修那盏总偏向左边的台灯。",
           "未来心愿", ("家书", "清单", "修理"), "postdesk", "ledger", "postmark"),
    Letter("three_blanks", "archive_huan", "第二格能不能放一碗鱼丸",
           "读到你给明年留的三格，我也撕下一页作业本。第一格写回家陪阿婆包鱼丸，第二格留给她自己填。她想了一晚，在空白处画了辆公交车，原来她还想去江边走走。",
           "未来心愿", ("福州", "鱼丸", "家书"), "boat", "sea", "sail", "parcel", "第一格已经填好：跟爸爸学修那盏总偏向左边的台灯。"),
    Letter("late_route", "archive_mei", "把第三格留给认路的人",
           "你的空清单让我想到，会安木铺隔壁的师傅能凭木纹把卸下来的门板认回原位。我把第三格写成跟他学认一块木头。先从今天摸到的这扇门开始，说得出哪里光滑，哪里被手掌磨亮。",
           "未来心愿", ("会安", "木作", "学习"), "courtyard", "rice", "junk", "parcel"),
)


def mark(symbol, x, y, size, color):
    return dict(kind="stamp", symbol=symbol, x=x, y=y, size=size, color=color)


def stroke(color, width, *points):
    return dict(kind="stroke", color=color, width=width, points=list(points))


def inscription(text, x, y, size, color):
    return dict(kind="text", text=text, x=x, y=y, size=size, color=color)


# Each pair follows the same review, source-visibility and remix rules as a user version.
# Later versions contain just the second artist's contribution, not a copy of the base.
SCROLLS = {
    "m3": (
        ("dragon", "火龙转过街角", "阿琪用朱砂画下舞火龙经过的街道。门上的空绳留给下一位画灯的人。", [
            stroke("#406362", 6, (20,218), (77,177), (192,184), (246,154), (321,175)),
            stroke("#406362", 4, (70,190), (70,315), (155,320), (158,195)),
            stroke("#486b65", 4, (184,192), (180,310), (236,313), (236,175)),
            stroke("#a55e3e", 6, (20,271), (79,252), (141,268), (198,254), (266,220), (320,232), (382,265), (439,251), (490,217), (538,202), (581,213)),
            stroke("#d69b55", 3, (28,261), (81,243), (140,260), (199,245), (266,210), (320,219), (382,254), (435,241), (495,204), (536,195)),
            stroke("#876a51", 2, (304,108), (403,127), (536,137), (665,129), (776,106)),
            mark("moon", 657, 77, 84, "#d4a961"),
            inscription("街 角 的 火 光", 105, 83, 29, "#3d625e"),
        ]),
        ("dragon_thread", "给歇脚的人留一盏灯", "禾禾沿前一层的街绳添上灯笼和一条灯穗。", [
            stroke("#867457", 3, (547,136), (547,159)),
            mark("lantern", 547, 208, 114, "#ad523d"),
            stroke("#93614d", 3, (546,259), (545,274), (549,282)),
            mark("lantern", 695, 162, 77, "#cb8d46"),
            inscription("抬 完 龙 ， 到 这 里 歇 歇 。", 490, 330, 17, "#695b53"),
        ]),
    ),
    "m5": (
        ("sky_split", "南边的取景框", "弦仔从阳台取下取景框，把月亮和晾衣杆先画在对页的左侧。", [
            stroke("#42686d", 4, (53,62), (377,62), (377,314), (53,314), (53,62)),
            mark("moon", 222, 147, 137, "#cc9a51"),
            stroke("#698787", 5, (63,245), (367,224)),
            stroke("#4e6662", 3, (104,242), (104,292)),
            stroke("#4e6662", 3, (301,229), (301,287)),
            mark("wave", 211, 280, 94, "#709b9d"),
            inscription("南 窗", 84, 101, 18, "#576b67"),
        ]),
        ("sky_fold", "窗沿的另一半", "纸荔补上澳门露台的半张天空，把木夹夹在对页之间。", [
            stroke("#607b6a", 4, (420,62), (746,62), (746,314), (420,314), (420,62)),
            mark("moon", 647, 126, 98, "#dfb779"),
            stroke("#758c7a", 3, (428,185), (514,192), (617,190), (737,174)),
            stroke("#a27658", 6, (485,179), (488,207)),
            stroke("#996d4d", 6, (544,184), (547,211)),
            stroke("#bc945f", 6, (602,179), (604,205)),
            mark("mountain", 635, 266, 182, "#8c9f8a"),
            inscription("北 窗", 446, 101, 18, "#536f62"),
        ]),
    ),
}

EDITION_START = datetime(2025, 10, 7, 1, 20, tzinfo=timezone.utc)


def _contributors(db, people):
    ids = set()
    for key, (name, region) in people.items():
        # A local account may already have this pen name. Never attach our text
        # to that account or rename it.
        candidate = name
        number = 1
        while db.execute("SELECT 1 FROM users WHERE name=?", (candidate,)).fetchone():
            candidate = f"{name}（示例{number}）"
            number += 1
        inserted = db.execute("""INSERT INTO users(id,name,region,demo) VALUES(?,?,?,1)
                                 ON CONFLICT(id) DO NOTHING""", (key, candidate, region))
        if inserted.rowcount == 1:
            ids.add(key)
    return ids


def install(db):
    """Install each sample edition inside server.setup's existing transaction."""
    from collection_additions import EDITION as NEW_EDITION, LETTERS as NEW_LETTERS
    from collection_additions import PEOPLE as NEW_PEOPLE, SCROLLS as NEW_SCROLLS, START

    db.execute("CREATE TABLE IF NOT EXISTS sample_editions (id TEXT PRIMARY KEY)")
    _install_edition(db, EDITION, PEOPLE, LETTERS, SCROLLS, EDITION_START,
                     ("he", "lu", "xu", "zhou"))
    _install_edition(db, NEW_EDITION, NEW_PEOPLE, NEW_LETTERS, NEW_SCROLLS, START)


def _install_edition(db, edition, people, letters, scrolls, start, returning=()):
    entered = db.execute("INSERT INTO sample_editions(id) VALUES(?) ON CONFLICT(id) DO NOTHING",
                         (edition,))
    if not entered.rowcount:
        return

    authors = _contributors(db, people)
    # Four correspondents are returning project characters. Verify their demo
    # flag before assigning new letters on installations with earlier data.
    if returning:
        marks = ",".join("?" for _ in returning)
        authors.update(row["id"] for row in db.execute(
            f"SELECT id FROM users WHERE demo=1 AND id IN ({marks})", returning))
    regions = dict(db.execute("SELECT id,region FROM users WHERE demo=1"))
    inserted_keys = set()
    for order, letter in enumerate(letters):
        if letter.author not in authors or (letter.parent and letter.parent not in inserted_keys):
            continue
        created = (start + timedelta(days=order)).isoformat(timespec="seconds")
        result = db.execute("""INSERT INTO letters(
            id, parent_id, author, title, body, region, theme, art, created,
            is_open, exhibit, status, drift, tags, paper, stamp, quote_text)
            VALUES(?,?,?,?,?,?,?,?,?,1,1,'published',?,?,?,?,?)
            ON CONFLICT(id) DO NOTHING""",
            ("sample_" + letter.key, "sample_" + letter.parent if letter.parent else None,
             letter.author, letter.title, letter.body, regions[letter.author], letter.theme, letter.art,
             created, "theme" if order % 3 == 0 else "free",
             json.dumps(letter.tags, ensure_ascii=False), letter.paper, letter.stamp, letter.quote or None))
        if result.rowcount:
            inserted_keys.add(letter.key)

    for panel, revisions in scrolls.items():
        # Optional exemplars only occupy entirely untouched, unclaimed panels.
        free = db.execute("""SELECT 1 FROM scroll_panels AS p WHERE p.id=? AND p.claimed_by IS NULL
            AND NOT EXISTS (SELECT 1 FROM scroll_versions WHERE panel_id=p.id)""", (panel,)).fetchone()
        if not free or any(source not in inserted_keys for source, *_ in revisions):
            continue
        base_id = None
        for number, (source, title, body, scene) in enumerate(revisions, 1):
            version_id = f"sample_harbour_{panel}_{number}"
            result = db.execute("""INSERT INTO scroll_versions (
                id,panel_id,version,author,region,title,body,art,source_id,status,exhibit,
                created,scene,base_id,allow_remix)
                SELECT ?,?,?,author,region,?,?,art,id,'published',1,
                       created,?,?,1 FROM letters WHERE id=?
                ON CONFLICT(id) DO NOTHING""",
                (version_id, panel, number, title, body,
                 json.dumps(scene, ensure_ascii=False), base_id, "sample_" + source))
            if not result.rowcount:
                break
            base_id = version_id
