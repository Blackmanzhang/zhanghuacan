(function soundArchive() {
  "use strict";
  const esc = (value) => window.app.esc(value);
  const icon = (name, size) => window.app.icon(name, size);
  const words = [
    { key: "morning", word: "早安" },
    {
      key: "sea",
      word: "海",
      original: "海",
      nan: ["hái", "06176"],
      hak: ["hoi³¹", "05562"],
      yue: ["hoi2", "oi/2/hoi2"],
    },
    {
      key: "wind",
      word: "风",
      original: "風",
      nan: ["hong", "05585"],
      hak: ["fung²⁴", "03313"],
      yue: ["fung1", "ung/1/fung1"],
    },
    {
      key: "boat",
      word: "船",
      original: "船",
      nan: ["tsûn", "07809"],
      hak: ["son¹¹", "11953"],
      yue: ["syun4", "yun/4/syun4"],
    },
    {
      key: "letter",
      word: "信",
      original: "信",
      nan: ["sìn", "04708"],
      hak: ["xin⁵⁵", "14035"],
      yue: ["seon3", "eon/3/seon3"],
    },
    {
      key: "tea",
      word: "茶",
      original: "茶",
      nan: ["tê", "06559"],
      hak: ["ca¹¹", "00831"],
      yue: ["caa4", "aa/4/caa4"],
    },
    {
      key: "moon",
      word: "月",
      original: "月",
      nan: ["gua̍t", "00811"],
      hak: ["ngied⁵", "09429"],
      yue: ["jyut6", "yut/6/jyut6"],
    },
    {
      key: "rice",
      word: "米",
      original: "米",
      nan: ["bí", "02599"],
      hak: ["mi³¹", "08473"],
      yue: ["mai5", "ai/5/mai5"],
    },
    {
      key: "rain",
      word: "雨",
      original: "雨",
      nan: ["hōo", "04513"],
      hak: ["i³¹", "05719"],
      yue: ["jyu5", "yu/5/jyu5"],
    },
    {
      key: "mountain",
      word: "山",
      original: "山",
      nan: ["suann", "00206"],
      hak: ["san²⁴", "11114"],
      yue: ["saan1", "aan/1/saan1"],
    },
    {
      key: "water",
      word: "水",
      original: "水",
      nan: ["tsuí", "00823"],
      hak: ["sui³¹", "12276"],
      yue: ["seoi2", "eoi/2/seoi2"],
    },
    ...window.soundCollection,
  ];
  const creditNan = "教育部《臺灣台語常用詞辭典》";
  const themes = {
    tea: "餐桌饮食",
    moon: "山海天象",
    rice: "餐桌饮食",
    rain: "山海天象",
    mountain: "山海天象",
    water: "山海天象",
    morning: "日常问候",
    sea: "海洋自然",
    wind: "海洋自然",
    boat: "舟行",
    letter: "书信",
  };
  const creditHak = "教育部《臺灣客語辭典》";
  const creditYue = "粵音資料集叢";
  const licenses = {
    moe: {
      name: "CC BY-ND 3.0 TW",
      href: "https://creativecommons.org/licenses/by-nd/3.0/tw/",
    },
    yue: {
      name: "CC BY-SA 4.0",
      href: "https://creativecommons.org/licenses/by-sa/4.0/",
    },
  };
  const yueRepo = "https://github.com/jyutnet/jyutnet-cantonese-syllables";
  const recordings = [
    {
      id: "nan-morning",
      key: "morning",
      title: "𠢕早",
      text: "𠢕早",
      reading: "gâu-tsá",
      language: "闽南语（台湾）",
      region: "台湾",
      credit: creditNan,
      speaker: "辞典词目示范音",
      src: "/audio/nan-morning.mp3",
      license: licenses.moe,
      entry: "https://sutian.moe.edu.tw/zh-hant/su/13473/",
      original: "https://r2-assets.moedict.tw/audio/t/13508.mp3",
      terms: "https://sutian.moe.edu.tw/zh-hant/piantsip/pankhuan-singbing/",
      note: "早晨相见时的问候，意思是「早安」。辞典原声，由萌典音档镜像提供。",
    },
    {
      id: "yue-morning",
      key: "morning",
      title: "早晨",
      text: "早晨。",
      reading: "zou2 san4",
      language: "粤语",
      region: "地域未注明",
      credit: "cantonesespoken",
      speaker: "Tatoeba 发音人",
      src: "/audio/yue-morning.mp3",
      license: {
        name: "CC BY 4.0",
        href: "https://creativecommons.org/licenses/by/4.0/",
      },
      entry: "https://tatoeba.org/en/sentences/show/402878",
      original: "https://tatoeba.org/en/audio/download/990487",
      terms: "https://tatoeba.org/en/user/profile/cantonesespoken",
      note: "粤语的早安问候。原句由 nickyeow 提供，录音由 cantonesespoken 发布，录制地点未公开。",
    },
    ...words
      .filter((entry) => entry.nan)
      .flatMap((entry) =>
        ["nan", "yue", "hak"].map((type) => {
          const [reading, file] = entry[type];
          const isYue = type === "yue",
            isHak = type === "hak";
          return {
            id: `${type}-${entry.key}`,
            key: entry.key,
            title: entry.word,
            theme: entry.theme || themes[entry.key],
            text: entry.original,
            reading,
            speaker: isYue ? "发音人 kt" : "辞典词目示范音",
            language: isYue
              ? "粤语"
              : isHak
                ? "客家语（四县腔）"
                : "闽南语（台湾）",
            region: isYue ? "香港" : "台湾",
            credit: isYue ? creditYue : isHak ? creditHak : creditNan,
            license: isYue ? licenses.yue : licenses.moe,
            terms: isYue
              ? yueRepo
              : isHak
                ? "https://hakkadict.moe.edu.tw/directions/答客問/版本授權/"
                : "https://sutian.moe.edu.tw/zh-hant/piantsip/pankhuan-singbing/",
            original: isYue
              ? `${yueRepo}/blob/4f4204b03a3694cb4451ffeda064bc1e6c71629f/sound/kt/${file}.opus`
              : `https://r2-assets.moedict.tw/audio/${isHak ? "h/1-" : "t/"}${file}.mp3`,
            entry: isYue
              ? "https://jyut.net/query?q=" + encodeURIComponent(entry.original)
              : `https://www.moedict.tw/${isHak ? ":" : "'"}${encodeURIComponent(entry.original)}`,
            src: `/audio/${type}-${entry.key}.${isYue ? "opus" : "mp3"}`,
          };
        }),
      ),
  ];
  const pageSize = 24;
  let shown = pageSize;
  let wordKey = "morning",
    region = "",
    language = "",
    theme = "",
    search = "",
    active = null,
    player = null;
  function contributions() {
    return window.app.state.letters
      .filter(
        (letter) =>
          letter.status === "published" &&
          letter.exhibit &&
          letter.media?.type === "audio" &&
          /^\/api\/media\/[\w-]+$/.test(letter.media.url),
      )
      .map((letter) => {
        const dialect = (letter.tags || []).find(
          (tag) =>
            /(?:语|話|话|腔)$|^(?:方言|语种)[：:]/u.test(tag) && tag !== "方言",
        );
        return {
          id: "post-" + letter.id,
          title: letter.title,
          text: letter.body,
          credit: letter.author,
          region: letter.region || "地域未注明",
          language:
            dialect?.replace(/^(?:方言|语种)[：:]/u, "") || "语种未注明",
          src: letter.media.url,
          post: letter.id,
          speaker: "声音来信",
          theme: letter.theme || "其他",
        };
      });
  }
  const library = () => [...recordings, ...contributions()];
  const themeOf = (item) => item.theme || themes[item.key];
  const external = (url, name) =>
    `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(name)} ↗</a>`;
  const link = (item) => `#sounds/${encodeURIComponent(item.id)}`;
  function toggle(item) {
    return `<button type="button" class="sm-toggle" data-sm-play="${esc(item.id)}" data-sm-name="${esc(item.language + " · " + item.title)}" aria-label="${esc("播放" + item.language + " · " + item.title)}" aria-pressed="false"><span class="sm-playmark" aria-hidden="true"></span></button>`;
  }
  function stop() {
    if (player) {
      player.pause();
      player.removeAttribute("src");
      player.load();
    }
    player = null;
    active = null;
  }
  function sync(root) {
    const isPlaying = Boolean(player && !player.paused && !player.ended);
    root.querySelectorAll("[data-sm-play]").forEach((button) => {
      const on = isPlaying && button.dataset.smPlay === active;
      button.setAttribute("aria-pressed", String(on));
      button.setAttribute(
        "aria-label",
        (on ? "暂停" : "播放") + button.dataset.smName,
      );
    });
    root.classList.toggle("sm-playing", isPlaying);
    const seek = root.querySelector("[data-sm-seek]");
    if (seek && player && isFinite(player.duration)) {
      seek.disabled = false;
      seek.max = player.duration;
      seek.value = player.currentTime;
    }
  }
  function play(root, item) {
    if (!item) return;
    const feedback = root.querySelector("[data-sm-message]");
    if (active === item.id && player && !player.paused) {
      player.pause();
      return;
    }
    if (!player || active !== item.id) {
      stop();
      active = item.id;
      player = new Audio(item.src);
      const audio = player;
      ["playing", "pause", "ended", "timeupdate", "loadedmetadata"].forEach(
        (type) => {
          audio.addEventListener(type, () => {
            if (audio === player && root.isConnected) sync(root);
          });
        },
      );
    }
    const audio = player;
    if (audio.ended) audio.currentTime = 0;
    feedback.textContent = "";
    audio.play().catch((error) => {
      if (error.name !== "AbortError" && player === audio && root.isConnected) {
        feedback.textContent = "这段录音暂时无法播放，请重试或查看录音出处。";
        sync(root);
      }
    });
  }
  function compare() {
    const word = words.find((item) => item.key === wordKey);
    const morning = word.key === "morning";
    const quick = words.slice(0, 11);
    if (!quick.includes(word)) quick.push(word);
    const groups = [...new Set(words.map((entry) => entry.theme || themes[entry.key]))];
    const picker = `<label class="sm-word-picker">全部对听词<select data-sm-word-picker>${
      groups.map((group) => `<optgroup label="${esc(group)}">${
        words.filter((entry) => (entry.theme || themes[entry.key]) === group)
          .map((entry) => `<option value="${entry.key}" ${entry === word ? "selected" : ""}>${esc(entry.word)}</option>`)
          .join("")
      }</optgroup>`).join("")
    }</select></label>`;
    return `<div class="sm-compare-heading"><div><h2>${morning ? "同一句早安，两种乡音" : "同一个字，听三种乡音"}</h2><p>选一句问候或一个字，点播放键对听。</p></div><div class="sm-words" aria-label="选择对听词">${quick.map((w) => `<button type="button" data-sm-word="${w.key}" aria-pressed="${w.key === wordKey}">${w.word}</button>`).join("")}${picker}</div></div>
      <div class="sm-trio ${morning ? "sm-duo" : ""}">${recordings
        .filter((item) => item.key === word.key)
        .map(
          (item) =>
            `<article>${toggle(item)}<div><h3>${item.language}${morning ? " · " + item.title : ""}</h3><span class="sm-reading">${item.reading}</span></div><a href="${link(item)}" aria-label="查看${item.language}${word.word}的出处">${icon("chevron", 16)}</a></article>`,
        )
        .join("")}</div>`;
  }
  function rows(all) {
    const query = search.trim().normalize("NFC").toLowerCase();
    const filtered = all.filter(
      (item) =>
        (!region || item.region === region) &&
        (!language || item.language === language) &&
        (!theme || themeOf(item) === theme) &&
        (!query ||
          [
            item.title,
            item.text,
            item.reading,
            item.credit,
            item.language,
            item.region,
            themeOf(item),
          ].some((value) =>
            (value || "").normalize("NFC").toLowerCase().includes(query),
          )),
    );
    return `<p class="sm-count" aria-live="polite">${filtered.length} 段录音</p>${
      filtered
        .slice(0, shown)
        .map(
          (item) => `<article class="sm-row">
      ${toggle(item)}<a class="sm-rowname" href="${link(item)}"><strong>${esc(item.title)}</strong><span>${esc(item.reading || item.credit)}</span></a>
      <span>${esc(item.language)}</span><span class="sm-area">${esc(item.region)}</span><a class="sm-rowlink" aria-label="${esc("查看录音档案 · " + item.title + " · " + item.language)}" href="${link(item)}">${icon("chevron", 16)}</a>
      </article>`,
        )
        .join("") ||
      `<div class="sm-empty">这个组合暂时没有录音。<button type="button" data-sm-reset>查看全部</button></div>`
    }${filtered.length > shown ? '<div class="sm-more"><button type="button" class="btn compact" data-sm-more>显示更多录音</button></div>' : ""}`;
  }
  function filter(label, id, values, selected) {
    return `<label>${label}<select data-sm-filter="${id}"><option value="">全部${label}</option>${[...new Set(values)].map((v) => `<option value="${esc(v)}" ${v === selected ? "selected" : ""}>${esc(v)}</option>`).join("")}</select></label>`;
  }
  function detail(item) {
    return `<a class="sm-back" href="#sounds">${icon("back", 16)} 回到乡音展馆</a>
      <section class="sm-detail"><div class="sm-label">乡音馆藏 · ${item.post ? "声音来信" : "词音原档"}</div>
      <h1>${esc(item.title)}</h1><p>${esc(item.region)}　/　${esc(item.language)}　/　${esc(themeOf(item))}</p>
      <div class="sm-detail-player">${toggle(item)}<div><strong>${esc(item.reading || "听这封信")}</strong><input aria-label="录音播放进度" data-sm-seek type="range" min="0" max="1" step=".01" value="0" disabled></div></div></section>
      <section class="sm-notes"><h2>${item.post ? "来信正文" : "录音文字"}</h2><p>${esc(item.text)}</p><h2>录音出处</h2>
      <p>${esc(item.credit)} · ${esc(item.speaker)}</p>
      ${
        item.post
          ? `<p>作者已授权在数字展厅展示此信与录音。</p><a href="#read/${encodeURIComponent(item.post)}">打开原信 ↗</a>`
          : `<p>${item.note || (item.id.startsWith("yue") ? "香港粤语音节录音，按粤拼标音。" : "辞典原声，由萌典音档镜像提供。")}录音按原文件收录。</p><div class="sm-links">${external(item.entry, "词目与读音")}${external(item.original, "原始音档")}${external(item.terms, "来源与署名")}${external(item.license.href, item.license.name)}</div>`
      }</section>`;
  }
  function contribute() {
    return `<aside class="sm-contribute"><div><h3>留下你的乡音</h3><p>把家乡话录成声音来信，写下原文、地域和语种标签。勾选展出授权，审核通过后即可在馆内收听。</p></div><a class="sm-submit" href="#write">${icon("pen", 16)} 写声音来信</a></aside>`;
  }
  function view(id) {
    stop();
    const all = library(),
      selected = id && all.find((item) => item.id === id);
    if (!all.some((item) => item.region === region)) region = "";
    if (!all.some((item) => item.language === language)) language = "";
    if (!all.some((item) => themeOf(item) === theme)) theme = "";
    const message = `<p class="sm-message" data-sm-message role="status"></p>`;
    if (id)
      return `<div class="sm-museum">${selected ? detail(selected) : `<div class="sm-notes"><h1>这段录音暂未展出</h1><a href="#sounds">回到乡音展馆</a></div>`}${message}</div>`;
    return `<div class="sm-museum"><header class="page-head"><div><h1>乡音展馆</h1><p>从一句「早安」开始，听问候和海边的日常。</p></div></header>
      ${message}<section class="sm-compare" data-sm-compare>${compare()}</section>
      <section class="sm-archive"><div class="sm-archive-head"><h2>声音馆藏</h2><div class="sm-filters">${filter(
        "地域",
        "region",
        all.map((item) => item.region),
        region,
      )}${filter(
        "语种",
        "language",
        all.map((item) => item.language),
        language,
      )}${filter("主题", "theme", all.map(themeOf), theme)}</div></div><label class="sm-archive-search">查找录音<input type="search" data-sm-search placeholder="输入文字、拼音或署名" value="${esc(search)}"></label><div data-sm-rows>${rows(all)}</div></section>${contribute()}</div>`;
  }
  function mount() {
    const root = document.querySelector(".sm-museum");
    if (!root || root.dataset.smReady) return;
    root.dataset.smReady = "true";
    function selectWord(key, focusSelector) {
      stop();
      wordKey = key;
      root.querySelector("[data-sm-compare]").innerHTML = compare();
      root.querySelector(focusSelector)?.focus({ preventScroll: true });
      sync(root);
    }
    root.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      if (b.hasAttribute("data-sm-play"))
        play(
          root,
          library().find((item) => item.id === b.dataset.smPlay),
        );
      if (b.hasAttribute("data-sm-word")) {
        selectWord(b.dataset.smWord, `[data-sm-word="${b.dataset.smWord}"]`);
      }
      if (b.hasAttribute("data-sm-more")) {
        const firstNew = shown;
        shown += pageSize;
        root.querySelector("[data-sm-rows]").innerHTML = rows(library());
        root.querySelectorAll(".sm-row")[firstNew]?.querySelector(".sm-rowname").focus();
        sync(root);
      }
      if (b.hasAttribute("data-sm-reset")) {
        shown = pageSize;
        theme = language = region = search = "";
        root.querySelector("[data-sm-search]").value = "";
        root.querySelectorAll("[data-sm-filter]").forEach((s) => (s.value = ""));
        root.querySelector("[data-sm-rows]").innerHTML = rows(library());
      }
    });
    root.addEventListener("change", (e) => {
      if (e.target.hasAttribute("data-sm-word-picker")) {
        selectWord(e.target.value, "[data-sm-word-picker]");
        return;
      }
      const f = e.target.dataset.smFilter;
      if (!f) return;
      shown = pageSize;
      if (f === "region") region = e.target.value;
      if (f === "language") language = e.target.value;
      if (f === "theme") theme = e.target.value;
      stop();
      root.querySelector("[data-sm-rows]").innerHTML = rows(library());
      sync(root);
    });
    root.addEventListener("input", (e) => {
      if (e.target.hasAttribute("data-sm-search")) {
        shown = pageSize;
        search = e.target.value;
        root.querySelector("[data-sm-rows]").innerHTML = rows(library());
        sync(root);
        return;
      }
      if (
        e.target.hasAttribute("data-sm-seek") &&
        player &&
        isFinite(player.duration)
      )
        player.currentTime = Number(e.target.value);
    });
  }
  window.addEventListener("hashchange", stop);
  window.soundMuseum = { view, mount };
})();
