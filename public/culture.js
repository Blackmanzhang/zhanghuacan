/* Culture atlas, editorial sources, and author-controlled tag suggestions. */
(() => {
  "use strict";
  const app = () => window.app;
  const esc = (value) => app().esc(value ?? "");
  const icon = (name, size = 16) => app().icon(name, size);
  const unique = (values) => [...new Set(values)];
  const letters = () =>
    app().state.letters.filter((letter) => letter.status === "published");
  const linkTo = (view, id) =>
    "#" + view + (id ? "/" + encodeURIComponent(id) : "");
  const sources = {
    mazucustom: [
      "联合国教科文组织 · 妈祖信俗",
      "https://ich.unesco.org/en/RL/mazu-belief-and-customs-00227",
    ],
    enamel: [
      "联合国教科文组织 · 龙泉青瓷传统烧制技艺",
      "https://ich.unesco.org/en/RL/traditional-firing-technology-of-longquan-celadon-00205",
    ],
    dragon: [
      "香港非物质文化遗产办事处 · 大坑舞火龙",
      "https://www.icho.hk/en/web/icho/representative_list_taihang.html",
    ],
    opera: [
      "香港非物质文化遗产办事处 · 粤剧",
      "https://www.icho.hk/en/web/icho/representative_list_cantoneseopera.html",
    ],
    milktea: [
      "香港非物质文化遗产办事处 · 港式奶茶制作技艺",
      "https://www.icho.hk/en/web/icho/representative_list_milk_tea.html",
    ],
    straits: [
      "联合国教科文组织世界遗产中心 · 马六甲与乔治市",
      "https://whc.unesco.org/en/list/1223/",
    ],
    hoian: [
      "联合国教科文组织世界遗产中心 · 会安古城",
      "https://whc.unesco.org/en/list/948/",
    ],
    teaport: [
      "台北市政府观光传播局 · 茶香满溢大稻埕",
      "https://www.travel.taipei/zh-tw/pictorial/article/10223",
    ],
    street: [
      "台北市政府观光传播局 · 迪化街店屋",
      "https://www.travel.taipei/zh-tw/attraction/details/105",
    ],
    gongfu: [
      "广东省人民政府侨务办公室 · 潮州工夫茶",
      "https://www.qb.gd.gov.cn/whjy/content/post_1279581.html",
    ],
    pot: [
      "广东省人民政府侨务办公室 · 潮州手拉朱泥壶",
      "https://www.qb.gd.gov.cn/mlgd/content/post_1018333.html",
    ],
    nanyin: [
      "联合国教科文组织 · 南音",
      "https://ich.unesco.org/en/RL/nanyin-00199",
    ],
    lion: [
      "新加坡国家文物局 · 南音",
      "https://www.roots.gov.sg/ich-landing/ich/nanyin",
    ],
    lantern: [
      "台南市盐水区公所 · 盐水蜂炮",
      "https://web.tainan.gov.tw/ysdo_en/cp.aspx?n=8667",
    ],
    hawker: [
      "联合国教科文组织 · 新加坡小贩文化",
      "https://ich.unesco.org/en/RL/hawker-culture-in-singapore-community-dining-and-culinary-practices-in-a-multicultural-urban-context-01568",
    ],
    wangchuan: [
      "联合国教科文组织 · 送王船",
      "https://ich.unesco.org/en/RL/ong-chun-wangchuan-wangkang-ceremony-rituals-and-related-practices-for-maintaining-the-sustainable-connection-between-man-and-the-ocean-01608",
    ],
    macauHeritage: ["联合国教科文组织世界遗产中心 · 澳门历史城区", "https://whc.unesco.org/en/list/1110/"],
    diaolou: ["联合国教科文组织世界遗产中心 · 开平碉楼与村落", "https://whc.unesco.org/en/list/1112/"],
    hueHeritage: ["联合国教科文组织世界遗产中心 · 顺化古迹群", "https://whc.unesco.org/en/list/678/"],
    ayutthayaHeritage: ["联合国教科文组织世界遗产中心 · 大城历史城区", "https://whc.unesco.org/en/list/576/"],
    kulangsu: ["联合国教科文组织世界遗产中心 · 鼓浪屿", "https://whc.unesco.org/en/list/1541/"],
    quanzhouHeritage: ["联合国教科文组织世界遗产中心 · 宋元中国的世界海洋商贸中心", "https://whc.unesco.org/en/list/1561/"],
    botanic: ["联合国教科文组织世界遗产中心 · 新加坡植物园", "https://whc.unesco.org/en/list/1483/"],
  };
  const places = [
    {
      id: "quanzhou",
      city: "泉州",
      area: "福建",
      coords: [118.58, 24.88],
      art: "boat",
      aliases: ["泉州"],
      cards: [
        {"theme": "港口街区", "title": "从桥、码头到生产作坊", "tags": ["宋元泉州", "码头"], "body": "宋元泉州的世界遗产由多处遗址组成。桥梁和码头连通交通，陶瓷与冶铁遗址可以帮助理解商贸港口背后的生产体系。", "source": "quanzhouHeritage"},
        {
          theme: "乡音曲艺",
          title: "用泉州方言唱一支南音",
          tags: ["南音", "方言", "闽南语"],
          body: "在闽南，南音既有器乐，也有配合乐器演唱的曲目。演唱者以泉州方言唱词，洞箫和横抱的琵琶是乐队中有代表性的乐器。",
          source: "nanyin",
        },
        {
          theme: "海洋信俗",
          title: "泉州湾的送王船",
          tags: ["送王船"],
          body: "在泉州湾沿岸，送王船寄托着社区对出海先人的追念。厦门湾和马六甲的一些华人社区也延续着这项传统。",
          source: "wangchuan",
        },
      ],
      kin: "singapore",
    },
    {
      id: "tainan",
      city: "台南",
      area: "台湾",
      coords: [120.21, 23.0],
      art: "lantern",
      aliases: ["台南", "臺南"],
      cards: [
        {
          theme: "岁时节俗",
          title: "盐水的元宵夜",
          tags: ["元宵", "蜂炮"],
          body: "台南盐水的元宵习俗与庙宇巡境相连。农历正月十四、十五，蜂炮是当地节庆中鲜明的声音和景象。",
          source: "lantern",
        },
      ],
    },
    {
      id: "singapore",
      city: "新加坡",
      area: "东南亚",
      coords: [103.82, 1.35],
      art: "leaf",
      aliases: ["新加坡", "Singapore"],
      cards: [
        {"theme": "地方手艺", "title": "一座植物园里的种植实验", "tags": ["新加坡植物园", "植物"], "body": "新加坡植物园最初是热带植物的研究场所之一。园中仍能观察到景观、植物引种和研究历史留下的空间布局。", "source": "botanic"},
        {
          theme: "食与日常",
          title: "小贩中心的共同餐桌",
          tags: ["小贩文化", "家常饮食"],
          body: "在新加坡的小贩中心，人们一起用餐，也在桌边聊天、下棋。来自不同背景的摊主把各自的烹饪经验带进社区，形成这座城市的日常饮食文化。",
          source: "hawker",
        },
        {
          theme: "乡音曲艺",
          title: "南音在南洋的新声",
          tags: ["南音", "闽南语"],
          body: "自十九世纪末以来，新加坡便有南音演奏。当地乐团延续泉州方言的唱腔，也尝试加入其他族群的乐器，为传统曲目写下新的演绎。",
          source: "lion",
        },
      ],
      kin: "quanzhou",
    },
    {
      id: "xiamen",
      city: "厦门",
      area: "福建",
      coords: [118.08, 24.48],
      art: "wave",
      aliases: ["厦门", "廈門", "Xiamen"],
      cards: [
        {"theme": "港口街区", "title": "隔着水面看鼓浪屿", "tags": ["鼓浪屿", "厦门"], "body": "鼓浪屿位于厦门对岸。岛上既有闽南传统民居，也有近代西式和融合多种风格的建筑。沿路观察它们如何相邻，比只看单座建筑更能读出这段交流史。", "source": "kulangsu"},
        {
          theme: "海洋信俗",
          title: "厦门湾的王船",
          tags: ["送王船", "王船"],
          body: "厦门湾是送王船仪式传承地之一。沿海社区以王船和巡游表达对海上遇难者的追思，留下共同航海生活的记忆。",
          source: "wangchuan",
        },
      ],
    },
    {
      id: "melaka",
      city: "马六甲",
      area: "马来西亚",
      coords: [102.25, 2.2],
      art: "harbor",
      aliases: ["马六甲", "馬六甲", "Melaka", "Malacca"],
      cards: [
        {
          theme: "海洋信俗",
          title: "在马六甲遇见送王船",
          tags: ["送王船", "王船"],
          body: "马六甲部分华人社区传承送王船仪式。中国与马来西亚共同申报的这项传统在 2020 年列入人类非物质文化遗产代表作名录。",
          source: "wangchuan",
        },
        {
          theme: "港口街区",
          title: "海峡两端的街屋",
          tags: ["店屋", "海峡商港"],
          body: "马六甲的广场、教堂和防御建筑记录了港口早期的发展。把这里与槟城乔治市的历史街区放在一起读，可以比较不同时期留下的店屋和城市格局。",
          source: "straits",
        },
      ],
    },

    {
      id: "taipei",
      city: "台北",
      area: "台湾",
      coords: [121.51, 25.057],
      aliases: ["台北", "臺北", "Taipei"],
      art: "courtyard",
      sound: ["nan-tea", "听台语「茶」"],
      cards: [
        {
          theme: "食与日常",
          title: "在大稻埕装一箱茶",
          tags: ["大稻埕", "茶叶"],
          body: "淡水开港后，茶叶沿水路运到大稻埕，再装箱出海。今天站在淡水河边，很难想象十九世纪的码头上曾堆满茶箱，背后的街区聚集着加工和出口茶叶的商号。",
          source: "teaport",
        },
        {
          theme: "港口街区",
          title: "在骑楼下读迪化街",
          tags: ["迪化街", "店屋", "骑楼"],
          body: "沿河卸下的南北货曾在迪化街销售。商人盖起的店屋一边留出可以避雨的骑楼，一边用不同风格的立面装饰迎客。买卖和天气都在街上留下了形状。",
          source: "street",
        },
      ],
    },
    {
      id: "hongkong",
      city: "香港",
      area: "香港",
      coords: [114.18, 22.28],
      aliases: ["香港", "Hong Kong"],
      art: "lantern",
      sound: ["yue-moon", "听粤语「月」"],
      cards: [
        {
          theme: "岁时节俗",
          title: "大坑的三个中秋夜",
          tags: ["大坑", "中秋", "舞火龙"],
          body: "农历八月十四到十六，插满线香的火龙在大坑的街巷间巡游。连续三晚的龙舞由社区共同参与，寄托居民祈求平安的心愿。",
          source: "dragon",
        },
        {
          theme: "乡音曲艺",
          title: "粤剧的唱词从哪里来",
          tags: ["粤剧", "粤语", "锣鼓"],
          body: "粤语既是戏中的唱词，也是角色对白的语言。香港的粤剧舞台上，演员用唱、做、念、打讲故事，锣鼓为身段与情节添上节拍。",
          source: "opera",
        },
        {
          theme: "食与日常",
          title: "一杯奶茶里的手艺",
          tags: ["港式奶茶", "拼茶", "撞茶"],
          body: "一杯港式奶茶从拼配茶叶开始，再煮茶、撞茶、焗茶和撞奶。茶餐桌上的一杯饮品，留住了香港人将英式奶茶发展为本地做法的过程。",
          source: "milktea",
        },
      ],
    },
    {
      id: "georgetown",
      city: "乔治市",
      area: "马来西亚·槟城",
      coords: [100.34, 5.42],
      aliases: ["槟城", "檳城", "乔治市", "喬治市", "Penang", "George Town"],
      art: "courtyard",
      cards: [
        {"theme": "地方手艺", "title": "店屋的前厅与街面", "tags": ["乔治市", "店屋"], "body": "乔治市与马六甲的历史城区保存了成片的店屋。街道、店铺和居住空间相接，保留着港口社区长期交易与生活的关系。", "source": "straits"},
        {
          theme: "港口街区",
          title: "一条店屋街记录的往来",
          tags: ["店屋", "海峡商港"],
          body: "在槟城乔治市，成排的店屋和住宅保存着海峡港口的生活尺度。它与马六甲共同列入世界遗产，两地街屋的不同样式记录了漫长的贸易往来。",
          source: "straits",
        },
      ],
    },
    {
      id: "meizhou",
      city: "湄洲岛",
      area: "福建·莆田",
      coords: [119.14, 25.08],
      aliases: ["湄洲", "莆田", "Meizhou Island"],
      art: "sampan",
      cards: [
        {
          theme: "海洋信俗",
          title: "海岛上的妈祖庙会",
          tags: ["妈祖", "湄洲岛", "庙会"],
          body: "在湄洲岛的妈祖庙会上，渔民、农户和其他居民暂歇手头的工作，一同敬奉妈祖、观看表演。海岛居民关于救助遇险者的传说，也随这一信俗流传。",
          source: "mazucustom",
        },
      ],
    },
    {
      id: "longquan",
      city: "龙泉",
      area: "浙江·丽水",
      coords: [119.14, 28.08],
      aliases: ["龙泉", "龍泉", "Longquan"],
      art: "mountain",
      sound: ["nan-mountain", "听台语「山」"],
      cards: [
        {
          theme: "地方手艺",
          title: "一炉青瓷，怎样看火候",
          tags: ["龙泉青瓷", "釉色"],
          body: "器胎上釉后再次入窑。工匠既用温度计，也看火焰的颜色来判断火候。釉料配方、升温和降温的时机，一起决定出窑时的青色。",
          source: "enamel",
        },
      ],
    },
    {
      id: "chaozhou",
      city: "潮州",
      area: "广东",
      coords: [116.63, 23.66],
      aliases: ["潮州", "Chaozhou"],
      art: "leaf",
      cards: [
        {
          theme: "食与日常",
          title: "小杯里的工夫",
          tags: ["工夫茶", "乌龙茶"],
          body: "先温茶盅，再把乌龙茶纳入壶中。高冲、低洒、分茶、闻香，各有次序。潮州工夫茶用一连串动作，让围在茶席边的人一起等到开茶的一刻。",
          source: "gongfu",
        },
        {
          theme: "地方手艺",
          title: "茶席上的手拉朱泥壶",
          tags: ["朱泥壶", "工夫茶"],
          body: "潮州的手拉朱泥壶和本地饮茶习惯相伴发展。枫溪的制陶传统，为今天工夫茶席上常见的小壶留下了一条可以追溯的手艺线索。",
          source: "pot",
        },
      ],
    },
    {
      id: "hoian",
      city: "会安",
      area: "越南",
      coords: [108.33, 15.88],
      aliases: ["会安", "會安", "Hoi An", "Hội An"],
      art: "harbor",
      cards: [
        {
          theme: "港口街区",
          title: "街的一面临水，一面迎客",
          tags: ["会安古城", "秋盆河", "街屋"],
          body: "会安古城的街道沿秋盆河展开。传统街屋前面向行人开门，背面临河，方便商船卸货。沿着一间屋子从前门走到后门，就能看出商埠的生活方式。",
          source: "hoian",
        },
        {
          theme: "地方手艺",
          title: "木桥与木构街屋",
          tags: ["木构", "日本桥"],
          body: "在会安，木构房屋密密排列于窄街两侧，木构件上留着传统雕纹。日本桥上的庙宇和沿街的屋瓦，一起构成旧港口保留下来的建筑景观。",
          source: "hoian",
        },
      ],
    },
    {
      id: "macau",
      city: "澳门",
      area: "港澳",
      coords: [113.541, 22.194],
      art: "courtyard",
      aliases: ["澳门", "澳門"],
      cards: [
        {"theme": "港口街区", "title": "澳门旧城的广场与街巷", "tags": ["澳门历史城区", "港口"], "body": "从议事亭前地走入周围街巷，可以看到广场、住宅与宗教建筑连成的旧城空间。不同建筑习惯共同留下了海上贸易城市的痕迹。", "source": "macauHeritage"},
        {"theme": "地方手艺", "title": "读一读旧城里的中西建筑", "tags": ["澳门历史城区", "建筑"], "body": "澳门历史城区保存了中式庙宇，也保存了教堂和城防设施。沿街观察建筑的功能、材料和布局，可以把这座旧港放回海上交流的历史中。", "source": "macauHeritage"},
      ],
    },
    {
      id: "kaiping",
      city: "开平",
      area: "广东",
      coords: [112.69, 22.36],
      art: "courtyard",
      aliases: ["开平", "開平"],
      cards: [
        {"theme": "地方手艺", "title": "碉楼的防守与营造", "tags": ["开平碉楼", "侨乡"], "body": "开平碉楼是村落中的多层防御建筑。不同碉楼的墙体、开窗和顶部装饰各有特征，体现地方营造与海外建筑风格的结合。", "source": "diaolou"},
        {"theme": "港口街区", "title": "侨乡里的返乡建筑", "tags": ["开平碉楼", "侨乡"], "body": "开平既是侨乡，也是观察移民往返的地方。十九世纪末至二十世纪初，离乡者同故乡的联系体现在碉楼与村落的建造中。", "source": "diaolou"},
      ],
    },
    {
      id: "hue",
      city: "顺化",
      area: "越南",
      coords: [107.58, 16.47],
      art: "boat",
      aliases: ["顺化", "順化", "Huế"],
      cards: [
        {"theme": "港口街区", "title": "香江穿过顺化", "tags": ["顺化古迹群", "香江"], "body": "香江贯穿顺化。沿河看去，旧都的城墙、宫城和周围景观彼此关联，用河流作线索可以读出城市的格局。", "source": "hueHeritage"},
        {"theme": "地方手艺", "title": "宫城、园林与山水", "tags": ["顺化古迹群", "园林"], "body": "顺化古迹群还包括分布在城外的陵寝和其他建筑。建筑与地形、水系的组合，是阅读这处遗产布局的一条线索。", "source": "hueHeritage"},
      ],
    },
    {
      id: "ayutthaya",
      city: "大城",
      area: "泰国",
      coords: [100.56, 14.35],
      art: "lantern",
      aliases: ["大城", "阿瑜陀耶", "Ayutthaya"],
      cards: [
        {"theme": "港口街区", "title": "河道围合的旧都", "tags": ["大城遗址", "河运"], "body": "大城旧城坐落在河流围合的岛上，水路有助于理解它作为区域中心的兴起。留存的遗址见证了这里曾经的对外往来。", "source": "ayutthayaHeritage"},
        {"theme": "地方手艺", "title": "从塔和寺院辨认旧城", "tags": ["大城遗址", "建筑"], "body": "今天仍能从砖砌塔、寺院和高台辨认旧城。不同来源的装饰和建筑手法，也反映出大城与其他地区的交流。", "source": "ayutthayaHeritage"},
      ],
    },
  ];
  const atlasState = {
    theme: "全部",
    mode: "地图",
  };
  const connections = [
    ["quanzhou", "singapore", "乡音曲艺"],
    ["xiamen", "melaka", "海洋信俗"],
    ["georgetown", "melaka", "港口街区"],
  ];
  const themes = [
    "全部",
    ...unique(places.flatMap((p) => p.cards.map((c) => c.theme))),
  ];
  function available() {
    return places.filter(
      (p) =>
        atlasState.theme === "全部" ||
        p.cards.some((c) => c.theme === atlasState.theme),
    );
  }
  function filteredCards(place) {
    return place.cards.filter(
      (c) => atlasState.theme === "全部" || c.theme === atlasState.theme,
    );
  }
  const sourceLink = (key) => {
    const [label, href] = sources[key];
    return (
      '<a class="ca-source" href="' +
      href +
      '" target="_blank" rel="noopener noreferrer">' +
      esc(label) +
      " ↗</a>"
    );
  };
  function themeChips() {
    return (
      '<div class="ca-tabs" role="group" aria-label="地图主题">' +
      themes
        .map(
          (t) =>
            '<button type="button" data-ca-theme="' +
            esc(t) +
            '" aria-pressed="' +
            (t === atlasState.theme) +
            '">' +
            esc(t) +
            "</button>",
        )
        .join("") +
      "</div>"
    );
  }
  function placeDetails(place) {
    const related = letters().filter((l) =>
      place.aliases.some((a) =>
        (l.region || "").toLowerCase().includes(a.toLowerCase()),
      ),
    );
    const cards = filteredCards(place);
    const audioLetter = related.find(
      (l) =>
        l.exhibit &&
        l.media?.type === "audio" &&
        /^\/api\/media\/[\w-]+$/.test(l.media.url),
    );
    const soundWord = cards.some((c) => c.source === "wangchuan")
      ? "boat"
      : "sea";
    const soundUrl = audioLetter
      ? linkTo("sounds", "post-" + audioLetter.id)
      : linkTo("sounds", place.sound?.[0] || "nan-" + soundWord);
    const soundLabel = audioLetter
      ? "听当地声音来信"
      : place.sound?.[1] ||
        "听台语「" + (soundWord === "boat" ? "船" : "海") + "」";
    return (
      '<article class="ca-place"><div class="ca-place-visual"><img alt="" src="' +
      app().art(place.art) +
      '"><span>' +
      esc(place.area) +
      '</span></div><div class="ca-place-copy"><h2>' +
      esc(place.city) +
      "</h2>" +
      cards
        .map(
          (c) =>
            '<section class="ca-guide"><span>' +
            esc(c.theme) +
            "</span><h3>" +
            esc(c.title) +
            "</h3><p>" +
            esc(c.body) +
            "</p>" +
            sourceLink(c.source) +
            "</section>",
        )
        .join("") +
      (place.kin && cards.some((c) => c.tags.includes("南音"))
        ? '<div class="ca-kin"><strong>跨海的同一支曲</strong><p>泉州方言的南音也在新加坡传唱。两个地方的资料可以对照阅读。</p>' +
          sourceLink("lion") +
          '<a class="ca-cross" href="' +
          linkTo("atlas", place.kin) +
          '">探索' +
          places.find((p) => p.id === place.kin).city +
          " →</a></div>"
        : "") +
      `<nav class="ca-related-links" aria-label="继续探索"><a href="#knowledge/${place.id}">${icon("branch")} 查看文化关系</a><a href="${soundUrl}">${icon("waves")} ${soundLabel}</a><a href="#workshop">${icon("pen")} 进入共创工坊</a></nav></div></article>` +
      '<section class="ca-local"><div><h2>来自' +
      esc(place.city) +
      "的信</h2><small>按作者公开填写的地域选取</small></div>" +
      (related.length
        ? "<ul>" +
          related
            .slice(0, 8)
            .map(
              (l) =>
                '<li><a href="' +
                linkTo("read", l.id) +
                '"><b>' +
                esc(l.title) +
                "</b><small>" +
                esc(l.author) +
                (l.demo ? " · 示例书信" : "") +
                "</small></a></li>",
            )
            .join("") +
          "</ul>"
        : "<p>这里还没有来自这一地点的公开来信。</p>") +
      "</section>"
    );
  }
  let mapView;
  const mapMessages = {
    loading: "正在加载高德地图…",
    missing: "尚未配置高德地图的 Web 端 Key 和安全密钥。",
    service: "高德地图接口尚未启动。请重启项目后重试。",
    authorization: "高德地图授权失败。请检查 Web 端 Key、安全密钥和域名白名单。",
    unavailable: "高德地图暂时无法加载，请稍后重试。",
  };

  function showMapStatus(chart, status) {
    const notice = chart.querySelector(".ca-map-status");
    const ready = status === "ready";
    const unavailable = !ready && status !== "loading";
    chart.dataset.mapState = status;
    chart.classList.toggle("ca-map-unavailable", unavailable);
    chart.nextElementSibling.hidden = chart.hidden || !ready;
    notice.hidden = ready;
    notice.querySelector("p").textContent = mapMessages[status] || "";
    notice.querySelector(".ca-map-tools").hidden = status === "loading";
    chart.querySelector("[data-ca-map-controls]").hidden = !ready;
    if (unavailable) chart.querySelector("iframe")?.remove();
  }

  function sendMapView(frame) {
    if (!frame?.contentWindow || !mapView) return;
    const translate = window.translateSiteLabel || ((label) => label);
    frame.contentWindow.postMessage(
      {
        ...mapView,
        places: mapView.places.map((place) => ({ ...place, city: translate(place.city) })),
      },
      location.origin,
    );
  }

  window.addEventListener("sea:language-changed", () =>
    sendMapView(document.querySelector(".ca-chart iframe")),
  );

  function loadMap(chart) {
    chart.querySelector("iframe")?.remove();
    showMapStatus(chart, "loading");
    const frame = document.createElement("iframe");
    frame.title = "高德地图 · 文化地点";
    frame.src = "/atlas-map.html";
    frame.addEventListener("load", () => sendMapView(frame));
    chart.prepend(frame);
  }

  window.addEventListener("message", (event) => {
    if (event.origin !== location.origin) return;
    const chart = document.querySelector(".ca-chart");
    const frame = chart?.querySelector("iframe");
    if (!frame || event.source !== frame.contentWindow) return;
    if (event.data?.type === "atlas-map-status") {
      const { status } = event.data;
      if (status === "ready" || Object.hasOwn(mapMessages, status))
        showMapStatus(chart, status);
    }
    if (
      event.data?.type === "atlas-map-select" &&
      !chart.hidden &&
      available().some((place) => place.id === event.data.id)
    ) {
      app().go("atlas/" + event.data.id);
    }
  });

  function atlas(root, id) {
    const requested = places.find((place) => place.id === id);
    if (requested && !available().includes(requested)) atlasState.theme = "全部";
    const filtered = available();
    const selected = requested || filtered[0];

    // Preserve the map document and its viewport when browsing cultural stops.
    if (!root.querySelector(".ca-atlas")) {
      root.innerHTML = `<div class="ca-atlas">
        <header class="page-head"><div><h1>数字文化地图</h1><p>循着乡音、节俗与餐桌，探索一座城市，再读一封当地的信。</p></div></header>
        ${themeChips()}
        <div class="ca-spread">
          <div><section class="ca-map-panel">
            <div class="ca-map-heading"><h2>文化地点</h2><div class="ca-toggle">
              <button type="button" data-ca-mode="地图">地图</button>
              <button type="button" data-ca-mode="列表">列表</button>
            </div></div>
            <div class="ca-chart">
              <div class="ca-map-status">
                <p role="status"></p>
                <div class="ca-map-tools" hidden>
                  <button type="button" data-ca-map-action="retry">重新加载</button>
                  <button type="button" data-ca-mode="列表">切换到列表</button>
                </div>
              </div>
              <div class="ca-map-tools" data-ca-map-controls aria-label="地图操作" hidden>
                <button type="button" data-ca-map-action="out" aria-label="缩小地图">−</button>
                <button type="button" data-ca-map-action="in" aria-label="放大地图">＋</button>
                <button type="button" data-ca-map-action="overview">全景</button>
              </div>
            </div>
            <p class="ca-caption">虚线连接共享文化传统的地点。点选地标可查看当地文化与来信。</p>
            <div class="ca-stop-list"></div>
          </section></div>
          <div class="ca-place-details"></div>
        </div>
      </div>`;
    }

    root.querySelectorAll(".ca-tabs button").forEach((button) =>
      button.setAttribute("aria-pressed", button.dataset.caTheme === atlasState.theme),
    );
    root.querySelectorAll(".ca-toggle button").forEach((button) =>
      button.setAttribute("aria-pressed", button.dataset.caMode === atlasState.mode),
    );
    root.querySelector(".ca-stop-list").innerHTML = filtered
      .map((place) => `<a href="${linkTo("atlas", place.id)}" ${place === selected ? 'aria-current="location"' : ""}><span>${esc(place.city)}</span><small>${esc(place.area)}</small></a>`)
      .join("");
    root.querySelector(".ca-place-details").innerHTML = placeDetails(selected);

    const chart = root.querySelector(".ca-chart");
    chart.hidden = atlasState.mode !== "地图";
    root.querySelector(".ca-caption").hidden = chart.hidden || chart.dataset.mapState !== "ready";
    if (!chart.hidden) {
      const activePlaces = new Set(filtered.map((place) => place.id));
      mapView = {
        type: "atlas-map-view",
        theme: atlasState.theme,
        selected: selected.id,
        focusPlace: Boolean(requested),
        places: filtered.map(({ id, city }) => ({ id, city })),
        locations: places.map(({ id, coords }) => [id, coords]),
        lines: connections
          .filter(([from, to, theme]) =>
            activePlaces.has(from) && activePlaces.has(to) &&
            (atlasState.theme === "全部" || atlasState.theme === theme),
          )
          .map(([from, to]) => [from, to]),
      };
      if (!chart.dataset.mapState) loadMap(chart);
      else sendMapView(chart.querySelector("iframe"));
    }
  }

  function selectedMarkup(tags) {
    return tags.length
      ? tags
          .map(
            (tag) =>
              '<button type="button" class="ct-picked" data-ct-remove="' +
              esc(tag) +
              '" aria-label="删除标签 ' +
              esc(tag) +
              '">' +
              esc(tag) +
              ' <span aria-hidden="true">×</span></button>',
          )
          .join("")
      : "<small>尚未选择标签</small>";
  }
  function tagsEditor(draftTags = []) {
    const tags = Array.isArray(draftTags)
      ? unique(
          draftTags
            .filter((t) => typeof t === "string" && t.trim())
            .map((t) => t.trim()),
        ).slice(0, 5)
      : [];
    return (
      '<fieldset class="ct-editor"><legend>文化标签</legend><p class="ct-help">选填，最多五个。标签帮助读者找到有共同记忆的公开来信。</p><div class="ct-selected" data-ct-selected>' +
      selectedMarkup(tags) +
      '</div><div class="ct-add"><input type="text" data-ct-input aria-label="新文化标签" placeholder="自定义标签，例如：面线"><button type="button" class="btn compact" data-ct-add>添加</button></div>' +
      '<label class="ct-consent"><input type="checkbox" data-ct-consent>本次允许把标题和正文发送给站点配置的模型服务</label><div class="ct-suggest"><button type="button" class="btn compact" data-ct-suggest>' +
      icon("search", 15) +
      ' 识别文化元素</button><small>默认仅使用本站词表</small></div><div data-ct-status role="status" aria-live="polite"></div><div class="ct-candidates" data-ct-candidates></div></fieldset>'
    );
  }
  function readTags(form) {
    return [
      ...form.querySelectorAll("[data-ct-selected] [data-ct-remove]"),
    ].map((b) => b.dataset.ctRemove);
  }
  function updateSelection(box, wanted, remove) {
    const selected = readTags(box);
    const tag = wanted.trim();
    const status = box.querySelector("[data-ct-status]");
    if (!tag) return;
    if (remove) selected.splice(selected.indexOf(tag), 1);
    else if (
      Array.from(tag).length > 12 ||
      /[\u0000-\u001f\u007f]/u.test(tag)
    ) {
      status.textContent = "标签限 1 至 12 字，请使用单行文字。";
      return;
    } else if (selected.includes(tag)) {
      status.textContent = "已选过这个标签。";
      return;
    } else if (selected.length >= 5) {
      status.textContent = "已选满五个，请先移除一个标签。";
      return;
    } else selected.push(tag);
    box.querySelector("[data-ct-selected]").innerHTML =
      selectedMarkup(selected);
    box.querySelectorAll("[data-ct-candidate]").forEach((b) => {
      b.disabled = selected.includes(b.dataset.ctCandidate);
    });
    if (!remove && box.querySelector("[data-ct-input]").value.trim() === tag)
      box.querySelector("[data-ct-input]").value = "";
    status.textContent = (remove ? "已移除「" : "已添加「") + tag + "」。";
    box.dispatchEvent(new Event("input", { bubbles: true }));
  }
  async function suggest(button, box) {
    const form = button.closest("form");
    const title = form.elements.title.value.trim(),
      body = form.elements.body.value.trim();
    const status = box.querySelector("[data-ct-status]"),
      candidates = box.querySelector("[data-ct-candidates]");
    if (!title && !body) {
      status.textContent = "先写下标题或正文，再识别标签。";
      return;
    }
    button.disabled = true;
    status.textContent = "正在识别文化元素…";
    candidates.replaceChildren();
    try {
      const consent = box.querySelector("[data-ct-consent]");
      const allowModel = consent.checked;
      consent.checked = false;
      const data = await app().request("suggest-tags", {
        title,
        body,
        allowModel,
      });
      if (!box.isConnected) return;
      const selected = readTags(box);
      status.textContent =
        (data.sourceLabel || "标签建议") +
        " · " +
        (data.tags.length
          ? "点击候选即可添加。"
          : "未发现合适的标签，可手动添加。") +
        (data.notice ? " " + data.notice : "");
      candidates.innerHTML = data.tags
        .map(
          (t) =>
            '<button type="button" data-ct-candidate="' +
            esc(t) +
            '" ' +
            (selected.includes(t) ? "disabled" : "") +
            ">＋ " +
            esc(t) +
            "</button>",
        )
        .join("");
    } catch (err) {
      status.textContent = err.message || "识别暂时不可用，可手动添加。";
    } finally {
      button.disabled = false;
    }
  }
  function related(letter) {
    if (!letter || letter.status !== "published") return "";
    const tags = Array.isArray(letter.tags) ? letter.tags : [];
    const matches = letters()
      .filter((l) => l.id !== letter.id)
      .map((l) => {
        const common = tags.filter((t) => (l.tags || []).includes(t));
        return { letter: l, common, theme: l.theme === letter.theme };
      })
      .filter((m) => m.common.length || m.theme)
      .sort(
        (a, b) =>
          b.common.length - a.common.length ||
          Number(b.theme) - Number(a.theme) ||
          String(b.letter.created).localeCompare(String(a.letter.created)) ||
          String(a.letter.id).localeCompare(String(b.letter.id)),
      )
      .slice(0, 3);
    if (!matches.length && !tags.length) return "";
    return (
      '<section class="ct-related"><h2>相关文化故事</h2>' +
      (tags.length
        ? '<div class="ct-terms">' +
          tags.map((t) => "<span>" + esc(t) + "</span>").join("") +
          "</div>"
        : "") +
      (matches.length
        ? "<ul>" +
          matches
            .map(
              (m) =>
                '<li><a href="' +
                linkTo("read", m.letter.id) +
                '"><strong>' +
                esc(m.letter.title) +
                "</strong><small>" +
                esc(
                  m.common.length
                    ? "共同标签 · " + m.common.join("、")
                    : "同一主题 · " + letter.theme,
                ) +
                "</small></a></li>",
            )
            .join("") +
          "</ul>"
        : "<p>暂未找到相同标签或主题的公开来信。</p>") +
      "</section>"
    );
  }
  document.addEventListener("click", (e) => {
    const b = e.target.closest(
      "button[data-ca-theme],button[data-ca-mode],button[data-ca-map-action],button[data-ct-remove],button[data-ct-add],button[data-ct-suggest],button[data-ct-candidate]",
    );
    if (!b) return;
    if (b.dataset.caMapAction) {
      const chart = b.closest(".ca-chart");
      if (b.dataset.caMapAction === "retry") loadMap(chart);
      else chart.querySelector("iframe")?.contentWindow?.postMessage(
        { type: "atlas-map-control", action: b.dataset.caMapAction },
        location.origin,
      );
      return;
    }
    if (b.hasAttribute("data-ca-theme")) {
      atlasState.theme = b.dataset.caTheme;
      const id = location.hash.split("/")[1] || "";
      const target = available().find((p) => p.id === id) || available()[0];
      app().go("atlas/" + target.id);
      return;
    }
    if (b.hasAttribute("data-ca-mode")) {
      atlasState.mode = b.dataset.caMode;
      app().render();
      if (!b.closest(".ca-toggle")) {
        document.querySelector(".ca-toggle [aria-pressed='true']")?.focus();
      }
      return;
    }
    const box = b.closest(".ct-editor");
    if (b.hasAttribute("data-ct-suggest")) {
      suggest(b, box);
      return;
    }
    if (b.hasAttribute("data-ct-remove")) {
      updateSelection(box, b.dataset.ctRemove, true);
      return;
    }
    updateSelection(
      box,
      b.dataset.ctCandidate || box.querySelector("[data-ct-input]").value,
      false,
    );
  });
  document.addEventListener("keydown", (e) => {
    if (
      e.key === "Enter" &&
      !e.isComposing &&
      e.target.matches("[data-ct-input]")
    ) {
      e.preventDefault();
      updateSelection(e.target.closest(".ct-editor"), e.target.value, false);
    }
  });
  window.cultureViews = { atlas, sources };
  window.cultureTools = { tagsEditor, readTags, related };
})();
