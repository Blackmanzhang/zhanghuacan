(() => {
  "use strict";
  const nodes = {
    taipei: {
      label: "台北",
      type: "地点",
      source: "teaport",
      blurb:
        "大稻埕的茶叶交易把台北与海运相连。一条茶街可以串起河岸码头、加工茶叶的商号和城里的店屋。",
      terms: ["臺北", "Taipei"],
    },
    hongkong: {
      label: "香港",
      type: "地点",
      source: "dragon",
      blurb:
        "从大坑的中秋夜走到粤剧戏台，再到冲制奶茶的茶档，节日、乡音和饮食各有可追寻的在地做法。",
      terms: ["Hong Kong"],
    },
    georgetown: {
      label: "乔治市",
      type: "地点",
      source: "straits",
      blurb:
        "槟城乔治市的历史街区以成片的店屋和住宅见证海峡贸易，与马六甲共同组成世界遗产地。",
      terms: ["槟城", "檳城", "喬治市", "George Town", "Penang"],
    },
    meizhou: {
      label: "湄洲岛",
      type: "地点",
      source: "mazucustom",
      blurb:
        "湄洲岛是妈祖传说的重要发生地，庙会与祭祀使口头记忆持续进入社区生活。",
      terms: ["莆田", "湄洲島"],
    },
    longquan: {
      label: "龙泉",
      type: "地点",
      source: "enamel",
      blurb:
        "浙江龙泉的青瓷匠人从釉料配制到烧成掌握多道工艺，成器既供欣赏，也走进日常生活。",
      terms: ["龍泉"],
    },
    chaozhou: {
      label: "潮州",
      type: "地点",
      source: "gongfu",
      blurb:
        "在潮州，一席工夫茶牵着茶叶、小壶与冲泡者的技艺。可以从这里走向乌龙茶或手拉朱泥壶。",
      terms: ["Chaozhou"],
    },
    hoian: {
      label: "会安",
      type: "地点",
      source: "hoian",
      blurb:
        "会安古城临秋盆河，木构房屋和沿河街巷记下这座越南港口与海外商人的往来。",
      terms: ["會安", "会安古城", "Hoi An", "Hội An"],
    },
    dadaocheng: {
      label: "大稻埕",
      type: "街区",
      source: "teaport",
      blurb:
        "淡水开港后，大稻埕成为茶叶重要的贸易区。沿河的贵德街留着茶商聚集的故事。",
    },
    shophouse: {
      label: "店屋",
      type: "建筑",
      source: "straits",
      blurb:
        "店屋是从街道阅读商贸生活的入口。乔治市和马六甲保存着不同时期的店屋，台北迪化街也有自己的店屋与骑楼。",
      terms: ["街屋", "骑楼", "騎樓"],
    },
    tealeaf: {
      label: "茶叶",
      type: "饮食",
      source: "teaport",
      blurb:
        "茶叶可以是待运的货物，也可以是泡茶人手中的原料。在图中可比较台北港区的茶贸、潮州的工夫茶和香港的奶茶。",
      terms: ["茶葉", "茶箱"],
    },
    gongfucha: {
      label: "工夫茶",
      type: "饮食",
      source: "gongfu",
      blurb:
        "潮州工夫茶讲究温杯、冲泡和分茶。乌龙茶与茶壶在这里各有位置，人们也借茶席待客。",
      terms: ["功夫茶"],
    },
    teapot: {
      label: "手拉朱泥壶",
      type: "工艺",
      source: "pot",
      blurb: "潮州陶工将朱泥制成小茶壶，与当地工夫茶的冲泡习惯相互呼应。",
      terms: ["朱泥壶", "朱泥壺"],
    },
    milktea: {
      label: "港式奶茶",
      type: "饮食",
      source: "milktea",
      blurb:
        "茶师将不同茶叶拼配、煮茶并反复撞茶，再配奶。调茶的手法，是辨认港式奶茶的一把钥匙。",
      terms: ["丝袜奶茶", "絲襪奶茶"],
    },
    firedragon: {
      label: "大坑舞火龙",
      type: "民俗",
      source: "dragon",
      blurb:
        "农历八月中旬连续三个夜晚，大坑居民舞动插满线香的火龙，祈求社区平安。",
      terms: ["舞火龙", "舞火龍", "大坑"],
    },
    midautumn: {
      label: "中秋",
      type: "节日",
      source: "dragon",
      blurb:
        "同一个中秋可以有不同的过法。香港大坑的线香火龙是一种地方表达，也可以对照来信中各家的节日记忆。",
      terms: ["中秋节", "中秋節"],
    },
    yueju: {
      label: "粤剧",
      type: "曲艺",
      source: "opera",
      blurb: "演员以粤语演唱、念白，将身段、武打和锣鼓融入舞台叙事。",
      terms: ["粵劇"],
    },
    cantonese: {
      label: "粤语",
      type: "语言",
      source: "opera",
      blurb:
        "在粤剧中，表演者用粤语唱曲和念白。在乡音展馆里也能逐字聆听粤语的日常词音。",
      terms: ["粵語", "广东话", "廣東話"],
    },
    mazu: {
      label: "妈祖信俗",
      type: "民俗",
      source: "mazucustom",
      blurb:
        "沿海社区以口头传说、庙会和祭祀纪念妈祖，参与者在出海平安等心愿中相聚。",
      terms: ["妈祖", "媽祖"],
    },
    mazulamp: {
      label: "妈祖灯",
      type: "民俗",
      source: "mazucustom",
      blurb:
        "一些社区在晚间巡游时手持妈祖灯。灯是活动中的物件，也把祈愿带到了庙门外的街道上。",
      terms: ["媽祖燈"],
    },
    celadon: {
      label: "龙泉青瓷",
      type: "工艺",
      source: "enamel",
      blurb:
        "龙泉青瓷以釉色见长。工匠在施釉后的烧成过程中留意火焰颜色，控制温度变化。",
      terms: ["青瓷", "龍泉青瓷"],
    },
    glaze: {
      label: "青瓷釉色",
      type: "工艺",
      source: "enamel",
      blurb:
        "窑温过高或过低都会影响呈色。传统龙泉青瓷可见厚釉、梅子青等不同效果。",
      terms: ["釉色", "梅子青"],
    },
    bridge: {
      label: "会安日本桥",
      type: "建筑",
      source: "hoian",
      blurb:
        "古城里的日本桥是带有庙宇的木桥。这座桥与木构民居共同见证旧港的多元建筑传统。",
      terms: ["日本桥", "日本橋", "来远桥"],
    },
    nanyin: {
      label: "南音",
      type: "曲艺",
      source: "nanyin",
      blurb:
        "南音里既有纯器乐，也有泉州方言演唱的曲目。沿着乐器、唱词和流传地点，可以听见一支曲子的不同侧面。",
    },
    quanzhou: {
      label: "泉州",
      type: "地点",
      source: "nanyin",
      blurb: "泉州的方言走进南音唱词。泉州湾沿海社区也延续着送王船的传统。",
    },
    singapore: {
      label: "新加坡",
      type: "地点",
      source: "lion",
      blurb:
        "从当地南音乐社到小贩中心，在同一座城市可以追寻音乐和饮食两条文化线索。",
      terms: ["Singapore"],
    },
    tainan: {
      label: "台南",
      type: "地点",
      source: "lantern",
      blurb:
        "在台南盐水，跟随元宵巡境的队伍，可以从一个地点读到一个节日的地方记忆。",
      terms: ["臺南"],
    },
    xiamen: {
      label: "厦门",
      type: "地点",
      source: "wangchuan",
      blurb: "厦门湾沿海社区是送王船的重要传承地。",
      terms: ["廈門", "Xiamen"],
    },
    melaka: {
      label: "马六甲",
      type: "地点",
      source: "wangchuan",
      blurb:
        "马来西亚马六甲的部分华人社区至今传承送王船仪式，与闽南沿岸共享海洋记忆。",
      terms: ["馬六甲", "Melaka", "Malacca"],
    },
    dongxiao: {
      label: "洞箫",
      type: "乐器",
      source: "nanyin",
      blurb: "这支竹制吹管乐器的声音，是辨认南音合奏的一条线索。",
      terms: ["洞簫"],
    },
    pipa: {
      label: "南音琵琶",
      type: "乐器",
      source: "nanyin",
      blurb:
        "演奏者横抱曲颈琵琶参与南音合奏。看演奏姿势，也是认识这种乐器的方式。",
      terms: ["琵琶"],
    },
    dialect: {
      label: "泉州方言",
      type: "语言",
      source: "nanyin",
      blurb: "南音的声乐曲目以泉州方言演唱。这一唱腔也随南音在新加坡延续。",
      terms: ["泉州话", "泉州話"],
    },
    hawker: {
      label: "小贩文化",
      type: "饮食",
      source: "hawker",
      blurb:
        "新加坡的小贩中心由街头饮食发展而来。摊主制作食物，人们围桌吃饭、交谈、下棋。",
      terms: ["小贩中心", "小販", "熟食中心"],
    },
    ceremony: {
      label: "送王船",
      type: "民俗",
      source: "wangchuan",
      blurb:
        "闽南沿岸和马六甲华人社区藉由送王船追思海上遇难者，记住先人与大海的关系。",
      terms: ["王船", "Wangkang"],
    },
    firecrackers: {
      label: "盐水蜂炮",
      type: "民俗",
      source: "lantern",
      blurb: "在盐水，蜂炮与庙宇巡境共同构成元宵节的地方景象。",
      terms: ["鹽水蜂炮", "蜂炮"],
    },
    lantern: {
      label: "元宵",
      type: "节日",
      source: "lantern",
      blurb:
        "农历正月十五的节日，在台南盐水与蜂炮、巡境相连。可循着「元宵」查阅公开来信中各自的过节记忆。",
      terms: ["元宵节", "元宵節"],
    },
    macau: {
      label: "澳门",
      type: "地点",
      source: "macauHeritage",
      blurb: "澳门历史城区的街巷与广场把不同背景的建筑连在一起。它们也留下了早期海上贸易和文化接触的迹象。",
      terms: ["澳門", "Macao"],
    },
    kaiping: {
      label: "开平",
      type: "地点",
      source: "diaolou",
      blurb: "开平村落中的碉楼记录了地方营造传统，以及海外侨民与故乡的持续联系。",
      terms: ["開平", "Kaiping"],
    },
    hue: {
      label: "顺化",
      type: "地点",
      source: "hueHeritage",
      blurb: "顺化旧都围绕香江展开，宫城、寺庙和陵寝共同构成古迹群。",
      terms: ["順化", "Huế"],
    },
    ayutthaya: {
      label: "大城",
      type: "地点",
      source: "ayutthayaHeritage",
      blurb: "泰国大城的历史城区由河流环绕，遗存包括砖塔和寺院。",
      terms: ["阿瑜陀耶", "Ayutthaya"],
    },
    macaocentre: {
      label: "澳门历史城区",
      type: "街区",
      source: "macauHeritage",
      blurb: "历史街区中的广场、庙宇和教堂共同记录了这一海上贸易城市的多种建筑传统。",
      terms: ["澳門歷史城區"],
    },
    kaipingdiaolou: {
      label: "开平碉楼",
      type: "建筑",
      source: "diaolou",
      blurb: "多层的防御性建筑是开平侨乡有代表性的遗存，建筑表现出中外营造手法的交融。",
      terms: ["開平碉樓", "碉楼"],
    },
    huecomplex: {
      label: "顺化古迹群",
      type: "建筑",
      source: "hueHeritage",
      blurb: "古迹群包括都城、宗教建筑和陵寝。沿香江及周边山水，可以理解这组遗产的布局。",
      terms: ["順化古蹟群", "香江"],
    },
    ayutthayaruins: {
      label: "大城遗址",
      type: "建筑",
      source: "ayutthayaHeritage",
      blurb: "留存的塔与寺院见证了大城的发展。旧都的位置也显示了河流在城市格局中的作用。",
      terms: ["大城遺址"],
    },
    gulanyu: {
      label: "鼓浪屿",
      type: "街区",
      source: "kulangsu",
      blurb: "厦门对岸的岛屿，保存闽南民居、西式建筑和不同风格交融的近代遗存。",
      terms: ["鼓浪嶼", "Kulangsu"],
    },
    quanzhouports: {
      label: "宋元泉州",
      type: "街区",
      source: "quanzhouHeritage",
      blurb: "泉州的码头、桥梁、生产作坊与文化遗址共同呈现了宋元时期的海上商贸网络。",
      terms: ["洛阳桥", "泉州港", "宋元海丝"],
    },
    botanicgarden: {
      label: "新加坡植物园",
      type: "街区",
      source: "botanic",
      blurb: "植物园见证热带植物引种、园艺和研究的发展。园区保存着不同阶段的景观和研究设施。",
      terms: ["新加坡植物園"],
    },
    straitsshophouses: {
      label: "海峡店屋",
      type: "建筑",
      source: "straits",
      blurb: "马六甲和乔治市保存了不同年代的店屋。作为典型街区建筑，店屋连接了沿街经营与日常居住。",
      terms: ["海峽店屋", "店屋", "shophouse"],
    },
  };
  // Each sentence is directional. The reverse label lets the same evidence be read from either entity.
  const edges = [
    [
      "nanyin",
      "quanzhou",
      "传唱于",
      "传唱曲艺",
      "nanyin",
      "泉州是闽南南音传承的代表地区，南音声乐使用泉州方言。",
    ],
    [
      "nanyin",
      "singapore",
      "流传至",
      "传承曲艺",
      "lion",
      "十九世纪末以来，新加坡已有南音活动，今天仍有当地乐团演奏和推广南音。",
    ],
    [
      "nanyin",
      "dongxiao",
      "合奏乐器",
      "参与合奏",
      "nanyin",
      "南音所用的特色乐器包括竹制的洞箫。",
    ],
    [
      "nanyin",
      "pipa",
      "合奏乐器",
      "参与合奏",
      "nanyin",
      "南音合奏中，演奏者横抱曲颈琵琶。",
    ],
    [
      "nanyin",
      "dialect",
      "演唱用语",
      "演唱曲艺",
      "nanyin",
      "南音声乐部分的唱词以泉州方言演唱。",
    ],
    [
      "singapore",
      "hawker",
      "当地饮食",
      "实践地点",
      "hawker",
      "新加坡的小贩中心提供共同用餐的空间，不同背景的摊主延续各自的烹饪经验。",
    ],
    [
      "quanzhou",
      "ceremony",
      "沿海信俗",
      "传承海湾",
      "wangchuan",
      "泉州湾沿岸是送王船仪式集中的地区之一。",
    ],
    [
      "xiamen",
      "ceremony",
      "沿海信俗",
      "传承海湾",
      "wangchuan",
      "送王船分布于厦门湾及泉州湾沿岸。",
    ],
    [
      "melaka",
      "ceremony",
      "社区信俗",
      "传承地点",
      "wangchuan",
      "马六甲的部分华人社区传承送王船，并与中国社区共同参与此项非遗申报。",
    ],
    [
      "tainan",
      "firecrackers",
      "地方民俗",
      "举办地点",
      "lantern",
      "盐水蜂炮举办于台南市盐水区，活动包含庙宇巡境。",
    ],
    [
      "firecrackers",
      "lantern",
      "举行节时",
      "地方习俗",
      "lantern",
      "盐水区公所记录蜂炮活动日期为农历正月十四、十五。",
    ],

    [
      "taipei",
      "dadaocheng",
      "城中街区",
      "所在城市",
      "teaport",
      "大稻埕位于台北淡水河畔，河港通商推动茶业商号聚集。",
    ],
    [
      "dadaocheng",
      "tealeaf",
      "集散货物",
      "旧时商埠",
      "teaport",
      "十九世纪的大稻埕码头曾堆放装茶的木箱，附近商号经营茶叶。",
    ],
    [
      "dadaocheng",
      "shophouse",
      "街区建筑",
      "可见街区",
      "street",
      "迪化街的店屋容纳了南北货、茶叶等贸易，沿街骑楼为行人遮雨。",
    ],
    [
      "georgetown",
      "shophouse",
      "街区建筑",
      "可见街区",
      "straits",
      "乔治市有连续的住宅和商业街区，保存着风格各异的店屋。",
    ],
    [
      "melaka",
      "shophouse",
      "街区建筑",
      "可见街区",
      "straits",
      "马六甲与乔治市店屋各有特色，反映不同阶段的海峡贸易发展。",
    ],
    [
      "georgetown",
      "melaka",
      "同列遗产",
      "同列遗产",
      "straits",
      "两地共同组成「马六甲和乔治市：马六甲海峡历史城市」世界遗产。",
    ],
    [
      "hoian",
      "bridge",
      "古城建筑",
      "所在古城",
      "hoian",
      "会安古城保存着一座设庙的木桥，遗产档案称其为日本桥。",
    ],
    [
      "hoian",
      "shophouse",
      "沿河街屋",
      "港口街区",
      "hoian",
      "会安传统商业建筑临街迎客，临河的一面供船装卸货物。",
    ],
    [
      "hongkong",
      "firedragon",
      "地方民俗",
      "举办地点",
      "dragon",
      "香港大坑居民每年在八月十四、十五、十六的夜晚舞火龙。",
    ],
    [
      "firedragon",
      "midautumn",
      "举办节时",
      "地方习俗",
      "dragon",
      "火龙在中秋节前夜、当夜和翌夜走过大坑街巷。",
    ],
    [
      "hongkong",
      "yueju",
      "地方戏曲",
      "流行地点",
      "opera",
      "香港属于粤剧流行的粤语地区，舞台演出以唱、做、念、打讲述故事。",
    ],
    [
      "yueju",
      "cantonese",
      "唱念用语",
      "演唱戏曲",
      "opera",
      "粤剧的唱段与对白均使用粤语。",
    ],
    [
      "hongkong",
      "milktea",
      "日常饮品",
      "流行地点",
      "milktea",
      "英式奶茶在本地发展出港式做法，成为香港人的日常饮品。",
    ],
    [
      "milktea",
      "tealeaf",
      "拼配原料",
      "制成饮品",
      "milktea",
      "师傅先拼配茶叶，再煮茶、撞茶，最后调入奶。",
    ],
    [
      "chaozhou",
      "gongfucha",
      "饮茶习俗",
      "传承地点",
      "gongfu",
      "潮州工夫茶艺包含温茶盅、壶纳乌龙、分茶敬客等步骤。",
    ],
    [
      "gongfucha",
      "tealeaf",
      "冲泡原料",
      "相关茶艺",
      "gongfu",
      "工夫茶冲泡程序中的「壶纳乌龙」，就是把乌龙茶放入茶壶。",
    ],
    [
      "gongfucha",
      "teapot",
      "常用茶器",
      "使用场合",
      "pot",
      "朱泥壶是潮州工夫茶器的代表之一。",
    ],
    [
      "chaozhou",
      "teapot",
      "地方手艺",
      "制作地点",
      "pot",
      "潮州枫溪的制陶传统与当地朱泥壶的发展相关。",
    ],
    [
      "meizhou",
      "mazu",
      "岛上信俗",
      "传承地点",
      "mazucustom",
      "湄洲岛居民在庙会等活动中纪念妈祖。",
    ],
    [
      "mazu",
      "mazulamp",
      "巡游物件",
      "相关信俗",
      "mazucustom",
      "妈祖信俗中的一些晚间巡游会用到居民手持的妈祖灯。",
    ],
    [
      "longquan",
      "celadon",
      "地方手艺",
      "制作地点",
      "enamel",
      "龙泉青瓷传统烧制技艺在浙江龙泉传承。",
    ],
    [
      "celadon",
      "glaze",
      "成器特点",
      "工艺来源",
      "enamel",
      "传统配釉与烧成火候共同决定龙泉青瓷的釉色。",
    ],
    ["macau", "macaocentre", "包含遗产", "位于", "macauHeritage", "澳门旧城中的多个广场和建筑群共同构成历史城区遗产。"],
    ["kaiping", "kaipingdiaolou", "保有建筑", "分布于", "diaolou", "碉楼分布于开平村落，反映防御需要和侨乡文化。"],
    ["hue", "huecomplex", "包含遗产", "位于", "hueHeritage", "历代宫城及城外陵寝构成顺化古迹群。"],
    ["ayutthaya", "ayutthayaruins", "保有遗址", "位于", "ayutthayaHeritage", "大城历史遗存包括砖塔、寺院和其他旧都建筑。"],
    ["xiamen", "gulanyu", "包含街区", "毗邻", "kulangsu", "鼓浪屿位于厦门对岸，沿海港形成交流。"],
    ["quanzhou", "quanzhouports", "包含遗产", "位于", "quanzhouHeritage", "这一系列遗址呈现了泉州商贸中心的城市结构。"],
    ["singapore", "botanicgarden", "包含遗产", "位于", "botanic", "新加坡植物园是认识热带植物引种和研究的一处遗产地。"],
    ["melaka", "straitsshophouses", "保留建筑", "见于", "straits", "马六甲的历史街区保存了沿街店屋。"],
    ["georgetown", "straitsshophouses", "保留建筑", "见于", "straits", "乔治市的遗产包括成片店屋和多样的贸易街区建筑。"],
    ["macaocentre", "gulanyu", "对照阅读", "对照阅读", "kulangsu", "鼓浪屿的近代风格融合可与澳门历史城区的中西建筑并置观察。"],
    ["hoian", "hue", "越南中部", "越南中部", "hueHeritage", "两处均在越南中部，顺化保存旧都遗存，会安保有历史商港街道。"],
    ["kaipingdiaolou", "macaocentre", "比较建筑", "比较建筑", "diaolou", "两处均可观察不同来源的建筑手法。开平碉楼尤其反映海外侨民与村落的联系。"],
    ["quanzhouports", "hoian", "对照港史", "对照港史", "quanzhouHeritage", "泉州的宋元海贸遗址可与会安古城的历史商港街屋对照阅读。"],
    ["straitsshophouses", "hoian", "比较街屋", "比较街屋", "hoian", "会安与海峡古城都可从沿街房屋理解古港经营和居住空间。"],
    ["ayutthayaruins", "huecomplex", "比较旧都", "比较旧都", "ayutthayaHeritage", "大城与顺化均有昔日都城遗址，河流与不同布局的古建筑可以对照阅读。"],
    ["kaiping", "macau", "珠江口周边", "珠江口周边", "diaolou", "开平侨乡和澳门旧港可作为阅读珠江口周边跨海往来的两个不同入口。"],
  ];
  const palette = {
    街区: "#a1d0de",
    建筑: "#c7ca8e",
    工艺: "#d7a987",
    地点: "#83dfd2",
    曲艺: "#f6c77a",
    乐器: "#b8badf",
    语言: "#a4c8ff",
    饮食: "#eaae99",
    民俗: "#98c8a5",
    节日: "#f0aeb9",
  };
  const esc = (value) => window.app.esc(value);
  const audioForNode = {
    cantonese: ["yue-morning", "粤语早安"],
    firedragon: ["yue-moon", "粤语「月」"],
    midautumn: ["nan-moon", "台语「月」"],
    milktea: ["yue-tea", "粤语「茶」"],
    tealeaf: ["nan-tea", "台语「茶」"],
    dadaocheng: ["nan-tea", "台语「茶」"],
  };
  const link = (id) => "#knowledge/" + id;
  const relations = (id) =>
    edges
      .filter(([a, b]) => a === id || b === id)
      .map(([a, b, forward, backward, source, note]) => ({
        other: a === id ? b : a,
        label: a === id ? forward : backward,
        source,
        note,
      }));
  function sourceLink(key) {
    const [name, url] = window.cultureViews.sources[key];
    return `<a class="kg-source" href="${url}" target="_blank" rel="noopener noreferrer">${name} ↗</a>`;
  }
  function graph(id) {
    return `<div class="kg-sphere" tabindex="0" role="group" aria-label="文化关系球，拖动或用方向键旋转">
      <canvas aria-hidden="true"></canvas>
      <div class="kg-nodes">${Object.entries(nodes).map(([key, node]) =>
        `<a class="kg-node" href="${link(key)}" data-kg-node="${key}" ${key === id ? 'aria-current="true"' : ""} style="--kg-tone:${palette[node.type]}"><span>${esc(node.label)}</span></a>`
      ).join("")}</div>
    </div>`;
  }
  function matchedLetters(id) {
    const node = nodes[id],
      terms = [node.label, ...(node.terms || [])];
    const found = [];
    for (const letter of window.app.state.letters) {
      if (letter.status !== "published") continue;
      const values = [
        ["公开地域", node.type === "地点" ? letter.region : ""],
        ["文化标签", (letter.tags || []).join(" ")],
        ["标题", letter.title],
        ["正文", letter.body],
      ];
      const match = values.find(([, text]) =>
        terms.some((t) => (text || "").toLowerCase().includes(t.toLowerCase())),
      );
      if (match) found.push({ letter, field: match[0] });
    }
    return `<section class="kg-letters"><h3>书信中的${node.label}</h3>${
      found.length
        ? `<ul>${found
            .slice(0, 8)
            .map(
              ({ letter, field }) =>
                `<li><a href="#read/${encodeURIComponent(letter.id)}">${esc(letter.title)} <span>↗</span></a><small>${esc(letter.author)} · ${field}匹配${letter.demo ? " · 示例" : ""}</small></li>`,
            )
            .join("")}</ul>`
        : "<p>公开来信中暂未找到这个词条。</p>"
    }</section>`;
  }
  function indexResults(id, term, type) {
    const query = term.trim().toLowerCase();
    const matches = Object.entries(nodes).filter(
      ([, n]) =>
        (!type || n.type === type) &&
        [n.label, ...(n.terms || [])].some((s) =>
          s.toLowerCase().includes(query),
        ),
    );
    return matches.length
      ? matches
          .map(
            ([key, n]) =>
              `<a href="${link(key)}" ${id === key ? 'aria-current="true"' : ""}><i style="--kg-tone:${palette[n.type]}"></i>${n.label}</a>`,
          )
          .join("")
      : "<p>未找到匹配词条，试试其他词或类别。</p>";
  }
  function view(requested) {
    const id = Object.hasOwn(nodes, requested) ? requested : "nanyin";
    const item = nodes[id],
      near = relations(id);
    return `<div class="kg-page" data-kg-id="${id}"><header class="page-head"><div><h1>文化知识图谱</h1><p>选一个文化词条，沿连线探索它与地点、乐器和节俗的关系。</p></div></header>
      <div class="kg-layout"><div><section class="kg-chart"><header><h2>${item.label}的关系图</h2><small>${near.length} 条直接关系</small></header>${graph(id)}
      <div class="kg-chart-foot"><span class="kg-key"></span>当前词条 <span>拖动旋转 · 点选节点探索</span><button type="button" data-kg-center>定位当前词条</button></div></section>
      <section class="kg-index"><h2>词条索引</h2><div class="kg-fields"><input type="search" data-kg-search placeholder="搜索词条，如「元宵」" aria-label="搜索文化词条"><select data-kg-kind aria-label="词条类别"><option value="">全部类别</option>${Object.keys(
        palette,
      )
        .map((t) => `<option value="${t}">${t}</option>`)
        .join("")}</select></div>
      <nav data-kg-results aria-label="文化词条" aria-live="polite">${indexResults(id, "", "")}</nav></section></div>
      <article class="kg-card"><header><small>${item.type}</small><h2>${item.label}</h2><p>${item.blurb}</p>${sourceLink(item.source)}</header>
      <section class="kg-evidence"><h3>关系与出处</h3><ul>${near.map(({ other, label, note, source }) => `<li><div><span>${label}</span><a href="${link(other)}">${nodes[other].label} →</a></div><p>${note}</p>${sourceLink(source)}</li>`).join("")}</ul></section>
      ${matchedLetters(id)}${audioForNode[id] ? `<a class="kg-map-link" href="#sounds/${audioForNode[id][0]}">去乡音展馆听${audioForNode[id][1]} →</a>` : ""}${item.type === "地点" ? `<a class="kg-map-link" href="#atlas/${id}">在文化地图中查看${item.label} →</a>` : ""}</article></div></div>`;
  }
  function refreshIndex(target) {
    const root = target.closest(".kg-page");
    if (root)
      root.querySelector("[data-kg-results]").innerHTML = indexResults(
        root.dataset.kgId,
        root.querySelector("[data-kg-search]").value,
        root.querySelector("[data-kg-kind]").value,
      );
  }
  document.addEventListener("input", (e) => {
    if (e.target.matches("[data-kg-search]")) refreshIndex(e.target);
  });
  document.addEventListener("change", (e) => {
    if (e.target.matches("[data-kg-kind]")) refreshIndex(e.target);
  });
  let dispose;
  let previousView;
  function unmount(preserveView) {
    const pose = dispose?.();
    dispose = undefined;
    previousView = preserveView ? pose : undefined;
  }
  function mount() {
    const stage = document.querySelector(".kg-sphere");
    dispose = window.mountKnowledgeSphere(stage, edges, previousView);
  }
  window.knowledgeGraph = { view, mount, unmount };
})();
