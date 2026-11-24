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
  ];
  const atlasState = {
    theme: "全部",
    mode: "地图",
    level: 0,
    center: null,
    place: "",
  };
  const zoomLevels = [1, 1.7, 2.8, 4.5];
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
  // Small-scale coastline sketch in latitude/longitude. City pins use the same projection.
  const xy = ([lng, lat]) => [(lng - 93) * 16, (31 - lat) * 12];
  const coords = (points) =>
    points
      .map((p) =>
        xy(p)
          .map((n) => n.toFixed(1))
          .join(","),
      )
      .join(" ");
  const shores = [
    [
      [90, 36],
      [127, 36],
      [123, 32],
      [121.2, 31.6],
      [121.9, 30.9],
      [121.1, 30.4],
      [121.5, 29.9],
      [122, 29.7],
      [121.5, 28.7],
      [120.8, 27.9],
      [120.4, 27.2],
      [119.8, 26.6],
      [119.7, 26.1],
      [119.1, 25.4],
      [118.8, 25.1],
      [118.6, 24.8],
      [118.2, 24.6],
      [118.1, 24.4],
      [117.7, 24.2],
      [117.3, 23.7],
      [116.7, 23.4],
      [116.0, 22.8],
      [115.0, 22.7],
      [114.4, 22.6],
      [114.1, 22.3],
      [113.6, 22.6],
      [113.5, 22.1],
      [112.8, 21.9],
      [111, 21.4],
      [110.5, 21.2],
      [110.3, 20.3],
      [109.9, 20.2],
      [109.7, 21.3],
      [108.4, 21.6],
      [107.8, 21.5],
      [107, 20.9],
      [106.7, 20.8],
      [106.5, 20],
      [105.7, 19.3],
      [105.9, 18.4],
      [106.6, 17.7],
      [107.7, 16.5],
      [108.2, 16.2],
      [108.8, 15.2],
      [109.3, 13.8],
      [109.4, 12.5],
      [109.1, 11.7],
      [108.4, 11.2],
      [107.2, 10.7],
      [106.7, 10.3],
      [106.3, 9.5],
      [105.2, 8.7],
      [104.8, 8.6],
      [104.8, 9.8],
      [104.5, 10.4],
      [103.5, 10.6],
      [103, 11.5],
      [102.4, 12.2],
      [101.9, 12.5],
      [101.2, 12.7],
      [100.9, 13.0],
      [100.9, 13.5],
      [100.3, 13.6],
      [100, 12.5],
      [99.5, 11.0],
      [99.2, 10.1],
      [99.9, 9.3],
      [100.1, 8.7],
      [100.4, 7.4],
      [100.6, 6.9],
      [101.4, 6.8],
      [102.2, 6.2],
      [103.1, 5.3],
      [103.5, 4.6],
      [103.4, 3.5],
      [103.8, 2.4],
      [104.2, 1.5],
      [103.6, 1.25],
      [103.1, 1.8],
      [102.3, 2.2],
      [101.4, 2.8],
      [101.0, 3.4],
      [100.6, 4.3],
      [100.3, 5.3],
      [100.1, 6.2],
      [99.6, 6.7],
      [99.3, 7.5],
      [98.6, 8.2],
      [98.2, 8.2],
      [98.5, 9.7],
      [98.6, 10.6],
      [99, 11.8],
      [98.7, 13],
      [98.2, 14],
      [97.8, 15.5],
      [97.5, 16.5],
      [96.6, 16.6],
      [95.5, 15.8],
      [94.5, 16.0],
      [90, 19],
    ],
    [
      [121.54, 25.3],
      [121.97, 25.0],
      [121.83, 24.6],
      [121.62, 24.1],
      [121.48, 23.4],
      [121.1, 22.8],
      [120.86, 22.3],
      [120.85, 21.9],
      [120.55, 22.3],
      [120.27, 22.7],
      [120.14, 23.1],
      [120.08, 23.5],
      [120.3, 24.05],
      [120.65, 24.5],
      [120.96, 25.02],
    ],
    [
      [110.96, 20],
      [110.4, 20.16],
      [109.5, 19.95],
      [108.63, 19.33],
      [108.71, 18.5],
      [109.5, 18.2],
      [110.1, 18.4],
      [110.65, 19.2],
    ],
    [
      [95.2, 5.8],
      [96.5, 5.1],
      [97.5, 5.1],
      [98.5, 4],
      [99.5, 3.3],
      [100.1, 2.4],
      [101.0, 2],
      [102.1, 1.4],
      [102.6, 0.65],
      [103.6, -0.5],
      [104.6, -1.0],
      [104.9, -2.1],
      [106.1, -2.9],
      [105.9, -5.8],
      [104.4, -5.4],
      [103.2, -4.5],
      [101.5, -2.6],
      [100.2, -0.6],
      [99.1, 1.4],
      [97.7, 2.7],
      [96.3, 3.8],
    ],
    [
      [108.9, 0.9],
      [109.5, 1.9],
      [110.5, 2],
      [111.1, 2.7],
      [112.2, 2.8],
      [113.0, 3.2],
      [114.0, 4.2],
      [114.7, 4.9],
      [115.5, 5.2],
      [116.3, 6.1],
      [117.2, 6.9],
      [117.8, 6.2],
      [117.5, 5.7],
      [118.8, 5.2],
      [119.3, 5.0],
      [118.5, 4.2],
      [117.8, 4.2],
      [117.6, 3.1],
      [118.5, 2.1],
      [117.7, 1.1],
      [117.5, 0.1],
      [116.8, -1.1],
      [116.2, -2.2],
      [116.1, -3.4],
      [114.5, -3.8],
      [113.3, -3.3],
      [112, -3.5],
      [110.4, -2.9],
      [109.7, -1.9],
      [109.3, -0.8],
    ],
    [
      [120.6, 18.5],
      [121.5, 18.4],
      [122.0, 18.6],
      [122.4, 17.1],
      [121.9, 16.3],
      [121.8, 15.3],
      [121.6, 14.7],
      [122.8, 14.0],
      [123.3, 13.8],
      [124.1, 13.2],
      [123.5, 12.9],
      [122.5, 13.5],
      [121.4, 13.9],
      [120.7, 13.8],
      [120.6, 14.3],
      [120.9, 14.6],
      [120.1, 14.8],
      [119.8, 16.1],
      [120.4, 16.4],
      [120.3, 17.9],
    ],
    [
      [117.1, 8.5],
      [117.7, 8.9],
      [118.3, 9.6],
      [119.0, 10.3],
      [119.6, 11.3],
      [119.3, 11.3],
      [118.7, 10.6],
      [118.0, 9.9],
      [117.4, 9.2],
    ],
  ];
  function frame() {
    const scale = zoomLevels[atlasState.level],
      width = 550 / scale,
      height = 416 / scale;
    const [cx, cy] = atlasState.center || [275, 208];
    return {
      x: Math.max(0, Math.min(550 - width, cx - width / 2)),
      y: Math.max(0, Math.min(416 - height, cy - height / 2)),
      width,
      height,
      scale,
    };
  }
  function mapGraphic(filtered, selected) {
    const activeIds = new Set(filtered.map((p) => p.id));
    const f = frame();
    const anchors = {
      quanzhou: [-46, -31],
      xiamen: [-90, -7],
      tainan: [37, 24],
      singapore: [48, 14],
      melaka: [-49, -11],
      taipei: [45, -8],
      hongkong: [-62, 39],
      georgetown: [26, -24],
      meizhou: [45, -41],
      longquan: [-30, -17],
      chaozhou: [-27, 22],
      hoian: [44, -13],
    };
    const pins = places
      .map((p) => {
        const [x, y] = xy(p.coords);
        if (!activeIds.has(p.id))
          return `<circle cx="${x}" cy="${y}" r="${3 / f.scale}" fill="#759aa1"/>`;
        const [dx, dy] = anchors[p.id],
          width = p.city.length * 14 + 16;
        return `<a class="ca-svg-pin" href="${linkTo("atlas", p.id)}" aria-label="探索${p.city}" ${p === selected ? 'aria-current="location"' : ""}>
        <g transform="translate(${x} ${y}) scale(${1 / f.scale})"><path d="M0 0 L${dx} ${dy}" class="ca-pin-leader"/>
        <circle r="14" fill="transparent"/><circle class="ca-pin-halo" r="8"/><circle class="ca-pin-dot" r="3"/>
        <rect x="${dx - width / 2}" y="${dy - 12}" width="${width}" height="24" rx="5"/>
        <text x="${dx}" y="${dy + 4}" text-anchor="middle">${p.city}</text></g></a>`;
      })
      .join("");
    const routes = [
      ["quanzhou", "singapore", "乡音曲艺", 45],
      ["xiamen", "melaka", "海洋信俗", -27],
      ["georgetown", "melaka", "港口街区", 12],
    ]
      .filter(
        ([a, b, t]) =>
          activeIds.has(a) &&
          activeIds.has(b) &&
          (atlasState.theme === "全部" || atlasState.theme === t),
      )
      .map(([a, b, , offset]) => {
        const [ax, ay] = xy(places.find((p) => p.id === a).coords),
          [bx, by] = xy(places.find((p) => p.id === b).coords);
        return `<path d="M${ax} ${ay} Q${(ax + bx) / 2 + offset} ${(ay + by) / 2 + offset}, ${bx} ${by}" class="ca-thread"/>`;
      })
      .join("");
    const geography = shores
      .map(
        (s) =>
          `<polygon class="ca-landmass" points="${coords(s)}"/><polygon fill="url(#ca-land)" points="${coords(s)}"/>`,
      )
      .join("");
    return `<svg class="ca-map" tabindex="0" data-zoomed="${!!atlasState.level}" viewBox="${f.x} ${f.y} ${f.width} ${f.height}" aria-label="东亚与东南亚文化地点示意图，放大后可拖动或按方向键平移">
      <defs><pattern id="ca-grid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0V32" fill="none" stroke="#58818c" stroke-width=".45"/></pattern>
      <pattern id="ca-land" width="9" height="9" patternUnits="userSpaceOnUse"><path d="M1 8l2-1" stroke="#7ca99f" stroke-width=".55"/></pattern></defs>
      <rect width="550" height="416" fill="#123441"/><rect width="550" height="416" fill="url(#ca-grid)"/>
      ${geography}<g class="ca-sea-label" fill="#aac1bf" text-anchor="middle"><text x="333" y="267">南 海</text><text x="510" y="151">东 海</text></g>${routes}${pins}</svg>`;
  }
  function mapTools() {
    const z = atlasState.level;
    return `<div class="ca-tools" aria-label="地图缩放"><button type="button" data-ca-zoom="out" aria-label="缩小地图" ${z ? "" : "disabled"}>−</button><output>${Math.round(zoomLevels[z] * 100)}%</output><button type="button" data-ca-zoom="in" aria-label="放大地图" ${z === zoomLevels.length - 1 ? "disabled" : ""}>＋</button><button type="button" data-ca-zoom="reset" aria-label="恢复地图全景">全景</button></div>`;
  }
  function panTo(svg, x, y) {
    atlasState.center = [x, y];
    const f = frame();
    atlasState.center = [f.x + f.width / 2, f.y + f.height / 2];
    svg.setAttribute("viewBox", [f.x, f.y, f.width, f.height].join(" "));
  }
  document.addEventListener("pointerdown", (event) => {
    const svg = event.target.closest('.ca-map[data-zoomed="true"]');
    if (!svg || event.target.closest("a") || event.button !== 0) return;
    const f = frame(),
      transform = svg.getScreenCTM();
    if (!transform) return;
    const { clientX, clientY, pointerId } = event;
    svg.setPointerCapture(pointerId);
    const move = (e) => {
      if (e.pointerId === pointerId)
        panTo(
          svg,
          f.x + f.width / 2 - (e.clientX - clientX) / transform.a,
          f.y + f.height / 2 - (e.clientY - clientY) / transform.d,
        );
    };
    svg.addEventListener("pointermove", move);
    svg.addEventListener(
      "lostpointercapture",
      () => svg.removeEventListener("pointermove", move),
      { once: true },
    );
  });
  document.addEventListener("keydown", (event) => {
    if (!event.target.matches('.ca-map[data-zoomed="true"]')) return;
    const step = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    }[event.key];
    if (!step) return;
    event.preventDefault();
    const f = frame();
    panTo(
      event.target,
      f.x + f.width * (0.5 + step[0] * 0.12),
      f.y + f.height * (0.5 + step[1] * 0.12),
    );
  });
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
  function atlas(id) {
    const requested = places.find((p) => p.id === id);
    if (requested && !available().some((p) => p.id === id))
      atlasState.theme = "全部";
    const filtered = available();
    const selected = requested || filtered[0];
    if (selected.id !== atlasState.place) {
      atlasState.center = xy(selected.coords);
      atlasState.place = selected.id;
    }
    const locationList =
      '<div class="ca-stop-list">' +
      filtered
        .map(
          (p) =>
            '<a href="' +
            linkTo("atlas", p.id) +
            '" ' +
            (p === selected ? 'aria-current="location"' : "") +
            "><span>" +
            esc(p.city) +
            "</span><small>" +
            esc(p.area) +
            "</small></a>",
        )
        .join("") +
      "</div>";
    return (
      '<div class="ca-atlas"><header class="page-head"><div><h1>数字文化地图</h1><p>循着乡音、节俗与餐桌，探索一座城市，再读一封当地的信。</p></div></header>' +
      themeChips() +
      '<div class="ca-spread"><div><section class="ca-map-panel"><div class="ca-map-heading"><h2>文化地点</h2><div class="ca-toggle">' +
      ["地图", "列表"]
        .map(
          (m) =>
            '<button type="button" data-ca-mode="' +
            m +
            '" aria-pressed="' +
            (atlasState.mode === m) +
            '">' +
            m +
            "</button>",
        )
        .join("") +
      "</div></div>" +
      (atlasState.mode === "地图"
        ? '<div class="ca-chart">' +
          mapGraphic(filtered, selected) +
          mapTools() +
          '</div><p class="ca-caption">虚线连接共享文化传统的地点。选择地标可查看当地文化与来信。</p>'
        : "") +
      locationList +
      "</section></div><div>" +
      placeDetails(selected) +
      "</div></div></div>"
    );
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
      "button[data-ca-theme],button[data-ca-mode],button[data-ca-zoom],button[data-ct-remove],button[data-ct-add],button[data-ct-suggest],button[data-ct-candidate]",
    );
    if (!b) return;
    if (b.hasAttribute("data-ca-zoom")) {
      const action = b.dataset.caZoom;
      atlasState.level =
        action === "reset"
          ? 0
          : Math.max(
              0,
              Math.min(
                zoomLevels.length - 1,
                atlasState.level + (action === "in" ? 1 : -1),
              ),
            );
      const place = places.find((p) => p.id === atlasState.place);
      atlasState.center = xy(place.coords);
      const panel = b.closest(".ca-chart");
      panel.innerHTML = mapGraphic(available(), place) + mapTools();
      (
        panel.querySelector(`[data-ca-zoom="${action}"]:enabled`) ||
        panel.querySelector('[data-ca-zoom="reset"]')
      ).focus({ preventScroll: true });
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
