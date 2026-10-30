---
name: github-commit
description: 提交到 GitHub —— 检查 c:\Users\SY\Desktop\web 工作区改动、生成 git commit，并通过 SSH 推送到 GitHub 仓库 sy17-lu/shaoyuzimeng416（master 分支）。当用户说「提交到 github」「推到 github」「同步到 github」时使用。
---

# 提交到 GitHub

把当前工作区 `c:\Users\SY\Desktop\web` 的改动提交并推送到 GitHub。全程非交互，使用本机已配置的 SSH 公钥认证（不需要令牌、不需要输密码）。

## 固定参数

| 项 | 值 |
| --- | --- |
| git 可执行文件 | `D:\软件\Git\cmd\git.exe`（不在 PATH，必须用绝对路径） |
| 工作区根目录 | `c:\Users\SY\Desktop\web` |
| 远端地址 | `ssh://git@ssh.github.com:443/sy17-lu/shaoyuzimeng416.git` |
| 分支 | `master` |
| SSH 私钥 | `C:\Users\SY\.ssh\id_ed25519`（公钥已添加到 GitHub 账号 sy17-lu） |
| 提交身份 | 已全局配置，不要改写 |

## 关键前提：必须走 443 端口

本机 **22 端口被拒**（`ssh: connect to host github.com port 22: Connection refused`），SSH 必须走 GitHub 的 443 备用入口 `ssh.github.com:443`。因此 remote 一律写成上面的 `ssh://git@ssh.github.com:443/...` 形式，**不要**用 `git@github.com:...`。

## 硬性约束

- `.gitignore` 已排除 `lusyzm/`（那是独立的 Gitee 仓库，会造成嵌套子模块）、`.gitee_token`、`syzm_prompt.md`（含明文令牌）。**禁止**用 `git add -f` 强行加入这些路径。
- **禁止** `git push --force` 到 `master`。
- 推送前必须 `fetch`；远端领先时先快进或 rebase，不要强推。
- PowerShell 5 会把 git 写到 stderr 的进度/警告渲染成红字 `NativeCommandError`，属正常；成败以 `$LASTEXITCODE` 为准。

## 执行流程

### 1. 准备变量并验证 SSH

```powershell
$syzm_git = "D:\软件\Git\cmd\git.exe"
$syzm_repo = "c:\Users\SY\Desktop\web"
$syzm_remote = "ssh://git@ssh.github.com:443/sy17-lu/shaoyuzimeng416.git"
$env:GIT_TERMINAL_PROMPT = '0'
& "C:\Windows\System32\OpenSSH\ssh.exe" -o StrictHostKeyChecking=accept-new -o BatchMode=yes -p 443 -T git@ssh.github.com 2>&1 | Out-String -Width 200
# 出现 "Hi sy17-lu! You've successfully authenticated" 即通过（退出码为 1 属正常）
```

### 2. 首次使用：初始化仓库并绑定远端

```powershell
if (-not (Test-Path "$syzm_repo\.git")) {
  & $syzm_git -C $syzm_repo init 2>&1 | Out-String -Width 200
  & $syzm_git -C $syzm_repo branch -M master 2>&1 | Out-String -Width 200
  & $syzm_git -C $syzm_repo remote add origin $syzm_remote 2>&1 | Out-String -Width 200
}
& $syzm_git -C $syzm_repo remote -v
```

### 3. 查看改动

```powershell
& $syzm_git -C $syzm_repo status --short --branch 2>&1 | Out-String -Width 200
```

无改动时如实告知并结束，不要造空提交。确认输出里**不含** `lusyzm/`、`.gitee_token`、`syzm_prompt.md`。

### 4. 同步远端

```powershell
& $syzm_git -C $syzm_repo fetch origin 2>&1 | Out-String -Width 200
$syzm_behind = & $syzm_git -C $syzm_repo rev-list --count "HEAD..origin/master"
$syzm_ahead  = & $syzm_git -C $syzm_repo rev-list --count "origin/master..HEAD"
if ([int]$syzm_behind -gt 0 -and [int]$syzm_ahead -eq 0) {
  & $syzm_git -C $syzm_repo merge --ff-only origin/master 2>&1 | Out-String -Width 200
} elseif ([int]$syzm_behind -gt 0) {
  & $syzm_git -C $syzm_repo stash push -u -m "syzm_autostash" 2>&1 | Out-String -Width 200
  & $syzm_git -C $syzm_repo rebase origin/master 2>&1 | Out-String -Width 200
  if ($LASTEXITCODE -ne 0) { Write-Output "rebase 冲突，已停止（未回滚）"; return }
  & $syzm_git -C $syzm_repo stash pop 2>&1 | Out-String -Width 200
}
```

远端为空仓库时 `fetch` 不会报错但也没有 `origin/master`，此时 `rev-list` 会失败——直接跳到第 5 步即可。

### 5. 暂存并提交

```powershell
& $syzm_git -C $syzm_repo add -A 2>&1 | Out-String -Width 200
& $syzm_git -C $syzm_repo commit -m "feat: 说明本次改动" 2>&1 | Out-String -Width 200
& $syzm_git -C $syzm_repo show --stat --oneline HEAD 2>&1 | Select-Object -First 25 | Out-String -Width 200
```

提交信息格式 `type(scope): 摘要`（feat / fix / docs / style / refactor / chore），中文摘要不超过 50 字。

### 6. 推送

```powershell
& $syzm_git -C $syzm_repo push -u origin master 2>&1 | Out-String -Width 200
if ($LASTEXITCODE -ne 0) { Write-Output "push 失败，按故障处理排查" } else { Write-Output "push 成功" }
```

### 7. 验证

```powershell
$syzm_local  = & $syzm_git -C $syzm_repo rev-parse HEAD
$syzm_remote = (& $syzm_git -C $syzm_repo ls-remote origin -h refs/heads/master).Split("`t")[0]
"local=$syzm_local`nremote=$syzm_remote"
& $syzm_git -C $syzm_repo status -sb
```

两者相等才算成功。回复中给出提交号、提交信息、文件数、GitHub 仓库地址。

## 故障处理

| 现象 | 原因 | 处理 |
| --- | --- | --- |
| `connect to host github.com port 22: Connection refused` | 22 端口被网络封锁 | 改用 `ssh://git@ssh.github.com:443/...` |
| `Permission denied (publickey)` | 公钥未添加到 GitHub | 把 `C:\Users\SY\.ssh\id_ed25519.pub` 粘贴到 GitHub → Settings → SSH and GPG keys |
| `Permission denied (publickey)` 但 key 已存在 | ssh 未选中该私钥 | 指定 `-i C:\Users\SY\.ssh\id_ed25519`，或写 `~/.ssh/config` 指定 IdentityFile |
| `! [rejected] ... non-fast-forward` | 远端有新提交 | 回到第 4 步 fetch 后快进/rebase 重试 |
| `nothing to commit` | 工作区干净 | 如实告知，不要空提交 |
| 提交后 `lusyzm` 出现在 status | `.gitignore` 失效或用了 `add -f` | 立即 `git restore --staged lusyzm` 并检查 `.gitignore` |

## 完成标准

- `HEAD` 与远端 `refs/heads/master` 指向同一提交。
- 提交内容不含 `lusyzm/`、`.gitee_token`、`syzm_prompt.md`。
- 回复包含提交号、提交信息、文件数、仓库 URL。
