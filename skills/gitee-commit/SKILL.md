---
name: gitee-commit
description: 提交项目 —— 检查工作区改动、按规范生成 git commit，并推送到 Gitee 仓库 neusoft_wangyao_jsj/lusyzm（master 分支）。当用户说「提交项目」「提交并推送」「推到 gitee」「同步代码」时使用。
---

# 提交项目

把 `lusyzm` 仓库的本地改动提交并推送到 Gitee。全程非交互，不需要用户输入密码。

## 固定参数

| 项 | 值 |
| --- | --- |
| git 可执行文件 | `D:\软件\Git\cmd\git.exe`（不在 PATH，必须用绝对路径调用） |
| 仓库根目录 | `c:\Users\SY\Desktop\web\lusyzm` |
| 远端 | `origin` → `https://gitee.com/neusoft_wangyao_jsj/lusyzm.git` |
| 分支 | `master` |
| 令牌文件 | `c:\Users\SY\Desktop\web\.gitee_token`（在仓库之外，只含一行私人令牌） |
| 提交身份 | 已在全局配置，不要改写 |

## 硬性约束

- 令牌只从文件读入环境变量，**禁止**回显、**禁止**写进命令参数、**禁止**写进 `.git/config` 或 remote URL。
- **禁止** `git push -f` / `--force` 到 `master`。
- 令牌文件位于仓库之外，若发现它出现在 `git status` 里，立即停止并上报。
- 推送前必须先 `fetch`；远端领先时先 `rebase`，不要强推覆盖他人提交。
- PowerShell 5 会把 git 写到 stderr 的进度信息渲染成红色 `NativeCommandError`，这是正常现象；判断成功与否请看 `$LASTEXITCODE`，不要被红字误导。

## 执行流程

### 1. 读取令牌

```powershell
$syzm_git = "D:\软件\Git\cmd\git.exe"
$syzm_repo = "c:\Users\SY\Desktop\web\lusyzm"
$syzm_tokenFile = "c:\Users\SY\Desktop\web\.gitee_token"
if (-not (Test-Path $syzm_tokenFile)) { Write-Output "缺少令牌文件，已中止"; return }
$env:GITEE_TOKEN = (Get-Content $syzm_tokenFile -Raw).Trim()
$env:GIT_TERMINAL_PROMPT = '0'
```

### 2. 查看改动

```powershell
$syzm_status = & $syzm_git -C $syzm_repo status --short --branch 2>&1
$syzm_status
```

无任何改动（除分支行外为空）时，直接告知「没有需要提交的改动」并结束，不要造空提交。

### 3. 先 fetch，确认是否需要 rebase

```powershell
& $syzm_git -C $syzm_repo fetch origin 2>&1 | Out-String -Width 200
if ($LASTEXITCODE -ne 0) { Write-Output "fetch 失败，已中止"; return }
$syzm_behind = & $syzm_git -C $syzm_repo rev-list --count "HEAD..origin/master"
$syzm_ahead  = & $syzm_git -C $syzm_repo rev-list --count "origin/master..HEAD"
if ([int]$syzm_behind -gt 0 -and [int]$syzm_ahead -eq 0) {
  # 本地无领先提交，直接快进（无冲突风险，优先用这个）
  & $syzm_git -C $syzm_repo merge --ff-only origin/master 2>&1 | Out-String -Width 200
} elseif ([int]$syzm_behind -gt 0) {
  & $syzm_git -C $syzm_repo stash push -u -m "syzm_autostash" 2>&1 | Out-String -Width 200
  & $syzm_git -C $syzm_repo rebase origin/master 2>&1 | Out-String -Width 200
  if ($LASTEXITCODE -ne 0) { Write-Output "rebase 冲突，已停止（未回滚）"; return }
  & $syzm_git -C $syzm_repo stash pop 2>&1 | Out-String -Width 200
}
```

rebase 冲突时：中止流程，把冲突文件列给用户，不要自动 `--abort` 丢改动。

### 4. 暂存并提交

```powershell
& $syzm_git -C $syzm_repo add -A 2>&1
$syzm_msg = "feat: 说明本次改动"
& $syzm_git -C $syzm_repo commit -m $syzm_msg 2>&1
```

提交信息格式 `type(scope): 摘要`，摘要用中文、不超过 50 字：

- `feat` 新增功能或页面；`fix` 修缺陷；`docs` 文档；`style` 样式调整；`refactor` 重构；`chore` 依赖/配置。

提交成功后，把 `git show --stat --oneline HEAD` 的输出摘要给用户。

### 5. 推送（一次性凭据助手，令牌不进磁盘配置）

```powershell
$syzm_helper = '!f() { echo username=oauth2; echo "password=$GITEE_TOKEN"; }; f'
& $syzm_git -C $syzm_repo -c credential.helper=$syzm_helper push origin HEAD:master 2>&1 | Out-String -Width 200
if ($LASTEXITCODE -ne 0) { Write-Output "push 失败，按故障处理排查" } else { Write-Output "push 成功" }
```

退出码非 0 时按下方「故障处理」排查，**不要**改用 `--force`。

### 6. 验证

```powershell
& $syzm_git -C $syzm_repo log --oneline -1
& $syzm_git -C $syzm_repo status -sb
$syzm_local = & $syzm_git -C $syzm_repo rev-parse HEAD
$syzm_remote = (& $syzm_git -C $syzm_repo -c credential.helper=$syzm_helper ls-remote origin -h refs/heads/master).Split("`t")[0]
"local=$syzm_local remote=$syzm_remote"
```

两者相等才算推送成功；最后输出一句话结论（提交号 + 文件数 + 是否已同步），**不要**输出令牌。

## 故障处理

| 现象 | 原因 | 处理 |
| --- | --- | --- |
| `git : 无法将“git”项识别为...` | git 不在 PATH | 用 `D:\软件\Git\cmd\git.exe` 绝对路径；换机时先 `where.exe git` 定位 |
| `Authentication failed` / `403` | 令牌失效或无该仓库权限 | 让用户重新生成私人令牌并更新 `.gitee_token`，不要猜 |
| `! [rejected] ... non-fast-forward` | 远端有新提交 | 回到第 3 步 fetch + rebase 后重试 |
| `nothing to commit` | 工作区干净 | 如实告知，不要空提交 |
| `fatal: 无法读取用户名` | 身份未配置 | `git config user.name/user.email` 补齐后重试 |

## 完成标准

- `HEAD` 与远端 `refs/heads/master` 指向同一提交。
- `git status` 干净（除未跟踪的忽略项）。
- 回复中包含提交号、提交信息、本次涉及文件数。
