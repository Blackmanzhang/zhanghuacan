/* A closed, portable drawing format. All display and PNG export share this renderer. */
(() => {
  "use strict";
  const esc = (value) => window.app.esc(String(value));
  const palette = [
    ["海松", "#355e59"],
    ["朱砂", "#ad5341"],
    ["青瓷", "#719b93"],
    ["藤黄", "#c79246"],
    ["松烟", "#363e3b"],
  ];
  const symbols = {
    moon: "圆月",
    mountain: "远山",
    boat: "帆船",
    lantern: "花灯",
    wave: "海浪",
    leaf: "桂枝",
  };
  const engrave =
    'fill="none" stroke="#f9f0d9" stroke-linecap="round" stroke-linejoin="round"';
  const motifs = {
    moon: `<circle r="40" fill="currentColor"/><circle r="36" fill="none" stroke="#f5dba7" stroke-width="1.2"/><g ${engrave} stroke-width=".65" opacity=".72"><path d="M-26,-17q13,-17 31,-14m-32,18q9,-11 19,-13m24,49q9,-5 14,-15m-10,17 8,-6"/><path d="M-36,5q9,-2 17,0t14,0m9,-17q10,-2 15,0t12,-1"/></g>`,
    mountain: `<path fill="currentColor" d="M-52,22-43,12-36,9-25,-4-17,-8-9,-20-5,-18 1,-26 7,-16 13,-13 21,-5 27,-7 37,7 45,11 53,22Z"/><g ${engrave} stroke-width=".65"><path d="m1,-24-4,14-5,3-9,16m17,-21 5,11 5,4 6,9m-27,-13-5,9-7,5m43,-11 4,5 4,3m-48,2 6,-4m-2,8 8,-4m2,-12-3,10m3,-4-3,7m13,-2 4,4m-33,-5 5,-4m56,8 3,1"/><path d="m-43,18 6,-4m27,-15-5,11m20,6 4,-1m18,1 9,2"/></g>`,
    boat: `<path fill="currentColor" d="m-48,16 19,5 49,-1 24,-8-14,15-49,2-22,-5Z"/><path fill="currentColor" d="m-5,-37 1,1 0,54-2,0Zm4,3q17,13 28,42l-26,5Zm-9,8-1,37-22,5q10,-9 23,-42Z"/><g ${engrave} stroke-width="1"><path d="m1,-26 7,24m-4,-19 9,29m-38,2 12,-25m-22,39q32,9 61,-1"/></g><path fill="none" stroke="currentColor" stroke-width="1" d="m-7,-32-29,51m32,-55 38,50M-42,32q19,2 31,0m20,1 18,-2"/>`,
    lantern: `<g fill="none" stroke="currentColor" stroke-width="2"><path d="M0,-46v15m0,57v11m-3,-1-2,8m5,-8v10m4,-9 2,7"/></g><path fill="currentColor" d="M-14,-31h28v5h-28zM-11,22h22v5h-22zM-13,-24q-22,7-16,27 3,13 16,17h26q18,-5 17,-23-1,-15-17,-21Z"/><g ${engrave} stroke-width="1.4"><path d="M-10,-22q-13,24 0,40m9,-40q-6,25 0,40m10,-40q13,23 1,40M-23,-13q20,6 46,0m-49,17q26,6 51,0"/></g>`,
    wave: `<g fill="none" stroke="currentColor" stroke-linecap="round"><path stroke-width="2.2" d="M-48,3q13,0 22,-10 10,-13 17,-7 3,4-3,7-5,2-4,-2-3,12-19,14m20,-5q13,2 24,-9 8,-9 13,-5 4,4-3,7m-7,9q19,1 32,-13"/><path stroke-width="1" d="M-47,10q13,-1 21,-7m-9,12q12,-3 18,-10m3,4q12,-1 19,-7m9,9q13,-2 22,-9m-9,11 14,-5"/></g>`,
    leaf: `<path fill="none" stroke="currentColor" stroke-width="2.2" d="M-40,32Q-12,10 30,-31m-42,37-9,-19m25,4 14,-1m-32,19 20,1"/><g fill="currentColor"><path d="M-18,7q-17,-3-16,-20 18,2 16,20m16,-16q-9,-11-7,-21 11,7 7,21m8,-6q1,-16 10,-22 4,14-10,22m-16,27q11,-9 27,-3-10,13-27,3m21,-23q13,-10 28,-8-6,13-28,8"/></g><g fill="#c5954b"><circle cx="-19" cy="-14" r="3"/><circle cx="-24" cy="-13" r="2.6"/><circle cx="-20" cy="-18" r="2.5"/><circle cx="9" cy="-20" r="3"/><circle cx="13" cy="-20" r="2.5"/></g>`,
  };
  function item(e, index) {
    const color = /^#[0-9a-f]{6}$/i.test(e.color) ? e.color : "#355e59";
    let mark = "";
    if (e.kind === "stroke" && e.points.length) {
      const points = e.points.map((p) => p.map(Number).join(",")).join(" ");
      mark =
        e.points.length === 1
          ? `<circle cx="${+e.points[0][0]}" cy="${+e.points[0][1]}" r="${e.width / 2}" fill="${color}"/>`
          : `<polyline points="${points}" stroke="${color}" stroke-width="${+e.width}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
    } else if (e.kind === "stamp" && Object.hasOwn(motifs, e.symbol)) {
      mark = `<g transform="translate(${+e.x} ${+e.y}) scale(${+e.size / 100})" color="${color}">${motifs[e.symbol]}</g>`;
    } else if (e.kind === "text") {
      mark = `<text x="${+e.x}" y="${+e.y}" font-family="SimSun, Songti SC, serif" font-size="${+e.size}" text-anchor="middle" fill="${color}">${esc(e.text)}</text>`;
    }
    return index === undefined ? mark : `<g data-mark="${index}">${mark}</g>`;
  }
  const paper =
    '<rect width="800" height="380" fill="#f5eedc"/><g fill="none" stroke="#b6a990" opacity=".47"><rect x="11" y="11" width="778" height="358"/><path d="M20 28v-8h11m738 0h11v8M20 351v9h11m738 0h11v-9"/></g>';
  function markup(layers, own = []) {
    return (
      paper +
      layers.map((l) => l.items.map((e) => item(e)).join("")).join("") +
      own.map((e, i) => item(e, i)).join("")
    );
  }
  function picture(v) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 380" width="800" height="380" role="img" aria-label="${esc(v.title || "共创画面")}">${markup(v.layers || [])}</svg>`;
  }
  function toolButton(tool, title, mark) {
    return `<button type="button" data-tool="${tool}" aria-pressed="${tool === "stroke"}"><span aria-hidden="true">${mark}</span>${title}</button>`;
  }
  function controls() {
    const stamps = Object.entries(symbols)
      .map(
        ([key, name]) =>
          `<button type="button" data-symbol="${key}" title="放置${name}" aria-label="放置${name}" aria-pressed="false"><svg viewBox="-54 -48 108 96" aria-hidden="true">${motifs[key]}</svg><span>${name}</span></button>`,
      )
      .join("");
    return `<div class="sc-desk"><div class="sc-stage"><div class="sc-tools" role="group" aria-label="画布工具">
      ${toolButton("stroke", "画笔", "✎")}${toolButton("move", "移动", "✥")}${toolButton("text", "题字", "字")}
      <div class="sc-undo"><button type="button" data-step="undo" aria-label="撤销" title="撤销" disabled>↶</button><button type="button" data-step="redo" aria-label="重做" title="重做" disabled>↷</button></div></div>
      <div class="sc-paper"><svg class="sc-canvas" viewBox="0 0 800 380" role="application" aria-label="共创画布，按方向键移动光标，回车落笔、放置或选取元素" tabindex="0"></svg></div>
      <div class="sc-footer"><span class="sc-hint" aria-live="polite">在纸上拖动画笔，或选一枚图章落印。</span><span class="sc-count"></span></div></div>
      <aside class="sc-tray"><h3>文化图章</h3><div class="sc-stamps">${stamps}</div><div class="sc-ink"><h3>墨色</h3><div class="sc-palette">${palette.map(([label, c], i) => `<button type="button" style="--pigment:${c}" data-color="${c}" aria-label="${label}" title="${label}" aria-pressed="${i === 0}"></button>`).join("")}</div></div>
      <label class="sc-setting">笔粗 <input type="range" min="1" max="20" value="5" data-pen><output>5</output></label>
      <label class="sc-setting sc-text" hidden>题字 <input type="text" data-inscription maxlength="40" aria-label="题字内容" placeholder="写一句家乡话"></label></aside></div>`;
  }
  function mount(form, draft, base) {
    const desk = form.querySelector(".sc-desk");
    const board = desk.querySelector(".sc-canvas");
    const hint = desk.querySelector(".sc-hint");
    let own = structuredClone(draft.scene || []),
      past = [],
      future = [],
      mode = "stroke",
      color = palette[0][1],
      symbol = "boat";
    let gesture = null,
      pointer = null,
      cursor = [400, 190],
      keySelection = -1,
      keyboardActive = false;
    const clone = () => structuredClone(own);
    const changed = () =>
      form.dispatchEvent(new Event("input", { bubbles: true }));
    const setHint = (text) => {
      hint.textContent = text;
    };
    const redraw = () => {
      const cross = keyboardActive
        ? `<path d="M${cursor[0] - 7} ${cursor[1]}h14m-7 -7v14" fill="none" stroke="#a94e3a" stroke-width="2" pointer-events="none"/>`
        : "";
      board.innerHTML = markup(base?.layers || [], own) + cross;
      desk.querySelector(".sc-count").textContent = own.length + " / 80 个元素";
      for (const [step, stack] of [
        ["undo", past],
        ["redo", future],
      ])
        desk.querySelector('[data-step="' + step + '"]').disabled =
          !stack.length;
    };
    const commit = (snapshot) => {
      past.push(snapshot);
      if (past.length > 25) past.shift();
      future = [];
      redraw();
      changed();
    };
    const clamp = (n, min, max) => Math.max(min, Math.min(max, Math.round(n)));
    const point = (e) => {
      const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(
        board.getScreenCTM().inverse(),
      );
      return [clamp(pt.x, 0, 800), clamp(pt.y, 0, 380)];
    };
    function reposition(original, x, y, dx, dy) {
      if (original.kind !== "stroke")
        return {
          ...original,
          x: clamp(original.x + dx, 0, 800),
          y: clamp(original.y + dy, 0, 380),
        };
      const xs = original.points.map((p) => p[0]),
        ys = original.points.map((p) => p[1]);
      dx = clamp(dx, -Math.min(...xs), 800 - Math.max(...xs));
      dy = clamp(dy, -Math.min(...ys), 380 - Math.max(...ys));
      return {
        ...original,
        points: original.points.map((p) => [p[0] + dx, p[1] + dy]),
      };
    }
    function start(pos, index) {
      const [x, y] = pos,
        before = clone();
      if (mode === "move") {
        if (!Number.isInteger(index) || !own[index]) {
          setHint("请选择自己在本版新增的笔迹、图章或题字。");
          return;
        }
        gesture = { before, index, pos };
        return;
      }
      if (own.length >= 80) {
        setHint("图层已满，可撤销或提交此版。");
        return;
      }
      if (mode === "stroke") {
        if (own.reduce((sum, e) => sum + (e.points?.length || 0), 0) >= 4800) {
          setHint("本版笔迹已满，请提交后接续。");
          return;
        }
        own.push({
          kind: "stroke",
          color,
          width: +desk.querySelector("[data-pen]").value,
          points: [pos],
        });
        gesture = { before, index: own.length - 1, pos };
        redraw();
        return;
      }
      if (mode === "stamp")
        own.push({ kind: "stamp", symbol, color, x, y, size: 132 });
      if (mode === "text") {
        const text = desk.querySelector("[data-inscription]").value.trim();
        if (!text) {
          setHint("先在题字栏写下文字，再选择纸面位置。");
          desk.querySelector("[data-inscription]").focus();
          return;
        }
        own.push({ kind: "text", color, x, y, size: 27, text });
      }
      commit(before);
    }
    function move(pos) {
      if (!gesture) return;
      const { before, index, pos: from } = gesture;
      if (mode === "stroke") {
        const line = own[index].points;
        const budget =
          4800 - before.reduce((sum, e) => sum + (e.points?.length || 0), 0);
        if (
          line.length >= Math.min(300, budget) ||
          (line.at(-1)[0] === pos[0] && line.at(-1)[1] === pos[1])
        )
          return;
        line.push(pos);
      } else if (mode === "move")
        own[index] = reposition(
          before[index],
          ...pos,
          pos[0] - from[0],
          pos[1] - from[1],
        );
      redraw();
    }
    function finish(cancel = false) {
      if (gesture) {
        const old = gesture.before;
        gesture = null;
        if (cancel) {
          own = old;
          redraw();
        } else if (JSON.stringify(old) !== JSON.stringify(own)) commit(old);
      }
      pointer = null;
    }
    function pressed(selector, value, attribute) {
      for (const b of desk.querySelectorAll(selector))
        b.setAttribute(
          "aria-pressed",
          String(b.getAttribute(attribute) === value),
        );
    }
    desk.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      if (b.dataset.step) {
        const undo = b.dataset.step === "undo",
          from = undo ? past : future,
          to = undo ? future : past;
        if (from.length) {
          to.push(clone());
          own = from.pop();
          redraw();
          changed();
        }
        return;
      }
      if (b.dataset.color) {
        color = b.dataset.color;
        pressed("[data-color]", color, "data-color");
        return;
      }
      if (b.dataset.tool || b.dataset.symbol) {
        mode = b.dataset.tool || "stamp";
        symbol = b.dataset.symbol || symbol;
        keySelection = -1;
        pressed("[data-tool]", mode, "data-tool");
        pressed("[data-symbol]", mode === "stamp" ? symbol : "", "data-symbol");
        desk.querySelector(".sc-text").hidden = mode !== "text";
        board.style.cursor = mode === "move" ? "grab" : "crosshair";
        setHint(
          {
            stamp: "在纸上点一下，落下「" + symbols[symbol] + "」图章。",
            stroke: "在纸上按住并拖动，留下笔迹。",
            move: "拖动你在本版新增的元素。",
            text: "写下题字，再点选纸面上的位置。",
          }[mode],
        );
        if (mode === "text") desk.querySelector("[data-inscription]").focus();
      }
    });
    desk.querySelector("[data-pen]").addEventListener("input", (e) => {
      desk.querySelector("output").value = e.target.value;
    });
    board.addEventListener("pointerdown", (e) => {
      if (pointer !== null || e.button !== 0) return;
      e.preventDefault();
      keyboardActive = false;
      pointer = e.pointerId;
      board.setPointerCapture(pointer);
      const node = e.target.closest("[data-mark]");
      start(point(e), node ? +node.dataset.mark : null);
    });
    board.addEventListener("pointermove", (e) => {
      if (pointer === e.pointerId) move(point(e));
    });
    board.addEventListener("pointerup", (e) => {
      if (pointer === e.pointerId) {
        move(point(e));
        finish();
      }
    });
    board.addEventListener("pointercancel", (e) => {
      if (pointer === e.pointerId) finish(true);
    });
    board.addEventListener("lostpointercapture", (e) => {
      if (pointer === e.pointerId) finish(true);
    });
    board.addEventListener("keydown", (e) => {
      if (
        pointer !== null ||
        ![
          "ArrowLeft",
          "ArrowRight",
          "ArrowUp",
          "ArrowDown",
          "Enter",
          " ",
        ].includes(e.key)
      )
        return;
      e.preventDefault();
      keyboardActive = true;
      if (e.key === "Enter" || e.key === " ") {
        if (mode === "move") {
          keySelection = (keySelection + 1) % Math.max(own.length, 1);
          setHint(
            "方向键移动第 " + (keySelection + 1) + " 个自创元素，回车切换。",
          );
        } else if (mode === "stroke" && gesture) finish();
        else start(cursor.slice(), null);
      } else {
        const step = e.shiftKey ? 20 : 5,
          dx =
            (e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0) *
            step,
          dy =
            (e.key === "ArrowDown" ? 1 : e.key === "ArrowUp" ? -1 : 0) * step;
        cursor = [clamp(cursor[0] + dx, 0, 800), clamp(cursor[1] + dy, 0, 380)];
        if (mode === "move" && own[keySelection]) {
          const before = clone();
          own[keySelection] = reposition(own[keySelection], ...cursor, dx, dy);
          commit(before);
        } else if (gesture) move(cursor);
      }
      redraw();
    });
    board.addEventListener("blur", () => {
      keyboardActive = false;
      if (pointer === null) finish();
      redraw();
    });
    form.readDrawing = clone;
    redraw();
  }
  window.studioCanvas = {
    controls,
    mount,
    picture,
    source: (v) =>
      "data:image/svg+xml;charset=utf-8," + encodeURIComponent(picture(v)),
  };
})();
