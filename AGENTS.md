# AGENTS.md

Static HTML/CSS/JS site. No package manager, build step, lint, or tests. Verify changes by opening the page in a browser over `file://`.

## Layout and entrypoints

- Root `index.html` is the showcase landing page; it links `iconfont-1.html` (Font Awesome webfont) and `iconfont-2.html` (Lucide inline SVG via `cdn/lucide/lucide.min.js`).
- `lusyzm/` is the course project and its own git repository (pushed to Gitee); `lusyzm/index.html` is its catalog page. The workspace **root** is now also a git repository, pushed to GitHub — `lusyzm/` is excluded there via `.gitignore` to avoid a nested submodule.
- `cdn/` holds vendored fonts and icon libraries. Pages must not depend on remote CDNs; put new assets here.
- `lusyzm/24002120416 邵玉紫檬/` and `lusyzm/web/` are submission/duplicate snapshots. Do not assume an edit propagates between them; the primary sources are directly under `lusyzm/`.
- `.trae-html-share-packages/` contains generated zip bundles; ignore them.
- `lusyzm/README.md` and `README.en.md` are untouched Gitee boilerplate, not project documentation.

## Commands

- No `npm`/build commands exist. Open HTML files directly in the browser.
- `git` is **not on PATH**; use `D:\软件\Git\cmd\git.exe`.
- `.vscode/launch.json` points at a nonexistent root `9.9.html`; the real file is `lusyzm/9.9.html`.

## Git and Gitee submission

- Repo: `lusyzm/`, remote `origin` = `https://gitee.com/neusoft_wangyao_jsj/lusyzm.git`, branch `master`.
- Follow `skills/gitee-commit/SKILL.md` for commit/push: `fetch` first, rebase when behind, never force-push `master`.
- Token lives in `C:\Users\SY\Desktop\web\.gitee_token` (outside the repo). Never print it, commit it, or write it into `.git/config`/remote URLs; use the skill's one-off credential helper.
- The global `gitee-submit` skill has a different workflow (copies the project into a `24002120416 邵玉紫檬/` folder in a temp clone). Prefer the repo-local skill unless a submission-folder update is explicitly requested.
- Commit messages use `type(scope): 中文摘要` (see `git log`); keep them concise.
- PowerShell 5 renders git's stderr progress as red errors; judge success by `$LASTEXITCODE`, not color.

## Git and GitHub submission

- Root workspace repo: remote `origin` = `ssh://git@ssh.github.com:443/sy17-lu/shaoyuzimeng416.git`, branch `master`. SSH port 22 is blocked on this machine, so always use the `ssh.github.com:443` endpoint, never `git@github.com:`.
- Follow `skills/github-commit/SKILL.md` for commit/push; `.gitignore` excludes `lusyzm/`, `.gitee_token`, and `syzm_prompt.md` — never `git add -f` those.
- Published site: `https://sy17-lu.github.io/shaoyuzimeng416/` (Pages source: branch `master`, path `/`).

## Conventions

- `syzm_prompt.md` records standing rules: append each prompt (date, model, content) before acting; never overwrite prior entries.
- Every new root-level HTML page must be linked from root `index.html`.
- Root showcase pages prefix CSS classes, IDs, CSS variables, and JS variables with `SYZM_` (see `rank-tabs.html`, `news-tabs.html`, `js/SYZM_*.js`). Existing `lusyzm/` pages use plain names; match the file being edited instead of retrofitting prefixes.
- Pages are standalone HTML with inline `<style>`/`<script>`, UTF-8, Chinese `lang="zh-CN"` where appropriate. No framework.
- For new visual work, follow `skills/frontend-design/SKILL.md`; typography uses locally vendored Inter/Fraunces via `cdn/fonts/fonts.css`.

## HTML 注释规范（新建页面必做）

- 每个新建 HTML 文件必须在文件最顶部写文件头注释，固定包含四项信息：

```html
<!--
  作者：邵玉紫檬
  建立时间：2026-11-04
  使用大模型：DeepSeek-V4.1-Flash
  功能名称：首页导航页
-->
```

- **作者**固定为「邵玉紫檬」。
- **建立时间**为文件创建当天，格式 `YYYY-MM-DD`；后续编辑不修改该时间。
- **使用大模型**填生成该页面时所用模型名（如 `DeepSeek-V4.1-Flash`）；纯手写填「人工」。
- **功能名称**用一句短语概括页面用途，如「Font Awesome 图标展示」「Lucide SVG 图标展示」「首页入口」。
- JS 部分每个函数都要在其上方加一行 `//` 中文注释，说明该函数主要实现的功能，例如 `// 渲染图标网格并绑定主题切换`；只含单个表达式的事件回调可省略。
- 同一次创作中若新增多个页面，各自写自己的头部注释，不共用。
