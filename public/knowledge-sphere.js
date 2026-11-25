/* Project the knowledge graph onto a sphere using the same yaw and tilt as the letter globe. */
(() => {
  "use strict";

  const turn = 2 * Math.PI;
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const directions = {
    ArrowLeft: [-0.18, 0],
    ArrowRight: [0.18, 0],
    ArrowUp: [0, 0.18],
    ArrowDown: [0, -0.18],
  };

  function vector(longitude, latitude) {
    const ring = Math.cos(latitude);
    return [Math.sin(longitude) * ring, Math.sin(latitude), Math.cos(longitude) * ring];
  }

  function surfaceArc(a, b) {
    const dot = a.reduce((sum, value, index) => sum + value * b[index], 0);
    const angle = Math.acos(Math.max(-1, Math.min(1, dot)));
    const sine = Math.sin(angle);
    if (angle < 1e-6) return [a, b];
    let tangent;
    if (sine > 1e-6) {
      tangent = b.map((value, index) => (value - a[index] * dot) / sine);
    } else {
      const normal = Math.abs(a[0]) < 0.8 ? [0, a[2], -a[1]] : [a[2], 0, -a[0]];
      const length = Math.hypot(...normal);
      tangent = normal.map((value) => value / length);
    }
    const steps = Math.max(8, Math.ceil(angle * 24));
    const points = Array.from({ length: steps }, (_, index) => {
      const phase = angle * index / steps;
      return a.map((value, axis) => value * Math.cos(phase) + tangent[axis] * Math.sin(phase));
    });
    points.push(b);
    return points;
  }

  function traceSurface(context, points, front) {
    for (let i = 1; i < points.length; i++) {
      let a = points[i - 1], b = points[i];
      const aVisible = (a.depth >= 0) === front;
      const bVisible = (b.depth >= 0) === front;
      if (!aVisible && !bVisible) continue;
      if (aVisible !== bVisible) {
        const fraction = a.depth / (a.depth - b.depth);
        const boundary = { x: a.x + (b.x - a.x) * fraction, y: a.y + (b.y - a.y) * fraction };
        if (!aVisible) a = boundary;
        else b = boundary;
      }
      context.moveTo(a.x, a.y);
      context.lineTo(b.x, b.y);
    }
  }

  const grid = [];
  for (let lane = 1; lane < 6; lane++) {
    const latitude = lane * Math.PI / 6 - Math.PI / 2;
    grid.push(Array.from({ length: 73 }, (_, i) => vector(i * turn / 72, latitude)));
  }
  for (let lane = 0; lane < 12; lane++) {
    const longitude = lane * turn / 12;
    grid.push(Array.from({ length: 37 }, (_, i) => vector(longitude, i * Math.PI / 36 - Math.PI / 2)));
  }

  window.mountKnowledgeSphere = function (stage, relations, previous) {
    const canvas = stage.querySelector("canvas");
    const context = canvas.getContext("2d");
    const center = stage.parentElement.querySelector("[data-kg-center]");
    if (!context) {
      stage.classList.add("kg-sphere-fallback");
      stage.removeAttribute("tabindex");
      center.hidden = true;
      return;
    }

    const anchors = [...stage.querySelectorAll("[data-kg-node]")];
    const nodes = new Map(anchors.map((anchor, index) => {
      const latitude = Math.asin(1 - 2 * (index + 0.5) / anchors.length);
      const longitude = index * goldenAngle;
      const point = vector(longitude, latitude);
      return [anchor.dataset.kgNode, { anchor, point, longitude, latitude }];
    }));
    const selected = stage.querySelector("[aria-current]").dataset.kgNode;
    const focus = nodes.get(selected);
    const routes = relations.map(([a, b]) => ({
      a,
      b,
      points: surfaceArc(nodes.get(a).point, nodes.get(b).point),
      highlighted: a === selected || b === selected,
    }));
    const nearby = new Set(routes.filter((edge) => edge.highlighted).flatMap(({ a, b }) => [a, b]));
    let yaw = previous?.yaw ?? focus.longitude;
    let pitch = previous?.pitch ?? focus.latitude;
    let width = 0, height = 0, radius = 1;
    let light;
    let pending = 0;
    let pointer;

    function projector() {
      const a = Math.cos(yaw), b = Math.sin(yaw);
      const c = Math.cos(pitch), d = Math.sin(pitch);
      return ([x, y, z]) => {
        const depth = z * a + x * b;
        return {
          x: width / 2 + radius * (x * a - z * b),
          y: height / 2 - radius * (y * c - depth * d),
          depth: y * d + depth * c,
        };
      };
    }

    if (projector()(focus.point).depth < 0.1) {
      yaw = focus.longitude;
      pitch = focus.latitude;
    }

    function draw() {
      pending = 0;
      const project = projector();
      const points = new Map([...nodes].map(([id, node]) => [id, project(node.point)]));
      context.clearRect(0, 0, width, height);
      context.beginPath();
      context.arc(width / 2, height / 2, radius, 0, turn);
      context.fillStyle = light;
      context.fill();
      context.strokeStyle = "#9edbd086";
      context.lineWidth = 1;
      context.stroke();

      for (const front of [false, true]) {
        context.beginPath();
        for (const line of grid) {
          let last = project(line[0]);
          for (let i = 1; i < line.length; i++) {
            const next = project(line[i]);
            if ((last.depth + next.depth >= 0) === front) {
              context.moveTo(last.x, last.y);
              context.lineTo(next.x, next.y);
            }
            last = next;
          }
        }
        context.strokeStyle = front ? "#83c8bf42" : "#83c8bf14";
        context.stroke();
      }

      const projectedRoutes = routes.map((edge) => ({ ...edge, points: edge.points.map(project) }));
      for (const front of [false, true]) {
        for (const highlighted of [false, true]) {
          context.beginPath();
          for (const edge of projectedRoutes) {
            if (edge.highlighted === highlighted) traceSurface(context, edge.points, front);
          }
          context.lineWidth = highlighted ? 1.8 : 1;
          context.strokeStyle = highlighted ? "#efca88" : "#78babc";
          context.globalAlpha = front ? (highlighted ? 0.92 : 0.48) : (highlighted ? 0.24 : 0.10);
          context.stroke();
        }
      }
      context.globalAlpha = 1;

      const labels = [];
      const ranked = [...points].sort(([a, p], [b, q]) =>
        Number(b === selected) - Number(a === selected) ||
        Number(nearby.has(b)) - Number(nearby.has(a)) ||
        q.depth - p.depth,
      );
      for (const [id, point] of ranked) {
        const { anchor } = nodes.get(id);
        const { x, y, depth } = point;
        const visible = depth >= 0 || anchor === document.activeElement;
        anchor.hidden = !visible;
        if (!visible) {
          context.beginPath();
          context.arc(x, y, 2, 0, turn);
          context.fillStyle = "#8dd7cb48";
          context.fill();
          continue;
        }
        const labelX = Math.min(width - 50, Math.max(50, x));
        const showLabel = id === selected ||
          ((nearby.has(id) || depth > 0.68) && !labels.some(
            (other) => Math.abs(other.x - labelX) < 73 && Math.abs(other.y - y) < 31,
          ));
        if (showLabel) labels.push({ x: labelX, y });
        anchor.toggleAttribute("data-kg-label", showLabel);
        anchor.style.setProperty("--kg-label-shift", (labelX - x) + "px");
        anchor.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
        anchor.style.setProperty(
          "--kg-depth-layer",
          id === selected ? 110 : Math.round(10 + Math.max(0, depth) * 85),
        );
      }
    }

    function invalidate() {
      if (!pending) pending = requestAnimationFrame(draw);
    }
    function resize() {
      width = stage.clientWidth;
      height = stage.clientHeight;
      radius = Math.max(1, Math.min(width * 0.4, height * 0.4));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      light = context.createRadialGradient(
        width / 2 - radius * 0.33, height / 2 - radius * 0.38, radius * 0.06,
        width / 2, height / 2, radius,
      );
      light.addColorStop(0, "#498e8960");
      light.addColorStop(0.68, "#1d575b5c");
      light.addColorStop(1, "#0a202c81");
      invalidate();
    }

    const observer = new ResizeObserver(resize);
    observer.observe(stage);
    resize();
    center.onclick = () => {
      yaw = focus.longitude;
      pitch = focus.latitude;
      invalidate();
    };
    stage.onpointerdown = (event) => {
      if (event.button !== 0 || !event.isPrimary) return;
      pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, yaw, pitch, dragging: false };
    };
    stage.onpointermove = (event) => {
      if (pointer?.id !== event.pointerId) return;
      const dx = event.clientX - pointer.x, dy = event.clientY - pointer.y;
      if (!pointer.dragging) {
        if (Math.hypot(dx, dy) < 5) return;
        pointer.dragging = true;
        stage.setPointerCapture(event.pointerId);
        stage.classList.add("is-dragging");
      }
      yaw = (pointer.yaw - dx / radius) % turn;
      pitch = (pointer.pitch + dy / radius) % turn;
      invalidate();
    };
    function endDrag(event) {
      if (pointer?.id !== event.pointerId) return;
      pointer = undefined;
      stage.classList.remove("is-dragging");
    }
    stage.onpointerup = stage.onpointercancel = stage.onlostpointercapture = endDrag;
    stage.onpointerleave = (event) => {
      if (!pointer?.dragging) endDrag(event);
    };
    stage.ondragstart = (event) => event.preventDefault();
    stage.onkeydown = (event) => {
      const delta = directions[event.key];
      if (!delta || event.altKey || event.ctrlKey || event.metaKey) return;
      event.preventDefault();
      yaw = (yaw + delta[0]) % turn;
      pitch = (pitch + delta[1]) % turn;
      invalidate();
    };
    stage.onfocusout = invalidate;
    if (previous?.focusInGraph) stage.focus({ preventScroll: true });

    return () => {
      observer.disconnect();
      cancelAnimationFrame(pending);
      return { yaw, pitch, focusInGraph: stage.contains(document.activeElement) };
    };
  };
})();
