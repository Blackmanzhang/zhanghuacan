/* A shallow water surface responding to the path of the mouse. */
(() => {
  "use strict";

  const canvas = document.querySelector("#site-water");
  const context = canvas.getContext("2d");
  if (!context) return;

  const frame = canvas.parentElement;
  const allowsWater = matchMedia(
    "(any-hover: hover) and (any-pointer: fine) and (prefers-reduced-motion: no-preference)",
  );
  const stepTime = 1000 / 60;
  const settleTime = 1750;
  const fadeStart = 850;
  const brushWidth = 5.15;
  const brushHeight = 4.05;
  const brushSpacing = 2.6;

  let water;
  let lastPoint;
  let distanceToSample = 0;
  let lastStroke = 0;
  let lastFrame = 0;
  let accumulator = 0;
  let animation = 0;

  function makeSurface(bounds) {
    // Simulate on a coarse grid and let the browser interpolate the reflections.
    const cell = Math.max(4, bounds.width / 420, bounds.height / 240);
    const width = Math.max(3, Math.ceil(bounds.width / cell));
    const height = Math.max(3, Math.ceil(bounds.height / cell));
    const light = new Float32Array(width * height);
    const damping = new Float32Array(light.length);

    for (let row = 0; row < height; row++) {
      const y = row / (height - 1);
      for (let column = 0; column < width; column++) {
        const x = column / (width - 1);
        const index = row * width + column;
        const sky = Math.exp(-((x - 0.72) ** 2 * 9 + (y - 0.24) ** 2 * 7));
        const shore = Math.exp(-((x * 2.8) ** 2 + ((y - 0.55) * 2.1) ** 2));
        const reflection =
          Math.sin(row * 0.25 + Math.sin(column * 0.049 + row * 0.032) * 2) +
          0.45 * Math.sin(row * 0.58 + Math.sin(column * 0.031 - row * 0.02) * 2.4);
        light[index] = 0.1 + 0.53 * sky + 0.24 * shore + reflection * (0.017 + sky * 0.037);

        // Absorb outgoing waves at the viewport edges.
        const edge = Math.min(column, row, width - 1 - column, height - 1 - row);
        damping[index] = 0.74 + 0.222 * Math.min(1, edge / 9);
      }
    }

    canvas.width = width;
    canvas.height = height;
    return {
      bounds,
      width,
      height,
      light,
      damping,
      image: context.createImageData(width, height),
      current: new Float32Array(light.length),
      previous: new Float32Array(light.length),
    };
  }

  function advance() {
    const { current, previous, damping, width, height } = water;
    for (let row = 1; row < height - 1; row++) {
      const end = (row + 1) * width - 1;
      for (let i = row * width + 1; i < end; i++) {
        const level = current[i];
        const across = current[i - 1] + current[i + 1] - 2 * level;
        const down = current[i - width] + current[i + width] - 2 * level;
        const velocity = level - previous[i];
        previous[i] = level + (velocity + 0.29 * across + 0.16 * down) * damping[i];
      }
    }
    water.current = previous;
    water.previous = current;
  }

  function refractedLight(light, width, height, x, y) {
    const u = Math.max(0, Math.min(width - 1.001, x));
    const v = Math.max(0, Math.min(height - 1.001, y));
    const column = Math.floor(u);
    const row = Math.floor(v);
    const index = row * width + column;
    const top = light[index] + (light[index + 1] - light[index]) * (u - column);
    const bottom =
      light[index + width] + (light[index + width + 1] - light[index + width]) * (u - column);
    return top + (bottom - top) * (v - row);
  }

  function paint(visibility) {
    const { width, height, current, light, image } = water;
    const { data } = image;
    for (let row = 0; row < height; row++) {
      for (let column = 0; column < width; column++) {
        const index = row * width + column;
        let tone = light[index];
        let highlight = 0;
        if (visibility && row > 1 && row < height - 2 && column > 1 && column < width - 2) {
          // A broader slope sample softens the light on each side of the crest.
          const xSlope = visibility * (
            0.25 * (current[index - 1] - current[index + 1]) +
            0.125 * (current[index - 2] - current[index + 2])
          );
          const ySlope = visibility * (
            0.25 * (current[index - width] - current[index + width]) +
            0.125 * (current[index - 2 * width] - current[index + 2 * width])
          );
          if (Math.abs(xSlope) + Math.abs(ySlope) > 0.0005) {
            tone = refractedLight(light, width, height, column + 11 * xSlope, row + 14 * ySlope);
            const tilt = 0.36 * xSlope - 0.9 * ySlope;
            const reflection = (58 + 23 * tone) * tilt / (1 + 2 * Math.abs(tilt));
            highlight = reflection >= 0 ? reflection : reflection * 0.55;
          }
        }
        const offset = index * 4;
        data[offset] = 7 + 19 * tone + 0.65 * highlight;
        data[offset + 1] = 25 + 42 * tone + highlight;
        data[offset + 2] = 35 + 47 * tone + 0.93 * highlight;
        data[offset + 3] = 255;
      }
    }
    context.putImageData(image, 0, 0);
  }

  function stirAt(clientX, clientY, strength) {
    const { bounds, previous, width, height } = water;
    const x = clientX * width / bounds.width;
    const y = clientY * height / bounds.height;
    const left = Math.max(1, Math.floor(x - brushWidth));
    const right = Math.min(width - 2, Math.ceil(x + brushWidth));
    const top = Math.max(1, Math.floor(y - brushHeight));
    const bottom = Math.min(height - 2, Math.ceil(y + brushHeight));

    for (let row = top; row <= bottom; row++) {
      const dy = (row - y) / brushHeight;
      for (let column = left; column <= right; column++) {
        const dx = (column - x) / brushWidth;
        const distance = dx * dx + dy * dy;
        if (distance < 1) {
          const pressure = (1 - distance) ** 2 * (2.8 * distance - 0.7);
          previous[row * width + column] -= strength * pressure;
        }
      }
    }
  }

  function reset() {
    cancelAnimationFrame(animation);
    animation = 0;
    accumulator = 0;
    endStroke();
    if (water) {
      water.current.fill(0);
      water.previous.fill(0);
    }
  }

  function resize() {
    if (canvas.hidden) return;
    const bounds = canvas.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    reset();
    water = makeSurface(bounds);
    paint(0);
  }

  function updateSurface() {
    if (!allowsWater.matches) {
      canvas.hidden = true;
      reset();
      water = undefined;
    } else if (canvas.hidden) {
      canvas.hidden = false;
      resize();
    }
  }

  function animate(now) {
    const quiet = now - lastStroke;
    if (quiet >= settleTime) {
      reset();
      paint(0);
      return;
    }

    accumulator += Math.min(3 * stepTime, now - lastFrame);
    lastFrame = now;
    if (accumulator >= stepTime) {
      do {
        advance();
        accumulator -= stepTime;
      } while (accumulator >= stepTime);

      const fade = Math.min(1, (settleTime - quiet) / (settleTime - fadeStart));
      paint(fade * fade * (3 - 2 * fade));
    }
    animation = requestAnimationFrame(animate);
  }

  function move(event) {
    if (!water || document.hidden || event.pointerType !== "mouse" || event.buttons) {
      endStroke();
      return;
    }

    const { bounds } = water;
    const now = performance.now();
    const point = { x: event.clientX - bounds.left, y: event.clientY - bounds.top, time: now };
    if (point.x < 0 || point.y < 0 || point.x >= bounds.width || point.y >= bounds.height) {
      endStroke();
      return;
    }
    if (!lastPoint || now - lastPoint.time > 180) {
      distanceToSample = 0;
      lastPoint = point;
      return;
    }
    const dx = point.x - lastPoint.x;
    const dy = point.y - lastPoint.y;
    const distance = Math.hypot(dx, dy);
    if (distance < 1.5) return;

    const speed = distance / Math.max(8, now - lastPoint.time);
    const strength = 0.24 + 0.31 * Math.min(1, Math.sqrt(speed / 1.35));
    // Carry the sampling distance across pointer events for a continuous stroke.
    let offset = distanceToSample;
    for (; offset <= distance; offset += brushSpacing) {
      const t = offset / distance;
      stirAt(lastPoint.x + t * dx, lastPoint.y + t * dy, strength);
    }
    distanceToSample = offset - distance;
    lastPoint = point;
    lastStroke = now;
    if (!animation) {
      lastFrame = now - stepTime;
      animation = requestAnimationFrame(animate);
    }
  }

  function endStroke() {
    lastPoint = undefined;
    distanceToSample = 0;
  }

  frame.addEventListener("pointermove", move, { passive: true });
  frame.addEventListener("pointerleave", endStroke);
  frame.addEventListener("pointerdown", endStroke, { passive: true });
  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", () => {
    reset();
    if (water) paint(0);
  });
  allowsWater.addEventListener("change", updateSurface);
  updateSurface();
})();
