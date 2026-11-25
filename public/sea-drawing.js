/* World coordinates and the same brush renderer for editing, viewing, and export. */
(() => {
  "use strict";
  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
  const brushes = { pencil:"铅笔", ink:"钢笔", marker:"马克笔", brush:"毛笔", watercolor:"水彩", spray:"喷枪" };
  const shapes = { line:"直线", rect:"矩形", ellipse:"椭圆", polygon:"自由多边形" };
  const padding = (item) => item.size * (item.tool === "spray" ? 1.4 : 0.65) + 2;
  const cachedBounds = new WeakMap();

  function boundsOf(item) {
    if (cachedBounds.has(item)) return cachedBounds.get(item);
    const box = {left:Infinity, top:Infinity, right:-Infinity, bottom:-Infinity};
    for (const [x,y] of item.points) {
      box.left = Math.min(box.left, x);
      box.top = Math.min(box.top, y);
      box.right = Math.max(box.right, x);
      box.bottom = Math.max(box.bottom, y);
    }
    const pad = padding(item);
    const bounds = {left:box.left-pad, top:box.top-pad, right:box.right+pad, bottom:box.bottom+pad};
    cachedBounds.set(item, bounds);
    return bounds;
  }

  function drawingBounds(layers) {
    const box = {left:Infinity, top:Infinity, right:-Infinity, bottom:-Infinity};
    for (const layer of layers) {
      if (!layer.visible) continue;
      for (const item of layer.items) {
        if (item.tool === "eraser") continue;
        const edge = boundsOf(item);
        box.left = Math.min(box.left, edge.left);
        box.top = Math.min(box.top, edge.top);
        box.right = Math.max(box.right, edge.right);
        box.bottom = Math.max(box.bottom, edge.bottom);
      }
    }
    return Number.isFinite(box.left) ? box : null;
  }

  function dot(ctx, x, y, radius) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawShape(ctx, item) {
    const [[x,y],[endX,endY]] = item.points;
    ctx.lineWidth = item.size;
    ctx.beginPath();
    if (item.tool === "rect") {
      ctx.rect(x, y, endX-x, endY-y);
    } else if (item.tool === "ellipse") {
      ctx.ellipse((x+endX)/2,(y+endY)/2,Math.abs(endX-x)/2,Math.abs(endY-y)/2,0,0,Math.PI*2);
    } else {
      ctx.moveTo(x, y);
      for (const [px,py] of item.points.slice(1)) ctx.lineTo(px, py);
      if (item.tool === "polygon") ctx.closePath();
    }
    if (item.fill && item.tool !== "line") ctx.fill();
    ctx.stroke();
  }

  function drawStroke(ctx, item) {
    const {tool, color, size, points, opacity} = item;
    const width = pressure => size * (0.22 + pressure * 0.78);
    if (tool === "pencil" || tool === "spray") {
      const random = seed => {
        const n = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
        return n - Math.floor(n);
      };
      const spray = tool === "spray";
      const screenScale = Math.abs(ctx.getTransform().a);
      for (let i=0; i<points.length; i++) {
        const [x,y,p] = points[i];
        const [px,py] = points[Math.max(0,i-1)];
        const spacing = Math.max(1, 0.6 / screenScale, width(p) * (spray ? 0.3 : 0.17));
        const count = Math.min(32, Math.max(1,Math.ceil(Math.hypot(x-px,y-py)/spacing)));
        for (let step=1; step<=count; step++) {
          const cx = px+(x-px)*step/count;
          const cy = py+(y-py)*step/count;
          for (let grain=0; grain<(spray ? 7 : 4); grain++) {
            const n = i*1013+step*53+grain*7;
            const angle = random(n)*Math.PI*2;
            const dist = Math.sqrt(random(n+1))*width(p)*(spray ? 1.16 : 0.48);
            dot(ctx,cx+Math.cos(angle)*dist,cy+Math.sin(angle)*dist,
              Math.max(0.2,width(p)*(spray ? 0.057 : 0.12))*(0.3+random(n+2)));
          }
        }
      }
      return;
    }

    if (tool === "marker" || tool === "watercolor") {
      // Paint opacity once per mark so crossing points don't form a chain of beads.
      if (tool === "marker") ctx.lineCap = "square";
      ctx.lineWidth = size * (tool === "watercolor" ? 1.24 : 0.9);
      const trace = () => {
        ctx.beginPath();
        ctx.moveTo(points[0][0], points[0][1]);
        for (const [x,y] of points.slice(1)) ctx.lineTo(x, y);
        if (points.length === 1) ctx.lineTo(points[0][0]+0.01, points[0][1]+0.01);
        ctx.stroke();
      };
      ctx.globalAlpha = opacity * (tool === "watercolor" ? 0.22 : 0.58);
      trace();
      if (tool === "watercolor") {
        ctx.globalAlpha = opacity * 0.18;
        ctx.lineWidth *= 0.58;
        trace();
      }
      return;
    }

    const weight = tool === "brush" ? 1 : tool === "ink" ? 0.76 : 1.05;
    if (points.length === 1) dot(ctx, points[0][0], points[0][1], width(points[0][2])*weight/2);
    for (let i=1; i<points.length; i++) {
      const [x,y,p] = points[i];
      const [px,py,pressure] = points[i-1];
      ctx.lineWidth = weight * width((pressure+p)/2);
      if (tool === "brush") ctx.lineWidth *= 0.78 + 0.22*Math.abs(x-px)/(Math.hypot(x-px,y-py)||1);
      ctx.beginPath();
      ctx.moveTo(px,py);
      ctx.lineTo(x,y);
      ctx.stroke();
    }
  }

  function paintItem(ctx, item) {
    ctx.save();
    ctx.fillStyle = ctx.strokeStyle = item.color;
    ctx.globalAlpha = item.opacity;
    if (item.tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.globalAlpha = 1;
    }
    ctx.lineJoin = ctx.lineCap = "round";
    if (Object.hasOwn(shapes,item.tool)) drawShape(ctx,item);
    else drawStroke(ctx,item);
    ctx.restore();
  }

  function cameraFit(box, width, height, margin = 25) {
    if (!box) return {x:width/2,y:height/2,z:1};
    const z = clamp(Math.min((width-margin*2)/Math.max(1,box.right-box.left),
      (height-margin*2)/Math.max(1,box.bottom-box.top)), 0.00002, 8);
    return {z,x:width/2-(box.left+box.right)*z/2,y:height/2-(box.top+box.bottom)*z/2};
  }

  function intersects(a,b) {
    return a.left <= b.right && a.right >= b.left && a.top <= b.bottom && a.bottom >= b.top;
  }

  function render(canvas, scratch, layers, camera, width, height, ratio, grid = false, highlight = null) {
    const ctx = canvas.getContext("2d");
    const off = scratch.getContext("2d");
    for (const c of [canvas,scratch]) {
      const w = Math.max(1,Math.round(width*ratio)), h = Math.max(1,Math.round(height*ratio));
      if (c.width !== w) c.width = w;
      if (c.height !== h) c.height = h;
    }
    ctx.setTransform(ratio,0,0,ratio,0,0);
    ctx.fillStyle = "#fffdf4";
    ctx.fillRect(0,0,width,height);
    if (grid) {
      const space = Math.pow(2,Math.ceil(Math.log2(23 / camera.z))) * camera.z;
      ctx.fillStyle = "#55797034";
      for (let x=(camera.x%space+space)%space;x<width;x+=space)
        for (let y=(camera.y%space+space)%space;y<height;y+=space) ctx.fillRect(x,y,1,1);
    }
    const area = {left:-camera.x/camera.z,top:-camera.y/camera.z,
      right:(width-camera.x)/camera.z,bottom:(height-camera.y)/camera.z};
    for (const layer of layers) {
      if (!layer.visible || !layer.items.length) continue;
      off.setTransform(1,0,0,1,0,0);
      off.clearRect(0,0,scratch.width,scratch.height);
      off.setTransform(ratio*camera.z,0,0,ratio*camera.z,camera.x*ratio,camera.y*ratio);
      for (const item of layer.items) {
        if (intersects(area,boundsOf(item))) paintItem(off,item);
      }
      ctx.drawImage(scratch,0,0,width,height);
    }
    if (highlight) {
      ctx.strokeStyle = "#168e91";
      ctx.setLineDash([5,4]);
      ctx.strokeRect(highlight.left*camera.z+camera.x,highlight.top*camera.z+camera.y,
        (highlight.right-highlight.left)*camera.z,(highlight.bottom-highlight.top)*camera.z);
      ctx.setLineDash([]);
    }
  }

  function exportDrawing(layers, crop) {
    const box = crop || drawingBounds(layers);
    if (!box) return;
    const w = Math.max(1,box.right-box.left), h = Math.max(1,box.bottom-box.top);
    const scale = Math.min(4,2600/Math.max(w,h));
    const width = Math.ceil(w*scale)+24, height = Math.ceil(h*scale)+24;
    const canvas = document.createElement("canvas");
    render(canvas,document.createElement("canvas"),layers,{x:12-box.left*scale,y:12-box.top*scale,z:scale},width,height,1);
    canvas.toBlob(blob => {
      if (!blob) return;
      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href;
      a.download = "海上手账-"+(crop?"选区":"全图")+".png";
      a.click();
      setTimeout(() => URL.revokeObjectURL(href), 1000);
    }, "image/png");
  }
  window.seaDrawing = { brushes, shapes, clamp, boundsOf, drawingBounds, cameraFit, render, exportDrawing };
})();
