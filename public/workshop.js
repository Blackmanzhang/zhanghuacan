(() => {
  "use strict";
  const api = () => window.app;
  const esc = (value) => api().esc(value);
  const knownArt = {
    moon: "海上月色",
    lantern: "灯火人家",
    boat: "渡口相逢",
    mountain: "山间望月",
    wave: "隔海相望",
    leaf: "庭院秋意",
  };
  const versionState = {
    pending: "待审核",
    published: "已上卷",
    withdrawn: "已撤回",
    rejected: "未获采用",
  };
  const locks = new Set();
  const workshopData = () => api().state.workshop;
  const publicVersion = (v) =>
    v?.status === "published" &&
    v.exhibit &&
    (!v.sourceId || Boolean(findLetter(v.sourceId)));
  const art = (token) =>
    api().art(Object.hasOwn(knownArt, token) ? token : "moon");
  const hash = (page, id) =>
    "#" + page + (id ? "/" + encodeURIComponent(id) : "");
  const link = (page, id, text, solid = false) =>
    '<a class="btn' +
    (solid ? " solid" : "") +
    '" href="' +
    esc(hash(page, id)) +
    '">' +
    esc(text) +
    "</a>";
  const action = (key, id, label, primary = false) =>
    '<button type="button" class="btn' +
    (primary ? " solid" : "") +
    '" data-wk-action="' +
    key +
    '" data-wk-id="' +
    esc(id) +
    '">' +
    esc(label) +
    "</button>";
  const findLetter = (id) =>
    id &&
    api().state.letters.find(
      (l) => l.id === id && l.status === "published" && l.exhibit,
    );
  const signature = (v) =>
    [v.author || "匿名作者", v.region].filter(Boolean).join(" · ");
  const shortDate = (value) => {
    const d = new Date(value);
    return value && !Number.isNaN(d.getTime())
      ? d.toLocaleDateString("zh-CN", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "";
  };
  const ownVersions = (panel) =>
    (panel.myVersions || (panel.mine ? [panel.mine] : [])).filter(
      (v) => v.authorId === api().state.me.id,
    );
  const mineClaim = (p) => !!p.claimedBy && p.claimedBy === api().state.me.id;
  const pending = (p) => ownVersions(p).find((v) => v.status === "pending");
  const hasCurrent = (p) => publicVersion(p.current);
  const label = (p) =>
    mineClaim(p)
      ? pending(p)
        ? "我的稿件待审"
        : "我已认领"
      : p.claimedBy
        ? "正在共创"
        : hasCurrent(p)
          ? "可接续创作"
          : "可认领";
  const empty = () =>
    '<section class="wk"><div class="wk-notice">暂时无法读取中秋活动。' +
    action("sync", "", "刷新活动") +
    "</div></section>";

  function feature(data, live) {
    const count = data.panels.filter(hasCurrent).length;
    return (
      '<header class="wk-cover"><img src="/art/midautumn.png" alt="" class="wk-cover-art"><div class="wk-cover-copy">' +
      '<p class="wk-kicker">' +
      (live ? "中秋专题展" : "中秋共创工坊") +
      "</p><h1>" +
      esc(data.title) +
      "</h1><p>" +
      (live
        ? "沿着一幅长卷，读两岸及海外创作者共同写下的中秋。"
        : "选一格画面，用家乡的月色、味道和声音，一起写出今年的中秋。") +
      '</p><div class="wk-cover-actions">' +
      (live
        ? link("workshop", null, "进入共创工坊", true)
        : link("festival", null, "观看公开长卷")) +
      "<span>" +
      count +
      " / " +
      data.panels.length +
      " 格已上卷</span></div></div></header>"
    );
  }

  function sourceLinks(data) {
    const seeds = (data.sourceIds || []).map(findLetter).filter(Boolean);
    if (!seeds.length) return "";
    return (
      '<section class="wk-origins" aria-label="活动缘起"><h2>长卷从这些来信开始</h2><div>' +
      seeds
        .map(
          (l) =>
            '<a href="' +
            esc(hash("read", l.id)) +
            '">' +
            api().icon("mail", 17) +
            "<span>" +
            esc(l.title) +
            "</span><small>" +
            esc(signature(l)) +
            "</small></a>",
        )
        .join("") +
      "</div></section>"
    );
  }

  function panelImage(version) {
    if (version.layers?.length) return window.studioCanvas.source(version);
    const ref = findLetter(version.sourceId);
    if (
      ref?.media?.type === "image" &&
      ref.media.url === "/api/media/" + ref.id
    ) {
      return ref.media.url;
    }
    return art(version.art);
  }

  function source(v) {
    const l = findLetter(v.sourceId);
    if (!l)
      return v.sourceId
        ? '<span class="wk-meta">来源原信已停止展示</span>'
        : '<span class="wk-meta">为本次专题创作</span>';
    return (
      '<span class="wk-source">来源原信 <a href="' +
      esc(hash("read", l.id)) +
      '">' +
      esc(l.title) +
      "</a> · " +
      esc(signature(l)) +
      "</span>"
    );
  }

  function draftKey(id) {
    return ["letters-workshop", api().state.me.id, id].join(":");
  }
  function savedDraft(id) {
    try {
      return JSON.parse(sessionStorage.getItem(draftKey(id)) || "null");
    } catch {
      return null;
    }
  }
  function discard(id) {
    try {
      sessionStorage.removeItem(draftKey(id));
    } catch {}
  }
  function remixChoices(panel) {
    return (panel.versions || [])
      .filter((v) => publicVersion(v) && v.allowRemix && v.layers?.length < 16)
      .slice()
      .reverse();
  }
  function editor(panel) {
    const choices = remixChoices(panel);
    const saved = savedDraft(panel.id);
    const baseId = saved ? saved.baseId || "" : choices[0]?.id || "";
    const base = choices.find((v) => v.id === baseId);
    const draft = saved || {};
    const owned = (api().state.letters || []).filter(
      (l) =>
        l.authorId === api().state.me.id &&
        l.status === "published" &&
        l.exhibit,
    );
    requestAnimationFrame(() => {
      const form = document.querySelector(
        '[data-wk-editor="' + panel.id + '"]',
      );
      if (form && !form.readDrawing)
        window.studioCanvas.mount(form, draft, base);
    });
    return `<form data-wk-editor="${esc(panel.id)}" class="wk-studio-form">
      <div class="sc-heading"><div><span class="wk-kicker">共创长卷 · ${esc(panel.title)}</span><h2>${esc(base?.title || panel.title)}</h2></div>
      <label class="sc-base">画布底稿<select name="baseId">${baseId && !base ? '<option selected value="' + esc(baseId) + '">来源授权已失效，请另选底稿</option>' : ""}
      ${choices.map((v) => '<option value="' + esc(v.id) + '" ' + (v.id === baseId ? "selected" : "") + ">第 " + v.version + " 版 · " + esc(v.author) + "</option>").join("")}
      <option value="" ${!baseId ? "selected" : ""}>从空白画布开始</option></select></label></div>
      ${window.studioCanvas.controls()}
      <div class="sc-credits">${
        base
          ? "底稿署名　" +
            base.layers
              .map((l) => esc(l.author))
              .filter((v, i, a) => a.indexOf(v) === i)
              .join("、") +
            "　·　第 " +
            base.version +
            " 版已开放二创"
          : esc(panel.prompt)
      }</div>
      <details class="sc-submit" ${mineClaim(panel) ? "open" : ""}><summary>署名与提交</summary>
      <div class="sc-fields"><label class="field">作品标题<input name="title" maxlength="100" required value="${esc(draft.title || "")}" placeholder="给作品起个名字"></label>
      <label class="field">关联我的原信<select name="sourceId"><option value="">本次原创</option>${owned.map((l) => '<option value="' + esc(l.id) + '" ' + (draft.sourceId === l.id ? "selected" : "") + ">" + esc(l.title) + "</option>").join("")}</select></label></div>
      <label class="field">创作手记<textarea name="body" maxlength="2000" rows="2" required placeholder="写下你在这一版添了什么。">${esc(draft.body || "")}</textarea></label>
      <input type="hidden" name="art" value="${esc(panel.art)}">
      <label class="wk-consent"><input type="checkbox" name="exhibit" required>同意将本作和署名用于公开展览及长卷导出。</label>
      <label class="wk-consent"><input type="checkbox" name="allowRemix" ${draft.allowRemix ? "checked" : ""}>同意其他创作者保留我的署名，在本版画面上接续创作。</label>
      <div class="wk-action-row"><button class="btn solid" type="submit">${mineClaim(panel) ? "提交审核" : "认领并提交审核"}</button>${mineClaim(panel) ? action("release", panel.id, "放弃认领") : ""}<small class="wk-draft-status" aria-live="polite">${saved ? "已恢复本标签页草稿" : ""}</small></div><p class="wk-error" role="alert"></p></details></form>`;
  }

  function versions(panel, personal) {
    const list = (
      personal
        ? ownVersions(panel)
        : (panel.versions || []).filter(publicVersion)
    )
      .slice()
      .sort((a, b) => b.version - a.version);
    if (!list.length) return "";
    return (
      '<section class="wk-history"><h3>' +
      (personal ? "我的投稿记录" : "公开版本") +
      "</h3>" +
      list
        .map(
          (v) =>
            "<details><summary><span>第 " +
            esc(v.version) +
            " 版 · " +
            esc(v.title) +
            "</span><small>" +
            esc(personal ? versionState[v.status] || "处理中" : v.author) +
            "</small></summary>" +
            '<div><p class="wk-meta">' +
            esc(signature(v)) +
            " · " +
            esc(shortDate(v.created)) +
            '</p><p class="wk-body">' +
            esc(v.body) +
            "</p>" +
            (v.layers?.length
              ? '<img class="sc-version-image" src="' +
                esc(panelImage(v)) +
                '" alt="本版画面"><p class="wk-meta">' +
                v.layers
                  .map((l) => esc(signature(l)))
                  .filter((v, i, a) => a.indexOf(v) === i)
                  .join("、") +
                "</p>"
              : "") +
            (v.baseAvailable === false
              ? '<p class="wk-meta">前序来源已撤回，仅显示本版作者自身的图层。</p>'
              : "") +
            source(v) +
            (personal && ["published", "pending"].includes(v.status)
              ? '<div class="wk-action-row">' +
                action(
                  v.status === "pending" ? "withdraw-draft" : "withdraw",
                  v.id,
                  v.status === "pending" ? "撤回待审稿" : "撤回至此版本的授权",
                ) +
                "</div>"
              : "") +
            "</div></details>",
        )
        .join("") +
      "</section>"
    );
  }

  let focusedHash = "";
  function focusSection(page, id, selector) {
    const target = hash(page, id);
    if (!id || location.hash !== target || focusedHash === target) return;
    focusedHash = target;
    requestAnimationFrame(() => {
      if (location.hash !== target) return;
      const box = document.querySelector(selector);
      if (!box) return;
      box.tabIndex = -1;
      box.focus({ preventScroll: true });
      box.scrollIntoView({ block: "start", behavior: "instant" });
    });
  }
  window.addEventListener("hashchange", () => {
    if (focusedHash !== location.hash) focusedHash = "";
  });

  function workshop(id) {
    const data = workshopData();
    if (!data?.panels?.length) return empty();
    const selected =
      data.panels.find((p) => p.id === id) ||
      data.panels.find(mineClaim) ||
      data.panels[0];
    const waiting = pending(selected);
    const locked = selected.claimedBy && !mineClaim(selected);
    const displayed = waiting || selected.current;
    const nav = data.panels
      .map(
        (p, i) =>
          `<a href="${esc(hash("workshop", p.id))}" ${p === selected ? 'aria-current="page"' : ""}><span>${String(i + 1).padStart(2, "0")}</span>${esc(p.title)}</a>`,
      )
      .join("");
    const board =
      waiting || locked
        ? `<div class="sc-readonly"><h2>${esc(displayed?.title || selected.title)}</h2>${displayed ? '<img class="sc-version-image" alt="画格预览" src="' + esc(panelImage(displayed)) + '">' : ""}
        <p>${waiting ? "你的第 " + waiting.version + " 版正在审核。" : "已有伙伴认领此画格，可以选择另一格创作。"}</p></div>`
        : editor(selected);
    return `<section class="wk wk-studio"><header class="sc-header"><div><p class="wk-kicker">海上有信 / 同一片月光</p><h1>多人文化创作工坊</h1><p>在前一版上添画或题字，通过审核后交给下一位创作者。</p></div>
      ${link("festival", null, "观看公开长卷 ↗")}</header><nav class="sc-panels" aria-label="选择共创画格">${nav}</nav>
      <section class="wk-workarea sc-workarea">${board}</section><div class="sc-records"><div>${versions(selected, true)}${versions(selected, false)}</div>${action("sync", "", "刷新状态")}</div>${sourceLinks(data)}</section>`;
  }

  function approvedPanels(data) {
    return data.panels.filter(hasCurrent);
  }
  function signatures(panels) {
    const seen = new Map();
    for (const p of panels) {
      for (const l of p.current.layers || [])
        seen.set(l.authorId, signature(l));
      seen.set(p.current.authorId, signature(p.current));
    }
    return [...seen.values()];
  }
  function festival(id) {
    const data = workshopData();
    if (!data?.panels?.length) return empty();
    const panels = approvedPanels(data);
    const selected = panels.find((p) => p.id === id) || panels[0];
    if (selected && id === selected.id)
      focusSection("festival", id, ".wk-reading");
    const joint = signatures(panels);
    const artboard = !selected
      ? '<div class="wk-notice">第一幅画格获准公开后，将在这里展出。</div>'
      : '<nav class="wk-scroll" aria-label="已上卷画格">' +
        panels
          .map(
            (p) =>
              '<a class="wk-scroll-tile' +
              (selected === p ? " chosen" : "") +
              '" href="' +
              esc(hash("festival", p.id)) +
              '"' +
              (selected === p ? ' aria-current="true"' : "") +
              ">" +
              '<img src="' +
              esc(panelImage(p.current)) +
              '" alt=""><div><small>' +
              esc(p.title) +
              "</small><h3>" +
              esc(p.current.title) +
              "</h3><span>" +
              esc(signature(p.current)) +
              "</span></div></a>",
          )
          .join("") +
        "</nav>" +
        '<article class="wk-reading"><div class="wk-brief"><small>' +
        esc(selected.title) +
        " · 第 " +
        esc(selected.current.version) +
        " 版</small><h2>" +
        esc(selected.current.title) +
        "</h2><p>" +
        esc(
          selected.current.layers?.length
            ? signatures([selected]).join("、")
            : signature(selected.current),
        ) +
        '</p></div><div><p class="wk-body">' +
        esc(selected.current.body) +
        "</p>" +
        (selected.current.layers?.length
          ? '<img class="sc-version-image" src="' +
            esc(panelImage(selected.current)) +
            '" alt="长卷画面">'
          : "") +
        api().media(findLetter(selected.current.sourceId)) +
        source(selected.current) +
        versions(selected, false) +
        "</div></article>" +
        '<section class="wk-colophon"><div><h2>本卷共同署名</h2><p>' +
        joint.map(esc).join("、") +
        "</p></div>" +
        action("export", "", "保存长卷 PNG", true) +
        "</section>";
    return (
      '<section class="wk">' +
      feature(data, true) +
      '<div class="wk-section-title"><h2>中秋记忆长卷</h2>' +
      action("sync", "", "刷新展览") +
      "</div>" +
      artboard +
      sourceLinks(data) +
      "</section>"
    );
  }

  function formValues(form) {
    const values = Object.fromEntries(new FormData(form));
    return {
      title: values.title.trim(),
      body: values.body.trim(),
      sourceId: values.sourceId || null,
      art: values.art,
      scene:
        form.readDrawing?.() || savedDraft(form.dataset.wkEditor)?.scene || [],
      baseId: values.baseId || null,
      allowRemix: form.elements.allowRemix.checked,
    };
  }

  function ask(label, detail) {
    return new Promise((resolve) => {
      const dialog = document.createElement("dialog");
      dialog.className = "wk-dialog";
      dialog.innerHTML =
        '<form method="dialog"><h2>' +
        esc(label) +
        "</h2><p>" +
        esc(detail) +
        '</p><div class="wk-action-row"><button class="btn" value="cancel" autofocus>保留</button>' +
        '<button class="btn solid" value="confirm">' +
        esc(label) +
        "</button></div></form>";
      document.body.appendChild(dialog);
      dialog.addEventListener(
        "close",
        () => {
          resolve(dialog.returnValue === "confirm");
          dialog.remove();
        },
        { once: true },
      );
      dialog.showModal();
    });
  }

  async function update(kind, payload) {
    try {
      await api().request("workshop/" + kind, payload);
    } catch (error) {
      try {
        await api().reload();
        api().render();
      } catch {}
      throw error;
    }
    await api().reload();
    api().render();
  }

  function splitLines(ctx, text, width) {
    const lines = [];
    let line = "";
    for (const ch of Array.from(
      String(text || "")
        .replace(/\s+/g, " ")
        .trim(),
    )) {
      if (line && ctx.measureText(line + ch).width > width) {
        lines.push(line);
        line = "";
      }
      line += ch;
    }
    if (line) lines.push(line);
    return lines;
  }

  async function exportScroll() {
    // Refresh permissions immediately before generating the local file.
    await api().reload();
    const data = workshopData();
    const panels = data && approvedPanels(data);
    if (!panels?.length) throw Error("当前没有已获准导出的画格。");
    const fingerprints = (items) =>
      JSON.stringify(
        items.map((p) => [
          p.id,
          p.current.id,
          p.current.sourceId || "",
          p.current.version,
        ]),
      );
    const original = fingerprints(panels);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw Error("浏览器未能打开图片画布。");
    const column = 520,
      pad = 26,
      lineWidth = column - pad * 2;
    const prepare = (value, font, lineHeight, color) => {
      ctx.font = font;
      return {
        lines: splitLines(ctx, value, lineWidth),
        font,
        lineHeight,
        color,
      };
    };
    const entries = await Promise.all(
      panels.map(async (panel) => {
        const v = panel.current,
          ref = findLetter(v.sourceId);
        const image = new Image();
        image.src = panelImage(v);
        await image.decode();
        const blocks = [
          prepare(
            panel.title + "  /  第 " + v.version + " 版",
            "21px sans-serif",
            30,
            "#785835",
          ),
          prepare(v.title, "bold 34px serif", 46, "#213d32"),
          prepare(
            signatures([panel]).join("、"),
            "21px sans-serif",
            31,
            "#385e4d",
          ),
          prepare(v.body, "24px serif", 38, "#2e3b2e"),
          prepare(
            ref
              ? "原信《" + ref.title + "》 · " + signature(ref)
              : v.sourceId
                ? "原信已停止展示"
                : "为本次专题创作",
            "19px sans-serif",
            29,
            "#526851",
          ),
        ];
        if (ref)
          blocks.push(
            prepare(
              "原信入口 " +
                location.origin +
                location.pathname +
                hash("read", ref.id),
              "16px sans-serif",
              23,
              "#526851",
            ),
          );
        return { blocks, image };
      }),
    );
    const records = entries.map((e) =>
      e.blocks.reduce(
        (total, b) => total + b.lines.length * b.lineHeight + 18,
        0,
      ),
    );
    const left = 30,
      top = 128,
      imageH = 242;
    canvas.width = Math.max(990, column * panels.length + left * 2);
    const joint = signatures(panels).join("、");
    ctx.font = "22px sans-serif";
    const credits = splitLines(
      ctx,
      "共同署名  " + joint,
      canvas.width - 2 * left,
    );
    const bottom = top + imageH + Math.max(...records) + 65;
    canvas.height = bottom + 62 + credits.length * 34;
    ctx.fillStyle = "#f8f4e5";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#183f33";
    ctx.fillRect(0, 0, canvas.width, 100);
    ctx.fillStyle = "#f8f3dd";
    ctx.font = "bold 42px serif";
    ctx.fillText(data.title, 32, 63);
    ctx.textAlign = "right";
    ctx.font = "22px serif";
    ctx.fillText("海上有信 · 中秋共创长卷", canvas.width - 32, 60);
    ctx.textAlign = "left";
    entries.forEach(({ blocks, image }, i) => {
      const x = left + i * column;
      const scale = (panels[i].current.layers?.length ? Math.min : Math.max)(
        (column - 2) / image.naturalWidth,
        imageH / image.naturalHeight,
      );
      ctx.save();
      ctx.beginPath();
      ctx.rect(x, top, column - 2, imageH);
      ctx.clip();
      ctx.drawImage(
        image,
        x + (column - 2 - image.naturalWidth * scale) / 2,
        top + (imageH - image.naturalHeight * scale) / 2,
        image.naturalWidth * scale,
        image.naturalHeight * scale,
      );
      ctx.restore();
      ctx.strokeStyle = "#c6cdb8";
      ctx.strokeRect(x, top, column - 2, bottom - top - 16);
      let y = top + imageH + 20;
      for (const b of blocks) {
        ctx.font = b.font;
        ctx.fillStyle = b.color;
        for (const line of b.lines) {
          y += b.lineHeight;
          ctx.fillText(line, x + pad, y);
        }
        y += 18;
      }
    });
    ctx.fillStyle = "#2a5843";
    ctx.font = "22px sans-serif";
    credits.forEach((line, i) =>
      ctx.fillText(line, left, bottom + 35 + i * 34),
    );
    const file = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/png"),
    );
    if (!file) throw Error("长卷图片生成失败。");
    // A source or version may be withdrawn while image assets load.
    await api().reload();
    const latest = workshopData();
    if (!latest || fingerprints(approvedPanels(latest)) !== original) {
      api().render();
      throw Error("长卷的公开版本刚刚更新，请重新导出。");
    }
    const url = URL.createObjectURL(file);
    const download = document.createElement("a");
    download.href = url;
    download.download =
      "海上有信-" +
      String(data.title).replace(/[\\/:*?"<>|]/g, "") +
      "-共创长卷.png";
    download.click();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }

  document.addEventListener("input", (event) => {
    const form = event.target.closest?.("[data-wk-editor]");
    if (!form) return;
    if (event.target.name === "exhibit") return;
    try {
      sessionStorage.setItem(
        draftKey(form.dataset.wkEditor),
        JSON.stringify(formValues(form)),
      );
      form.querySelector(".wk-draft-status").textContent =
        "草稿已保存在此标签页";
    } catch {}
  });
  document.addEventListener("change", (event) => {
    if (event.target.matches("[data-wk-editor] select[name=baseId]"))
      api().render();
  });
  document.addEventListener("submit", async (event) => {
    const form = event.target;
    if (!form.matches("[data-wk-editor]")) return;
    event.preventDefault();
    const id = form.dataset.wkEditor,
      button = form.querySelector("[type=submit]");
    if (locks.has("work:" + id)) return;
    locks.add("work:" + id);
    button.disabled = true;
    try {
      const payload = formValues(form);
      if (!payload.title || !payload.body || !form.elements.exhibit.checked)
        throw Error("请填写画格标题、手记并确认展示授权。");
      const panel = workshopData().panels.find((p) => p.id === id);
      if (!payload.scene.length)
        throw Error("请先在画布上留下笔迹、图章或题字。");
      if (
        payload.baseId &&
        !remixChoices(panel).some((v) => v.id === payload.baseId)
      )
        throw Error("请重新选择有授权的底稿。");
      if (!mineClaim(panel))
        await api().request("workshop/claim", { panelId: id });
      await update("submit", { ...payload, panelId: id, exhibit: true });
      discard(id);
      api().notify("画格已提交审核");
    } catch (error) {
      if (form.isConnected)
        form.querySelector(".wk-error").textContent = error.message;
      api().notify(error.message);
    } finally {
      locks.delete("work:" + id);
      button.disabled = false;
    }
  });
  document.addEventListener("click", async (event) => {
    const btn = event.target.closest?.("[data-wk-action]");
    if (!btn) return;
    const { wkAction: key, wkId: id } = btn.dataset;
    const lock =
      key === "claim" || key === "release" ? "work:" + id : key + ":" + id;
    if (locks.has(lock)) return;
    locks.add(lock);
    btn.disabled = true;
    try {
      if (key === "sync") {
        await api().reload();
        api().render();
        api().notify("活动状态已刷新");
      }
      if (key === "export") {
        await exportScroll();
        api().notify("共创长卷已生成");
      }
      if (key === "claim") {
        await update("claim", { panelId: id });
        api().notify("已认领画格");
      }
      if (
        key === "release" &&
        (await ask(
          "放弃认领",
          "这格将重新开放给其他创作者。当前标签页中的编辑草稿将清除。",
        ))
      ) {
        await update("release", { panelId: id });
        discard(id);
        api().notify("已放弃认领");
      }
      if (
        key === "withdraw" &&
        (await ask(
          "撤回授权",
          "你在本格截至所选版本的投稿将撤回，相应内容将从公开长卷和之后的导出中移除。",
        ))
      ) {
        await update("withdraw", { versionId: id });
        api().notify("已撤回所选版本及此前的授权");
      }
      if (
        key === "withdraw-draft" &&
        (await ask("撤回待审稿", "撤回后可以继续编辑本格或放弃认领。"))
      ) {
        await update("withdraw", { versionId: id });
        api().notify("已撤回待审稿");
      }
    } catch (error) {
      api().notify(error.message || "操作未完成，请重试");
    } finally {
      locks.delete(lock);
      btn.disabled = false;
    }
  });
  window.workshopViews = { workshop, festival };
})();
