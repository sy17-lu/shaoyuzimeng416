# AGENTS.md

Static HTML/CSS/JS site. No package manager, build step, lint, or tests. Verify changes by opening the page in a browser over `file://`.

## Layout and entrypoints

- Root `index.html` is the showcase landing page; it links `iconfont-1.html` (Font Awesome webfont) and `iconfont-2.html` (Lucide inline SVG via `cdn/lucide/lucide.min.js`).
- `lusyzm/` is the course project and the **only git repository** (the workspace root is not a repo). `lusyzm/index.html` is its catalog page.
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

## Conventions

- `syzm_prompt.md` records standing rules: append each prompt (date, model, content) before acting; never overwrite prior entries.
- Every new root-level HTML page must be linked from root `index.html`.
- Root showcase pages prefix CSS classes, IDs, and JS variables with `syzm_` (see `index.html`, `iconfont-*.html`). Existing `lusyzm/` pages use plain names; match the file being edited instead of retrofitting prefixes.
- Pages are standalone HTML with inline `<style>`/`<script>`, UTF-8, Chinese `lang="zh-CN"` where appropriate. No framework.
- For new visual work, follow `skills/frontend-design/SKILL.md`; typography uses locally vendored Inter/Fraunces via `cdn/fonts/fonts.css`.
