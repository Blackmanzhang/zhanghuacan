/* UI copy only. Stored letters, quotations, signatures, source choices and tag values retain their authors' spelling. */
(() => {
  "use strict";
  const messages = {
    附件与寄送: "附件與寄送",
    "点击生成会把上面四项发给已配置的模型，可先预览草稿。":
      "點擊生成會把上面四項發給已設定的模型，可先預覽草稿。",
    "AI 正文生成尚未配置。按项目 README 配置后即可使用。":
      "AI 正文生成尚未設定。按專案 README 設定後即可使用。",
    "AI 草稿预览": "AI 草稿預覽",
    "使用这份草稿会替换现有正文。": "使用這份草稿會取代現有正文。",
    关闭预览: "關閉預覽",
    使用这份草稿: "使用這份草稿",
    替换为这份草稿: "以這份草稿取代正文",
    "正在生成书信草稿…": "正在生成書信草稿…",
    "请先填写信件标题。": "請先填寫信件標題。",
    "写信资料已修改，请重新生成草稿。": "寫信資料已修改，請重新生成草稿。",
    "草稿已填入正文，可以继续编辑。": "草稿已填入正文，可以繼續編輯。",
    "暂时连不上写信服务，请稍后再试。": "暫時連不上寫信服務，請稍後再試。",
    "请从公开地域建议中选择，或将地域留空。":
      "請從公開地域建議中選擇，或將地域留空。",
    "AI 写信尚未配置。请按项目 README 配置模型后重启服务。":
      "AI 寫信尚未設定。請按專案 README 設定模型後重啟服務。",
    "模型服务未通过认证。请核对服务端 API Key 和模型权限。":
      "模型服務未通過驗證。請核對伺服器端的 API Key 和模型權限。",
    "模型服务余额不足。请检查账户余额后重试。":
      "模型服務餘額不足。請檢查帳戶餘額後重試。",
    "模型服务请求较多，请稍后再试。": "模型服務請求較多，請稍後再試。",
    "模型服务暂时不可用，请稍后再试。": "模型服務暫時無法使用，請稍後再試。",
    "暂时连不上模型服务，请稍后再试。": "暫時連不上模型服務，請稍後再試。",
    "模型未返回完整的书信正文，请重试。": "模型未傳回完整的書信正文，請重試。",
    夜港灯塔: "夜港燈塔",
    潮汐邮局: "潮汐郵局",
    江口归帆: "江口歸帆",
    青竹素笺: "青竹素箋",
    潮汐蓝笺: "潮汐藍箋",
    亚麻手札: "亞麻手札",
    海岬灯塔: "海岬燈塔",
    海港邮局: "海港郵局",
    南洋归帆: "南洋歸帆",
    闽南花窗: "閩南花窗",
    自定义封面: "自訂封面",
    上传自己的封面: "上傳自己的封面",
    内置信笺封面: "內建信箋封面",
    "正在处理封面…": "正在處理封面…",
    已使用上传的封面: "已使用上傳的封面",
    "JPG、PNG 或 WebP，最大 8 MB。另可附上一张图或一段录音。":
      "JPG、PNG 或 WebP，最大 8 MB。另可附上一張圖或一段錄音。",
    "请选择 8 MB 以内的 JPG、PNG 或 WebP 封面。":
      "請選擇 8 MB 以內的 JPG、PNG 或 WebP 封面。",
    "没有读出这张封面，请选择可以打开的图片。":
      "沒有讀出這張封面，請選擇可以打開的圖片。",
    地方手艺: "地方手藝",
    港口街区: "港口街區",
    台湾台北: "臺灣臺北",
    湄洲岛: "湄洲島",
    龙泉: "龍泉",
    乔治市: "喬治市",
    会安: "會安",
    马六甲: "馬六甲",
    "同一句早安，两种乡音": "同一句早安，兩種鄉音",
    "选一句问候或一个字，点播放键对听。": "選一句問候或一個字，點播放鍵對聽。",
    "从一句「早安」开始，听问候和海边的日常。":
      "從一句「早安」開始，聽問候和海邊的日常。",
    日常问候: "日常問候",
    海洋自然: "海洋自然",
    书信: "書信",
    书信地球: "書信地球",
    乡音展馆: "鄉音展館",
    知识图谱: "知識圖譜",
    全球书信网络: "全球書信網絡",
    "越过山海。": "越過山海。",
    "转动地球，拆开一封远方的来信。": "轉動地球，拆開一封遠方的來信。",
    "从一个人的家乡，抵达另一个人的日常。":
      "從一個人的家鄉，抵達另一個人的日常。",
    来信地点: "來信地點",
    厦门: "廈門",
    台中: "臺中",
    马来西亚: "馬來西亞",
    宁波: "寧波",
    "拖动旋转 · 金线表示跨地接力": "拖動旋轉 · 金線表示跨地接力",
    "▷  开启自转": "▷  開啟自轉",
    台湾台南: "臺灣臺南",
    福建厦门: "福建廈門",
    台湾台中: "臺灣臺中",
    广东潮州: "廣東潮州",
    浙江宁波: "浙江寧波",
    关联接力: "關聯接力",
    拆开来信: "拆開來信",
    探索文化空间: "探索文化空間",
    浏览数字展厅: "瀏覽數字展廳",

    "逐词对听，辨认故乡的声音": "逐詞對聽，辨認故鄉的聲音",
    多人文化创作工坊: "多人文化創作工坊",
    海上手账: "海上手帳",
    翻阅不同地区共同写下的记忆: "翻閱不同地區共同寫下的記憶",
    按地点探访习俗与来信: "按地點探訪習俗與來信",
    文化知识图谱: "文化知識圖譜",
    沿一条关系发现另一种文化: "沿一條關系發現另一種文化",
    声音典藏: "聲音典藏",
    "从一声「海」开始，听同一个字在不同海岸的回响。":
      "從一聲「海」開始，聽同一個字在不同海岸的回響。",
    "同一个字，听三种乡音": "同一個字，聽三種鄉音",
    "选一个字，点播放键对听。": "選一個字，點播放鍵對聽。",
    风: "風",
    声音馆藏: "聲音館藏",
    语种: "語種",
    全部语种: "全部語種",
    "闽南语（台湾）": "閩南語（臺灣）",
    粤语: "粵語",
    "客家语（四县腔）": "客家語（四縣腔）",
    留下你的乡音: "留下你的鄉音",
    "把家乡话录成声音来信，写下原文、地域和语种标签。勾选展出授权，审核通过后即可在馆内收听。":
      "把家鄉話錄成聲音來信，寫下原文、地域和語種標簽。勾選展出授權，審核通過后即可在館內收聽。",
    写声音来信: "寫聲音來信",
    回到乡音展馆: "回到鄉音展館",
    "乡音馆藏 · 词音原档": "鄉音館藏 · 詞音原檔",
    录音文字: "錄音文字",
    录音出处: "錄音出處",
    "词目与读音 ↗": "詞目與讀音 ↗",
    "原始音档 ↗": "原始音檔 ↗",
    "来源与署名 ↗": "來源與署名 ↗",
    "选一个文化词条，沿连线探索它与地点、乐器和节俗的关系。":
      "選一個文化詞條，沿連線探索它與地點、樂器和節俗的關系。",
    当前词条: "當前詞條",
    全部对听词: "全部對聽詞",
    显示更多录音: "顯示更多錄音",
    街巷器物: "街巷器物",
    四季节俗: "四季節俗",
    乐声: "樂聲",
    "文化关系球，拖动或用方向键旋转": "文化關係球，拖動或用方向鍵旋轉",
    "拖动旋转 · 点选节点探索": "拖動旋轉 · 點選節點探索",
    定位当前词条: "定位當前詞條",
    词条索引: "詞條索引",
    全部类别: "全部類別",
    地点: "地點",
    曲艺: "曲藝",
    乐器: "樂器",
    语言: "語言",
    饮食: "飲食",
    节日: "節日",
    关系与出处: "關系與出處",
    "在前一版上添画或题字，通过审核后交给下一位创作者。":
      "在前一版上添畫或題字，通過審核后交給下一位創作者。",
    "观看公开长卷 ↗": "觀看公開長卷 ↗",
    画布底稿: "畫布底稿",
    从空白画布开始: "從空白畫布開始",
    "在纸上拖动画笔，或选一枚图章落印。": "在紙上拖動畫筆，或選一枚圖章落印。",
    文化图章: "文化圖章",
    圆月: "圓月",
    远山: "遠山",
    花灯: "花燈",
    笔粗: "筆粗",
    题字: "題字",
    "Ⅱ  暂停自转": "Ⅱ  暫停自轉",
    "书信地球，拖动或使用方向键旋转，选择信封查看来信":
      "書信地球，拖動或使用方向鍵旋轉，選擇信封查看來信",
    切换这个地点的来信: "切換這個地點的來信",
    按信中公开的城市或地区示意定位: "按信中公開的城市或地區示意定位",
    画笔: "畫筆",
    移动: "移動",
    撤销: "撤銷",
    画布工具: "畫布工具",
    "共创画布，按方向键移动光标，回车落笔、放置或选取元素":
      "共創畫布，按方向鍵移動光標，回車落筆、放置或選取元素",
    题字内容: "題字內容",
    写一句家乡话: "寫一句家鄉話",
    录音播放进度: "錄音播放進度",
    词条类别: "詞條類別",
    搜索文化词条: "搜索文化詞條",
    "搜索词条，如「元宵」": "搜索詞條，如「元宵」",
    "乡音馆藏 · 声音来信": "鄉音館藏 · 聲音來信",
    来信正文: "來信正文",
    "打开原信 ↗": "打開原信 ↗",
    文化词条: "文化詞條",
    原始音档: "原始音檔",
    画格预览: "畫格預覽",
    笔迹: "筆跡",
    确认投稿: "確認投稿",
    录音对听: "錄音對聽",
    网站导航: "網站導航",
    打开导航: "打開導航",
    关闭导航: "關閉導航",
    海上有信首页: "海上有信首頁",
    写信: "寫信",
    首页: "首頁",
    拾信广场: "拾信廣場",
    故事回响: "故事回響",
    数字展厅: "數字展廳",
    文化地图: "文化地圖",
    共创工坊: "共創工坊",
    交流网络: "交流網絡",
    内容审核: "內容審核",
    网站工具: "網站工具",
    文化交流网络: "文化交流網絡",
    数字文化地图: "數字文化地圖",
    数字书信: "數字書信",
    书信共创: "書信共創",
    中秋主题展: "中秋主題展",
    共创: "共創",
    参与共创: "參與共創",
    探索文化地图: "探索文化地圖",
    本期共创: "本期共創",
    中秋特辑: "中秋特輯",
    长卷进度: "長卷進度",
    观看共创长卷: "觀看共創長卷",
    "你家中秋餐桌上，最特别的是什么？": "你家中秋餐桌上，最特別的是什么？",
    "寄一封家书，和海的另一边共绘一幅长卷。":
      "寄一封家書，和海的另一邊共繪一幅長卷。",
    海上来信: "海上來信",
    随机拾信: "隨機拾信",
    时光邮局随机来信: "時光郵局隨機來信",
    再拾一封: "再拾一封",
    "正在拾取公开信并整理摘要…": "正在拾取公開信並整理摘要…",
    浏览全部: "瀏覽全部",
    全部来信: "全部來信",
    家乡风物: "家鄉風物",
    节日习俗: "節日習俗",
    探索故事树: "探索故事樹",
    成长记忆: "成長記憶",
    未来心愿: "未來心愿",
    拾一封海上来信: "拾一封海上來信",
    "挑选感兴趣的主题，或让海流替你选一封。":
      "挑選感興趣的主題，或讓海流替你選一封。",
    列表浏览: "列表瀏覽",
    搜索来信: "搜索來信",
    "搜索标题、作者或信中内容": "搜索標題、作者或信中內容",
    筛选地域: "篩選地域",
    主题漂流: "主題漂流",
    海面上可拾取的书信: "海面上可拾取的書信",
    "没有找到符合条件的来信，可以试试其他主题或关键词。":
      "沒有找到符合條件的來信，可以試試其他主題或關鍵詞。",
    寄送状态: "寄送狀態",
    回应这封信: "回應這封信",
    示例书信: "示例書信",
    "这是示例作者的信箱，可体验寄信。": "這是示例作者的信箱，可體驗寄信。",
    "只有你和这封信的作者可见。": "只有你和這封信的作者可見。",
    公开接力: "公開接力",
    "可选中原文引用，也可在接力页选择要回应的句子。":
      "可選中原文引用，也可在接力頁選擇要回應的句子。",
    "作者已关闭这封信的公开接力。": "作者已關閉這封信的公開接力。",
    查看海洋故事树: "查看海洋故事樹",
    举报: "舉報",
    相关文化故事: "相關文化故事",
    "暂未找到相同标签或主题的公开来信。": "暫未找到相同標簽或主題的公開來信。",
    "这封信暂时无法阅读。": "這封信暫時無法閱讀。",
    阅读来信: "閱讀來信",
    返回故事树: "返回故事樹",
    查看故事树: "查看故事樹",
    阅读: "閱讀",
    打开原信: "打開原信",
    已公开: "已公開",
    等待审核: "等待審核",
    未通过审核: "未通過審核",
    查看我的书信: "查看我的書信",
    写一封信: "寫一封信",
    让故事继续漂流: "讓故事繼續漂流",
    "把想说的话写下来，寄给海的另一边。": "把想說的話寫下來，寄給海的另一邊。",
    "引用原信（选填）": "引用原信（選填）",
    回应整封信: "回應整封信",
    信件标题: "信件標題",
    给这封信起个名字: "給這封信起個名字",
    "写给远方的你……": "寫給遠方的你……",
    主题: "主題",
    "公开地域（选填）": "公開地域（選填）",
    "例如：福建、台湾、新加坡": "例如：福建、臺灣、新加坡",
    "附图或声音（选填）": "附圖或聲音（選填）",
    "可附一张图片或一段音频，最大 4 MB。":
      "可附一張圖片或一段音頻，最大 4 MB。",
    允许其他人公开接力: "允許其他人公開接力",
    "同意在数字展厅展示这封信和附件，并保留署名":
      "同意在數字展廳展示這封信和附件，并保留署名",
    装瓶寄出: "裝瓶寄出",
    信笺封面: "信箋封面",
    "选择一幅插画，作为这封信在海面上的封面。":
      "選擇一幅插畫，作為這封信在海面上的封面。",
    信纸: "信紙",
    邮票: "郵票",
    预览信笺: "預覽信箋",
    信笺预览: "信箋預覽",
    暖白信纸: "暖白信紙",
    海青横格: "海青橫格",
    桂花笺: "桂花箋",
    海上邮局: "海上郵局",
    灯笼: "燈籠",
    九层塔: "九層塔",
    岸边小船: "岸邊小船",
    信件附图: "信件附圖",
    回信内容: "回信內容",
    写一封私密回信: "寫一封私密回信",
    关闭: "關閉",
    举报这封信: "舉報這封信",
    举报原因: "舉報原因",
    请说明需要核查的内容: "請說明需要核查的內容",
    提交举报: "提交舉報",
    暂无作品: "暫無作品",
    我的书信: "我的書信",
    我的共创: "我的共創",
    保存为账号: "保存為賬號",
    登录: "登錄",
    退出登录: "退出登錄",
    当前为此浏览器的访客身份: "當前為此瀏覽器的訪客身份",
    已登录: "已登錄",
    继续写信: "繼續寫信",
    查看画格: "查看畫格",
    去认领一格长卷: "去認領一格長卷",
    "你还没有参与本期共创。": "你還沒有參與本期共創。",
    "还没有保存的草稿。": "還沒有保存的草稿。",
    保存在此浏览器: "保存在此瀏覽器",
    展示与接力: "展示與接力",
    继续通信: "繼續通信",
    写第一封信: "寫第一封信",
    "你还没有寄出书信。": "你還沒有寄出書信。",
    "你的私人往来信件会出现在这里。": "你的私人往來信件會出現在這里。",
    "打开一封喜欢的信，点击书签即可收藏。":
      "打開一封喜歡的信，點擊書簽即可收藏。",
    "设置昵称和密码，即可在其他浏览器找回当前的信件与收藏。":
      "設置昵稱和密碼，即可在其他瀏覽器找回當前的信件與收藏。",
    昵称: "昵稱",
    密码: "密碼",
    创建账号: "創建賬號",
    登录我的海: "登錄我的海",
    展示与接力设置: "展示與接力設置",
    "授权将信件与附件展出，保留署名": "授權將信件與附件展出，保留署名",
    保存设置: "保存設置",
    确认撤回: "確認撤回",
    退出当前账号: "退出當前賬號",
    "退出后将使用新的访客身份，原有书信可以重新登录查看。":
      "退出后將使用新的訪客身份，原有書信可以重新登錄查看。",
    "撤回后，这封信的正文、附件及展览内容将停止公开展示。":
      "撤回后，這封信的正文、附件及展覽內容將停止公開展示。",
    "循着乡音、节俗与餐桌，探索一座城市，再读一封当地的信。":
      "循著鄉音、節俗與餐桌，探索一座城市，再讀一封當地的信。",
    文化地点: "文化地點",
    地图: "地圖",
    地图操作: "地圖操作",
    缩小地图: "縮小地圖",
    放大地图: "放大地圖",
    "高德地图 · 文化地点": "高德地圖 · 文化地點",
    "正在加载高德地图…": "正在載入高德地圖…",
    "尚未配置高德地图的 Web 端 Key 和安全密钥。": "尚未設定高德地圖的 Web 端 Key 和安全金鑰。",
    "高德地图接口尚未启动。请重启项目后重试。": "高德地圖介面尚未啟動。請重新啟動專案後再試。",
    "高德地图授权失败。请检查 Web 端 Key、安全密钥和域名白名单。":
      "高德地圖授權失敗。請檢查 Web 端 Key、安全金鑰和網域白名單。",
    "高德地图暂时无法加载，请稍后重试。": "高德地圖暫時無法載入，請稍後再試。",
    重新加载: "重新載入",
    切换到列表: "切換到列表",
    "虚线连接共享文化传统的地点。点选地标可查看当地文化与来信。":
      "虛線連接共享文化傳統的地點。點選地標可查看當地文化與來信。",
    岁时节俗: "歲時節俗",
    乡音曲艺: "鄉音曲藝",
    食与日常: "食與日常",
    台南: "臺南",
    台湾: "臺灣",
    东南亚: "東南亞",
    "东 海": "東 海",
    探索台南: "探索臺南",
    "联合国教科文组织 · 南音 ↗": "聯合國教科文組織 · 南音 ↗",
    "新加坡国家文物局 · 南音 ↗": "新加坡國家文物局 · 南音 ↗",
    "台南市盐水区公所 · 盐水蜂炮 ↗": "臺南市鹽水區公所 · 鹽水蜂炮 ↗",
    "联合国教科文组织 · 新加坡小贩文化 ↗":
      "聯合國教科文組織 · 新加坡小販文化 ↗",
    "泉州方言的南音也在新加坡传唱。两个地方的资料可以对照阅读。":
      "泉州方言的南音也在新加坡傳唱。兩個地方的資料可以對照閱讀。",
    "探索台南 →": "探索臺南 →",
    去共创工坊: "去共創工坊",
    按作者公开填写的地域选取: "按作者公開填寫的地域選取",
    "这里还没有来自这一地点的公开来信。": "這里還沒有來自這一地點的公開來信。",
    来自泉州的信: "來自泉州的信",
    来自台南的信: "來自臺南的信",
    来自新加坡的信: "來自新加坡的信",
    东亚与东南亚文化地点示意图: "東亞與東南亞文化地點示意圖",
    文化主题: "文化主題",
    新文化标签: "新文化標簽",
    "自定义标签，例如：面线": "自定義標簽，例如：面線",
    文化标签: "文化標簽",
    "选填，最多五个。标签帮助读者找到有共同记忆的公开来信。":
      "選填，最多五個。標簽幫助讀者找到有共同記憶的公開來信。",
    尚未选择标签: "尚未選擇標簽",
    本次允许把标题和正文发送给站点配置的模型服务:
      "本次允許把標題和正文發送給站點配置的模型服務",
    识别文化元素: "識別文化元素",
    默认仅使用本站词表: "默認僅使用本站詞表",
    "先写下标题或正文，再识别标签。": "先寫下標題或正文，再識別標簽。",
    "正在识别文化元素…": "正在識別文化元素…",
    "标签限 1 至 12 字，请使用单行文字。":
      "標簽限 1 至 12 字，請使用單行文字。",
    "已选过这个标签。": "已選過這個標簽。",
    "已选满五个，请先移除一个标签。": "已選滿五個，請先移除一個標簽。",
    "在闽南，南音既有器乐，也有配合乐器演唱的曲目。演唱者以泉州方言唱词，洞箫和横抱的琵琶是乐队中有代表性的乐器。":
      "在閩南，南音既有器樂，也有配合樂器演唱的曲目。演唱者以泉州方言唱詞，洞簫和橫抱的琵琶是樂隊中有代表性的樂器。",
    盐水的元宵夜: "鹽水的元宵夜",
    "台南盐水的元宵习俗与庙宇巡境相连。农历正月十四、十五，蜂炮是当地节庆中鲜明的声音和景象。":
      "臺南鹽水的元宵習俗與廟宇巡境相連。農歷正月十四、十五，蜂炮是當地節慶中鮮明的聲音和景象。",
    小贩中心的共同餐桌: "小販中心的共同餐桌",
    "在新加坡的小贩中心，人们一起用餐，也在桌边聊天、下棋。来自不同背景的摊主把各自的烹饪经验带进社区，形成这座城市的日常饮食文化。":
      "在新加坡的小販中心，人們一起用餐，也在桌邊聊天、下棋。來自不同背景的攤主把各自的烹飪經驗帶進社區，形成這座城市的日常飲食文化。",
    南音在南洋的新声: "南音在南洋的新聲",
    "自十九世纪末以来，新加坡便有南音演奏。当地乐团延续泉州方言的唱腔，也尝试加入其他族群的乐器，为传统曲目写下新的演绎。":
      "自十九世紀末以來，新加坡便有南音演奏。當地樂團延續泉州方言的唱腔，也嘗試加入其他族群的樂器，為傳統曲目寫下新的演繹。",
    长卷从这些来信开始: "長卷從這些來信開始",
    中秋专题展: "中秋專題展",
    中秋共创工坊: "中秋共創工坊",
    "沿着一幅长卷，读两岸及海外创作者共同写下的中秋。":
      "沿著一幅長卷，讀兩岸及海外創作者共同寫下的中秋。",
    "选一格画面，用家乡的月色、味道和声音，一起写出今年的中秋。":
      "選一格畫面，用家鄉的月色、味道和聲音，一起寫出今年的中秋。",
    观看公开长卷: "觀看公開長卷",
    进入共创工坊: "進入共創工坊",
    活动缘起: "活動緣起",
    选择画格: "選擇畫格",
    刷新状态: "刷新狀態",
    刷新活动: "刷新活動",
    我已认领: "我已認領",
    可认领: "可認領",
    正在共创: "正在共創",
    可接续创作: "可接續創作",
    我的稿件待审: "我的稿件待審",
    认领并续作: "認領并續作",
    认领这格: "認領這格",
    选择共创画格: "選擇共創畫格",
    月升海峡: "月升海峽",
    灶边团圆: "灶邊團圓",
    巷口灯影: "巷口燈影",
    一桌家书: "一桌家書",
    "写下你所在的地方，月亮升起时的第一眼。":
      "寫下你所在的地方，月亮升起時的第一眼。",
    "留下一道中秋菜，或一段厨房里的对话。":
      "留下一道中秋菜，或一段廚房里的對話。",
    "挑一盏灯，写下那条边走边看的小路。": "挑一盞燈，寫下那條邊走邊看的小路。",
    "讲讲团聚时你想留住的一种声音。": "講講團聚時你想留住的一種聲音。",
    "写给远方正在抬头看月亮的那个人。": "寫給遠方正在抬頭看月亮的那個人。",
    "给下一位加入长卷的伙伴留一句祝福。": "給下一位加入長卷的伙伴留一句祝福。",
    查看已上卷画格: "查看已上卷畫格",
    "第一幅画格获准公开后，将在这里展出。":
      "第一幅畫格獲準公開后，將在這里展出。",
    "这格已有伙伴认领。你可以浏览公开版本，或选择其他开放画格。":
      "這格已有伙伴認領。你可以瀏覽公開版本，或選擇其他開放畫格。",
    来源原信: "來源原信",
    来源原信已停止展示: "來源原信已停止展示",
    为本次专题创作: "為本次專題創作",
    画格标题: "畫格標題",
    画格手记: "畫格手記",
    给这幅画面起个名字: "給這幅畫面起個名字",
    "写下你看到、听见或记得的中秋……": "寫下你看到、聽見或記得的中秋……",
    配图: "配圖",
    关联我的原信: "關聯我的原信",
    本次原创: "本次原創",
    灯火人家: "燈火人家",
    山间望月: "山間望月",
    "我同意将本稿、署名及所选原信的授权素材用于公开专题展和长卷图片导出。":
      "我同意將本稿、署名及所選原信的授權素材用於公開專題展和長卷圖片匯出。",
    "关联原信后，获准展出的照片将作为画面，录音可在展览中播放。":
      "關聯原信後，獲准展出的照片將作為畫面，錄音可在展覽中播放。",
    提交审核: "提交審核",
    放弃认领: "放棄認領",
    已恢复此标签页的编辑草稿: "已恢復此標簽頁的編輯草稿",
    未获采用: "未獲採用",
    处理中: "處理中",
    公开版本: "公開版本",
    我的投稿记录: "我的投稿記錄",
    撤回待审稿: "撤回待審稿",
    撤回至此版本的授权: "撤回至此版本的授權",
    "保存长卷 PNG": "保存長卷 PNG",
    已上卷画格: "已上卷畫格",
    中秋记忆长卷: "中秋記憶長卷",
    刷新展览: "刷新展覽",
    待审核: "待審核",
    海洋故事树: "海洋故事樹",
    回响故事树: "回響故事樹",
    "选择一只漂流瓶，看看一封来信怎样被不同的人接续。":
      "選擇一只漂流瓶，看看一封來信怎樣被不同的人接續。",
    "沿着漂流瓶之间的海流，寻找一封信的来处与回响。":
      "沿著漂流瓶之間的海流，尋找一封信的來處與回響。",
    切换故事: "切換故事",
    原始来信: "原始來信",
    接力来信: "接力來信",
    打开这封信: "打開這封信",
    沿支线阅读: "沿支線閱讀",
    从这里公开接力: "從這里公開接力",
    已关闭接力: "已關閉接力",
    缩小故事树: "縮小故事樹",
    放大故事树: "放大故事樹",
    当前路径: "當前路徑",
    当前阅读路径: "當前閱讀路徑",
    切换阅读支线: "切換閱讀支線",
    切换支线: "切換支線",
    回到海图: "回到海圖",
    选择后续支线: "選擇后續支線",
    故事支线: "故事支線",
    故事时间线: "故事時間線",
    返回展厅: "返回展廳",
    书信档案: "書信檔案",
    展览主题: "展覽主題",
    海的记忆: "海的記憶",
    "从一封信到一件共同作品。走进展览，读到每位作者的原信。":
      "從一封信到一件共同作品。走進展覽，讀到每位作者的原信。",
    保存纪念海报: "保存紀念海報",
    纪念海报: "紀念海報",
    回响长卷: "回響長卷",
    声音记忆: "聲音記憶",
    共创手记: "共創手記",
    阅读这封原信: "閱讀這封原信",
    来自这里的信: "來自這里的信",
    "展开画卷，读每一格背后的来信。": "展開畫卷，讀每一格背后的來信。",
    "主题展览 · 中秋": "主題展覽 · 中秋",
    "在本机审核公开书信、画格投稿和举报。":
      "在本機審核公開書信、畫格投稿和舉報。",
    本机管理员登录: "本機管理員登錄",
    在项目目录运行: "在項目目錄運行",
    "，将取得的一次性凭证填入下方。凭证在十分钟内有效。":
      "，將取得的一次性憑證填入下方。憑證在十分鐘內有效。",
    一次性审核凭证: "一次性審核憑證",
    打开审核台: "打開審核臺",
    长卷画格: "長卷畫格",
    公开书信: "公開書信",
    举报复核: "舉報復核",
    查看关联原信: "查看關聯原信",
    通过审核: "通過審核",
    保留原信并结案: "保留原信并結案",
    驳回投稿: "駁回投稿",
    退出审核台: "退出審核臺",
    "当前没有待处理的投稿或举报。": "當前沒有待處理的投稿或舉報。",
    "暂无操作记录。": "暫無操作記錄。",
    重试: "重試",
    待审附图: "待審附圖",
    "正在读取审核队列…": "正在讀取審核隊列…",
    "请先使用本机审核凭证登录。": "請先使用本機審核憑證登錄。",
    审核结果已保存: "審核結果已保存",
    重新连接: "重新連接",
    "正在打开海上来信…": "正在打開海上來信…",
    "中秋月下，朱帆驶过海边的村落": "中秋月下，朱帆駛過海邊的村落",
  };
  const storageKey = "letters-interface-locale";
  let traditional = false;
  try {
    traditional = localStorage.getItem(storageKey) === "zh-Hant";
  } catch {}
  window.translateSiteLabel = (label) => (traditional ? messages[label] : null) || label;
  const originals = new WeakMap();
  const originalAttrs = new WeakMap();

  // Only these named parts of the UI have translatable text. User-content containers
  // and dynamic headings (e.g., a gallery exhibit title) are intentionally absent.
  const labels = [
    "#navigation-title",
    ".compose-delivery > h2,#compose-ai-help,[data-ai-generate] span,[data-ai-status],#compose-ai-preview-title,[data-ai-overwrite]",
    ".cover-upload label,.cover-upload small,.cover-feedback,[data-cover-caption],[data-paper-name],.review-cover figcaption",
    ".sky-kicker,.sky h1,.sky h1 em,.sky-copy>p,.sky-actions>a,.sky-actions>button,.sky-stats dt,.globe-tools>span,[data-spin],.globe-pin>span,.post-pages>a,.post-connections small,.room-art h3,.room-copy p,.rooms-heading h2,.rooms-heading a",
    ".sm-word-picker,.sm-museum .page-head h1,.sm-museum .page-head p,.sm-label,.sm-compare-heading h2,.sm-compare-heading p,.sm-words button,.sm-archive-head h2,.sm-filters label,.sm-notes h2,.sm-back,.sm-contribute h3,.sm-contribute p,.sm-submit,.sm-links a,.sm-rowlink,.sm-count",
    ".kg-evidence>h3,.kg-index h2,.kg-chart-foot,.kg-chart-foot>span,[data-kg-center],.kg-node span,.kg-chart h2,.kg-chart header small,.kg-page .page-head p,.kg-page .page-head h1",
    ".sc-header h1,.sc-header p,.sc-header a,.sc-tools [data-tool] span,.sc-stamps button>span,.sc-tray h3,.sc-tray label,.sc-base,.sc-hint,.sc-studio .btn,.sc-footer .sc-count",
    ".ca-map-tools button,.ca-map-status p,.ca-caption,.ca-cross,.kg-source,.kg-map-link",
    ".skip",
    ".nav-link",
    ".head-actions a",
    ".footer-actions a",
    ".loading",
    "#toast",
    ".festival-intro h1",
    ".festival-intro p",
    ".festival-kicker",
    ".festival-progress b",
    ".festival-progress > span:last-child",
    ".festival-bar a",
    ".festival-invite small",
    ".festival-invite p",
    ".section-top > h2",
    ".section-title h2",
    ".section-top .text-link",
    ".page-head h1",
    ".page-head p",
    ".btn",
    ".plain",
    ".back",
    ".chip[data-action='home-theme']",
    ".chip[data-action='my-tab']",
    ".chip[data-action='discover-theme']",
    ".pickup-switch button",
    ".result-count",
    ".empty",
    ".empty a",
    "label.field",
    "label.check",
    ".editor-tools h2",
    ".editor-tools > p",
    ".stationery-options .btn",
    ".form-grid > p.subtle",
    ".stationery-options label",
    ".read-aside h2",
    ".read-aside p",
    ".read-aside a",
    ".reference small",
    ".reference a",
    ".byline time + span",
    ".paper-stamp small",
    ".list-item .status",
    ".list-item .text-link",
    ".dialog-heading h2",
    ".form-grid > p",
    ".account-band .subtle",
    ".ct-editor legend",
    ".ct-help",
    ".ct-consent",
    ".ct-suggest small",
    "[data-ct-selected] > small",
    "[data-ct-status]",
    ".ct-related > h2",
    ".ct-related > p",
    ".ca-tabs button",
    ".ca-toggle button",
    ".ca-map-heading h2",
    ".ca-place-copy > h2",
    ".ca-place-visual > span",
    ".ca-stop-list span",
    ".ca-stop-list small",
    ".ca-guide > span",
    ".ca-guide h3",
    ".ca-guide p",
    ".ca-source",
    ".ca-kin strong",
    ".ca-kin p",
    ".ca-cross",
    ".ca-local > div h2",
    ".ca-local > div small",
    ".ca-local > p",
    ".wk-kicker",
    ".wk-cover-copy > p",
    ".wk-cover-actions > span",
    ".wk-origins h2",
    ".wk-section-title h2",
    ".wk-panel-card > b",
    ".wk-panel-card > small",
    ".wk-status",
    ".wk-workarea > .wk-brief > h2",
    ".wk-workarea > .wk-brief > p",
    ".wk-inline",
    ".wk-notice",
    ".wk-draft-status",
    ".wk-history h3",
    ".wk-work-content .wk-consent",
    ".wk-colophon h2",
    ".wk-dialog h2",
    ".wk-dialog p",
    ".sv-button",
    ".sv-link",
    ".sv-map-key",
    ".sv-inspector > .sv-clay",
    ".sv-zoom button",
    ".sv-path > h2",
    ".sv-select",
    ".sv-empty",
    ".sv-empty p",
    ".sv-sheet-dialog form h2",
    ".sv-film-head h2",
    ".sv-audio-work > h2",
    ".sv-sources > h2",
    "[data-sv-format]",
    ".sv-poster-actions button",
    ".sv-time-label",
    ".sv-tag.sv-clay",
    ".review-screen > header p",
    ".review-screen > header h1",
    "#review-login h2",
    "#review-login p",
    "#review-workspace > p.subtle",
    "#review-workspace > .section-top h2",
    "#review-workspace > details > summary",
    "#review-workspace > .panel .byline > strong",
    "#review-workspace > .panel > a.text-link",
  ].join(",");
  const protectedNodes =
    "textarea,input,[contenteditable=true],[data-ct-remove],[data-ct-candidate],[data-sv-jump],[data-sv-choose]";
  function translate(text, node) {
    if (Object.hasOwn(messages, text)) return messages[text];
    // Only authorised counts/date/status formats are interpolated here. Dynamic text
    // between guillemets (names or quoted titles) is never script-converted.
    if (node.matches(".festival-progress > span:last-child"))
      return text.replace(/幅已展出$/, "幅已展出");
    if (node.matches(".sm-count")) return text.replace(/段录音$/, "段錄音");
    if (node.matches(".kg-chart header small"))
      return text.replace(/条直接关系$/, "條直接關係");
    if (node.matches(".kg-chart h2"))
      return text.replace(/的关系图$/, "的關係圖");
    if (node.matches(".result-count"))
      return text.replace(/^(共 \d+ )封公开书信$/, "$1封公開書信");
    if (node.matches(".wk-panel-card > small"))
      return text.replace(/版已公开$/, "版已公開");
    if (node.matches(".wk-notice"))
      return text.replace(
        /^你的第 (\d+) 版正在审核，可在下方投稿记录查看或撤回。$/,
        "你的第 $1 版正在審核，可在下方投稿記錄查看或撤回。",
      );
    if (node.matches(".form-grid > p.subtle"))
      return text
        .replace(
          /^信件审核通过后公开展示。署名为「/,
          "信件審核通過後公開展示。署名為「",
        )
        .replace(/ · 仅通信双方可见$/, " · 僅通信雙方可見");
    if (node.matches(".page-head p"))
      return text.replace(
        /^正在回应《(.+)》，发表后将连接到这封信。$/,
        "正在回應《$1》，發表後將連接到這封信。",
      );
    if (node.matches(".account-band .subtle"))
      return text
        .replace(/^当前为此浏览器的访客身份/, "當前為此瀏覽器的訪客身份")
        .replace(/^已登录/, "已登入");
    if (node.matches("[data-ct-status]"))
      return text
        .replace(/^本地词表/, "本地詞表")
        .replace(/点击候选即可添加。/, "點擊候選即可新增。")
        .replace(
          /未发现合适的标签，可手动添加。/,
          "未發現合適的標籤，可手動新增。",
        );
    if (node.matches("#review-workspace > .section-top h2"))
      return text.replace(/^待处理（(\d+)）$/, "待處理（$1）");
    if (node.matches("#review-workspace > details > summary"))
      return text.replace(
        /^审核记录（最近 (\d+) 条）$/,
        "審核記錄（最近 $1 筆）",
      );
    if (node.matches(".sv-time-label"))
      return text.replace(/^原始来信/, "原始來信");
    return text;
  }
  function textNode(node, parent) {
    const current = node.data;
    const old = originals.get(node);
    const source = old && old.rendered === current ? old.source : current;
    const trim = source.trim();
    if (!trim) return;
    const target = traditional
      ? source.replace(trim, () => translate(trim, parent))
      : source;
    if (target !== current) {
      originals.set(node, { source, rendered: target });
      node.data = target;
    }
  }
  function attribute(element, name) {
    if (!element.hasAttribute(name)) return;
    const current = element.getAttribute(name);
    const data = originalAttrs.get(element) || {};
    const old = data[name];
    const source = old && old.rendered === current ? old.source : current;
    const target =
      traditional && Object.hasOwn(messages, source)
        ? messages[source]
        : source;
    if (target === current) return;
    data[name] = { source, rendered: target };
    originalAttrs.set(element, data);
    element.setAttribute(name, target);
  }
  function eligibleOption(o) {
    const s = o.parentElement;
    if (!s || s.tagName !== "SELECT") return false;
    // Titles used to pick a letter or original quote are always original, even if
    // they are also interface words, e.g., an author's letter titled “文化地图”.
    if (["quoteText", "sourceId"].includes(s.name)) return o.value === "";
    return (
      ["theme", "drift", "paper", "stamp", "art"].includes(s.name) ||
      s.matches(".post-location select,[data-kg-kind],[data-sm-filter]") ||
      (s.name === "baseId" && o.value === "") ||
      s.id === "drift-filter" ||
      (s.id === "region-filter" && o.value === "") ||
      (o.value === "" &&
        ["networkTheme", "galleryTheme", "region"].includes(
          s.dataset.svControl,
        ))
    );
  }
  function options(root) {
    const list = root.matches("option")
      ? [root]
      : root.querySelectorAll("option");
    list.forEach((o) => {
      if (!eligibleOption(o)) return;
      const source = o.textContent.trim(),
        target = messages[source];
      if (!target) return;
      // The label attribute localises what is displayed without changing the
      // option's original text/value, even when its value is implicit.
      if (traditional && o.label !== target) o.label = target;
      if (
        !traditional &&
        !o.hasAttribute("value") &&
        o.getAttribute("label") === target
      )
        o.removeAttribute("label");
      else if (!traditional && o.getAttribute("label") === target)
        o.removeAttribute("label");
    });
  }
  const attributes =
    "[aria-label],input[placeholder],textarea[placeholder],button[title],iframe[title],img[alt]";
  function process(root) {
    if (root.nodeType !== Node.ELEMENT_NODE || !root.isConnected) return;
    const selectable = [...root.querySelectorAll(labels)];
    if (root.matches(labels)) selectable.unshift(root);
    // The story overview header is fixed except for gallery-detail titles and
    // timeline subtitles, which are original user titles.
    const [route, id] = location.hash.slice(1).split("/");
    const studioTitles = root.matches(".sv-header h1,.sv-header p")
      ? [root]
      : root.querySelectorAll(".sv-header h1,.sv-header p");
    studioTitles.forEach((el) => {
      if (route === "gallery" && id) return;
      if (route === "timeline" && el.tagName === "P") return;
      selectable.push(el);
    });
    for (const el of selectable) {
      if (el.closest(protectedNodes)) continue;
      for (const child of el.childNodes)
        if (child.nodeType === Node.TEXT_NODE) textNode(child, el);
    }
    for (const el of [root, ...root.querySelectorAll(attributes)]) {
      for (const name of ["aria-label", "placeholder", "title", "alt"])
        attribute(el, name);
    }
    options(root);
  }
  function languageButton() {
    const b = document.querySelector("[data-language]");
    if (!b) return;
    const name = traditional ? "简体中文" : "繁體中文";
    if (b.textContent !== name) b.textContent = name;
    b.setAttribute("lang", traditional ? "zh-Hans" : "zh-Hant");
    b.setAttribute(
      "aria-label",
      traditional ? "切换为简体中文" : "切換為繁體中文",
    );
  }
  function title() {
    const [name, ...suffix] = document.title.split(" · ");
    const old =
      Object.keys(messages).find((key) => messages[key] === name) || name;
    const value = [traditional ? messages[old] || old : old, ...suffix].join(
      " · ",
    );
    if (document.title !== value) document.title = value;
  }
  function apply() {
    document.documentElement.lang = traditional ? "zh-Hant" : "zh-CN";
    process(document.body);
    languageButton();
    title();
  }
  const observer = new MutationObserver((records) => {
    const dirty = new Set();
    for (const record of records) {
      if (record.target.nodeName === "TITLE") {
        title();
        continue;
      }
      if (!traditional) continue;
      const target =
        record.target.nodeType === Node.TEXT_NODE
          ? record.target.parentElement
          : record.target;
      if (target?.closest("#main,dialog,#toast,#nav,.head-actions"))
        dirty.add(target);
    }
    for (const el of dirty)
      if (
        el.isConnected &&
        !Array.from(dirty).some((other) => other !== el && other.contains(el))
      )
        process(el);
  });
  apply();
  observer.observe(document.body, {
    subtree: true,
    childList: true,
    characterData: true,
  });
  observer.observe(document.querySelector("title"), {
    childList: true,
    characterData: true,
    subtree: true,
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest("[data-language]")) return;
    traditional = !traditional;
    try {
      localStorage.setItem(storageKey, traditional ? "zh-Hant" : "zh-CN");
    } catch {}
    apply();
    window.dispatchEvent(new Event("sea:language-changed"));
  });
})();
