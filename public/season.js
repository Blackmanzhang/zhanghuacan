/* Mid-Autumn programme and the reading/writing tools shared by its pages. */
(() => {
  "use strict";
  const papers = {
    ivory: "暖白信纸",
    sea: "海青横格",
    peach: "桂花笺",
    ledger: "航海方格",
    rice: "青竹素笺",
    tide: "潮汐蓝笺",
    linen: "亚麻手札",
  };
  const paperKey = (value) => (Object.hasOwn(papers, value) ? value : "ivory");
  const stamps = {
    sail: ["帆", "海上邮局"],
    moon: ["月", "中秋望月"],
    flower: ["桂", "八月桂香"],
    beacon: ["灯", "海岬灯塔", "harbor"],
    postmark: ["邮", "海港邮局", "postdesk"],
    junk: ["舟", "南洋归帆", "sampan"],
    window: ["窗", "闽南花窗", "courtyard"],
  };
  const quotePicks = new Map();
  let pickupView = "sea";
  let firstLetter = 0;
  let seaView;
  let pickupResizeFrame = 0;
  function stamp(value) {
    const [mark, name, art] = Object.hasOwn(stamps, value)
      ? stamps[value]
      : stamps.sail;
    return `<span class="paper-stamp stamp-${Object.hasOwn(stamps, value) ? value : "sail"}" aria-label="${name}邮票">${art ? `<img alt="" src="${app.art(art)}">` : `<b>${mark}</b>`}<small>${name}</small></span>`;
  }
  function viewSwitch() {
    return `<div class="pickup-switch"><button type="button" data-view="sea" aria-pressed="${pickupView === "sea"}">${app.icon("waves", 16)}海面探索</button><button type="button" data-view="list" aria-pressed="${pickupView === "list"}">${app.icon("list", 16)}列表浏览</button></div>`;
  }
  function vessel() {
    return '<svg aria-hidden="true" width="36" height="55" viewBox="0 0 36 55" fill="none" stroke-width="1.6" stroke="#446957"><g transform="rotate(15 18 28)"><path d="M14 5h9v8l-1 4c0 2 7 5 7 11v16c0 4-3 6-10 6S9 48 9 44V28c0-6 7-9 7-11l-2-4z" fill="#dae8cf"/><path d="M14 5h9v5h-9z" fill="#bd936c"/><path d="m16 29 7-4 3 16-8 3z" fill="#fff0ce"/><path d="m18 31 4-2m-3 5 4-2"/><path d="M10 44q8 4 17 0" stroke="#7ea292"/></g></svg>';
  }
  function seaLetter(letter) {
    return `<a href="#read/${encodeURIComponent(letter.id)}" class="sea-letter"><span class="sea-mail-cover"><img src="${stationery.coverUrl(letter)}" alt="" loading="lazy"><span class="bottle-shape">${vessel()}</span></span><span><small>${app.esc(letter.theme)}</small><b>${app.esc(letter.title)}</b></span></a>`;
  }
  function renderSea(view, direction = 0) {
    const { sea, rows, pages, size } = view;
    const page = Math.floor(firstLetter / size);
    const total = Math.ceil(rows.length / size);
    pages.querySelector("span").textContent = `${page + 1} / ${total}`;
    const [previous, next] = pages.querySelectorAll("button");
    const focused = document.activeElement;
    previous.disabled = page === 0;
    next.disabled = page === total - 1;
    if (focused === previous && previous.disabled && !next.disabled)
      next.focus({ preventScroll: true });
    if (focused === next && next.disabled && !previous.disabled)
      previous.focus({ preventScroll: true });

    view.finishSlide?.();
    const contents = rows
      .slice(page * size, (page + 1) * size)
      .map(seaLetter)
      .join("");
    if (!direction || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      view.grid.innerHTML = contents;
      return;
    }
    const outgoing = view.grid;
    outgoing.inert = true;
    const incoming = document.createElement("div");
    incoming.className = "pickup-bottles";
    incoming.innerHTML = contents;
    sea.append(incoming);
    view.grid = incoming;

    const options = { duration: 390, easing: "cubic-bezier(.24,.72,.24,1)", fill: "both" };
    const exit = outgoing.animate([
      { transform: "translateX(0)", opacity: 1 },
      { transform: `translateX(${-direction * 100}%)`, opacity: 0.55 },
    ], options);
    const enter = incoming.animate([
      { transform: `translateX(${direction * 100}%)`, opacity: 0.72 },
      { transform: "translateX(0)", opacity: 1 },
    ], options);
    view.finishSlide = () => {
      outgoing.remove();
      exit.cancel();
      enter.cancel();
      view.finishSlide = null;
    };
    enter.onfinish = view.finishSlide;
  }
  function fitSea() {
    if (!seaView?.sea.isConnected) {
      seaView = null;
      return;
    }
    const { sea, rows, pages, grid } = seaView;
    const style = getComputedStyle(sea);
    const columns = Number(style.getPropertyValue("--pickup-columns"));
    const row = parseFloat(style.getPropertyValue("--pickup-row"));
    const gap = parseFloat(style.getPropertyValue("--pickup-gap"));
    const inset = parseFloat(style.getPropertyValue("--pickup-inset"));
    const top = sea.getBoundingClientRect().top + window.scrollY;
    const pagerSpace =
      pages.offsetHeight + parseFloat(getComputedStyle(pages).marginTop) + 12;
    const available = document.documentElement.clientHeight - top - pagerSpace - inset * 2;
    const visibleRows = Math.min(
      Math.ceil(rows.length / columns),
      Math.max(columns === 1 ? 3 : 2, Math.floor((available + gap) / (row + gap))),
    );
    const size = columns * visibleRows;
    if (seaView.size === size && seaView.visibleRows === visibleRows) return;
    const focusedHref = grid.contains(document.activeElement)
      ? document.activeElement.getAttribute("href")
      : null;
    if (focusedHref) {
      const index = rows.findIndex(
        (letter) => "#read/" + encodeURIComponent(letter.id) === focusedHref,
      );
      if (index >= 0) firstLetter = index;
    }
    firstLetter = Math.min(firstLetter, rows.length - 1);
    seaView.size = size;
    seaView.visibleRows = visibleRows;
    sea.style.setProperty("--pickup-visible-rows", visibleRows);
    renderSea(seaView);
    if (focusedHref)
      [...grid.querySelectorAll(".sea-letter")]
        .find((link) => link.getAttribute("href") === focusedHref)
        ?.focus({ preventScroll: true });
  }
  window.addEventListener("resize", () => {
    if (!seaView || pickupResizeFrame) return;
    pickupResizeFrame = requestAnimationFrame(() => {
      pickupResizeFrame = 0;
      fitSea();
    });
  });
  function results(target, rows, card, empty) {
    seaView?.finishSlide?.();
    seaView = null;
    const count = '<span class="result-count">共 ' + rows.length + " 封公开书信</span>";
    const top = '<div class="pickup-top">' + count + viewSwitch() + "</div>";
    if (!rows.length) {
      target.innerHTML = top + empty("没有找到符合条件的来信，可以试试其他主题或关键词。");
    } else if (pickupView === "list") {
      target.innerHTML = top + '<div class="card-grid">' + rows.map(card).join("") + "</div>";
    } else {
      target.innerHTML = top + `<section class="pickup-sea" aria-label="海面上可拾取的书信"><div class="pickup-bottles"></div></section>
        <div class="sea-pages"><button type="button" class="btn compact" data-sea-page="-1">上一片海域</button><span aria-live="polite"></span><button type="button" class="btn compact" data-sea-page="1">下一片海域</button></div>`;
      seaView = {
        sea: target.querySelector(".pickup-sea"),
        grid: target.querySelector(".pickup-bottles"),
        pages: target.querySelector(".sea-pages"),
        rows,
      };
      fitSea();
    }
  }
  function sourceBody(letter) {
    return letter.body
      .split(/\n\s*\n|\n/)
      .map((line, i) => `<p id="letter-line-${i}">${app.esc(line)}</p>`)
      .join("");
  }
  function quoteInput(parent, draft) {
    if (!parent) return "";
    const choice =
      quotePicks.get(parent.id) ?? draft.quote?.text ?? draft.quoteText ?? "";
    const options = (
      parent.body.match(/[^\n。！？]+[。！？]?/gu) || [parent.body]
    ).flatMap((s) => {
      const val = s.trim();
      return val ? [Array.from(val).slice(0, 240).join("")] : [];
    });
    if (choice && parent.body.includes(choice) && !options.includes(choice))
      options.unshift(choice);
    return `<label class="field">引用原信（选填）<select name="quoteText"><option value="">回应整封信</option>${[...new Set(options)].map((s) => `<option value="${app.esc(s)}" ${choice === s ? "selected" : ""}>${app.esc(s)}</option>`).join("")}</select></label>`;
  }
  function quoteBlock(letter) {
    const q = letter.quote;
    if (!q?.text) return "";
    return `<blockquote class="reference"><small>引用的原文</small><p>${app.esc(q.text)}</p><a href="#read/${encodeURIComponent(q.sourceId)}" data-source-quote="${app.esc(q.text)}">在原信中定位</a></blockquote>`;
  }
  let sourceFind = null;
  function scrollQuote(id) {
    if (!sourceFind || sourceFind.id !== id) return;
    const text = sourceFind.text;
    sourceFind = null;
    requestAnimationFrame(() => {
      for (const p of document.querySelectorAll(".original-text p")) {
        if (!p.textContent.includes(text)) continue;
        const at = p.textContent.indexOf(text);
        const node = p.firstChild;
        if (!node || node.nodeType !== 3) continue;
        const range = document.createRange();
        range.setStart(node, at);
        range.setEnd(node, at + text.length);
        const mark = document.createElement("mark");
        range.surroundContents(mark);
        mark.scrollIntoView({ block: "center" });
        break;
      }
    });
  }
  function paperTools(draft) {
    const choices = (obj, selected, isStamp) =>
      Object.entries(obj)
        .map(
          ([k, v]) =>
            `<option value="${k}" ${selected === k ? "selected" : ""}>${isStamp ? v[1] : v}</option>`,
        )
        .join("");
    return `<div class="paper-specimen paper-${paperKey(draft.paper)}" aria-hidden="true"><span data-paper-name>${papers[paperKey(draft.paper)]}</span><i></i><div data-paper-stamp>${stamp(draft.stamp)}</div></div><div class="stationery-options"><label class="field">信纸<select name="paper">${choices(papers, draft.paper || "ivory")}</select></label><label class="field">邮票<select name="stamp">${choices(stamps, draft.stamp || "sail", true)}</select></label><button class="btn compact" type="button" data-preview>${app.icon("book", 16)}预览信笺</button></div>`;
  }
  async function preview() {
    const f = document.querySelector("#compose");
    if (!f) return;
    await stationery.ready(f);
    if (!f.isConnected) return;
    const v = f.elements;
    app.modal(
      "信笺预览",
      `<article class="paper-preview paper-${paperKey(v.paper.value)}"><img class="preview-cover" src="${app.esc(f.querySelector("#selected-art").src)}" alt="信笺封面">${stamp(v.stamp.value)}<small>${app.esc(v.theme.value)}</small><h3>${app.esc(v.title.value || "未命名书信")}</h3><div class="prose">${app.esc(v.body.value || "写下正文即可预览。")}</div><p>写信人 · ${app.esc(app.state.me.name)}</p></article>`,
    );
  }
  document.addEventListener("change", (e) => {
    if (
      !e.target.matches(
        "#compose select[name=paper],#compose select[name=stamp]",
      )
    )
      return;
    const f = e.target.form,
      key = paperKey(f.elements.paper.value),
      sample = f.querySelector(".paper-specimen");
    sample.className = "paper-specimen paper-" + key;
    sample.querySelector("[data-paper-name]").textContent = papers[key];
    sample.querySelector("[data-paper-stamp]").innerHTML = stamp(
      f.elements.stamp.value,
    );
  });
  function personal() {
    return '<div class="empty"><a class="text-link" href="#workshop">前往海上手账查看我的共创</a></div>';
  }
  function drafts() {
    const prefix = "letters-draft-" + app.state.me.id + "-";
    let stored = [];
    try {
      for (const key of Object.keys(localStorage).filter((k) =>
        k.startsWith(prefix),
      )) {
        let d;
        try {
          d = JSON.parse(localStorage.getItem(key));
        } catch {
          continue;
        }
        stored.push([key, d]);
      }
    } catch {}
    return stored.length
      ? stored
          .map(([key, d]) => {
            const id = key.slice(prefix.length);
            return `<div class="list-item"><div><small>保存在此浏览器</small><h3>${app.esc(d.title || "未命名草稿")}</h3></div><a class="text-link" href="#${id === "root" ? "write" : "relay/" + encodeURIComponent(id)}">继续写信</a></div>`;
          })
          .join("")
      : '<div class="empty">还没有保存的草稿。<br><a class="text-link" href="#write">写一封信</a></div>';
  }
  document.addEventListener("click", (e) => {
    const el = e.target.closest(
      "[data-view],[data-sea-page],[data-preview],[data-quote-relay],[data-source-quote]",
    );
    if (!el) return;
    if (el.hasAttribute("data-view")) {
      if (pickupView === el.dataset.view) return;
      pickupView = el.dataset.view;
      firstLetter = 0;
      app.updateDiscovery();
      document
        .querySelector(".pickup-switch [aria-pressed='true']")
        ?.focus({ preventScroll: true });
      return;
    }
    if (el.hasAttribute("data-sea-page")) {
      const { size, rows } = seaView;
      const direction = Number(el.dataset.seaPage);
      const nextStart = (Math.floor(firstLetter / size) + direction) * size;
      if (nextStart < 0 || nextStart >= rows.length) return;
      firstLetter = nextStart;
      renderSea(seaView, direction);
      return;
    }
    if (el.hasAttribute("data-preview")) {
      preview().catch((error) => app.notify(error.message));
      return;
    }
    if (el.hasAttribute("data-source-quote")) {
      sourceFind = {
        id: decodeURIComponent(el.hash.split("/")[1]),
        text: el.dataset.sourceQuote,
      };
      return;
    }
    const id = el.dataset.quoteRelay,
      letter = app.state.letters.find((l) => l.id === id);
    if (!letter) return;
    const selection = getSelection();
    const quote = selection?.toString().trim() || "";
    if (
      quote &&
      document
        .querySelector(".original-text")
        ?.contains(selection.anchorNode) &&
      letter.body.includes(quote)
    ) {
      quotePicks.set(id, Array.from(quote).slice(0, 240).join(""));
    } else {
      quotePicks.delete(id);
    }
    app.go("relay/" + encodeURIComponent(id));
  });
  window.season = {
    results,
    sourceBody,
    quoteInput,
    quoteBlock,
    scrollQuote,
    paperTools,
    paperKey,
    stamp,
    personal,
    drafts,
    resetPickup: () => {
      firstLetter = 0;
    },
    clearQuote: (id) => quotePicks.delete(id),
  };
})();
