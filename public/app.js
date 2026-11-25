/* 海上有信 · 应用、导航与书信交互 */

"use strict";
const main = document.querySelector("#main");
const primaryNavigation = document.querySelector("#nav");
const dialog = document.querySelector("#dialog");
const state = { me: {}, letters: [], mine: [], inbox: [], favorites: [] };
const themes = ["家乡风物", "节日习俗", "海外日常", "成长记忆", "未来心愿"];
const artNames = {
  wave: "海浪",
  lantern: "灯笼",
  leaf: "九层塔",
  boat: "岸边小船",
  mountain: "青山",
  moon: "海上月色",
  harbor: "夜港灯塔",
  postdesk: "潮汐邮局",
  sampan: "江口归帆",
  courtyard: "花窗庭院",
};
const paths = {
  home: '<path d="m3 10 9-7 9 7v10H4V10m5 10v-7h6v7"/>',
  sparkles:
    '<path d="M11 3l1.8 5.2L18 10l-5.2 1.8L11 17l-1.8-5.2L4 10l5.2-1.8L11 3zm7.5 10v7m-3.5-3.5h7M19 3v4m-2-2h4"/>',
  pen: '<path d="m15 5 4 4M4 20l5-1L21 7a2.8 2.8 0 0 0-4-4L5 15z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/>',
  waves:
    '<path d="M2 7q3-3 6 0t6 0 6 0m-18 5q3-3 6 0t6 0 6 0m-18 5q3-3 6 0t6 0 6 0"/>',
  bottle:
    '<g transform="rotate(35 12 12)"><path d="M10 2h4m-3 1v5l-3 3v9q4 2 8 0v-9l-3-3V3m-5 12h8"/></g>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
  bookmark: '<path d="M6 4q0-1 2-1h8q2 0 2 1v17l-6-4-6 4z"/>',
  user: '<circle cx="12" cy="8" r="3.6"/><path d="M4 21c1-8 15-8 16 0"/>',
  pin: '<path d="M19 10c0 5-7 11-7 11s-7-6-7-11a7 7 0 1 1 14 0z"/><circle cx="12" cy="10" r="2.2"/>',
  branch:
    '<circle cx="6" cy="5" r="2.4"/><circle cx="18" cy="6" r="2.4"/><circle cx="6" cy="19" r="2.4"/><path d="M6 8v8m0-2c6 0 12-1 12-6"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  back: '<path d="m14 5-7 7 7 7"/>',
  search: '<circle cx="10" cy="10" r="6.5"/><path d="m15 15 6 6"/>',
  shuffle:
    '<path d="M3 6h3c4 0 7 12 11 12h4m-4-4 4 4-4 4M3 18h3c2 0 4-3 5-5m2-3c2-3 3-4 5-4h3m-4-4 4 4-4 4"/>',
  close: '<path d="m5 5 14 14M19 5 5 19"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  send: '<path d="m2 11 19-8-6 18-4-7-9-3zm9 3 10-11"/>',
  book: '<path d="M12 6c-3-2-6-2-10-1v15c4-1 7-1 10 1 3-2 6-2 10-1V5c-4-1-7-1-10 1zm0 0v15"/>',
  globe:
    '<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',
  layers: '<path d="m12 3 10 6-10 6L2 9zm-9 11 9 5 9-5m-18 4 9 5 9-5"/>',
  check: '<path d="m4 12 5 5L20 6"/>',
  menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
  image:
    '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8" cy="8" r="1.4"/><path d="m3 18 6-6 4 4 3-5 5 7"/>',
  plus: '<path d="M12 4v16M4 12h16"/>',
  minus: '<path d="M4 12h16"/>',
  list: '<path d="M8 6h12M8 12h12M8 18h12M4 6h.1M4 12h.1M4 18h.1"/>',
};
const aliases = {
  "map-pin": "pin",
  map: "globe",
  network: "branch",
  "git-branch": "branch",
  "chevron-right": "chevron",
  "chevron-left": "back",
  x: "close",
  "book-open": "book",
  archive: "layers",
  feather: "pen",
  pencil: "pen",
  reply: "mail",
  users: "user",
  route: "branch",
  gallery: "image",
};
function icon(name, size = 20) {
  return `<svg width="${Number(size) || 20}" height="${Number(size) || 20}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[aliases[name] || name] || paths.compass}</svg>`;
}
function esc(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
}
const webpArt = new Set(["harbor", "postdesk", "sampan", "courtyard"]);
const art = (token) => {
  const key = Object.hasOwn(artNames, token) ? token : "wave";
  return `/art/${key}.${webpArt.has(key) ? "webp" : "png"}`;
};
const urlId = (id) => encodeURIComponent(id);
function go(route) {
  if (location.hash.slice(1) === route) render();
  else location.hash = route;
}
function getRoute() {
  const [key, id = ""] = location.hash.slice(1).split("/");
  let decoded;
  try {
    decoded = decodeURIComponent(id);
  } catch {
    decoded = "";
  }
  return [key || "home", decoded];
}
function values(form) {
  return Object.fromEntries(new FormData(form));
}
async function request(path, body) {
  const r = await fetch(
    "/api/" + path,
    body === undefined
      ? { cache: "no-store" }
      : {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
  );
  const data = await r.json();
  if (!r.ok) {
    const error = new Error(data.error || "操作未完成，请重试。");
    error.status = r.status;
    throw error;
  }
  return data;
}
let stateRequest = 0,
  appliedRequest = 0;
async function reload() {
  const requestId = ++stateRequest;
  const freshState = await request("state");
  if (requestId >= appliedRequest) {
    appliedRequest = requestId;
    Object.assign(state, freshState);
  }
}
let toastTimer;
function notify(msg) {
  const t = document.querySelector("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 3500);
}
function modal(title, body) {
  document.querySelector("#dialog-content").innerHTML =
    `<div class="dialog-heading"><h2>${esc(title)}</h2><button type="button" class="circle-btn" data-action="dismiss" aria-label="关闭">${icon("close", 16)}</button></div>${body}`;
  if (!dialog.open) dialog.showModal();
}
function empty(msg, link = "", label = "") {
  return `<div class="empty">${esc(msg)}${link ? `<br><a class="text-link" href="#${link}">${label}</a>` : ""}</div>`;
}
function media(letter) {
  const m = letter?.media;
  if (!m || typeof m.url !== "string") return "";
  if (!/^\/api\/media\/[\w-]+$/.test(m.url)) return "";
  if (m.type === "image")
    return `<img class="attachment" alt="信件附图" src="${esc(m.url)}">`;
  if (m.type === "audio")
    return `<audio controls class="media-audio" src="${esc(m.url)}"></audio>`;
  return "";
}
function avatar(author, token = "") {
  return `<span aria-hidden="true" class="avatar ${token === "lantern" ? "warm" : token === "wave" ? "cool" : ""}">${esc(Array.from(author || "海")[0])}</span>`;
}
function getLetter(id) {
  return (
    state.mine.find((l) => l.id === id) ||
    state.letters.find((l) => l.id === id)
  );
}
function published() {
  return state.letters.filter((l) => l.status === "published");
}
function roots() {
  return published().filter((l) => !l.parentId);
}
let filters = { theme: "全部来信", region: "", q: "", drift: "" },
  myTab = "我的书信",
  lastBottle = "";
function chips(active, action, options) {
  return `<div class="chips">${options.map((k) => `<button class="chip ${k === active ? "active" : ""}" aria-pressed="${k === active}" data-action="${action}" data-value="${esc(k)}">${esc(k)}</button>`).join("")}</div>`;
}
function card(letter) {
  const saved = state.favorites.includes(letter.id),
    href = `#read/${urlId(letter.id)}`;
  return `<article class="letter-card"><a class="card-art" href="${href}" aria-label="阅读${esc(letter.title)}"><img src="${stationery.coverUrl(letter)}" alt="" loading="lazy"></a><button class="bookmark" data-action="favorite" data-id="${esc(letter.id)}" aria-label="${saved ? "取消收藏" : "收藏"}《${esc(letter.title)}》" aria-pressed="${saved}">${icon("bookmark", 16)}</button><div class="card-copy"><span class="theme-label t-${esc(letter.art)}">${esc(letter.theme)}</span><h3><a href="${href}">${esc(letter.title)}</a></h3><p>${esc(letter.body.split("\n").filter(Boolean)[0])}</p><div class="card-meta">${avatar(letter.author, letter.art)}${esc(letter.author)}${letter.region ? `<span class="pin">${icon("pin", 13)} ${esc(letter.region)}</span>` : ""}</div></div></article>`;
}
function section(title, link, label) {
  return `<div class="section-top"><div class="section-title"><h2>${title}</h2></div><a class="text-link" href="#${link}">${label}${icon("chevron", 15)}</a></div>`;
}
function discoverItems() {
  const query = filters.q.trim().toLowerCase();
  return published().filter(
    (l) =>
      (!filters.drift || l.drift === filters.drift) &&
      (filters.theme === "全部来信" || l.theme === filters.theme) &&
      (!filters.region || (l.regionGroup || l.region) === filters.region) &&
      (!query ||
        [l.title, l.body, l.author].some((v) =>
          v.toLowerCase().includes(query),
        )),
  );
}
function updateDiscovery() {
  const target = main.querySelector("#discovery-results");
  if (target) season.results(target, discoverItems(), card, empty);
}
function discover() {
  const regions = [
    ...new Set(
      published()
        .map((l) => l.regionGroup || l.region)
        .filter((v) => v && v !== "未公开"),
    ),
  ];
  return `<div class="page-head"><div><h1>拾一封海上来信</h1><p>挑选感兴趣的主题，或让海流替你选一封。</p></div><div class="row-actions pickup-actions"><button type="button" data-action="random-filtered" class="btn solid">${icon("shuffle", 17)}随机拾信</button><button type="button" class="btn pickup-postome" data-action="random-postome">${icon("mail", 17)}时光邮局随机来信</button></div></div><div class="filter-bar"><label class="searchbox">${icon("search", 17)}<input id="search" type="search" placeholder="搜索标题、作者或信中内容" aria-label="搜索来信" value="${esc(filters.q)}"></label><select id="region-filter" aria-label="筛选地域"><option value="">全部地域</option>${regions.map((v) => `<option ${v === filters.region ? "selected" : ""}>${esc(v)}</option>`).join("")}</select><select id="drift-filter" aria-label="漂流方式"><option value="">全部漂流方式</option><option value="free" ${filters.drift === "free" ? "selected" : ""}>自由漂流</option><option value="theme" ${filters.drift === "theme" ? "selected" : ""}>主题漂流</option></select></div>${chips(filters.theme, "discover-theme", ["全部来信", ...new Set([...themes, ...state.letters.map((l) => l.theme)])])}<div id="discovery-results"></div>`;
}
function read(id) {
  const l = getLetter(id);
  if (!l) return empty("这封信暂时无法阅读。", "discover", "返回拾信");
  const pub = l.status === "published",
    parent = getLetter(l.parentId);
  const saved = state.favorites.includes(id);
  if (l.status === "withdrawn" && l.authorId !== state.me.id)
    return empty(
      "作者已撤回这封信，其余公开回应仍保留在故事树中。",
      "tree/" + urlId(id),
      "查看故事树",
    );
  return `<a class="back" href="#discover">${icon("back", 15)}返回拾信</a><div class="read-layout"><article class="sheet paper-${season.paperKey(l.paper)}">${season.stamp(l.stamp)}<span class="theme-label">${esc(l.theme)}</span><h1 class="read-title">${esc(l.title)}</h1><div class="byline">${avatar(l.author, l.art)}<strong>${esc(l.author)}</strong>${l.region ? `<span>${icon("pin", 14)} ${esc(l.region)}</span>` : ""}<time>${esc((l.created || "").slice(0, 10))}</time>${l.demo ? "<span>示例书信</span>" : ""}</div><img class="read-cover" src="${stationery.coverUrl(l)}" alt="">${season.quoteBlock(l)}<div class="prose original-text">${season.sourceBody(l)}</div>${media(l)}${pub ? window.cultureTools.related(l) : ""}${parent ? `<a class="text-link" href="#read/${urlId(parent.id)}">这封信回应了《${esc(parent.title)}》</a>` : ""}</article><aside class="panel read-aside"><h2>${pub ? "回应这封信" : "寄送状态"}</h2>${pub ? `${l.authorId !== state.me.id ? `<button class="btn" data-action="reply" data-id="${esc(id)}">${icon("mail", 17)}私密回信</button><p>${l.demo ? "这是示例作者的信箱，可体验寄信。" : "只有你和这封信的作者可见。"}</p>` : ""}${l.open ? `<button class="btn solid" data-quote-relay="${esc(id)}">${icon("branch", 17)}公开接力</button><p>可选中原文引用，也可在接力页选择要回应的句子。</p>` : "<p>作者已关闭这封信的公开接力。</p>"}<a class="text-link" href="#tree/${urlId(id)}">查看海洋故事树 ${icon("chevron", 15)}</a><div class="minor"><button class="plain" data-action="favorite" data-id="${esc(id)}">${icon("bookmark", 16)} ${saved ? "已收藏" : "收藏"}</button><button class="plain" data-action="report" data-id="${esc(id)}">举报</button></div>` : `<p>${esc(statusName(l.status))}</p><a href="#mine" class="text-link">查看我的书信</a>`}</aside></div>`;
}
function statusName(s) {
  return (
    {
      published: "已公开",
      pending: "等待审核",
      withdrawn: "已撤回",
      rejected: "未通过审核",
      removed: "已撤下",
    }[s] ||
    s ||
    ""
  );
}
function draftKey(parent) {
  return "letters-draft-" + state.me.id + "-" + (parent || "root");
}
function draft(parent) {
  try {
    const saved = JSON.parse(localStorage.getItem(draftKey(parent)) || "{}");
    return saved && typeof saved === "object" && !Array.isArray(saved)
      ? saved
      : {};
  } catch {
    return {};
  }
}
function compose(parentId) {
  const parent =
    parentId && published().find((letter) => letter.id === parentId);
  if (parentId && (!parent || !parent.open))
    return empty("这条故事支线目前无法接力。", "discover", "返回拾信");
  const saved = draft(parentId);
  const requestedCover = saved.art || parent?.art;
  const cover = Object.hasOwn(artNames, requestedCover)
    ? requestedCover
    : "wave";
  const themeOptions = [
    ...new Set([...themes, ...(parent ? [parent.theme] : [])]),
  ]
    .map(
      (theme) =>
        `<option ${(saved.theme || parent?.theme) === theme ? "selected" : ""}>${esc(theme)}</option>`,
    )
    .join("");
  const regionOptions = (state.regions || [])
    .map((region) => `<option value="${esc(region)}"></option>`)
    .join("");
  const description = parent
    ? `正在回应《${esc(parent.title)}》，发表后将连接到这封信。`
    : "把想说的话写下来，寄给海的另一边。";

  return `<div class="page-head"><div><h1>${parent ? "让故事继续漂流" : "写一封信"}</h1><p>${description}</p></div></div>
    <form id="compose" class="compose-layout" data-parent="${esc(parentId)}">
      <section class="panel form-grid">
        <label class="field">信件标题<input name="title" value="${esc(saved.title || "")}" required maxlength="100" placeholder="给这封信起个名字"></label>
        <div class="form-pair">
          <label class="field">主题<select name="theme">${themeOptions}</select></label>
          <label class="field">公开地域（选填）<input name="region" maxlength="30" placeholder="例如：福建、台湾、新加坡" value="${esc(saved.region ?? state.me.region ?? "")}" list="region-suggestions"><datalist id="region-suggestions">${regionOptions}</datalist></label>
        </div>
        ${window.cultureTools.tagsEditor(saved.tags || [])}
        ${composeAI.editor(saved.body || "", state.writeAI)}
      </section>
      <section class="panel editor-tools compose-stationery">
        <h2>信笺封面</h2>
        <div class="compose-stationery-grid">
          <div>${stationery.editor(saved, cover, artNames)}</div>
          <div>${season.paperTools(saved)}</div>
        </div>
      </section>
      <section class="panel form-grid compose-delivery">
        <h2>附件与寄送</h2>
        ${season.quoteInput(parent, saved)}
        <label class="field">附图或声音（选填）<input type="file" id="upload" accept="image/jpeg,image/png,image/webp,image/gif,audio/mpeg,audio/wav,audio/x-wav,audio/ogg,audio/webm,audio/mp4" aria-describedby="compose-upload-help"></label>
        <p class="subtle compose-upload-help" id="compose-upload-help">可附一张图片或一段音频，最大 4 MB。</p>
        <label class="field">漂流方式<select name="drift"><option value="free">自由漂流</option><option value="theme" ${saved.drift === "theme" ? "selected" : ""}>主题漂流</option></select></label>
        <label class="check"><input type="checkbox" name="open" ${saved.open === false ? "" : "checked"}>允许其他人公开接力</label>
        <label class="check"><input type="checkbox" name="exhibit" ${saved.exhibit ? "checked" : ""}>同意在数字展厅展示这封信和附件，并保留署名</label>
        <p class="subtle compose-byline">信件审核通过后公开展示。署名为「${esc(state.me.name)}」。</p>
        <p class="error" role="alert"></p>
        <div class="row-actions">
          <button type="button" class="btn" data-action="draft">保存草稿</button>
          <button type="submit" class="btn solid">${icon("send", 17)}装瓶寄出</button>
        </div>
      </section>
    </form>`;
}

function mine() {
  const me = state.me,
    isGuest = me.guest,
    tab = myTab;
  let content = "";
  if (tab === "我的共创") content = season.personal();
  if (tab === "我的草稿") content = season.drafts();
  if (tab === "我的书信")
    content =
      state.mine
        .map(
          (l) =>
            `<div class="list-item"><div><span class="status">${esc(statusName(l.status))}</span><h3><a href="#read/${urlId(l.id)}">${esc(l.title)}</a></h3><small>${esc(l.theme)} · ${esc(l.created.slice(0, 10))}</small></div>${["pending", "published"].includes(l.status) ? `<div class="row-actions"><button class="btn compact" data-action="permissions" data-id="${esc(l.id)}">展示与接力</button><button class="plain" data-action="withdraw" data-id="${esc(l.id)}">撤回</button></div>` : ""}</div>`,
        )
        .join("") || empty("你还没有寄出书信。", "write", "写第一封信");
  if (tab === "私人信箱")
    content =
      state.inbox
        .map((m) => {
          const outgoing = m.fromId === me.id;
          return `<div class="list-item"><div><small>${outgoing ? "寄给 " + esc(m.toName) : "来自 " + esc(m.fromName)} · ${esc(m.created.slice(0, 10))}</small><h3>${esc(m.title || "私人来信")}</h3><div style="white-space:pre-wrap;overflow-wrap:anywhere">${esc(m.body)}</div></div><button data-action="reply" data-id="${esc(m.letterId)}" data-message="${esc(m.id)}" class="btn compact">继续通信</button></div>`;
        })
        .join("") || empty("你的私人往来信件会出现在这里。");
  if (tab === "我的收藏")
    content = `<div class="card-grid">${
      state.letters
        .filter((l) => state.favorites.includes(l.id))
        .map(card)
        .join("") ||
      empty("打开一封喜欢的信，点击书签即可收藏。", "discover", "去拾信")
    }</div>`;
  return `<div class="page-head"><h1>我的海</h1></div><div class="panel account-band">${avatar(me.name)}<div><strong>${esc(me.name)}</strong><p class="subtle">${isGuest ? "当前为此浏览器的访客身份" : "已登录"}${me.region ? " · " + esc(me.region) : ""}</p></div><div class="row-actions">${isGuest ? '<button class="btn compact solid" data-action="register">保存为账号</button><button class="btn compact" data-action="login">登录</button>' : '<button class="btn compact" data-action="logout">退出登录</button>'}</div></div>${chips(myTab, "my-tab", ["我的书信", "私人信箱", "我的共创", "我的草稿", "我的收藏"])}<div class="list">${content}</div>`;
}
const nav = [
  ["home", "书信地球", "globe"],
  ["sounds", "乡音展馆", "waves"],
  ["workshop", "海上手账", "pen"],
  ["atlas", "文化地图", "compass"],
  ["knowledge", "知识图谱", "branch"],
  ["discover", "拾信广场", "bottle"],
];

function setupNavigation() {
  const toggle = document.querySelector("#navigation-toggle");
  const dock = document.querySelector("#navigation-dock");
  const drawer = document.querySelector("#mobile-navigation");
  const close = drawer.querySelector(".navigation-close");
  const compact = matchMedia("(max-width: 1040px)");

  primaryNavigation.innerHTML = nav
    .map(
      ([code, name, glyph]) =>
        `<a class="nav-link" href="#${code}"><span class="nav-glyph">${icon(glyph, 19)}</span>${name}</a>`,
    )
    .join("");
  toggle.innerHTML = icon("menu", 22);
  close.innerHTML = icon("close", 21);

  function focusLink() {
    (
      primaryNavigation.querySelector('a[aria-current="page"]') ||
      primaryNavigation.querySelector("a")
    ).focus();
  }
  function placeNavigation() {
    const wasOpen = drawer.open;
    const hadFocus = primaryNavigation.contains(document.activeElement);
    const destination = compact.matches ? drawer : dock;
    if (!compact.matches && wasOpen) drawer.close();
    if (primaryNavigation.parentElement !== destination) {
      destination.append(primaryNavigation);
    }
    if (compact.matches && hadFocus && !drawer.open) toggle.focus();
    if (!compact.matches && wasOpen) focusLink();
  }

  toggle.addEventListener("click", () => {
    drawer.showModal();
    toggle.setAttribute("aria-expanded", "true");
    focusLink();
  });
  close.addEventListener("click", () => drawer.close());
  drawer.addEventListener("close", () => {
    toggle.setAttribute("aria-expanded", "false");
  });
  drawer.addEventListener("click", (event) => {
    if (event.target.closest(".nav-link")) {
      drawer.close();
    } else if (event.target === drawer) {
      const bounds = drawer.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right)
        drawer.close();
    }
  });
  window.addEventListener("hashchange", () => {
    if (drawer.open) drawer.close();
  });
  compact.addEventListener("change", placeNavigation);
  placeNavigation();
}
const names = {
  home: "书信地球",
  sounds: "乡音展馆",
  knowledge: "文化知识图谱",
  atlas: "文化地图",
  workshop: "海上手账",
  admin: "内容审核",
  discover: "拾信广场",
  tree: "海洋故事树",
  timeline: "故事时间线",
  gallery: "数字展厅",
  network: "文化交流网络",
  mine: "我的海",
  read: "阅读来信",
  relay: "公开接力",
  write: "写一封信",
};
let currentRoute = "",
  ready = false;
function render() {
  if (!ready) return;
  let [key, id] = getRoute();
  if (key === "festival" || (key === "workshop" && /^(legacy|m\d+)$/.test(id))) {
    history.replaceState(null, "", "#workshop");
    [key, id] = ["workshop", ""];
  }
  const route = key + "/" + id;
  window.letterPlanet?.unmount();
  window.knowledgeGraph?.unmount(key === "knowledge");
  document.body.classList.toggle("planet-home", key === "home");
  document.body.dataset.route = key;
  const changed = currentRoute !== route;
  const withinNotebook = key === "workshop" && seaNotebooks.canTurn(main, id);
  const withinExplorer = withinNotebook ||
    (key === "atlas" || key === "knowledge") && currentRoute.startsWith(key + "/");
  currentRoute = route;
  const group =
    {
      read: "discover",
      timeline: "tree",
      relay: "tree",
      network: "atlas",
    }[key] || key;
  for (const link of primaryNavigation.children) {
    if (link.hash === "#" + group) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  }
  document.title = (names[key] || "页面") + " · 海上有信";
  const views = {
    home: () => letterPlanet.view(),
    sounds: () => soundMuseum.view(id),
    knowledge: () => knowledgeGraph.view(id),
    discover,
    mine,
    workshop: () => seaNotebooks.screen(),
    admin: () => reviewDesk.page(),
    read: () => read(id),
    write: () => compose(""),
    relay: () => compose(id),
  };
  if (key === "atlas") {
    cultureViews.atlas(main, id);
  } else if (!withinNotebook) {
    main.innerHTML = views[key]
      ? views[key]()
      : window.storyViews?.[key]
        ? window.storyViews[key](id)
        : empty("找不到这个页面。", "home", "回到首页");
  }
  if (key === "workshop") window.seaNotebooks?.mount(main, id);
  if (key === "discover") updateDiscovery();
  const editor = main.querySelector("#compose");
  if (editor) {
    stationery.restore(editor);
    composeAI.mount(editor);
  }
  if (key === "home") letterPlanet.mount();
  if (key === "sounds") window.soundMuseum.mount?.(id);
  if (key === "knowledge") window.knowledgeGraph.mount?.(id);
  if (key === "read") season.scrollQuote(id);
  if (key === "admin") reviewDesk.load();
  if (changed) {
    if (!withinExplorer) window.scrollTo({ top: 0, behavior: "instant" });
    if (dialog.open) dialog.close();
    window.dispatchEvent(new Event("sea:route-ready"));
  }
}
function sailing(message, incoming = false) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches)
    return Promise.resolve();
  const overlay = document.createElement("div");
  overlay.className = "sailing" + (incoming ? " incoming" : "");
  overlay.setAttribute("role", "status");
  overlay.innerHTML =
    '<div class="sailing-card"><div class="bottle-scene"><span class="bottle-paper"></span><span class="glass-bottle"></span><i></i></div><strong>' +
    esc(message) +
    "</strong></div>";
  document.body.append(overlay);
  return new Promise((resolve) =>
    setTimeout(() => {
      overlay.remove();
      resolve();
    }, 820),
  );
}
async function randomPick(list) {
  if (!list.length) {
    notify("没有可拾取的来信");
    return;
  }
  const pool = list.length > 1 ? list.filter((l) => l.id !== lastBottle) : list;
  const l = pool[Math.floor(Math.random() * pool.length)];
  lastBottle = l.id;
  await sailing("拾起一封海上来信", true);
  go("read/" + urlId(l.id));
}
async function randomPostome() {
  modal("时光邮局随机来信", '<div class="postome-letter" data-postome-result aria-live="polite" aria-busy="true"><p>正在拾取公开信并整理摘要…</p></div>');
  const result = dialog.querySelector("[data-postome-result]");
  const route = location.hash;
  const actions = '<div class="row-actions"><button type="button" class="btn compact" data-action="random-postome">再拾一封</button></div>';
  try {
    const letter = await request("postome/random", {});
    if (result.isConnected && dialog.open && location.hash === route) {
      result.innerHTML = `<p class="postome-source">来源：PostoMe 时光邮局 · AI 摘要${letter.date ? " · " + esc(letter.date) : ""}</p><h3>${esc(letter.title)}</h3><p>${esc(letter.summary)}</p>${actions}`;
    }
  } catch (error) {
    if (result.isConnected && dialog.open && location.hash === route)
      result.innerHTML = `<p>${esc(error.status ? error.message : "暂时无法取得来信，请稍后再试。")}</p>${actions}`;
  } finally {
    result.removeAttribute("aria-busy");
  }
}

