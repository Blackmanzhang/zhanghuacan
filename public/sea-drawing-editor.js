/* Interactive infinite canvas shared by the drawing studio and the full-size viewer. */
(() => {
  "use strict";
  const {brushes,shapes,clamp,boundsOf,drawingBounds,cameraFit,render,exportDrawing} = seaDrawing;
  const emptyLayer = name => ({name,visible:true,locked:false,items:[]});
  const round = n => Math.round(n*100)/100;
  const viewportTools = '<button type="button" data-command="out" aria-label="缩小">−</button><output aria-label="缩放比例">100%</output><button type="button" data-command="in" aria-label="放大">＋</button><button type="button" data-command="fit">查看全图</button>';
  const button = (command,label) => '<button type="button" data-command="'+command+'">'+label+'</button>';

  function open({layers=[], ancestors=[], title="无限画布", commit=null}={}) {
    const editing = !!commit;
    let own = layers.length || !editing ? layers : [emptyLayer("图层 1")];
    const artAtOpen = own;
    let active = Math.max(0,own.length-1), history = [], redo = [];
    const bases = ancestors.flatMap(base => base.layers);
    const allLayers = () => [...bases,...own];
    let tool = editing ? "ink" : "pan", camera = {x:0,y:0,z:1};
    let width = 0, height = 0, frame = 0, gesture, live, selection, space = false, polygon = [];
    let color = "#234e51", size = 8, opacity = 1, fill = false;
    const fingers = new Map();
    const modal = document.createElement("dialog");
    modal.className = "nd-studio";
    modal.setAttribute("aria-label", title);
    modal.innerHTML = '<header class="nd-top"><strong>'+app.esc(title)+'</strong><div class="nd-controls">'+viewportTools
      +button("export","导出全图")+(editing ? button("crop","导出选区") : "")+'</div><div class="nd-controls">'
      +(editing ? button("apply","插入手账") : "")+button("close","关闭")+'</div></header><div class="nd-workarea">'
      +(editing ? '<aside class="nd-tools" aria-label="画板工具"></aside>' : "")
      +'<div class="nd-stage" tabindex="0" aria-label="画布，滚轮缩放，拖动查看"><canvas></canvas><div class="nd-help" aria-live="polite"></div></div>'
      +(editing ? '<aside class="nd-properties"><h3>笔触设置</h3><div class="nd-fields"><label>颜色 <input type="color" name="color" value="#234e51"></label><label>粗细 <output data-value="size">8</output><input type="range" name="size" min="1" max="180" value="8"></label><label>不透明度 <output data-value="opacity">100%</output><input type="range" name="opacity" min="5" max="100" value="100"></label><label><input type="checkbox" name="fill"> 填充形状</label></div><h3>图层</h3><div class="nd-layer-list"></div><div class="nd-controls">'+button("add","新建")+button("lower","下移")+button("raise","上移")+button("delete","删除")+'</div>'
        +'<div class="nd-controls nd-transform">'+button("smaller","缩小选区")+button("larger","放大选区")+button("rotate","旋转选区")+'</div></aside>' : "")
      +'</div>';
    const opener = document.activeElement;
    document.body.append(modal);
    const stage = modal.querySelector(".nd-stage");
    const canvas = stage.querySelector("canvas");
    const scratch = document.createElement("canvas");
    const info = modal.querySelector(".nd-help");
    const zoom = modal.querySelector("output");
    const say = text => { info.textContent = text; };
    const current = () => own[active];

    if (editing) {
      const tools = {...brushes,...shapes,eraser:"橡皮",picker:"吸管",select:"选区",pan:"抓手"};
      modal.querySelector(".nd-tools").innerHTML = Object.entries(tools).map(([key,label]) =>
        '<button type="button" data-tool="'+key+'" aria-pressed="false">'+label+'</button>').join("")
        + '<hr>'+button("undo","撤销")+button("redo","重做");
    }
    function repaint() {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (!width || !height) return;
        const scene = allLayers();
        if (live && current()) scene[bases.length+active] = {...current(), items:[...current().items,live]};
        render(canvas,scratch,scene,camera,width,height,Math.min(devicePixelRatio||1,2),
          editing,selection);
        zoom.textContent = Math.round(camera.z*1000)/10+"%";
      });
    }
    function fit() {
      camera = cameraFit(drawingBounds(allLayers()),width,height,Math.min(38,width/5,height/5));
      repaint();
    }
    function resize() {
      const oldWidth = width, oldHeight = height;
      width = stage.clientWidth;
      height = stage.clientHeight;
      if (!oldWidth || !oldHeight) fit();
      else {
        camera.x += (width-oldWidth)/2;
        camera.y += (height-oldHeight)/2;
        repaint();
      }
    }
    function layerList() {
      if (!editing) return;
      modal.querySelector(".nd-layer-list").innerHTML = own.map((layer,index) => {
        const name = app.esc(layer.name);
        return '<div class="nd-layer" data-active="'+(index===active)+'"><button type="button" data-layer="'+index
          +'" aria-pressed="'+(index===active)+'">'+name+'</button><button type="button" data-layer-toggle="visible" data-index="'+index
          +'" aria-pressed="'+layer.visible+'" aria-label="'+name+' · 显示">'+(layer.visible?'显示':'隐藏')
          +'</button><button type="button" data-layer-toggle="locked" data-index="'+index+'" aria-pressed="'+layer.locked
          +'" aria-label="'+name+' · 锁定">'+(layer.locked?'已锁':'可编辑')+'</button></div>';
      }).reverse().join("") + (bases.length ? '<small>底图由原作者提供</small>' : "");
      modal.querySelector('[data-command="undo"]').disabled = !history.length;
      modal.querySelector('[data-command="redo"]').disabled = !redo.length;
    }
    function mutate(next,index=active) {
      history.push({own,active});
      if (history.length>50) history.shift();
      redo = [];
      own = next;
      active = index;
      layerList();
      repaint();
    }
    function updateLayer(layer,index=active) {
      mutate(own.map((entry,i)=>i===index?layer:entry));
    }
    function addItem(item) {
      updateLayer({...current(),items:[...current().items,item]});
    }
    function setTool(key) {
      live = null;
      polygon = [];
      tool = key;
      stage.dataset.tool = key;
      modal.querySelectorAll("[data-tool]").forEach(el => el.setAttribute("aria-pressed",el.dataset.tool===key));
      const hints = {
        pan:"拖动平移 · 滚轮或双指缩放",
        polygon:"点击放置顶点，回车或双击闭合",
        select:"拖出选区，再拖动选区内的笔触 · 右侧可缩放和旋转",
        picker:"点击画布吸取颜色",
      };
      say(hints[key] || "滚轮缩放 · 按住空格拖动画布");
      repaint();
    }
    function point(event) {
      const box = stage.getBoundingClientRect();
      return [event.clientX-box.left,event.clientY-box.top];
    }
    function world([x,y],pressure=0.75) {
      return [round(clamp((x-camera.x)/camera.z,-1e6,1e6)),round(clamp((y-camera.y)/camera.z,-1e6,1e6)),round(clamp(pressure,0.02,1))];
    }
    function zoomAt(x,y,factor) {
      const next = clamp(camera.z*factor,0.00002,24);
      const offset = next/camera.z;
      camera = {x:x-(x-camera.x)*offset,y:y-(y-camera.y)*offset,z:next};
      repaint();
    }
    function boxFor(first,end) {
      return {left:Math.min(first[0],end[0]),right:Math.max(first[0],end[0]),
        top:Math.min(first[1],end[1]),bottom:Math.max(first[1],end[1])};
    }
    function transformSelection(mapPoint, scale = 1) {
      if (!selection || !current()?.visible || current().locked) return;
      const indices = current().items.map((item,index) => {
        const box = boundsOf(item);
        const x=(box.left+box.right)/2,y=(box.top+box.bottom)/2;
        return x>=selection.left && x<=selection.right && y>=selection.top && y<=selection.bottom ? index : -1;
      }).filter(index=>index>=0);
      if (!indices.length) return;
      const selected = new Set(indices);
      const items = current().items.map((item,index) => selected.has(index)
        ? {...item, size:clamp(round(item.size*scale),0.75,240), points:item.points.map(([x,y,p])=> {
          const [nx,ny] = mapPoint(x,y);
          return [round(clamp(nx,-1e6,1e6)),round(clamp(ny,-1e6,1e6)),p];
        })} : item);
      selection = drawingBounds([{visible:true,items:indices.map(index=>items[index])}]);
      updateLayer({...current(),items});
    }
    function shapedTool() { return Object.hasOwn(shapes,tool); }
    function makeStroke(points) { return {tool,points,size,color,opacity,fill}; }
    function finishPolygon() {
      if (polygon.length>=3) addItem(makeStroke(polygon));
      polygon=[];
      live=null;
      repaint();
    }
    function begin(event) {
      if (event.button!==0 && event.button!==1) return;
      const cursor = point(event);
      stage.setPointerCapture(event.pointerId);
      stage.focus({preventScroll:true});
      if (event.pointerType==="touch") {
        fingers.set(event.pointerId,cursor);
        if (fingers.size===2) {
          live=null;
          polygon=[];
          gesture={type:"pinch"};
          repaint();
          return;
        }
      }
      if (gesture) return;
      if (!editing || space || event.button===1 || tool==="pan") {
        gesture={type:"pan",cursor};
        return;
      }
      const p = world(cursor,event.pointerType==="pen"?event.pressure:0.75);
      if (tool==="picker") {
        const ratio=canvas.width/width;
        const data=canvas.getContext("2d").getImageData(clamp(Math.floor(cursor[0]*ratio),0,canvas.width-1),clamp(Math.floor(cursor[1]*ratio),0,canvas.height-1),1,1).data;
        color="#"+[...data.slice(0,3)].map(v=>v.toString(16).padStart(2,"0")).join("");
        modal.querySelector('[name="color"]').value=color;
        setTool("ink");
        return;
      }
      if (!current()?.visible || current().locked) {
        say("请选择一个可见且未锁定的图层。");
        return;
      }
      if (tool==="polygon") {
        if (polygon.length<240 && (!polygon.length || Math.hypot(p[0]-polygon.at(-1)[0],p[1]-polygon.at(-1)[1])>3/camera.z)) polygon.push(p);
        return;
      }
      if (tool==="select") {
        const inside=selection && p[0]>=selection.left && p[0]<=selection.right && p[1]>=selection.top && p[1]<=selection.bottom;
        gesture={type:inside?"selection-move":"selection-box",first:p,last:p};
        if (!inside) selection=boxFor(p,p);
      } else {
        gesture={type:"draw",first:p};
        live=makeStroke(shapedTool()?[p,p]:[p]);
      }
      repaint();
    }
    function move(event) {
      const cursor=point(event);
      if (gesture?.type==="pinch") {
        if (!fingers.has(event.pointerId) || fingers.size!==2) return;
        const [a,b]=[...fingers.values()];
        fingers.set(event.pointerId,cursor);
        const [c,d]=[...fingers.values()];
        const before=Math.hypot(a[0]-b[0],a[1]-b[1])||1;
        zoomAt((a[0]+b[0])/2,(a[1]+b[1])/2,Math.hypot(c[0]-d[0],c[1]-d[1])/before);
        camera.x+=(c[0]+d[0]-a[0]-b[0])/2;
        camera.y+=(c[1]+d[1]-a[1]-b[1])/2;
        return;
      }
      if (fingers.has(event.pointerId)) fingers.set(event.pointerId,cursor);
      const p=world(cursor,event.pointerType==="pen"?event.pressure:0.75);
      if (gesture?.type==="pan") {
        camera.x+=cursor[0]-gesture.cursor[0];
        camera.y+=cursor[1]-gesture.cursor[1];
        gesture.cursor=cursor;
      } else if (gesture?.type==="selection-box") {
        selection=boxFor(gesture.first,p);
      } else if (gesture?.type==="selection-move") {
        gesture.last=p;
      } else if (gesture?.type==="draw") {
        if (shapedTool()) live=makeStroke([gesture.first,p]);
        else {
          const last=live.points.at(-1);
          if (live.points.length<2400 && Math.hypot(last[0]-p[0],last[1]-p[1])>0.7/camera.z)
            live={...live,points:[...live.points,p]};
        }
      } else if (tool==="polygon" && polygon.length) {
        live=makeStroke([...polygon,p,p]);
      } else return;
      repaint();
    }
    function end(event) {
      fingers.delete(event.pointerId);
      if (gesture?.type==="pinch" && fingers.size) {
        gesture={type:"pan",cursor:fingers.values().next().value};
        return;
      }
      if (gesture?.type==="draw" && live && event.type==="pointerup") addItem(live);
      if (gesture?.type==="selection-move" && event.type==="pointerup") {
        const {first,last}=gesture;
        transformSelection((x,y)=>[x+last[0]-first[0],y+last[1]-first[1]]);
      }
      if (gesture) live=null;
      gesture=null;
      repaint();
    }

    function confirmClose() {
      return !editing || (own === artAtOpen && !live && !polygon.length)
        || window.confirm("关闭画板会放弃这次未插入手账的绘画修改。继续关闭？");
    }
    function command(key) {
      if (key==="close") {
        if (confirmClose()) modal.close();
        return;
      }
      if (key==="apply") {
        if (polygon.length>=3) finishPolygon();
        commit(own);
        modal.close();
        return;
      }
      if (key==="in" || key==="out") return zoomAt(width/2,height/2,key==="in"?1.35:1/1.35);
      if (key==="fit") return fit();
      if (key==="export") {
        if (!drawingBounds(allLayers())) return say("画布上还没有可导出的作品。");
        return exportDrawing(allLayers());
      }
      if (key==="crop") return selection ? exportDrawing(allLayers(),selection) : say("请先拖出一个选区。");
      if (key==="undo" || key==="redo") {
        const from=key==="undo"?history:redo, to=key==="undo"?redo:history;
        if (!from.length) return;
        to.push({own,active});
        ({own,active}=from.pop());
        selection=null;
        layerList();
        repaint();
        return;
      }
      if (key==="add") {
        if (own.length>=24) return say("一幅作品最多有 24 个可编辑图层。");
        const name=window.prompt("给新图层命名","图层 "+(own.length+1));
        if (name?.trim()) mutate([...own,emptyLayer(name.trim().slice(0,40))],own.length);
        return;
      }
      if (key==="delete") {
        if (current().locked) return say("请先解除图层锁定。");
        if (current().items.length && !window.confirm("删除这一图层？可通过撤销恢复。")) return;
        const remaining=own.filter((_,index)=>index!==active);
        mutate(remaining.length?remaining:[emptyLayer("图层 1")],Math.max(0,Math.min(active,remaining.length-1)));
        selection=null;
        return;
      }
      if (key==="lower" || key==="raise") {
        const nextIndex=active+(key==="lower"?-1:1);
        if (nextIndex<0 || nextIndex>=own.length) return;
        const next=[...own];
        [next[active],next[nextIndex]]=[next[nextIndex],next[active]];
        mutate(next,nextIndex);
        return;
      }
      if (!selection) return say("请使用选区工具框选内容。");
      const cx=(selection.left+selection.right)/2,cy=(selection.top+selection.bottom)/2;
      if (key==="rotate") {
        transformSelection((x,y) => [cx-(y-cy),cy+(x-cx)]);
      } else {
        const factor=key==="smaller"?0.8:1.25;
        transformSelection((x,y)=>[cx+(x-cx)*factor,cy+(y-cy)*factor],factor);
      }
    }

    stage.addEventListener("pointerdown",begin);
    stage.addEventListener("pointermove",move);
    stage.addEventListener("pointerup",end);
    stage.addEventListener("pointercancel",end);
    stage.addEventListener("dblclick",() => { if (tool==="polygon") finishPolygon(); });
    stage.addEventListener("wheel",event=>{
      event.preventDefault();
      zoomAt(...point(event),Math.exp(-clamp(event.deltaY,-120,120)*0.0045));
    },{passive:false});
    modal.addEventListener("click",event=>{
      const control=event.target.closest("button");
      if (!control) return;
      if (control.dataset.command) command(control.dataset.command);
      if (control.dataset.tool) setTool(control.dataset.tool);
      if (control.hasAttribute("data-layer")) {
        active=Number(control.dataset.layer);
        selection=null;
        layerList();
        repaint();
      }
      if (control.dataset.layerToggle) {
        const index=Number(control.dataset.index), key=control.dataset.layerToggle;
        selection=null;
        updateLayer({...own[index],[key]:!own[index][key]},index);
      }
    });
    modal.addEventListener("input",event=>{
      const target=event.target;
      if (target.name==="color") color=target.value;
      if (target.name==="fill") fill=target.checked;
      if (target.name==="size") {
        size=Number(target.value);
        modal.querySelector('[data-value="size"]').textContent=size;
      }
      if (target.name==="opacity") {
        opacity=Number(target.value)/100;
        modal.querySelector('[data-value="opacity"]').textContent=target.value+"%";
      }
    });
    modal.addEventListener("keydown",event=>{
      if (event.target.matches("input")) return;
      if (event.code==="Space" && event.target===stage) {
        space=true;
        event.preventDefault();
      }
      if (event.key==="Enter" && event.target===stage && tool==="polygon") finishPolygon();
      if (editing && (event.ctrlKey || event.metaKey) && event.key.toLowerCase()==="z") {
        event.preventDefault();
        command(event.shiftKey?"redo":"undo");
      }
      const arrows={ArrowLeft:[40,0],ArrowRight:[-40,0],ArrowUp:[0,40],ArrowDown:[0,-40]};
      if (event.target===stage && arrows[event.key]) {
        event.preventDefault();
        camera.x+=arrows[event.key][0];
        camera.y+=arrows[event.key][1];
        repaint();
      }
    });
    modal.addEventListener("keyup",event=>{ if (event.code==="Space") space=false; });
    stage.addEventListener("blur",()=>{space=false;});
    const resizeObserver=new ResizeObserver(resize);
    modal.addEventListener("cancel",event=>{ if (!confirmClose()) event.preventDefault(); });
    modal.addEventListener("close",()=>{
      resizeObserver.disconnect();
      cancelAnimationFrame(frame);
      modal.remove();
      if (opener?.isConnected) opener.focus({preventScroll:true});
    },{once:true});
    modal.showModal();
    resizeObserver.observe(stage);
    setTool(tool);
    layerList();
    stage.focus();
  }
  window.seaDrawingStudio={open};
})();

