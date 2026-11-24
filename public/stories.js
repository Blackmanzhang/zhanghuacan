(() => {
  "use strict";

  const state = {
    galleryTheme: "",
    networkTheme: "",
    region: "",
    switchFocus: null,
    zoom: 1,
    treePosition: null,
  };
  const exhibitView = { groupId: null, kind: "poster" };
  const api = () => window.app;
  const esc = (value) => api().esc(String(value ?? ""));
  const route = (page, id) =>
    "#" + page + (id == null ? "" : "/" + encodeURIComponent(id));
  const button = (page, id, title, solid = false) =>
    '<a class="sv-button' +
    (solid ? " sv-solid" : "") +
    '" href="' +
    esc(route(page, id)) +
    '">' +
    esc(title) +
    "</a>";
  const unique = (items) => [...new Set(items.filter(Boolean))];
  const initial = (value) => Array.from(value || "匿")[0];
  const published = (letter) => letter?.status === "published";
  const excerpt = (text, size) => {
    const chars = Array.from(
      String(text || "")
        .trim()
        .replace(/\s+/g, " "),
    );
    return chars.slice(0, size).join("") + (chars.length > size ? "…" : "");
  };
  const labelDate = (value) => {
    if (!value) return "";
    const date = new Date(value);
    return Number.isNaN(date.valueOf())
      ? ""
      : new Intl.DateTimeFormat("zh-CN", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }).format(date);
  };

  // Every public view is derived from the same approved letters and direct-parent edges.
  function collection() {
    const letters = api().state.letters || [];
    const byId = new Map(letters.map((l) => [String(l.id), l]));
    const children = new Map();
    const roots = [];
    for (const l of letters) {
      if (l.parentId == null || !byId.has(String(l.parentId))) roots.push(l);
      else {
        const parent = String(l.parentId);
        if (!children.has(parent)) children.set(parent, []);
        children.get(parent).push(l);
      }
    }
    for (const siblings of children.values())
      siblings.sort(
        (a, b) =>
          String(a.created || "").localeCompare(String(b.created || "")) ||
          String(a.id).localeCompare(String(b.id)),
      );
    return { letters, byId, children, roots };
  }

  function pathTo(db, letter) {
    const list = [];
    const seen = new Set();
    for (
      let l = letter;
      l && !seen.has(l.id);
      l = db.byId.get(String(l.parentId))
    ) {
      list.push(l);
      seen.add(l.id);
    }
    return list.reverse();
  }

  function subtree(db, root) {
    const list = [];
    const pending = [root];
    const seen = new Set();
    while (pending.length) {
      const l = pending.pop();
      if (!l || seen.has(l.id)) continue;
      list.push(l);
      seen.add(l.id);
      pending.push(...(db.children.get(String(l.id)) || []).slice().reverse());
    }
    return list;
  }
  const empty = (message, page = "write", action = "写一封信") =>
    '<div class="sv-empty"><p>' +
    esc(message) +
    "</p>" +
    button(page, null, action) +
    "</div>";
  const header = (title, description, action = "") =>
    '<header class="sv-header"><div><h1>' +
    esc(title) +
    "</h1><p>" +
    esc(description) +
    "</p></div>" +
    action +
    "</header>";
  const layout = (title, description, body, action) =>
    '<section class="sv">' +
    header(title, description, action) +
    body +
    "</section>";
  const options = (list, selected) =>
    list
      .map(
        ([value, label]) =>
          '<option value="' +
          esc(value) +
          '"' +
          (String(value) === String(selected) ? " selected" : "") +
          ">" +
          esc(label) +
          "</option>",
      )
      .join("");
  const select = (name, label, list, selected) =>
    '<label class="sv-select">' +
    esc(label) +
    '<select data-sv-control="' +
    name +
    '">' +
    options(list, selected) +
    "</select></label>";
  const byline = (l) =>
    '<div class="sv-byline"><span class="sv-avatar" aria-hidden="true">' +
    esc(initial(l.author)) +
    "</span><span>" +
    esc(l.author || "匿名来信") +
    "</span>" +
    (l.region ? '<span class="sv-muted">· ' + esc(l.region) + "</span>" : "") +
    "</div>";
  const missing = (title) =>
    layout(
      title,
      "这封信当前无法查看。",
      empty("你可以回到故事树，选择另一封公开来信。", "tree", "浏览故事树"),
    );

  const bottle = (x, y, selected) =>
    '<g transform="translate(' +
    x +
    " " +
    y +
    ') rotate(21)">' +
    '<rect x="-7" y="-18" width="14" height="5" rx="2" fill="' +
    (selected ? "#f0c999" : "#c29467") +
    '"/>' +
    '<path d="M-5-13H5V-5Q12-2 12 5V17Q12 21 8 21H-8Q-12 21-12 17V5Q-12-2-5-5Z" fill="' +
    (selected ? "#f0f4df" : "#d9ebdb") +
    '" stroke="#326755" stroke-width="1.7"/>' +
    '<path d="M-8 9Q0 5 9 8V16Q9 18 7 18H-7Q-9 18-9 16Z" fill="#78a893"/>' +
    '<rect x="-4" y="1" width="8" height="14" rx="2" transform="rotate(-12)" fill="#f5dfad" stroke="#a78355" stroke-width=".8"/></g>';

  // Midpoints of adjacent child lanes place each bottle above its own branch.
  function drawTree(db, root, chosen) {
    const all = subtree(db, root);
    const positions = new Map();
    let lane = 0;
    let maxDepth = 0;
    for (const l of all) {
      const depth = (positions.get(String(l.parentId))?.depth ?? -1) + 1;
      positions.set(String(l.id), { depth, x: 90 + depth * 175 });
      maxDepth = Math.max(maxDepth, depth);
    }
    // Assign leaf lanes in reading order, then work inward toward parents.
    for (const l of all)
      if (!db.children.has(String(l.id)))
        positions.get(String(l.id)).y = 72 + lane++ * 106;
    for (const l of all.slice().reverse()) {
      const child = db.children.get(String(l.id));
      if (child?.length)
        positions.get(String(l.id)).y =
          (positions.get(String(child[0].id)).y +
            positions.get(String(child.at(-1).id)).y) /
          2;
    }
    const width = Math.max(400, 180 + maxDepth * 175);
    const height = Math.max(275, lane * 106 + 48);
    const offsetY = Math.max(0, (height - (lane * 106 + 48)) / 2);
    const offsetX = (width - (180 + maxDepth * 175)) / 2;
    const currentPath = new Set(pathTo(db, chosen).map((l) => String(l.id)));
    let edges = "",
      pins = "";
    for (const l of all) {
      const p = positions.get(String(l.id));
      const parent = positions.get(String(l.parentId));
      const active = String(l.id) === String(chosen.id);
      if (parent)
        edges +=
          '<path d="M' +
          parent.x +
          " " +
          parent.y +
          " C" +
          (parent.x + 78) +
          " " +
          parent.y +
          " " +
          (p.x - 78) +
          " " +
          p.y +
          " " +
          p.x +
          " " +
          p.y +
          '" class="' +
          (currentPath.has(String(l.id)) ? "sv-current-edge" : "sv-edge") +
          '"/>';
      pins +=
        '<a href="' +
        esc(route("tree", l.id)) +
        '" aria-label="' +
        esc("选择故事：" + l.title) +
        '"' +
        (active ? ' aria-current="true"' : "") +
        ' data-sv-pin="' +
        esc(l.id) +
        '"><title>' +
        esc(l.title) +
        "</title>" +
        '<circle cx="' +
        p.x +
        '" cy="' +
        p.y +
        '" r="' +
        (active ? 26 : 21) +
        '" class="' +
        (active ? "sv-current-pin" : "sv-pin") +
        '"/>' +
        bottle(p.x, p.y, active) +
        '<text x="' +
        p.x +
        '" y="' +
        (p.y + 42) +
        '" class="sv-node-label">' +
        esc(excerpt(l.title, 10)) +
        "</text></a>";
    }
    return (
      '<div class="sv-sea-scroll" aria-label="故事树画布，较大的树可横向滚动"><svg class="sv-sea" role="group" aria-label="漂流瓶故事关系图" viewBox="0 0 ' +
      width +
      " " +
      height +
      '" width="' +
      width +
      '" height="' +
      height +
      '" style="min-width:' +
      width * state.zoom +
      "px;height:" +
      height * state.zoom +
      'px">' +
      '<g transform="translate(' +
      offsetX +
      " " +
      offsetY +
      ')">' +
      edges +
      pins +
      "</g></svg></div>"
    );
  }

  function tree(id) {
    const db = collection();
    const selected = id ? db.byId.get(String(id)) : db.roots[0];
    if (!selected && id) return missing("回响故事树");
    if (!selected)
      return layout(
        "回响故事树",
        "沿着漂流瓶之间的海流，寻找一封信的来处与回响。",
        empty("还没有公开故事，寄出第一封来信吧。"),
      );
    const root = pathTo(db, selected)[0];
    const all = subtree(db, root);
    const children = db.children.get(String(selected.id)) || [];
    const selectStory = select(
      "root",
      "切换故事",
      db.roots.map((l) => [l.id, l.title]),
      root.id,
    );
    return layout(
      "回响故事树",
      "选择一只漂流瓶，看看一封来信怎样被不同的人接续。",
      '<div class="sv-tree-layout">' +
        '<section class="sv-map"><div class="sv-map-top"><div><span class="sv-tag">' +
        esc(root.theme) +
        "</span><h2>" +
        esc(root.title) +
        '</h2></div><span class="sv-muted">' +
        all.filter(published).length +
        " 封来信</span></div>" +
        drawTree(db, root, selected) +
        '<div class="sv-map-key"><i></i>当前路径<span></span>公开接力<div class="sv-zoom">' +
        '<button data-sv-zoom="-1" aria-label="缩小故事树"' +
        (state.zoom <= 0.75 ? " disabled" : "") +
        ">−</button>" +
        '<button data-sv-zoom="1" aria-label="放大故事树"' +
        (state.zoom >= 2 ? " disabled" : "") +
        ">＋</button></div></div></section>" +
        '<aside class="sv-inspector"><span class="sv-tag sv-clay">' +
        (selected.id === root.id ? "原始来信" : "接力来信") +
        "</span><h2>" +
        esc(selected.title) +
        "</h2>" +
        byline(selected) +
        "<p>" +
        esc(excerpt(selected.body, 110)) +
        '</p><div class="sv-meta">' +
        labelDate(selected.created) +
        " · " +
        children.length +
        " 封后续来信</div>" +
        '<div class="sv-actions">' +
        (published(selected)
          ? button("read", selected.id, "打开这封信", true)
          : "") +
        button("timeline", selected.id, "沿支线阅读") +
        "</div>" +
        (selected.open && published(selected)
          ? '<a class="sv-link" href="' +
            esc(route("relay", selected.id)) +
            '">从这里公开接力</a>'
          : '<span class="sv-meta">已关闭接力</span>') +
        "</aside></div>",
      selectStory,
    );
  }

  function timeline(id) {
    const db = collection();
    const focused = id ? db.byId.get(String(id)) : db.roots[0];
    if (!focused) return missing("故事支线");
    const path = pathTo(db, focused);
    const root = path[0];
    const visited = new Set(path.map((l) => l.id));
    while (true) {
      const next = (db.children.get(String(path.at(-1).id)) || [])[0];
      if (!next || visited.has(next.id)) break;
      path.push(next);
      visited.add(next.id);
    }
    const cards = path
      .map((l, i) => {
        const branches = db.children.get(String(l.id)) || [];
        return (
          '<article class="sv-time-item" data-sv-card="' +
          esc(l.id) +
          '"><div class="sv-time-label">' +
          (i === 0 ? "原始来信" : "故事接力") +
          (l.created ? " · " + labelDate(l.created) : "") +
          "</div>" +
          '<details class="sv-letter"' +
          (l.id === focused.id ? " open" : "") +
          "><summary><span><b>" +
          esc(l.title) +
          "</b><small>" +
          esc([l.author || "匿名来信", l.region].filter(Boolean).join(" · ")) +
          '</small></span><span class="sv-plus" aria-hidden="true">＋</span></summary>' +
          '<div class="sv-expanded"><p>' +
          esc(l.body) +
          "</p>" +
          api().media(l) +
          '<div class="sv-actions">' +
          (published(l)
            ? button("read", l.id, "打开原信")
            : '<span class="sv-muted">原作者已撤回内容。</span>') +
          (published(l) && l.open ? button("relay", l.id, "公开接力") : "") +
          "</div></div></details>" +
          (branches.length > 1
            ? '<div class="sv-branch-row">' +
              select(
                "timeline",
                "选择后续支线",
                branches.map((c) => [c.id, c.title]),
                path[i + 1]?.id,
              ) +
              "</div>"
            : "") +
          "</article>"
        );
      })
      .join("");
    const nav = path
      .map(
        (l) =>
          '<button type="button" data-sv-jump="' +
          esc(l.id) +
          '"' +
          (l.id === focused.id ? ' class="sv-active"' : "") +
          ">" +
          esc(l.title) +
          "</button>",
      )
      .join("");
    const forks = path.filter(
      (l) => (db.children.get(String(l.id)) || []).length > 1,
    );
    const mobile =
      '<div class="sv-mobile-reader">' +
      button("tree", focused.id, "回到海图") +
      (forks.length
        ? '<button type="button" class="sv-button" data-sv-path-sheet>切换支线</button>'
        : "") +
      "<span data-sv-relay-action>" +
      (focused.open && published(focused)
        ? button("relay", focused.id, "公开接力", true)
        : "") +
      "</span></div>";
    return layout(
      "故事支线",
      root.title,
      '<div class="sv-timeline"><aside class="sv-path"><h2>当前阅读路径</h2><nav aria-label="定位到信件">' +
        nav +
        '</nav></aside><div class="sv-time-list">' +
        cards +
        "</div></div>" +
        mobile,
      button("tree", focused.id, "返回故事树"),
    );
  }

  function exhibits(db) {
    return db.roots
      .map((root) => ({
        root,
        sources: subtree(db, root).filter((l) => published(l) && l.exhibit),
      }))
      .filter((group) => group.sources.length);
  }

  function posterImage(group) {
    const photo = group.sources.find(
      (l) =>
        l.media?.type === "image" && /^\/api\/media\/[\w-]+$/.test(l.media.url),
    );
    const lead = group.sources[0];
    return lead.coverUrl || !photo ? stationery.coverUrl(lead) : photo.media.url;
  }

  function poster(group, large) {
    const lead = group.sources[0];
    const title = lead.title;
    return (
      '<div class="sv-poster' +
      (large ? " sv-large-poster" : "") +
      '"><img loading="lazy" src="' +
      esc(posterImage(group)) +
      '" alt=""><div class="sv-poster-text"><span>' +
      esc(lead.theme || "书信记忆") +
      "</span><strong>" +
      esc(title) +
      '</strong><span class="sv-poster-attribution">' +
      esc(
        unique(group.sources.map((l) => l.author || "匿名来信"))
          .slice(0, 3)
          .join("、"),
      ) +
      " · 书信共作</span></div></div>"
    );
  }

  function scrollArtwork(group) {
    const sources = new Map(group.sources.map((l) => [String(l.id), l]));
    const panels = group.sources
      .map((l) => {
        const parent = sources.get(String(l.parentId));
        const origin = parent
          ? "接续《" + parent.title + "》"
          : l.parentId
            ? "接力来信"
            : "原始来信";
        return (
          '<li class="sv-film-frame" data-sv-frame="' +
          esc(l.id) +
          '"><img loading="lazy" src="' +
          esc(posterImage({ sources: [l] })) +
          '" alt=""><div class="sv-frame-copy"><small>' +
          esc(origin) +
          "</small><h3>" +
          esc(l.title) +
          "</h3><p>" +
          esc(excerpt(l.body, 98)) +
          "</p>" +
          byline(l) +
          '<a class="sv-link" href="' +
          esc(route("read", l.id)) +
          '">阅读原信</a></div></li>'
        );
      })
      .join("");
    const navigator =
      group.sources.length > 1
        ? select(
            "frame",
            "定位画面",
            group.sources.map((l) => [l.id, l.title]),
            group.sources[0].id,
          )
        : "";
    return (
      '<section class="sv-film"><div class="sv-film-head"><div><h2>回响长卷</h2><p>' +
      (group.sources.length > 1
        ? "横向浏览参与者留下的书信画面。"
        : "这幅长卷从第一封来信开始。") +
      "</p></div>" +
      navigator +
      '</div><ol class="sv-film-strip" tabindex="0" aria-label="按接力关系编排的书信长卷">' +
      panels +
      "</ol></section>"
    );
  }

  function audioArtwork(tracks) {
    return (
      '<section class="sv-audio-work"><h2>声音记忆</h2><p class="sv-muted">' +
      tracks.length +
      " 段作者授权的录音</p><ol>" +
      tracks
        .map(
          (l) =>
            "<li>" +
            byline(l) +
            "<h3>" +
            esc(l.title) +
            "</h3>" +
            api().media(l) +
            '<a class="sv-link" href="' +
            esc(route("read", l.id)) +
            '">阅读录音所属来信</a></li>',
        )
        .join("") +
      "</ol></section>"
    );
  }

  function galleryDetail(group) {
    const lead = group.sources[0];
    const tracks = group.sources.filter(
      (l) =>
        l.media?.type === "audio" && /^\/api\/media\/[\w-]+$/.test(l.media.url),
    );
    const types = [
      ["poster", "纪念海报"],
      ["scroll", "回响长卷"],
    ];
    if (tracks.length) types.push(["audio", "声音记忆"]);
    if (
      exhibitView.groupId !== group.root.id ||
      !types.some(([key]) => key === exhibitView.kind)
    ) {
      exhibitView.groupId = group.root.id;
      exhibitView.kind = "poster";
    }
    const tabs =
      '<div class="sv-exhibit-tabs" role="group" aria-label="作品类型">' +
      types
        .map(
          ([key, label]) =>
            '<button type="button" aria-pressed="' +
            (key === exhibitView.kind) +
            '" data-sv-exhibit-type="' +
            key +
            '">' +
            label +
            "</button>",
        )
        .join("") +
      "</div>";
    const archive =
      '<section class="sv-sources"><h2>共创手记</h2>' +
      group.sources
        .map(
          (l) =>
            "<article>" +
            byline(l) +
            "<h3>" +
            esc(l.title) +
            "</h3><p>" +
            esc(excerpt(l.body, 130)) +
            '</p><a class="sv-link" href="' +
            esc(route("read", l.id)) +
            '">阅读这封原信</a></article>',
        )
        .join("") +
      "</section>";
    let content;
    if (exhibitView.kind === "scroll") {
      content =
        scrollArtwork(group) +
        '<div class="sv-poster-actions">' +
        button("tree", lead.id, "查看故事树") +
        "</div>";
    } else if (exhibitView.kind === "audio") {
      content =
        audioArtwork(tracks) +
        '<div class="sv-poster-actions">' +
        button("tree", lead.id, "查看故事树") +
        "</div>";
    } else {
      content =
        '<div class="sv-exhibit"><div>' +
        poster(group, true) +
        '<div class="sv-actions sv-poster-actions"><button class="sv-button" data-sv-download="' +
        esc(group.root.id) +
        '">保存纪念海报</button>' +
        button("tree", lead.id, "查看故事树") +
        '</div><p class="sv-meta" role="status" data-sv-download-status></p></div>' +
        archive +
        "</div>";
    }
    return layout(
      lead.title,
      "由 " + group.sources.length + " 封获得展览授权的公开来信编成。",
      tabs + content,
      button("gallery", null, "全部展品"),
    );
  }

  function gallery(id) {
    const db = collection();
    const groups = exhibits(db);
    if (id) {
      const group = groups.find(
        (g) =>
          String(g.root.id) === String(id) ||
          g.sources.some((l) => String(l.id) === String(id)),
      );
      if (!group)
        return layout(
          "海的记忆",
          "这件展品当前无法查看。",
          empty("可以浏览其他获得作者授权的作品。", "gallery", "返回展厅"),
        );
      return galleryDetail(group);
    }
    const themes = unique(groups.flatMap((g) => g.sources.map((l) => l.theme)));
    if (!themes.includes(state.galleryTheme)) state.galleryTheme = "";
    const shown = groups.filter(
      (g) =>
        !state.galleryTheme ||
        g.sources.some((l) => l.theme === state.galleryTheme),
    );
    return layout(
      "海的记忆",
      "从一封信到一件共同作品。走进展览，读到每位作者的原信。",
      '<div class="sv-toolbar">' +
        select(
          "galleryTheme",
          "展览主题",
          [["", "全部主题"], ...themes.map((t) => [t, t])],
          state.galleryTheme,
        ) +
        '<span class="sv-muted">' +
        shown.length +
        " 件展品</span></div>" +
        (shown.length
          ? '<div class="sv-grid">' +
            shown
              .map(
                (g) =>
                  '<a class="sv-work" href="' +
                  esc(route("gallery", g.root.id)) +
                  '">' +
                  poster(g, false) +
                  '<div class="sv-caption"><b>' +
                  esc(g.sources[0].title) +
                  "</b><span>" +
                  g.sources.length +
                  " 封授权来信 · 故事档案</span></div></a>",
              )
              .join("") +
            "</div>"
          : empty("展厅正在等待第一件获授权的作品。", "tree", "探索公开故事")),
      button("network", null, "文化交流网络"),
    );
  }

  function network() {
    const db = collection();
    const publicLetters = db.letters.filter(published);
    const themes = unique(publicLetters.map((l) => l.theme));
    if (!themes.includes(state.networkTheme)) state.networkTheme = "";
    const letters = publicLetters.filter(
      (l) =>
        l.region && (!state.networkTheme || state.networkTheme === l.theme),
    );
    const regionKey = (l) => l.regionKey || l.region;
    const filteredIds = new Set(letters.map((l) => String(l.id)));
    const regions = new Map();
    const edges = new Map();
    function region(name) {
      if (!regions.has(name))
        regions.set(name, { name, letters: new Map(), connections: 0 });
      return regions.get(name);
    }
    for (const letter of letters) {
      region(regionKey(letter)).letters.set(letter.id, letter);
      const parent = db.byId.get(String(letter.parentId));
      if (
        !parent ||
        !filteredIds.has(String(parent.id)) ||
        regionKey(parent) === regionKey(letter)
      )
        continue;
      region(regionKey(parent)).connections++;
      region(regionKey(letter)).connections++;
      const pair = [regionKey(parent), regionKey(letter)].sort();
      const key = JSON.stringify(pair);
      if (!edges.has(key)) edges.set(key, { pair, count: 0 });
      edges.get(key).count++;
    }
    const rows = [...regions.values()].sort(
      (a, b) =>
        b.connections - a.connections || a.name.localeCompare(b.name, "zh-CN"),
    );
    if (!regions.has(state.region)) state.region = rows[0]?.name || "";
    const selected = regions.get(state.region);
    // A relationship graph uses voluntary region labels without inferring geographic coordinates.
    const wide = 660;
    const tall = Math.max(270, 100 + rows.length * 45);
    const places = new Map(
      rows.map((r, i) => {
        const theta = (Math.PI * 2 * i) / rows.length - Math.PI / 2;
        return [
          r.name,
          {
            x: wide / 2 + (rows.length === 1 ? 0 : Math.cos(theta) * 210),
            y:
              tall / 2 +
              (rows.length === 1 ? 0 : Math.sin(theta) * (tall / 2 - 60)),
          },
        ];
      }),
    );
    const lines = [...edges.values()]
      .map((e) => {
        const [a, b] = e.pair.map((n) => places.get(n));
        const active = e.pair.includes(state.region);
        return (
          '<line x1="' +
          a.x +
          '" y1="' +
          a.y +
          '" x2="' +
          b.x +
          '" y2="' +
          b.y +
          '" stroke="' +
          (active ? "#508b70" : "#b5ccc2") +
          '" stroke-width="' +
          Math.min(7, 1 + Math.sqrt(e.count)) +
          '"><title>' +
          esc(e.pair.join(" ↔ ") + " · " + e.count + " 次接力") +
          "</title></line>"
        );
      })
      .join("");
    const pins = rows
      .map((r) => {
        const p = places.get(r.name);
        const active = r.name === state.region;
        return (
          '<g transform="translate(' +
          p.x +
          " " +
          p.y +
          ')" role="button" tabindex="0" aria-pressed="' +
          active +
          '" aria-label="' +
          esc("查看" + r.name + "的来信") +
          '" data-sv-region="' +
          esc(r.name) +
          '">' +
          '<circle r="23" fill="' +
          (active ? "#1f6050" : "#f5f6e9") +
          '" stroke="#8da99a"/><text class="sv-region-number" fill="' +
          (active ? "white" : "#295c4e") +
          '" y="5">' +
          r.letters.size +
          "</text>" +
          '<text class="sv-node-label" y="41">' +
          esc(r.name) +
          "</text></g>"
        );
      })
      .join("");
    const peerLinks = [...edges.values()]
      .filter((e) => e.pair.includes(state.region))
      .map((e) => {
        const name = e.pair.find((n) => n !== state.region);
        return (
          '<button class="sv-peer" data-sv-region="' +
          esc(name) +
          '">' +
          esc(name) +
          " · " +
          e.count +
          " 次接力</button>"
        );
      })
      .join("");
    const total = [...edges.values()].reduce((n, e) => n + e.count, 0);
    return layout(
      "文化交流网络",
      "每一条连线，都来自不同地域之间的一次公开书信接力。",
      '<div class="sv-toolbar">' +
        select(
          "networkTheme",
          "故事主题",
          [["", "全部主题"], ...themes.map((t) => [t, t])],
          state.networkTheme,
        ) +
        '<span class="sv-muted">' +
        rows.length +
        " 个地域 · " +
        total +
        " 次跨地域接力</span></div>" +
        (selected
          ? '<div class="sv-network-layout"><div class="sv-network-map"><svg role="group" aria-label="地域接力关系图" viewBox="0 0 ' +
            wide +
            " " +
            tall +
            '">' +
            lines +
            pins +
            '</svg><p class="sv-meta">圆点内为公开来信数 · 地域由作者自愿填写</p></div><aside class="sv-inspector">' +
            select(
              "region",
              "选择地域",
              rows.map((r) => [r.name, r.name]),
              selected.name,
            ) +
            "<h2>" +
            esc(selected.name) +
            "</h2><p>" +
            selected.letters.size +
            " 封公开来信，" +
            selected.connections +
            ' 次跨地域接力。</p><div class="sv-peers">' +
            peerLinks +
            '</div><h3>来自这里的信</h3><div class="sv-region-letters">' +
            [...selected.letters.values()]
              .map(
                (l) =>
                  '<a href="' +
                  esc(route("read", l.id)) +
                  '">' +
                  esc(l.title) +
                  "</a>",
              )
              .join("") +
            "</div></aside></div>"
          : empty("当前没有带公开地域信息的来信。", "tree", "回到故事树")),
      button("gallery", null, "返回展厅"),
    );
  }

  async function savePoster(id, trigger) {
    const group = exhibits(collection()).find(
      (g) => String(g.root.id) === String(id),
    );
    if (!group || trigger.disabled) return;
    const field = trigger
      .closest(".sv")
      ?.querySelector("[data-sv-download-status]");
    trigger.disabled = true;
    try {
      const lead = group.sources[0];
      const canvas = document.createElement("canvas");
      canvas.width = 960;
      canvas.height = 1320;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#f8f5e9";
      ctx.fillRect(0, 0, 960, 1320);
      const img = new Image();
      img.src = posterImage(group);
      await img.decode();
      const scale = Math.max(960 / img.naturalWidth, 560 / img.naturalHeight);
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, 960, 560);
      ctx.clip();
      ctx.drawImage(
        img,
        (960 - img.naturalWidth * scale) / 2,
        (560 - img.naturalHeight * scale) / 2,
        img.naturalWidth * scale,
        img.naturalHeight * scale,
      );
      ctx.restore();
      const wrap = (text, left, top, leading, limit) => {
        const lines = [];
        let line = "";
        for (const char of Array.from(text)) {
          if (ctx.measureText(line + char).width > 820) {
            lines.push(line);
            line = "";
          }
          line += char;
        }
        if (line) lines.push(line);
        lines.slice(0, limit).forEach((content, index) => {
          let display = content;
          if (index === limit - 1 && lines.length > limit) {
            while (display && ctx.measureText(display + "…").width > 820)
              display = Array.from(display).slice(0, -1).join("");
            display += "…";
          }
          ctx.fillText(display, left, top + index * leading);
        });
      };
      ctx.fillStyle = "#456d5d";
      ctx.font = "28px sans-serif";
      ctx.fillText("海上有信  /  海的记忆", 70, 640);
      ctx.fillStyle = "#203f35";
      ctx.font = "bold 52px serif";
      wrap(lead.title, 70, 740, 66, 3);
      ctx.font = "32px serif";
      wrap(excerpt(lead.body, 63), 70, 975, 50, 3);
      ctx.fillStyle = "#456d5d";
      ctx.font = "24px sans-serif";
      wrap(
        "共同创作 · " +
          unique(group.sources.map((l) => l.author || "匿名来信")).join("、"),
        70,
        1200,
        34,
        3,
      );
      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/png"),
      );
      if (!blob) throw new Error("无法导出海报");
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download =
        "海上有信-" +
        excerpt(lead.title, 24).replace(/[\\/:*?"<>|]/g, "") +
        ".png";
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      if (field) field.textContent = "海报已生成，可在浏览器下载记录中查看。";
    } catch {
      if (field) field.textContent = "海报暂时未能生成，请再试一次。";
    } finally {
      trigger.disabled = false;
    }
  }

  document.addEventListener("change", (e) => {
    const select = e.target.closest("[data-sv-control]");
    if (!select) return;
    const value = select.value;
    switch (select.dataset.svControl) {
      case "root":
        state.treePosition = null;
        state.zoom = 1;
        api().go("tree/" + encodeURIComponent(value));
        break;
      case "timeline":
        state.switchFocus = value;
        api().go("timeline/" + encodeURIComponent(value));
        break;
      case "galleryTheme":
        state.galleryTheme = value;
        api().render();
        break;
      case "networkTheme":
        state.networkTheme = value;
        api().render();
        break;
      case "region":
        state.region = value;
        api().render();
        break;
      case "frame": {
        const strip = document.querySelector(".sv-film-strip");
        const frame =
          strip &&
          [...strip.children].find((el) => el.dataset.svFrame === value);
        if (frame) {
          const margin = parseFloat(getComputedStyle(strip).paddingLeft);
          strip.scrollTo({
            left: frame.offsetLeft - margin,
            behavior: "instant",
          });
        }
        break;
      }
    }
  });
  function jump(id, scroll = true) {
    const card = [...document.querySelectorAll("[data-sv-card]")].find(
      (el) => el.dataset.svCard === id,
    );
    if (!card) return;
    card.querySelector("details").open = true;
    for (const button of document.querySelectorAll("[data-sv-jump]"))
      button.classList.toggle("sv-active", button.dataset.svJump === id);
    const letter = collection().byId.get(String(id));
    const action = document.querySelector("[data-sv-relay-action]");
    if (action)
      action.innerHTML =
        letter?.open && published(letter)
          ? button("relay", letter.id, "公开接力", true)
          : "";
    if (scroll) {
      card.scrollIntoView({ block: "center", behavior: "instant" });
      card.querySelector("summary")?.focus({ preventScroll: true });
    }
  }
  function saveTreePosition() {
    const sea = document.querySelector(".sv-sea-scroll");
    if (sea) state.treePosition = [sea.scrollLeft, sea.scrollTop];
  }
  function restoreTreePosition() {
    const sea = document.querySelector(".sv-sea-scroll");
    if (!sea) return;
    if (state.treePosition) sea.scrollTo(...state.treePosition);
    const selected = sea.querySelector('[aria-current="true"]');
    if (selected) {
      const frame = sea.getBoundingClientRect(),
        item = selected.getBoundingClientRect();
      if (item.left < frame.left || item.right > frame.right)
        sea.scrollLeft +=
          item.left - frame.left - (frame.width - item.width) / 2;
      if (item.top < frame.top || item.bottom > frame.bottom)
        sea.scrollTop +=
          item.top - frame.top - (frame.height - item.height) / 2;
    }
  }
  function openPathSheet() {
    const db = collection();
    const forks = Array.from(
      document.querySelectorAll("[data-sv-card]"),
      (el) => db.byId.get(el.dataset.svCard),
    ).filter((l) => (db.children.get(String(l?.id)) || []).length > 1);
    const dialog = document.createElement("dialog");
    dialog.className = "sv-sheet-dialog";
    dialog.setAttribute("aria-label", "切换阅读支线");
    dialog.innerHTML =
      '<form method="dialog"><h2>切换阅读支线</h2><button class="sv-button">关闭</button></form>' +
      forks
        .map(
          (l) =>
            "<section><h3>" +
            esc(l.title) +
            "</h3>" +
            db.children
              .get(String(l.id))
              .map(
                (c) =>
                  '<a href="' +
                  esc(route("timeline", c.id)) +
                  '" data-sv-choose="' +
                  esc(c.id) +
                  '">' +
                  esc(c.title) +
                  "</a>",
              )
              .join("") +
            "</section>",
        )
        .join("");
    document.body.appendChild(dialog);
    dialog.addEventListener("close", () => dialog.remove(), { once: true });
    dialog.addEventListener("click", (e) => {
      const link = e.target.closest("[data-sv-choose]");
      if (link) {
        state.switchFocus = link.dataset.svChoose;
        dialog.close();
      }
    });
    dialog.showModal();
  }
  document.addEventListener("click", (e) => {
    if (e.target.closest(".sv-tree-layout a")) saveTreePosition();
    const tab = e.target.closest("[data-sv-exhibit-type]");
    if (tab) {
      exhibitView.kind = tab.dataset.svExhibitType;
      api().render();
      document
        .querySelector(".sv-exhibit-tabs [aria-pressed=true]")
        ?.focus({ preventScroll: true });
      return;
    }
    const el = e.target.closest(
      "[data-sv-region],[data-sv-jump],[data-sv-download],[data-sv-zoom],[data-sv-path-sheet]",
    );
    if (!el) return;
    if (el.hasAttribute("data-sv-region")) {
      state.region = el.dataset.svRegion;
      api().render();
    } else if (el.hasAttribute("data-sv-jump")) jump(el.dataset.svJump);
    else if (el.hasAttribute("data-sv-zoom")) {
      saveTreePosition();
      state.zoom = Math.min(
        2,
        Math.max(0.75, state.zoom + Number(el.dataset.svZoom) * 0.25),
      );
      api().render();
      restoreTreePosition();
    } else if (el.hasAttribute("data-sv-path-sheet")) openPathSheet();
    else savePoster(el.dataset.svDownload, el);
  });
  document.addEventListener(
    "play",
    (event) => {
      const player = event.target;
      if (player.matches?.(".sv-audio-work audio")) {
        for (const other of player
          .closest(".sv-audio-work")
          .querySelectorAll("audio"))
          if (other !== player) other.pause();
      }
    },
    true,
  );
  document.addEventListener(
    "scrollend",
    (event) => {
      const strip = event.target;
      if (!strip.matches?.(".sv-film-strip")) return;
      const chooser = strip.parentElement.querySelector(
        "[data-sv-control=frame]",
      );
      if (chooser && strip.children.length) {
        const left =
          strip.scrollLeft + parseFloat(getComputedStyle(strip).paddingLeft);
        const nearest = [...strip.children].reduce((a, b) =>
          Math.abs(a.offsetLeft - left) <= Math.abs(b.offsetLeft - left)
            ? a
            : b,
        );
        chooser.value = nearest.dataset.svFrame;
      }
    },
    true,
  );
  document.addEventListener("keydown", (e) => {
    if (
      (e.key === "Enter" || e.key === " ") &&
      e.target.matches("g[data-sv-region]")
    ) {
      e.preventDefault();
      state.region = e.target.dataset.svRegion;
      api().render();
    }
  });
  window.addEventListener("sea:route-ready", () => {
    if (location.hash.startsWith("#tree"))
      requestAnimationFrame(restoreTreePosition);
    if (state.switchFocus) {
      const id = state.switchFocus;
      state.switchFocus = null;
      requestAnimationFrame(() => jump(id));
    }
  });
  window.storyViews = { tree, timeline, gallery, network };
})();