function authForm(register) {
  modal(
    register ? "保存为账号" : "登录我的海",
    `<form class="form-grid" data-form="${register ? "account" : "login"}">${register ? '<p class="subtle">设置昵称和密码，即可在其他浏览器找回当前的信件与收藏。</p>' : ""}<label class="field">昵称<input name="name" required minlength="2" maxlength="24" autocomplete="username"></label><label class="field">密码<input name="password" required minlength="${register ? 8 : 1}" maxlength="128" type="password" autocomplete="${register ? "new-password" : "current-password"}" placeholder="${register ? "至少 8 位" : ""}"></label>${register ? '<label class="field">公开地域（选填）<input name="region" maxlength="30"></label>' : ""}<p class="error" role="alert"></p><button class="btn solid">${register ? "创建账号" : "登录"}</button></form>`,
  );
}
async function saveDraft(form) {
  const data = values(form);
  delete data.file;
  data.tags = window.cultureTools.readTags(form);
  data.exhibit = form.elements.exhibit.checked;
  data.open = form.elements.open.checked;
  await stationery.saveDraft(draftKey(form.dataset.parent), data);
}
function dialogForm(title, type, inner, id = "", message = "") {
  modal(
    title,
    `<form class="form-grid" data-form="${type}" data-id="${esc(id)}" data-message="${esc(message)}">${inner}<p class="error" role="alert"></p></form>`,
  );
}
async function action(btn) {
  const kind = btn.dataset.action,
    id = btn.dataset.id,
    val = btn.dataset.value;
  if (kind === "discover-theme") {
    season.resetPickup();
    filters.theme = val;
    render();
    return;
  }
  if (kind === "my-tab") {
    myTab = val;
    render();
    return;
  }
  if (kind === "random" || kind === "random-filtered") {
    await randomPick(kind === "random" ? published() : discoverItems());
    return;
  }
  if (kind === "random-postome") {
    await randomPostome();
    return;
  }
  if (kind === "dismiss") {
    dialog.close();
    return;
  }
  if (kind === "register" || kind === "login") {
    if (
      kind === "login" &&
      state.me.guest &&
      Object.keys(localStorage).some((k) =>
        k.startsWith("letters-draft-" + state.me.id + "-"),
      )
    ) {
      notify("此访客身份有草稿，请先保存为账号。");
      return;
    }
    authForm(kind === "register");
    return;
  }
  if (kind === "permissions") {
    const l = state.mine.find((v) => v.id === id);
    if (!l) return;
    dialogForm(
      "展示与接力设置",
      "permissions",
      `<label class="check"><input type="checkbox" name="open" ${l.open ? "checked" : ""}>允许其他人公开接力</label><label class="check"><input type="checkbox" name="exhibit" ${l.exhibit ? "checked" : ""}>授权将信件与附件展出，保留署名</label><button class="btn solid">保存设置</button>`,
      id,
    );
    return;
  }
  if (kind === "logout") {
    dialogForm(
      "退出当前账号",
      "logout",
      '<p>退出后将使用新的访客身份，原有书信可以重新登录查看。</p><button class="btn solid">退出登录</button>',
    );
    return;
  }
  if (kind === "favorite") {
    await request("favorites", { letterId: id });
    await reload();
    render();
    notify(state.favorites.includes(id) ? "已收藏到我的海" : "已取消收藏");
    return;
  }
  if (kind === "art") {
    const form = btn.closest("form");
    stationery.pick(form, val, artNames[val]);
    return;
  }
  if (kind === "draft") {
    await stationery.ready(btn.form);
    await saveDraft(btn.form);
    notify("草稿已保存到此浏览器，附件需重新选择");
    return;
  }
  if (kind === "reply") {
    dialogForm(
      "写一封私密回信",
      "replies",
      `<p class="subtle">${esc(getLetter(id)?.title || "私人书信往来")} · 仅通信双方可见</p><label class="field">回信内容<textarea name="body" required maxlength="2000" placeholder="我也想起了……"></textarea></label><button class="btn solid">${icon("mail", 17)}寄出回信</button>`,
      id,
      btn.dataset.message || "",
    );
    return;
  }
  if (kind === "report") {
    dialogForm(
      "举报这封信",
      "report",
      '<label class="field">举报原因<textarea name="reason" required maxlength="400" placeholder="请说明需要核查的内容"></textarea></label><button class="btn solid">提交举报</button>',
      id,
    );
    return;
  }
  if (kind === "withdraw") {
    dialogForm(
      "撤回信件",
      "withdraw",
      '<p>撤回后，这封信的正文、附件及展览内容将停止公开展示。</p><button class="btn solid">确认撤回</button>',
      id,
    );
    return;
  }
}
document.addEventListener("click", async (e) => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;
  const owns = [
    "discover-theme",
    "my-tab",
    "random",
    "random-filtered",
    "random-postome",
    "dismiss",
    "register",
    "login",
    "logout",
    "favorite",
    "art",
    "draft",
    "reply",
    "report",
    "withdraw",
    "permissions",
  ];
  if (!owns.includes(btn.dataset.action)) return;
  btn.disabled = true;
  try {
    await action(btn);
  } catch (err) {
    notify(err.message);
  } finally {
    btn.disabled = false;
  }
});
document.addEventListener("input", (e) => {
  if (e.target.id === "search") {
    season.resetPickup();
    filters.q = e.target.value;
    updateDiscovery();
  }
});
document.addEventListener("change", (e) => {
  if (["region-filter", "drift-filter"].includes(e.target.id)) {
    season.resetPickup();
    filters[e.target.id === "region-filter" ? "region" : "drift"] =
      e.target.value;
    updateDiscovery();
  }
});
async function asMedia(file) {
  if (!file) return null;
  if (file.size > 4 * 1024 * 1024)
    throw Error("附件超过 4 MB，请选择较小的文件。");
  const allowed = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "audio/mpeg",
    "audio/ogg",
    "audio/wav",
    "audio/x-wav",
    "image/gif",
    "audio/webm",
    "audio/mp4",
  ];
  if (!allowed.includes(file.type))
    throw Error(
      "请选择图片（JPG、PNG、GIF、WebP）或音频（MP3、WAV、OGG、WebM、M4A）。",
    );
  return {
    type: file.type.startsWith("image") ? "image" : "audio",
    url: await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(Error("附件读取失败。"));
      reader.readAsDataURL(file);
    }),
  };
}
document.addEventListener("submit", async (e) => {
  const f = e.target;
  if (f.id !== "compose" && !f.dataset.form) return;
  e.preventDefault();
  const b = f.querySelector('button[type="submit"],button.solid');
  if (b.disabled) return;
  b.disabled = true;
  const error = f.querySelector(".error");
  error.textContent = "";
  try {
    if (f.id === "compose") {
      await stationery.ready(f);
      const data = values(f);
      data.cover = data.coverData ? { url: data.coverData } : null;
      delete data.coverData;
      data.parentId = f.dataset.parent || null;
      data.quote =
        data.parentId && data.quoteText
          ? { text: data.quoteText, sourceId: data.parentId }
          : null;
      delete data.quoteText;
      data.tags = window.cultureTools.readTags(f);
      data.open = f.elements.open.checked;
      data.exhibit = f.elements.exhibit.checked;
      data.media = await asMedia(document.querySelector("#upload").files[0]);
      await request("letters", data);
      season.clearQuote(f.dataset.parent);
      await sailing("信已装瓶，准备漂流");
      try {
        stationery.forgetDraft(draftKey(f.dataset.parent));
      } catch {}
      await reload();
      myTab = "我的书信";
      go("mine");
      notify("信件已寄出，正在等待审核");
      return;
    }
    const type = f.dataset.form,
      data = values(f);
    if (type === "permissions") {
      data.open = f.elements.open.checked;
      data.exhibit = f.elements.exhibit.checked;
    }
    if (f.dataset.id) data.letterId = f.dataset.id;
    if (f.dataset.message) data.replyTo = f.dataset.message;
    await request(type, data);
    dialog.close();
    await reload();
    render();
    notify(
      {
        account: "账号已创建",
        login: "登录成功",
        logout: "已退出登录",
        replies: "私密回信已寄出",
        report: "举报已提交",
        withdraw: "信件已撤回",
        permissions: "已更新展示与接力设置",
      }[type] || "已保存",
    );
  } catch (err) {
    error.textContent = err.message;
  } finally {
    b.disabled = false;
  }
});
dialog.addEventListener("click", (e) => {
  if (e.target === dialog) {
    const r = dialog.getBoundingClientRect();
    if (
      e.clientX < r.left ||
      e.clientX > r.right ||
      e.clientY < r.top ||
      e.clientY > r.bottom
    )
      dialog.close();
  }
});
window.app = {
  state,
  esc,
  icon,
  art,
  go,
  render,
  media,
  notify,
  request,
  reload,
  modal,
  updateDiscovery,
};
async function navigate() {
  if (!ready) return;
  const target = location.hash;
  try {
    await reload();
    if (target === location.hash) render();
  } catch {
    if (target !== location.hash) return;
    main.innerHTML =
      '<div class="empty">暂时无法读取这个页面。<br><button id="retry-navigation" class="btn">重新连接</button></div>';
    document.querySelector("#retry-navigation").onclick = navigate;
  }
}
window.addEventListener("hashchange", navigate);
async function start() {
  document.querySelector("#header-write").innerHTML = icon("pen", 16) + "写信";
  document.querySelector("#account-link").innerHTML = icon("user", 19);
  try {
    await reload();
    ready = true;
    render();
  } catch {
    main.innerHTML =
      '<div class="empty">暂时无法连接书信服务。<br><button class="btn" id="retry">重新连接</button></div>';
    document.querySelector("#retry").onclick = start;
  }
}
document.querySelector(".skip").addEventListener("click", (e) => {
  e.preventDefault();
  main.focus();
});
async function refreshWhenReturning() {
  if (!ready || document.visibilityState !== "visible" || dialog.open) return;
  const [route] = getRoute();
  if (["write", "relay", "workshop", "admin"].includes(route)) return;
  const before = JSON.stringify(state);
  try {
    await reload();
    if (before !== JSON.stringify(state) && route === getRoute()[0]) render();
  } catch {}
}
document.addEventListener("visibilitychange", refreshWhenReturning);
window.addEventListener("DOMContentLoaded", () => {
  setupNavigation();
  start();
});
