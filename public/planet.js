(() => {
  "use strict";
  const deg = Math.PI / 180;
  const geo = {
    福建泉州: [118.58, 24.88, "泉州"],
    福建厦门: [118.08, 24.48, "厦门"],
    福建福州: [119.3, 26.08, "福州"],
    广东潮州: [116.62, 23.66, "潮州"],
    福建湄洲岛: [119.14, 25.08, "湄洲岛"],
    浙江龙泉: [119.14, 28.08, "龙泉"],
    马来西亚乔治市: [100.34, 5.42, "乔治市"],
    马来西亚马六甲: [102.25, 2.2, "马六甲"],
    越南会安: [108.33, 15.88, "会安"],
    浙江宁波: [121.55, 29.87, "宁波"],
    台湾台南: [120.21, 23.0, "台南"],
    台湾台中: [120.67, 24.15, "台中"],
    台湾台北: [121.57, 25.03, "台北"],
    台湾高雄: [120.3, 22.63, "高雄"],
    马来西亚槟城: [100.3, 5.37, "槟城"],
    香港: [114.17, 22.32],
    澳门: [113.54, 22.2],
    新加坡: [103.82, 1.35],
    马来西亚: [102, 4.2],
    加拿大: [-99, 59],
    美国: [-99, 38.5],
    英国: [-2.6, 54.2],
    日本: [138, 36.5],
    法国: [2.2, 46.6],
    德国: [10.4, 51],
    澳大利亚: [134, -25],
    新西兰: [173, -41],
    印度尼西亚: [118, -4],
    泰国: [101, 15],
    菲律宾: [122, 12],
    越南: [107, 16],
    韩国: [128, 36],
    意大利: [12.6, 43],
    巴西: [-52, -12],
    大陆: [104, 35],
    台湾: [121, 23.7],
    港澳: [113.85, 22.3],
    福建: [118, 26],
    浙江: [120, 29.2],
    广东: [113.3, 23.3],
    江苏: [119.4, 32.9],
    北京: [116.4, 39.9],
    上海: [121.5, 31.2],
    天津: [117.2, 39.1],
    重庆: [107, 29.9],
    云南: [101.5, 25],
    山东: [118, 36.4],
    江西: [116, 27.6],
    吉林: [126, 43.6],
    安徽: [117.3, 31.6],
    湖北: [112.3, 31],
    湖南: [111.7, 27.6],
    河南: [113.6, 33.9],
    河北: [115.2, 38.8],
    海南: [109.8, 19.2],
    黑龙江: [127.7, 47.7],
    辽宁: [123, 41.4],
    贵州: [107, 26.9],
    四川: [103, 30.6],
    广西: [108.8, 23.8],
    青海: [96, 35.6],
    山西: [112, 37.6],
    陕西: [109, 35.5],
    甘肃: [103, 37.7],
    宁夏: [106, 37.2],
    新疆: [85.6, 41.5],
    西藏: [88.9, 31.6],
    内蒙古: [112, 43.8],
  };
  const rooms = [
    ["sounds", "数字乡音博物馆", "逐词对听，辨认故乡的声音"],
    ["workshop", "多人文化创作工坊", "在同一幅画上接续创作"],
    ["atlas", "数字文化地图", "按地点探访习俗与来信"],
    ["knowledge", "文化知识图谱", "沿一条关系发现另一种文化"],
  ];
  const vec = (lon, lat) => {
    const a = lon * deg,
      b = lat * deg;
    return [Math.cos(b) * Math.sin(a), Math.sin(b), Math.cos(b) * Math.cos(a)];
  };
  const esc = (v) => app.esc(v);
  function network() {
    const letters = app.state.letters.filter((l) => l.status === "published"),
      byId = new Map(),
      places = new Map(),
      routes = new Map();
    for (const l of letters) {
      const name = l.regionKey || l.region;
      if (!Object.hasOwn(geo, name)) continue;
      if (!places.has(name)) {
        const [lon, lat, label = name] = geo[name];
        places.set(name, {
          name,
          label,
          lon,
          lat,
          v: vec(lon, lat),
          letters: [],
        });
      }
      const place = places.get(name);
      place.letters.push(l);
      byId.set(l.id, place);
    }
    let replies = 0;
    for (const l of letters) {
      const a = byId.get(l.parentId),
        b = byId.get(l.id);
      if (!a || !b || a === b) continue;
      replies++;
      const key = a.name + "→" + b.name;
      if (!routes.has(key)) routes.set(key, [a, b]);
    }
    return {
      places: [...places.values()],
      routes: [...routes.values()],
      replies,
      total: letters.length,
    };
  }
  function view() {
    const { places, total, replies } = network();
    return `<div class="planet-shell"><section class="sky" aria-labelledby="ocean-title"><div class="sky-grid"><div class="sky-copy"><div class="sky-kicker"><i></i> 全球书信网络</div><h1 id="ocean-title">一封信，<br><em>越过山海。</em></h1><p>转动地球，拆开一封远方的来信。<br>从一个人的家乡，抵达另一个人的日常。</p><div class="sky-actions"><button data-action="random">${app.icon("mail", 18)} 随机拾信</button><a href="#write">${app.icon("pen", 16)} 寄一封信</a></div><dl class="sky-stats">${[
      [places.length, "来信地点"],
      [total, "公开书信"],
      [replies, "跨地接力"],
    ]
      .map(([v, k]) => `<div><dd>${v}</dd><dt>${k}</dt></div>`)
      .join("")}</dl></div>
 <div class="globe-stage"><div class="globe-scene" tabindex="0" role="group" aria-label="书信地球，拖动或使用方向键旋转，选择信封查看来信"><canvas aria-hidden="true"></canvas><div class="globe-pins"></div></div><div class="globe-tools"><span>拖动旋转 · 金线表示跨地接力</span><button type="button" data-spin></button></div></div></div>
 <div class="globe-post">${places.length ? `<label class="post-location" title="按信中公开的城市或地区示意定位">${app.icon("pin", 18)}<select aria-label="来信地点">${places.map((p) => `<option value="${esc(p.name)}">${esc(p.name)}</option>`).join("")}</select></label><div class="post-letter" aria-live="polite"></div><div class="post-pages"></div>` : `<a href="#discover">浏览公开来信 →</a>`}</div></section>
 <section class="culture-rooms"><div class="rooms-heading"><h2>探索文化空间</h2><a href="#gallery">浏览数字展厅 <span>↗</span></a></div><div class="room-grid">${rooms.map(([id, title, desc]) => `<a class="room-card" href="#${id}"><div class="room-art"><img src="/art/exhibit-${id}.webp" alt="" width="800" height="400"><h3>${title}</h3></div><div class="room-copy"><p>${desc}</p><span aria-hidden="true">↗</span></div></a>`).join("")}</div></section></div>`;
  }
  let dispose;
  function mount() {
    dispose?.();
    const stage = document.querySelector(".globe-scene");
    if (!stage) return;
    const { places, routes } = network(),
      placeForLetter = new Map(
        places.flatMap((p) => p.letters.map((l) => [l.id, p])),
      ),
      canvas = stage.querySelector("canvas"),
      pins = stage.querySelector(".globe-pins"),
      picker = document.querySelector(".post-location select"),
      play = document.querySelector("[data-spin]"),
      motion = matchMedia("(prefers-reduced-motion: reduce)");
    let selected = places[0],
      page = 0,
      spin = !motion.matches,
      lon = 93,
      lat = 22,
      target = null,
      drag = null,
      frame = 0,
      last = 0,
      elapsed = 0,
      dirty = true,
      onscreen = true,
      active = false;
    const labels = places.map((p, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "globe-pin";
      b.innerHTML = app.icon("mail", 13) + `<span>${esc(p.label)}</span>`;
      b.setAttribute("aria-label", `查看${p.name}来信`);
      pins.append(b);
      b.onclick = () => choose(i, true);
      return b;
    });
    const ctx = canvas.getContext("2d"),
      bound = (n, lo, hi) => Math.min(Math.max(n, lo), hi);
    let w = 1,
      h = 1,
      r = 1,
      cx = 0,
      cy = 0,
      ay,
      by,
      ap,
      bp;
    function project(v, height = 1) {
      const side = v[0] * ay - v[2] * by,
        depth = v[2] * ay + v[0] * by,
        up = v[1] * ap - depth * bp,
        z = v[1] * bp + depth * ap;
      return [cx + side * r * height, cy - up * r * height, z];
    }
    function setSpin(enabled) {
      spin = enabled;
      play.textContent = spin ? "Ⅱ  暂停自转" : "▷  开启自转";
      play.setAttribute("aria-pressed", String(spin));
      invalidate();
    }
    function preview() {
      if (!selected) return;
      const l = selected.letters[page],
        url = "#read/" + encodeURIComponent(l.id);
      picker.value = selected.name;
      const neighbors = new Map();
      const parent = placeForLetter.get(l.parentId);
      if (parent && parent !== selected) neighbors.set(parent, l.parentId);
      for (const p of places) {
        const reply = p.letters.find((other) => other.parentId === l.id);
        if (p !== selected && reply && !neighbors.has(p))
          neighbors.set(p, reply.id);
      }
      const connections = [...neighbors]
        .slice(0, 2)
        .map(
          ([p, id]) =>
            `<button type="button" data-globe-related="${places.indexOf(p)}" data-related-id="${esc(id)}" aria-label="查看${esc(p.name)}的接力来信">${esc(p.label)} ↗</button>`,
        )
        .join("");
      document.querySelector(".post-letter").innerHTML =
        `<a href="${url}"><span>${esc(l.title)}</span><small>${esc(l.author)} 寄出${l.demo ? " · 示例" : ""}</small></a>${connections ? `<div class="post-connections"><small>关联接力</small>${connections}</div>` : ""}`;
      document
        .querySelectorAll("[data-globe-related]")
        .forEach(
          (b) =>
            (b.onclick = () =>
              choose(
                Number(b.dataset.globeRelated),
                true,
                b.dataset.relatedId,
              )),
        );
      document.querySelector(".post-pages").innerHTML =
        `${selected.letters.length > 1 ? `<button data-next-post title="切换这个地点的来信" aria-label="切换这个地点的来信">${page + 1} / ${selected.letters.length} ›</button>` : ""}<a href="${url}">拆开来信 <span>↗</span></a>`;
      const next = document.querySelector("[data-next-post]");
      if (next)
        next.onclick = () => {
          page = (page + 1) % selected.letters.length;
          preview();
        };
    }
    function choose(i, aim, letterId) {
      selected = places[i];
      page = Math.max(
        0,
        selected.letters.findIndex((l) => l.id === letterId),
      );
      setSpin(false);
      if (aim) {
        target = [selected.lon, selected.lat];
        if (motion.matches) {
          [lon, lat] = target;
          target = null;
        }
      }
      preview();
      invalidate();
    }
    if (picker) picker.onchange = () => choose(picker.selectedIndex, true);
    setSpin(spin);
    preview();
    if (!ctx) {
      stage.classList.add("globe-fallback");
      stage.removeAttribute("tabindex");
      stage.setAttribute("aria-label", "选择来信地点");
      stage.nextElementSibling.hidden = true;
      return;
    }
    active = true;
    play.onclick = () => {
      target = null;
      setSpin(!spin);
    };
    stage.onpointerdown = (e) => {
      if (e.target.closest("button") || e.button !== 0) return;
      target = null;
      setSpin(false);
      drag = [e.clientX, e.clientY, lon, lat];
      stage.setPointerCapture(e.pointerId);
      stage.classList.add("dragging");
    };
    stage.onpointermove = (e) => {
      if (!drag) return;
      lon = drag[2] - ((e.clientX - drag[0]) * 62) / r;
      lat = bound(drag[3] + ((e.clientY - drag[1]) * 57) / r, -76, 76);
      invalidate();
    };
    stage.onpointerup = stage.onpointercancel = () => {
      drag = null;
      stage.classList.remove("dragging");
    };
    stage.onkeydown = (e) => {
      const delta = {
        ArrowLeft: [-12, 0],
        ArrowRight: [12, 0],
        ArrowUp: [0, 9],
        ArrowDown: [0, -9],
      }[e.key];
      if (!delta) return;
      e.preventDefault();
      setSpin(false);
      target = null;
      lon += delta[0];
      lat = bound(lat + delta[1], -76, 76);
      invalidate();
    };

    const dots = land(),
      grids = [],
      flights = routes.map(([a, b]) => flight(a.v, b.v));
    for (let b = -75; b <= 75; b += 15)
      grids.push(Array.from({ length: 121 }, (_, i) => vec(i * 3, b)));
    for (let a = 0; a < 360; a += 15)
      grids.push(Array.from({ length: 61 }, (_, i) => vec(a, -90 + i * 3)));
    function resize() {
      w = stage.clientWidth;
      h = stage.clientHeight;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      if (
        canvas.width === Math.round(w * dpr) &&
        canvas.height === Math.round(h * dpr)
      )
        return;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      r = Math.min(w * 0.326, h * 0.404);
      cx = w * 0.51;
      cy = h * 0.49;
      invalidate();
    }
    const ro = new ResizeObserver(resize);
    ro.observe(stage);
    resize();
    const circle = (x, y, s, fill) => {
      ctx.beginPath();
      ctx.arc(x, y, s, 0, 2 * Math.PI);
      ctx.fillStyle = fill;
      ctx.fill();
    };
    function draw() {
      ay = Math.cos(lon * deg);
      by = Math.sin(lon * deg);
      ap = Math.cos(lat * deg);
      bp = Math.sin(lat * deg);
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < 88; i++) {
        const x = ((i * 0.618034 + 0.17) % 1) * w,
          y = ((i * i * 0.07137 + 0.04) % 1) * h;
        circle(
          x,
          y,
          i % 8 === 1 ? 1.25 : 0.7,
          i % 4 === 1 ? "#759c9a99" : "#789bad55",
        );
      }
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-0.26);
      ctx.strokeStyle = "#6daba949";
      ctx.lineWidth = 0.8;
      ctx.setLineDash([2, 6]);
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 1.39, r * 0.66, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
      let glow = ctx.createRadialGradient(cx, cy, r * 0.88, cx, cy, r * 1.27);
      glow.addColorStop(0, "#4dc9bc18");
      glow.addColorStop(0.45, "#489d9c22");
      glow.addColorStop(1, "#33958c00");
      circle(cx, cy, r * 1.27, glow);
      const ocean = ctx.createRadialGradient(
        cx - r * 0.49,
        cy - r * 0.5,
        0,
        cx + r * 0.19,
        cy + r * 0.23,
        r * 1.25,
      );
      ocean.addColorStop(0, "#265f62");
      ocean.addColorStop(0.48, "#113e48");
      ocean.addColorStop(0.85, "#0a2937");
      ocean.addColorStop(1, "#22606b");
      circle(cx, cy, r, ocean);
      ctx.beginPath();
      for (const line of grids) {
        let visible = false;
        for (const v of line) {
          const [x, y, z] = project(v);
          if (z > 0) {
            if (visible) ctx.lineTo(x, y);
            else ctx.moveTo(x, y);
          }
          visible = z > 0;
        }
      }
      ctx.strokeStyle = "#93d2c02f";
      ctx.lineWidth = 0.65;
      ctx.stroke();
      const palettes = ["#579e9d", "#69b2ac", "#80c9bd", "#a0dbc8", "#b2e3d4"],
        batches = palettes.map(() => new Path2D());
      for (const v of dots) {
        const [x, y, z] = project(v);
        if (z < 0.005) continue;
        const size = Math.max(0.52, r * 0.00625 * (0.67 + 0.33 * z));
        const batch =
          batches[
            Math.min(4, Math.floor((z * 0.65 + (0.5 + v[1] * 0.5) * 0.35) * 5))
          ];
        batch.moveTo(x + size, y);
        batch.arc(x, y, size, 0, Math.PI * 2);
      }
      batches.forEach((b, i) => {
        ctx.fillStyle = palettes[i];
        ctx.fill(b);
      });
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = "#96dcd4aa";
      ctx.lineWidth = 1;
      ctx.stroke();
      flights.forEach((line, i) => {
        ctx.beginPath();
        let prev = false;
        const pts = line.map(([v, a]) => project(v, a));
        pts.forEach(([x, y, z]) => {
          const show = z > 0 || Math.hypot(x - cx, y - cy) > r;
          if (show) {
            if (prev) ctx.lineTo(x, y);
            else ctx.moveTo(x, y);
          }
          prev = show;
        });
        ctx.strokeStyle = "#eebf6dc4";
        ctx.lineWidth = 1.55;
        ctx.shadowBlur = 5;
        ctx.shadowColor = "#e5a04f";
        ctx.stroke();
        const [x, y, z] =
          pts[
            Math.floor(((elapsed * 0.00013 + i * 0.293) % 1) * (pts.length - 1))
          ];
        if (z > 0 || Math.hypot(x - cx, y - cy) > r) {
          if (i === 0 || i % 3 === 1) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(-0.22);
            ctx.fillStyle = "#ffe5ac";
            ctx.fillRect(-5, -3.5, 10, 7);
            ctx.strokeStyle = "#855f34";
            ctx.lineWidth = 0.85;
            ctx.beginPath();
            ctx.moveTo(-5, -3.5);
            ctx.lineTo(0, 0.4);
            ctx.lineTo(5, -3.5);
            ctx.stroke();
            ctx.restore();
          } else circle(x, y, 2.3, "#fff7c3");
        }
        ctx.shadowBlur = 0;
      });
      const used = [];
      const positions = places.map((p) => project(p.v));
      const order = places
        .map((p, i) => i)
        .sort(
          (a, b) =>
            (places[b] === selected) - (places[a] === selected) ||
            places[b].letters.length - places[a].letters.length,
        );
      for (const i of order) {
        const [x, y, z] = positions[i],
          p = places[i],
          b = labels[i];
        b.hidden = z < 0.07;
        if (b.hidden) continue;
        circle(x, y, 4, "#dba96577");
        circle(x, y, 1.8, "#ffe4a6");
        const bw = b.offsetWidth || 60,
          bh = 24;
        const side = x < cx - 8 ? -1 : 1;
        const offsets = [
          [side * 25, -25],
          [side * 43, 12],
          [side * 25, -57],
          [side * 30, 45],
          [-side * 37, -28],
          [-side * 35, 14],
          [-side * 30, 44],
          [-side * 30, -58],
          [side * 47, 76],
          [-side * 32, 78],
        ];
        let box;
        for (const [dx, dy] of offsets) {
          const left = bound(dx > 0 ? x + dx : x + dx - bw, 3, w - bw - 3),
            top = bound(y + dy, 5, h - bh - 30);
          if (
            used.every(
              (q) =>
                left + bw + 4 < q[0] ||
                left > q[0] + q[2] + 4 ||
                top + bh + 3 < q[1] ||
                top > q[1] + bh + 3,
            )
          ) {
            box = [left, top, bw];
            break;
          }
        }
        if (!box) {
          b.hidden = true;
          continue;
        }
        used.push(box);
        b.classList.toggle("current", p === selected);
        b.style.transform = `translate(${box[0].toFixed(1)}px,${box[1].toFixed(1)}px)`;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(bound(x, box[0] + 2, box[0] + bw - 2), box[1] + bh / 2);
        ctx.strokeStyle = p === selected ? "#f5c67fc9" : "#a2c9c67a";
        ctx.lineWidth = 0.7;
        ctx.stroke();
      }
    }
    function invalidate() {
      dirty = true;
      if (active && onscreen && !document.hidden && !frame)
        frame = requestAnimationFrame(tick);
    }
    function tick(time) {
      frame = 0;
      if (!stage.isConnected) {
        dispose?.();
        return;
      }
      if (!last || time - last > 32) {
        const dt = Math.min(64, time - last || 0);
        last = time;
        if (target) {
          const dx = ((((target[0] - lon + 540) % 360) + 360) % 360) - 180,
            dy = target[1] - lat;
          const t = 1 - Math.exp(-dt * 0.008);
          lon += dx * t;
          lat += dy * t;
          dirty = true;
          if (Math.abs(dx) + Math.abs(dy) < 0.16) {
            lon = target[0];
            lat = target[1];
            target = null;
          }
        }
        if (spin) {
          lon = (lon + dt * 0.00165) % 360;
          elapsed += dt;
          dirty = true;
        }
        if (dirty) {
          draw();
          dirty = false;
        }
      }
      if (spin || target || dirty) frame = requestAnimationFrame(tick);
    }
    function visibility() {
      cancelAnimationFrame(frame);
      frame = 0;
      last = 0;
      invalidate();
    }
    function preference() {
      if (motion.matches) setSpin(false);
    }
    const viewport = new IntersectionObserver((entries) => {
      onscreen = entries[0].isIntersecting;
      visibility();
    });
    viewport.observe(stage);
    document.addEventListener("visibilitychange", visibility);
    motion.addEventListener("change", preference);
    visibility();
    dispose = () => {
      cancelAnimationFrame(frame);
      active = false;
      viewport.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      motion.removeEventListener("change", preference);
      dispose = null;
    };
  }
  let sampled;
  function land() {
    if (!sampled) {
      const bytes = Uint8Array.from(atob(window.earthLandPoints), (c) =>
          c.charCodeAt(0),
        ),
        data = new DataView(bytes.buffer);
      sampled = [];
      for (let i = 0; i < bytes.length; i += 4)
        sampled.push(
          vec(data.getInt16(i, true) / 100, data.getInt16(i + 2, true) / 100),
        );
    }
    return sampled;
  }
  function flight(a, b) {
    const angle = Math.acos(
      Math.max(
        -1,
        Math.min(
          1,
          a.reduce((s, x, i) => s + x * b[i], 0),
        ),
      ),
    );
    return Array.from({ length: 73 }, (_, i) => {
      const t = i / 72,
        den = Math.sin(angle) || 1;
      return [
        a.map(
          (v, j) =>
            (v * Math.sin((1 - t) * angle) + b[j] * Math.sin(t * angle)) / den,
        ),
        1 + Math.min(0.34, 0.1 + angle * 0.12) * Math.sin(Math.PI * t),
      ];
    });
  }
  window.letterPlanet = { view, mount, unmount: () => dispose?.() };
})();
