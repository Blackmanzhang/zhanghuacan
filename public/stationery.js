(() => {
  "use strict";
  const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);
  const jobs = new WeakMap();
  const isData = (value) =>
    typeof value === "string" &&
    /^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/.test(value);
  function coverUrl(letter) {
    return typeof letter.coverUrl === "string" &&
      /^\/api\/covers\/[\w-]+$/.test(letter.coverUrl)
      ? letter.coverUrl
      : app.art(letter.art);
  }
  function editor(draft, token, names) {
    const custom = isData(draft.coverData) ? draft.coverData : "";
    const name = custom ? "自定义封面" : names[token];
    const options = Object.entries(names)
      .map(
        ([key, title]) =>
          `<button type="button" class="art-option ${!custom && key === token ? "selected" : ""}" title="${title}" aria-label="${title}" aria-pressed="${!custom && key === token}" data-action="art" data-value="${key}"><img src="${app.art(key)}" alt="" loading="lazy"></button>`,
      )
      .join("");
    return `<figure class="cover-current"><img id="selected-art" src="${custom || app.art(token)}" alt="${name}"><figcaption data-cover-caption>${name}</figcaption></figure><input type="hidden" name="art" value="${app.esc(token)}"><input type="hidden" name="coverData" value="${custom}"><div class="art-options cover-picks" role="group" aria-label="内置信笺封面">${options}</div>
  <div class="cover-upload"><label>${app.icon("image", 16)} 上传自己的封面<input id="cover-upload" ${validRef(draft.coverRef) ? `data-cover-ref="${draft.coverRef}"` : ""} type="file" accept="image/jpeg,image/png,image/webp"></label><small>JPG、PNG 或 WebP，最大 8 MB。另可附上一张图或一段录音。</small></div><p class="cover-feedback" role="status" aria-live="polite"></p>`;
  }
  async function prepare(file) {
    if (!allowed.has(file.type) || file.size > 8 * 1024 * 1024)
      throw Error("请选择 8 MB 以内的 JPG、PNG 或 WebP 封面。");
    const image = new Image(),
      url = URL.createObjectURL(file);
    try {
      image.src = url;
      await image.decode();
      const scale = Math.min(
        1,
        1280 / image.naturalWidth,
        900 / image.naturalHeight,
      );
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const ctx = canvas.getContext("2d");
      if (!ctx) throw Error();
      ctx.fillStyle = "#faf7ee";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL("image/jpeg", 0.84);
    } catch {
      throw Error("没有读出这张封面，请选择可以打开的图片。");
    } finally {
      URL.revokeObjectURL(url);
    }
  }
  function display(form, src, name, token) {
    const image = form.querySelector("#selected-art");
    image.src = src;
    image.alt = name;
    form.querySelector("[data-cover-caption]").textContent = name;
    form.querySelectorAll(".cover-picks button").forEach((b) => {
      const chosen = b.dataset.value === token;
      b.setAttribute("aria-pressed", chosen);
      b.classList.toggle("selected", chosen);
    });
  }
  function pick(form, token, title) {
    jobs.delete(form);
    form.elements.art.value = token;
    form.elements.coverData.value = "";
    form.querySelector("#cover-upload").value = "";
    form.querySelector("#cover-upload").setCustomValidity("");
    form.querySelector(".cover-feedback").textContent = "";
    display(form, app.art(token), title, token);
  }
  document.addEventListener("change", (e) => {
    if (e.target.id !== "cover-upload") return;
    const input = e.target,
      form = input.form,
      file = input.files[0];
    if (!file) return;
    const status = form.querySelector(".cover-feedback");
    input.setCustomValidity("");
    status.textContent = "正在处理封面…";
    const job = prepare(file)
      .then((data) => {
        if (jobs.get(form) !== job) return;
        form.elements.coverData.value = data;
        display(form, data, "自定义封面", null);
        status.textContent = "已使用上传的封面";
      })
      .catch((error) => {
        if (jobs.get(form) === job) {
          input.value = "";
          input.setCustomValidity(error.message);
          status.textContent = error.message + " 也可点选内置封面。";
        }
      })
      .finally(() => {
        if (jobs.get(form) === job) jobs.delete(form);
      });
    jobs.set(form, job);
  });
  async function ready(form) {
    while (jobs.has(form)) await jobs.get(form);
    const error = form.querySelector("#cover-upload").validationMessage;
    if (error) throw Error(error);
  }
  // Keep large image data out of the text draft index. Each save uses a new
  // reference so the previous draft remains intact until its index is replaced.
  const validRef = (key) =>
    typeof key === "string" && /^[a-f0-9-]{36}$/.test(key);
  let database;
  function openCovers() {
    if (!database)
      database = new Promise((resolve, reject) => {
        const req = indexedDB.open("sea-stationery", 1);
        req.onupgradeneeded = () => req.result.createObjectStore("covers");
        req.onerror = () => reject(req.error);
        req.onsuccess = () => resolve(req.result);
      }).catch((error) => {
        database = null;
        throw error;
      });
    return database;
  }
  async function storedCover(mode, operation) {
    const db = await openCovers();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("covers", mode);
      const request = operation(tx.objectStore("covers"));
      tx.oncomplete = () => resolve(request.result);
      tx.onabort = () => reject(tx.error || Error("本机封面存储未完成。"));
    });
  }
  function removeCover(ref) {
    if (validRef(ref))
      storedCover("readwrite", (store) => store.delete(ref)).catch(() => {});
  }
  function priorRef(key) {
    try {
      return JSON.parse(localStorage.getItem(key))?.coverRef;
    } catch {
      return null;
    }
  }
  async function saveDraft(key, data) {
    let value = data,
      ref;
    if (data.coverData && window.indexedDB && window.crypto?.randomUUID) {
      const id = crypto.randomUUID();
      try {
        await storedCover("readwrite", (store) =>
          store.put(data.coverData, id),
        );
        ref = id;
        value = { ...data, coverRef: ref };
        delete value.coverData;
      } catch {
        // Browsers with disabled IndexedDB can still keep small covers inline.
      }
    }
    const previous = priorRef(key);
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      removeCover(ref);
      if (error.name === "QuotaExceededError")
        throw Error(
          "此浏览器的草稿空间已满，本次改动仍在编辑页，原草稿已保留。",
        );
      throw error;
    }
    removeCover(previous);
  }
  function forgetDraft(key) {
    const previous = priorRef(key);
    localStorage.removeItem(key);
    removeCover(previous);
  }
  function restore(form) {
    const input = form.querySelector("#cover-upload"),
      ref = input.dataset.coverRef;
    if (!validRef(ref)) return;
    const status = form.querySelector(".cover-feedback");
    status.textContent = "正在读取草稿封面…";
    const job = storedCover("readonly", (store) => store.get(ref))
      .then((data) => {
        if (jobs.get(form) !== job) return;
        if (!isData(data)) throw Error();
        form.elements.coverData.value = data;
        display(form, data, "自定义封面", null);
        status.textContent = "";
      })
      .catch(() => {
        if (jobs.get(form) !== job) return;
        const message = "没有读出草稿封面，请重新上传或选择内置封面。";
        status.textContent = message;
        input.setCustomValidity(message);
      })
      .finally(() => {
        if (jobs.get(form) === job) jobs.delete(form);
      });
    jobs.set(form, job);
  }
  window.stationery = {
    editor,
    coverUrl,
    pick,
    ready,
    saveDraft,
    forgetDraft,
    restore,
  };
})();
