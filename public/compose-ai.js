(() => {
  "use strict";
  function editor(body, available, { notebook = false } = {}) {
    const id = notebook ? "notebook" : "letter";
    const help = notebook ? "点击生成会发送标题、手账主题、地区和文化标签。可先预览草稿。"
      : "点击生成会把上面四项发给已配置的模型，可先预览草稿。";
    return `<div class="compose-writing"><div class="compose-writing-head">
      <label for="${id}-body">正文</label>
      <button type="button" class="btn compact compose-generate" data-ai-generate aria-describedby="compose-ai-help" ${available ? "" : "disabled"}>${app.icon("sparkles", 16)}<span>AI 生成正文</span></button>
    </div>
    <p id="compose-ai-help">${available ? help : "AI 正文生成尚未配置。按项目 README 配置后即可使用。"}</p>
    <div class="field"><textarea id="${id}-body" name="body" ${notebook ? "" : "required"} maxlength="${notebook ? 8000 : 5000}" rows="${notebook ? 8 : 9}" placeholder="${notebook ? "把你想留下的那段记忆写在这里。" : "写给远方的你……"}">${app.esc(body)}</textarea></div>
    <p class="compose-ai-status" data-ai-status role="status"></p>
    <section class="compose-ai-preview" data-ai-preview aria-labelledby="compose-ai-preview-title" hidden>
      <h3 id="compose-ai-preview-title" tabindex="-1">AI 草稿预览</h3>
      <div class="compose-ai-copy prose" data-ai-copy></div>
      <p data-ai-overwrite hidden>使用这份草稿会替换现有正文。</p>
      <div class="row-actions">
        <button type="button" class="btn compact" data-ai-discard>关闭预览</button>
        <button type="button" class="btn compact compose-generate" data-ai-apply>使用这份草稿</button>
      </div>
    </section></div>`;
  }

  function details(form) {
    const { title, theme, region } = form.elements;
    return {
      title: title.value.trim(),
      theme: theme.value,
      region: region.value.trim(),
      tags: window.cultureTools.readTags(form),
    };
  }

  function mount(form, { readDetails = details, notebook = false } = {}) {
    const endpoint = notebook ? "notebooks/generate-draft" : "generate-draft";
    const contentName = notebook ? "手账" : "书信";
    const stale = notebook ? "手账资料已修改，请重新生成草稿。" : "写信资料已修改，请重新生成草稿。";
    const generate = form.querySelector("[data-ai-generate]");
    const label = generate.querySelector("span");
    const status = form.querySelector("[data-ai-status]");
    const preview = form.querySelector("[data-ai-preview]");
    const copy = form.querySelector("[data-ai-copy]");
    const overwrite = form.querySelector("[data-ai-overwrite]");
    const apply = form.querySelector("[data-ai-apply]");
    const body = form.elements.body;
    let usedDetails;

    function updateApplyLabel() {
      const hasBody = body.value.length > 0;
      overwrite.hidden = !hasBody;
      apply.textContent = hasBody ? "替换为这份草稿" : "使用这份草稿";
    }
    function clearPreview() {
      preview.hidden = true;
      copy.textContent = "";
      usedDetails = undefined;
    }
    generate.addEventListener("click", async () => {
      const fields = readDetails(form);
      if (!fields.title) {
        status.textContent = notebook ? "请先填写手账标题。" : "请先填写信件标题。";
        form.elements.title.focus();
        return;
      }
      const route = location.hash;
      const snapshot = JSON.stringify(fields);
      clearPreview();
      generate.disabled = true;
      generate.setAttribute("aria-busy", "true");
      label.textContent = "正在生成…";
      status.textContent = `正在生成${contentName}草稿…`;
      try {
        const result = await app.request(endpoint, fields);
        if (!form.isConnected || location.hash !== route) return;
        if (snapshot !== JSON.stringify(readDetails(form))) {
          status.textContent = stale;
          return;
        }
        usedDetails = snapshot;
        copy.textContent = result.body;
        updateApplyLabel();
        status.textContent = "";
        preview.hidden = false;
        preview.querySelector("h3").focus();
      } catch (error) {
        if (form.isConnected && location.hash === route) {
          status.textContent = error.status
            ? error.message
            : "暂时连不上正文生成服务，请稍后再试。";
        }
      } finally {
        generate.disabled = false;
        generate.removeAttribute("aria-busy");
        label.textContent = "AI 生成正文";
      }
    });
    body.addEventListener("input", () => {
      if (!preview.hidden) updateApplyLabel();
    });
    form.querySelector("[data-ai-discard]").addEventListener("click", () => {
      clearPreview();
      generate.focus();
    });
    apply.addEventListener("click", () => {
      if (usedDetails !== JSON.stringify(readDetails(form))) {
        clearPreview();
        status.textContent = stale;
        generate.focus();
        return;
      }
      body.value = copy.textContent;
      clearPreview();
      body.dispatchEvent(new Event("input", { bubbles: true }));
      status.textContent = "草稿已填入正文，可以继续编辑。";
      body.focus();
    });
  }

  window.composeAI = { editor, mount };
})();
