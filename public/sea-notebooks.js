/* Topic shelf, page reader, and independent notebook submissions. */
(() => {
  "use strict";
  const {request,esc,icon,go,notify} = app;
  const href = (...parts) => "#workshop/" + parts.map(encodeURIComponent).join("~");
  const dates = value => esc(value?.slice(0,10) || "");
  const statusNames = {draft:"草稿",pending:"待审核",published:"已发布",rejected:"已退回"};
  const filters = new Map();
  const link = (route,label,style="") => `<a class="btn ${style}" href="${route}">${label}</a>`;
  const pageLink = (notebook,page) => href(notebook,"page",page);
  const editLink = (notebook,id) => href(notebook,"edit",id);
  const intro = '<header class="page-head"><div><h1>海上手账</h1><p>打开一本主题手账，翻看远方的故事，也留下属于你的一页。</p></div></header>';
  const screen = () => '<section class="nb-shell" aria-label="海上手账"><p role="status">正在打开海上手账…</p></section>';
  const assetMarkup = (assets={}) =>
    (assets.image ? `<img class="nb-photo" src="${esc(assets.image)}" alt="手账投稿照片">` : "") +
    (assets.audio ? `<audio controls preload="metadata" src="${esc(assets.audio)}"></audio>` : "");
  const scene = item => [...(item.ancestors || []).flatMap(row=>row.layers),...(item.layers || [])];
  const drawingMarkup = item => seaDrawing.drawingBounds(scene(item))
    ? `<button type="button" class="nb-art-preview" data-nb-art="${esc(item.id)}" aria-label="放大查看手绘作品"><canvas aria-hidden="true"></canvas><span>${icon("search",15)} 放大查看</span></button>`
    : "";

  function preview(container,item) {
    const wrap = [...container.querySelectorAll("[data-nb-art]")].find(el=>el.dataset.nbArt===item.id);
    if (!wrap) return;
    const layers = scene(item);
    const bounds = seaDrawing.drawingBounds(layers);
    if (!bounds) return;
    const canvas = wrap.querySelector("canvas");
    const proportion = seaDrawing.clamp((bounds.right-bounds.left)/Math.max(1,bounds.bottom-bounds.top),0.95,2.7);
    wrap.style.setProperty("--nb-art-ratio",proportion);
    const width = 920, height = Math.round(width/proportion);
    seaDrawing.render(canvas,document.createElement("canvas"),layers,
      seaDrawing.cameraFit(bounds,width,height,26),width,height,1);
    wrap.onclick = () => seaDrawingStudio.open({layers:item.layers,ancestors:item.ancestors,title:item.title || "手绘作品"});
  }

  function shelf(data) {
    return intro + `<div class="nb-shelf-title"><h2>主题手账</h2></div><div class="nb-shelf">${
      data.books.map(book => `<article class="nb-book-card"><a href="${href(book.id)}" class="nb-cover" aria-label="打开《${esc(book.title)}》"><img src="${esc(book.cover)}" alt=""><span>${esc(book.title)}</span></a>
      <div class="nb-card-info"><p>${esc(book.description)}</p><small>${book.pages} 页 · ${book.authors} 位作者 · ${book.regions} 个地域</small>${link(href(book.id),"打开手账")}</div></article>`).join("")
    }</div>${data.mine.length ? `<section class="nb-own"><h2>我的手账页</h2>${
      data.mine.map(item => `<div><strong>${esc(item.title || "未命名草稿")}</strong><span>${statusNames[item.status]}</span>${
        link(["draft","rejected"].includes(item.status)?editLink(item.notebook_id,item.id):pageLink(item.notebook_id,item.id),
          ["draft","rejected"].includes(item.status)?"继续编辑":"查看")
      }</div>`).join("")
    }</section>`:""}`;
  }

  function header(book,heading) {
    const cover = /^\/art\/[\w-]+\.(?:png|webp)$/.test(book.cover) ? book.cover : "/art/exhibit-workshop.webp";
    return `<header class="page-head nb-book-head" style="--hall-art:url('${esc(cover)}')"><div>
      <a class="nb-header-back" href="#workshop">← 主题手账</a>
      <h1>${esc(heading || book.title)}</h1><p>${esc(book.description)}</p></div>${
      heading ? link(href(book.id),"翻阅手账") : link(href(book.id,"new"),"我也写一页","solid")
    }</header>`;
  }
  function pageBody(item) {
    return `<article class="nb-sheet" tabindex="0" data-nb-page="${esc(item.id)}"><div class="nb-page-meta"><span>${item.number ? "第 "+item.number+" 页" : statusNames[item.status] || "已撤回"}</span><span>${dates(item.created)}</span></div>
      <h2>${esc(item.title)}</h2><p class="nb-byline">${esc(item.author)}${item.region?" · "+esc(item.region):""}${item.demo?" · 原创示例":""}</p>
      ${item.reply ? `<aside class="nb-reference"><a href="${pageLink(item.notebook,item.reply.id)}">回应第 ${item.reply.number} 页《${esc(item.reply.title)}》</a>${item.reply.quote?`<blockquote>${esc(item.reply.quote)}</blockquote>`:""}</aside>`:""}
      ${item.base ? `<aside class="nb-reference"><a href="${pageLink(item.notebook,item.base.id)}">原作《${esc(item.base.title)}》 · ${esc(item.base.author)}</a></aside>`:""}
      ${item.baseUnavailable ? '<p class="nb-reference">原图已撤下或关闭授权，本页仍可查看作者自己的内容。</p>' : ""}
      ${item.body ? `<div class="nb-prose">${esc(item.body)}</div>`:""}${assetMarkup(item.assets)}${item.audioSource ? `<p class="nb-media-source"><a href="#sounds/${encodeURIComponent(item.audioSource)}">查看录音来源与许可</a></p>` : ""}${drawingMarkup(item)}
      ${item.tags?.length ? `<div class="nb-tags">${item.tags.map(tag=>`<span>#${esc(tag)}</span>`).join("")}</div>`:""}
      <div class="nb-page-actions">${
        item.status==="published" ? link(href(item.notebook,"reply",item.id),"回应这一页") : ""
      }${item.status==="published" && item.allowRemix && !item.baseUnavailable && seaDrawing.drawingBounds(scene(item))
        ? link(href(item.notebook,"remix",item.id),"从这幅画创作续作") : ""
      }${item.mine && item.status==="published" && seaDrawing.drawingBounds(item.layers)
        ? `<button class="btn" type="button" data-nb-permission>${item.allowRemix?"关闭二创授权":"开启二创授权"}</button>` : ""}
      ${item.mine && ["published","pending"].includes(item.status) ? '<button class="btn" type="button" data-nb-withdraw>撤回此页</button>' : ""}</div></article>`;
  }

  const readerRequests = new WeakMap();

  function canTurn(main,id) {
    const [book,mode] = id.split("~");
    return mode === "page" && main.querySelector(".nb-book")?.dataset.book === book;
  }

  function clipPaper(corners, distance, keep) {
    const result = [];
    for (let i = 0; i < corners.length; i++) {
      const from = corners[(i + corners.length - 1) % corners.length];
      const to = corners[i];
      const first = distance(from), last = distance(to);
      if (keep(first) !== keep(last)) {
        const t = first / (first - last);
        result.push([from[0] + t * (to[0] - from[0]), from[1] + t * (to[1] - from[1])]);
      }
      if (keep(last)) result.push(to);
    }
    return result;
  }

  function turnPaper(book, outgoing, scrollTop, direction) {
    if (!outgoing || !direction || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const {width, height} = book.querySelector(".nb-leaf").getBoundingClientRect();
    const surface = document.createElement("div");
    surface.className = "nb-curl";
    surface.inert = true;
    surface.setAttribute("aria-hidden", "true");
    const face = document.createElement("div");
    const shadow = document.createElement("div");
    face.className = "nb-curl-back";
    shadow.className = "nb-curl-shadow";
    outgoing.querySelectorAll("audio,video").forEach(media => media.pause());
    surface.append(outgoing, shadow, face);
    book.append(surface);
    const content = outgoing.querySelector(".nb-sheet");
    content.scrollTop = scrollTop;

    const corners = [[0,0], [width,0], [width,height], [0,height]];
    const polygon = points => points.length < 3 ? "polygon(0 0,0 0,0 0)"
      : "polygon(" + points.map(([x,y]) =>
        (direction > 0 ? x : width - x).toFixed(2) + "px " + y.toFixed(2) + "px"
      ).join(",") + ")";
    const duration = 720;
    const started = performance.now();
    function draw(time) {
      if (!surface.isConnected) return;
      const progress = Math.max(0, Math.min(1, (time - started) / duration));
      if (progress === 1) {
        surface.remove();
        return;
      }
      // A moving crease clips the front of the leaf and reflects its lifted corner.
      const fold = progress * progress * (3 - 2 * progress);
      const angle = (60 - 43 * fold) * Math.PI / 180;
      const nx = Math.cos(angle), ny = Math.sin(angle);
      const span = width * nx + height * ny;
      const line = span - (span + 14) * fold;
      const distance = ([x,y]) => x * nx + y * ny - line;
      const lifted = clipPaper(corners, distance, value => value >= 0);
      const reflected = lifted.map(point => {
        const d = 2 * distance(point);
        return [point[0] - d * nx, point[1] - d * ny];
      });
      outgoing.style.clipPath = polygon(clipPaper(corners, distance, value => value <= 0));
      shadow.style.clipPath = polygon(lifted);
      face.style.clipPath = polygon(reflected);

      const axis = 180 - direction * (90 - angle * 180 / Math.PI);
      const crease = line.toFixed(2) + "px";
      const glow = Math.min(1, fold * 16, (1 - fold) * 10);
      shadow.style.opacity = glow;
      face.style.opacity = Math.min(1, (1 - progress) * 8);
      shadow.style.background = `linear-gradient(${axis}deg, #38271457 ${crease}, transparent calc(${crease} + 42px))`;
      face.style.background = `linear-gradient(${axis}deg, #f9efd8 calc(${crease} - 95px), #fff7e4 calc(${crease} - 34px), #dbc6a0 calc(${crease} - 10px), #a88b62 ${crease})`;
      requestAnimationFrame(draw);
    }
    draw(started);
  }

  async function reader(root,data,pageID) {
    const requestId = Symbol();
    const route = location.hash;
    readerRequests.set(root, requestId);
    const {book,pages} = data;
    const options = filters.get(book.id) || {region:"",type:""};
    const regions = [...new Set(pages.map(page=>page.region).filter(Boolean))];
    const filtered = pages.filter(page=>(!options.region || page.region===options.region)
      && (!options.type || page[options.type]));
    const selected = pageID || filtered[0]?.id;
    const item = selected ? await request("notebooks/page/"+encodeURIComponent(selected)) : null;
    if (!root.isConnected || route !== location.hash || readerRequests.get(root) !== requestId) return;
    if (item && item.notebook!==book.id) throw new Error("这页手账属于其他主题。");
    const index = filtered.findIndex(page=>page.id===selected);
    const oldBook = root.querySelector(".nb-book");
    const oldIndex = Number(oldBook?.dataset.index ?? -1);
    const outgoing = oldBook?.querySelector(":scope > .nb-leaf");
    const scrollTop = outgoing?.querySelector(".nb-sheet").scrollTop || 0;
    const direction = oldIndex >= 0 && index >= 0 ? Math.sign(index - oldIndex) : 0;
    const focusedLink = document.activeElement.closest(".nb-turn, .nb-corner");
    const pgLink=(page,label)=>page ? link(pageLink(book.id,page.id),label) : `<span class="nb-disabled">${label}</span>`;
    const corner = (page, side, label) => page
      ? `<a class="nb-corner nb-corner-${side}" href="${pageLink(book.id,page.id)}" aria-label="${label}"></a>`
      : "";
    root.innerHTML=header(book)+`<div class="nb-reader"><aside class="nb-directory"><h2>目录</h2>
      <label>地区<select name="region"><option value="">全部地区</option>${
        regions.map(region=>`<option${region===options.region?" selected":""}>${esc(region)}</option>`).join("")
      }</select></label><label>内容类型<select name="type"><option value="">全部类型</option>${
        Object.entries({image:"照片",audio:"录音",drawing:"手绘"}).map(([key,label])=>`<option value="${key}"${key===options.type?" selected":""}>${label}</option>`).join("")
      }</select></label><ol>${filtered.map(page=>`<li><a href="${pageLink(book.id,page.id)}"${page.id===selected?' aria-current="page"':""}><small>${page.number} · ${esc(page.region || page.author)}</small>${esc(page.title)}</a></li>`).join("")}</ol></aside>
      <div class="nb-volume"><nav class="nb-turn" aria-label="手账翻页">${pgLink(index>0 && filtered[index-1],"← 上一页")}<span aria-live="polite">${index>=0? (index+1)+" / "+filtered.length : ""}</span>${pgLink(index>=0 && filtered[index+1],"下一页 →")}</nav>
      <div class="nb-book" data-book="${esc(book.id)}" data-index="${index}">
        <div class="nb-leaf">${item ? pageBody(item) : '<div class="nb-sheet nb-empty">这里还没有符合条件的公开页面。</div>'}</div>
        ${corner(index>0 && filtered[index-1],"left","从左下角翻到上一页")}
        ${corner(index>=0 && filtered[index+1],"right","从右下角翻到下一页")}
      </div></div></div>`;
    const volume = root.querySelector(".nb-book");
    turnPaper(volume, outgoing, scrollTop, direction);
    if (focusedLink) {
      const controls = root.querySelectorAll(".nb-turn a");
      (direction < 0 ? controls[0] : controls[controls.length - 1])?.focus({preventScroll:true});
    }
    for (const filter of root.querySelectorAll(".nb-directory select")) {
      filter.onchange=()=>{
        filters.set(book.id,{...options,[filter.name]:filter.value});
        go("workshop/"+encodeURIComponent(book.id));
      };
    }
    if (item) {
      preview(volume.querySelector(":scope > .nb-leaf"),item);
      root.querySelector("[data-nb-withdraw]")?.addEventListener("click",async e=>{
        if (!confirm("撤回这一页？它将退出公开手账。")) return;
        e.target.disabled=true;
        try { await request("notebooks/withdraw",{id:item.id}); go("workshop/"+book.id); }
        catch (error) { notify(error.message); e.target.disabled=false; }
      });
      root.querySelector("[data-nb-permission]")?.addEventListener("click",async e=>{
        e.target.disabled=true;
        try {
          await request("notebooks/permission",{id:item.id,allowRemix:!item.allowRemix});
          await reader(root,data,selected);
        } catch (error) { notify(error.message); }
        finally { e.target.disabled=false; }
      });
    }
  }

  const readTags = text => text.split(/[，、,]/u).map(value=>value.trim()).filter(Boolean);

  function editorMarkup(book,item,source) {
    const canApply = item?.status==="draft" || item?.status==="rejected" || !item;
    if (!canApply) throw new Error("这页已送审，请从目录查看当前状态。");
    return header(book,item?"继续编辑手账页":"写一页手账")+`<form class="nb-editor nb-sheet" data-nb-editor>
      <label>标题<input name="title" maxlength="100" placeholder="给这一页取个名字" value="${esc(item?.title)}"></label>
      <div class="nb-editor-pair"><label>公开地区（选填）<input name="region" maxlength="30" placeholder="如泉州、台南、新加坡" value="${esc(item?.region)}"></label>
      <label>文化标签（选填）<input name="tags" maxlength="90" placeholder="使用顿号或逗号分隔，最多 5 个" value="${esc(item?.tags?.join("、"))}"></label></div>
      ${source ? `<div class="nb-reference" data-nb-reference><a href="${pageLink(book.id,source.id)}">${esc(source.title)}</a>
      ${source.body!==undefined ? `<label>引用原页文字（选填）<select name="quote"><option value="">只回应这一页</option>${
        [...new Set([...(source.quote?[source.quote]:[]),...(source.body.match(/[^。！？\n]+[。！？]?/gu)||[])].map(value=>value.trim()).filter(Boolean).map(value=>value.slice(0,240)))]
          .map(value=>`<option${value===source.quote?" selected":""}>${esc(value)}</option>`).join("")
      }</select></label>` : ""}<button type="button" class="btn" data-nb-detach>移除关联</button></div>`:""}
      ${composeAI.editor(item?.body || "", app.state.writeAI, {notebook:true})}
      <fieldset class="nb-media"><legend>照片和录音</legend><div class="nb-editor-pair">
        <div><label>上传照片<input name="image" type="file" accept="image/png,image/jpeg,image/webp,image/gif"></label><div data-nb-asset="image"></div></div>
        <div><label>上传录音<input name="audio" type="file" accept="audio/*"></label><button type="button" class="btn" data-nb-record>开始录音</button><div data-nb-asset="audio"></div></div>
      </div></fieldset>
      <fieldset><legend>手绘作品（可选）</legend><div class="nb-page-actions"><button type="button" class="btn" data-nb-studio>打开专业画板</button><button type="button" class="btn" data-nb-remove-drawing hidden>移除手绘</button></div><div data-nb-drawing></div></fieldset>
      <div class="nb-checks"><label><input type="checkbox" name="exhibit"> 我同意将这一页公开展示，并有权使用提交的素材。</label>
      <label><input type="checkbox" name="remix" ${item?.allowRemix?"checked":""}> 允许他人从此页公开手绘创作续作</label></div>
      <p class="nb-form-status" role="status"></p>
      <div class="nb-page-actions"><button class="btn" type="submit" name="action" value="draft">保存草稿</button><button class="btn solid" type="submit" name="action" value="submit">提交审核</button></div>
      </form>`;
  }

  function mountEditor(root,book,item,source,mode) {
    root.innerHTML=editorMarkup(book,item,source);
    const form=root.querySelector("[data-nb-editor]");
    composeAI.mount(form, {notebook:true, readDetails:()=>({
      notebook:book.id, title:form.elements.title.value.trim(),
      region:form.elements.region.value.trim(), tags:readTags(form.elements.tags.value),
    })});
    const message=text=>{form.querySelector(".nb-form-status").textContent=text;};
    let key=item?.id || "", reply=mode==="reply"?source?.id:item?.replyId;
    let base=mode==="remix"?source?.id:item?.baseId;
    let ancestors=mode==="remix"?[...source.ancestors,{id:source.id,author:source.author,layers:source.layers}]:(item?.ancestors || []);
    let layers=item?.layers || [], retained={...item?.assets}, pending={}, recorder, stream, timer;
    const objectURLs={};
    const cleanUp=()=>{
      if (recorder?.state==="recording") recorder.stop();
      clearTimeout(timer);
      stream?.getTracks().forEach(track=>track.stop());
      Object.values(objectURLs).forEach(URL.revokeObjectURL);
      observer.disconnect();
    };
    const observer=new MutationObserver(()=>{ if (!form.isConnected) cleanUp(); });
    observer.observe(root.parentElement,{childList:true});
    const removable=form.querySelector("[data-nb-remove-drawing]");

    function drawPreview() {
      const figure={id:"draft",title:form.elements.title.value || "手账草稿",layers,ancestors};
      form.querySelector("[data-nb-drawing]").innerHTML=drawingMarkup(figure);
      preview(form,figure);
      removable.hidden=!seaDrawing.drawingBounds(layers);
    }
    function showAsset(kind) {
      const holder=form.querySelector('[data-nb-asset="'+kind+'"]');
      const url=Object.hasOwn(pending,kind)?objectURLs[kind]:retained[kind];
      holder.innerHTML=url?assetMarkup({[kind]:url})+'<button type="button" class="btn">移除</button>':"";
      holder.querySelector("button")?.addEventListener("click",()=>{
        if (objectURLs[kind]) URL.revokeObjectURL(objectURLs[kind]);
        delete objectURLs[kind];
        pending[kind]=null;
        form.elements[kind].value="";
        showAsset(kind);
      });
    }
    function attach(kind,file) {
      if (!file) return;
      const types={image:["image/png","image/jpeg","image/webp","image/gif"],
        audio:["audio/mpeg","audio/mp3","audio/wav","audio/x-wav","audio/ogg","audio/webm","audio/mp4"]};
      const mime=file.type.split(";")[0];
      if (!types[kind].includes(mime) || file.size>4*1024*1024) {
        message("请选择支持的照片或录音格式，单份最大 4 MB。");
        return;
      }
      if (objectURLs[kind]) URL.revokeObjectURL(objectURLs[kind]);
      pending[kind]=file.type===mime?file:new Blob([file],{type:mime});
      objectURLs[kind]=URL.createObjectURL(pending[kind]);
      showAsset(kind);
      message("");
    }
    for (const kind of ["image","audio"]) {
      showAsset(kind);
      form.elements[kind].onchange=()=>attach(kind,form.elements[kind].files[0]);
    }
    const record=form.querySelector("[data-nb-record]");
    record.onclick=async ()=>{
      if (recorder?.state==="recording") { recorder.stop(); return; }
      if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
        message("当前浏览器无法录音，可以使用上传录音。");
        return;
      }
      record.disabled=true;
      try {
        stream=await navigator.mediaDevices.getUserMedia({audio:true});
        if (!form.isConnected) { stream.getTracks().forEach(track=>track.stop()); return; }
        const mimeType=["audio/webm;codecs=opus","audio/ogg;codecs=opus","audio/mp4"]
          .find(value=>MediaRecorder.isTypeSupported(value));
        recorder=new MediaRecorder(stream,mimeType?{mimeType}:{});
        const chunks=[];
        recorder.ondataavailable=e=>{ if (e.data.size) chunks.push(e.data); };
        recorder.onstop=()=>{
          clearTimeout(timer);
          stream.getTracks().forEach(track=>track.stop());
          record.textContent="开始录音";
          record.setAttribute("aria-pressed","false");
          if (form.isConnected && chunks.length) attach("audio",new Blob(chunks,{type:recorder.mimeType}));
        };
        recorder.start();
        timer=setTimeout(()=>{ if (recorder.state==="recording") recorder.stop(); },120000);
        record.textContent="结束录音";
        record.setAttribute("aria-pressed","true");
      } catch {
        stream?.getTracks().forEach(track=>track.stop());
        message("未能打开麦克风，可以检查浏览器权限或上传录音。");
      } finally { record.disabled=false; }
    };
    form.querySelector("[data-nb-detach]")?.addEventListener("click",()=>{
      reply=base=null;
      ancestors=[];
      form.querySelector("[data-nb-reference]").remove();
      drawPreview();
    });
    form.querySelector("[data-nb-studio]").onclick=()=>seaDrawingStudio.open({
      layers,ancestors,title:"手账画板",commit:value=>{layers=value;drawPreview();}
    });
    removable.onclick=()=>{ layers=[]; drawPreview(); };
    drawPreview();
    const toData=file=>new Promise((resolve,reject)=>{
      const reader=new FileReader();
      reader.onload=()=>resolve({url:reader.result});
      reader.onerror=()=>reject(new Error("无法读取附件，请重新选择。"));
      reader.readAsDataURL(file);
    });
    form.onsubmit=async event=>{
      event.preventDefault();
      const action=event.submitter?.value || "draft";
      if (recorder?.state==="recording") {
        message("请先结束录音。");
        return;
      }
      const buttons=[...form.querySelectorAll("button[type=submit]")];
      const data=new FormData(form);
      buttons.forEach(button=>{button.disabled=true;});
      form.inert=true;
      message(action==="submit"?"正在送审…":"正在保存草稿…");
      try {
        const media=Object.fromEntries(await Promise.all(Object.entries(pending).map(async([kind,file])=>[kind,file?await toData(file):null])));
        const result=await request("notebooks/"+action,{id:key,notebook:book.id,title:data.get("title"),
          body:data.get("body"),region:data.get("region"),tags:readTags(data.get("tags") || ""),
          reply:reply||"",quote:reply?(data.get("quote")||""):"",base:base||"",layers,media,
          exhibit:data.has("exhibit"),allowRemix:data.has("remix")});
        key=result.id;
        pending={};
        if (action==="submit") {
          notify("已送审。通过审核后会加入手账。");
          go(pageLink(book.id,key).slice(1));
        } else {
          history.replaceState(null,"",editLink(book.id,key));
          retained=result.assets;
          for (const kind of ["image","audio"]) {
            if (objectURLs[kind]) URL.revokeObjectURL(objectURLs[kind]);
            delete objectURLs[kind];
            showAsset(kind);
          }
          message("草稿已保存，可从「我的手账页」继续编辑。");
        }
      } catch(error) { message(error.message); }
      finally {
        form.inert=false;
        buttons.forEach(button=>{button.disabled=false;});
        if (form.isConnected) event.submitter?.focus({preventScroll:true});
      }
    };
  }

  async function mount(main,id="") {
    const root=main.querySelector(".nb-shell");
    if (!root) return;
    const route = location.hash;
    try {
      if (!id) {
        const data=await request("notebooks");
        if (root.isConnected) root.innerHTML=shelf(data);
        return;
      }
      const [bookId,mode,pageId]=id.split("~");
      const data=await request("notebooks/book/"+encodeURIComponent(bookId));
      if (!root.isConnected || route !== location.hash) return;
      if (!mode || mode==="page") return await reader(root,data,pageId);
      if (!["new","edit","reply","remix"].includes(mode)) throw new Error("找不到这个手账入口。");
      const page=pageId ? await request("notebooks/page/"+encodeURIComponent(pageId)) : null;
      if (!root.isConnected || route !== location.hash) return;
      if (page && page.notebook!==bookId) throw new Error("这页属于其他主题手账。");
      if (mode==="edit" && !page?.mine) throw new Error("只能编辑自己的手账草稿。");
      if (mode==="reply" && page?.status!=="published") throw new Error("只有公开页面可以回应。");
      if (mode==="remix" && (!page?.allowRemix || page.baseUnavailable || page.status!=="published"))
        throw new Error("这幅作品目前无法作为续作底图。");
      const item=mode==="edit"?page:null;
      let source=item?.reply || item?.base || (mode==="reply" || mode==="remix"?page:null);
      if (!source && (item?.baseId || item?.replyId))
        source={id:item.baseId || item.replyId,title:"关联已失效，请移除后继续编辑"};
      if (mode==="remix" && source) source={id:source.id,title:source.title,ancestors:source.ancestors,layers:source.layers,author:source.author};
      mountEditor(root,data.book,item,source,mode);
    } catch(error) {
      if (root.isConnected && route === location.hash) root.innerHTML=`<div class="nb-sheet"><h1>海上手账</h1><p role="status">${esc(error.message)}</p><a href="#workshop">返回主题手账</a></div>`;
    }
  }
  window.seaNotebooks={screen,mount,canTurn,drawingMarkup,mountReview:(root,items)=>{
    for (const item of items) if (item.kind==="notebook") preview(root,item);
  }};
})();
