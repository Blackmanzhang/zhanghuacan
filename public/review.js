/* Local moderation UI. All reads, media and decisions require a server-validated session. */
(() => {
  "use strict";
  const { esc, request, icon } = window.app;
  function page() {
    return `<section class="review-screen"><header class="page-head"><div><h1>内容审核</h1><p>在本机审核公开书信、画格投稿和举报。</p></div></header><div id="review-workspace" aria-live="polite"><p class="subtle">正在读取审核队列…</p></div></section>`;
  }
  function login(message = "") {
    return `<form class="panel form-grid" id="review-login"><h2>本机管理员登录</h2><p>在项目目录运行 <code>python server.py admin-token</code>，将取得的一次性凭证填入下方。凭证在十分钟内有效。</p><label class="field">一次性审核凭证<input type="password" name="token" required maxlength="200" autocomplete="off"></label><p class="error">${esc(message)}</p><div><button type="submit" class="btn solid">打开审核台</button></div></form>`;
  }
  const kindName = {
    letter: "公开书信",
    panel: "长卷画格",
    report: "举报复核",
  };
  function attachment(media) {
    if (!media || !/^\/api\/admin\/media\/[\w-]+$/.test(media.url)) return "";
    const url = esc(media.url);
    return media.type === "image"
      ? `<img class="attachment" src="${url}" alt="待审附图">`
      : `<audio class="media-audio" controls src="${url}"></audio>`;
  }
  function queueCard(item) {
    const isReport = item.kind === "report",
      parent = item.sourceId
        ? `<a class="text-link" href="#read/${encodeURIComponent(item.sourceId)}">查看关联原信</a>`
        : "";
    return `<article class="panel"><div class="byline"><strong>${esc(kindName[item.kind] || "投稿")}</strong><span>${esc(item.author)}</span><time>${esc(item.created?.slice(0, 10))}</time></div><h2>${esc(item.title)}</h2>${item.reason ? `<p class="error">举报理由：${esc(item.reason)}</p>` : ""}${item.quote ? `<blockquote class="reference">${esc(item.quote)}</blockquote>` : ""}<p class="review-text">${esc(item.body)}</p>${item.layers?.length ? '<img class="sc-version-image" alt="待审画面" src="' + esc(window.studioCanvas.source(item)) + '">' : ""}${item.baseAvailable === false ? '<p class="error">前序画面授权已失效。</p>' : ""}${/^\/api\/admin\/covers\/[\w-]+$/.test(item.coverUrl || "") ? `<figure class="review-cover"><img class="attachment" src="${esc(item.coverUrl)}" alt="作者上传的信笺封面"><figcaption>自定义封面</figcaption></figure>` : ""}${attachment(item.media)}${parent}<div class="row-actions"><button class="btn solid compact" data-review-id="${esc(item.id)}" data-decision="approve">${isReport ? "保留原信并结案" : "通过审核"}</button><button class="btn compact" data-review-id="${esc(item.id)}" data-decision="reject" data-kind="${esc(item.kind)}">${isReport ? "撤下原信" : "驳回投稿"}</button></div></article>`;
  }
  function board(queue, history) {
    return `<div class="section-top"><h2>待处理（${queue.length}）</h2><div class="row-actions"><button class="btn compact" data-review-refresh>刷新</button><button class="btn compact" data-review-exit>退出审核台</button></div></div>${queue.length ? queue.map(queueCard).join("") : '<div class="empty">当前没有待处理的投稿或举报。</div>'}<details><summary>审核记录（最近 ${history.length} 条）</summary><div class="list">${history.map((row) => `<article class="list-item"><div><strong>${esc(kindName[row.kind] || row.kind)} · ${row.decision === "approve" ? "通过" : "驳回或撤下"}</strong><p>${esc(row.id)}</p></div><small>${row.channel === "web" ? "网页" : "终端"} · ${esc(row.created?.slice(0, 16)?.replace("T", " "))}</small></article>`).join("") || '<p class="subtle">暂无操作记录。</p>'}</div></details>`;
  }
  let fetchSerial = 0;
  async function load() {
    const box = document.querySelector("#review-workspace");
    if (!box) return;
    const serial = ++fetchSerial;
    try {
      const queue = await request("admin/queue");
      const history = await request("admin/history");
      if (serial === fetchSerial && box.isConnected)
        box.innerHTML = board(queue.items, history.items);
    } catch (e) {
      if (serial !== fetchSerial || !box.isConnected) return;
      box.innerHTML =
        e.status === 403
          ? login()
          : `<p class="error">${esc(e.message)}</p><button class="btn" data-review-refresh>重试</button>`;
    }
  }
  document.addEventListener("submit", async (e) => {
    const form = e.target;
    if (form.id !== "review-login") return;
    e.preventDefault();
    const submit = form.querySelector("button[type=submit]");
    submit.disabled = true;
    try {
      await request("admin/login", { token: form.elements.token.value.trim() });
      form.reset();
      await load();
    } catch (err) {
      form.querySelector(".error").textContent = err.message;
    } finally {
      submit.disabled = false;
    }
  });
  document.addEventListener("click", async (e) => {
    const btn = e.target.closest(
      "[data-review-refresh],[data-review-exit],[data-review-id]",
    );
    if (!btn) return;
    if (btn.hasAttribute("data-review-refresh")) {
      await load();
      return;
    }
    if (
      btn.dataset.decision === "reject" &&
      !window.confirm(
        btn.dataset.kind === "report"
          ? "确认撤下这封公开书信并处理举报？"
          : "确认驳回这份投稿？",
      )
    )
      return;
    btn.disabled = true;
    try {
      if (btn.hasAttribute("data-review-exit")) {
        await request("admin/logout", {});
        await load();
        return;
      }
      await request("admin/review", {
        id: btn.dataset.reviewId,
        decision: btn.dataset.decision,
      });
      await app.reload();
      await load();
      app.notify("审核结果已保存");
    } catch (err) {
      app.notify(err.message);
      await load();
    } finally {
      btn.disabled = false;
    }
  });
  window.reviewDesk = { page, load };
})();
