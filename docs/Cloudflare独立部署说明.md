# Cloudflare 独立部署说明

本项目使用网站所有者自己的 GitHub 与 Cloudflare 账号，避免依赖任何 ChatGPT 账号。首次部署完成后，日常代码发布由 GitHub `main` 自动触发。

## 1. Cloudflare 资源

- Worker：`liuhan-hanklau`
- D1 绑定：`DB`
- R2 绑定：`MEDIA`（可选；只有网站所有者主动开通 R2 订阅后才配置）
- 静态资产绑定：`ASSETS`
- 配置源：根目录 `wrangler.jsonc`

首次导入 GitHub 仓库时，可让 Cloudflare 根据绑定配置创建免费的 D1 数据库。默认部署不声明 R2，避免在未经网站所有者明确同意时开通按量计费订阅；文字、数值、作品资料和外部作品链接全部可以只用 D1 正常管理。以后如需直接上传图片、视频、音频或 PDF，由网站所有者先在 Cloudflare 开通 R2，再创建 `liuhan-hanklau-media` 并把 `MEDIA` 绑定加入 `wrangler.jsonc`。数据库 ID 和桶名称不是密码，可以提交；API 令牌不可以提交。

构建命令：

```text
pnpm install --frozen-lockfile && pnpm run build
```

部署命令：

```text
pnpm exec wrangler deploy
```

生产分支：`main`

## 2. 初始化 D1

Worker 首次创建后，在已登录 Cloudflare 的本地环境或 CI 中运行：

```bash
pnpm cloudflare:migrate
```

此命令应用 `drizzle/` 中尚未执行的迁移，创建 `site_content` 与 `media_assets`。再次运行只会应用新增迁移。

## 3. GitHub OAuth 后台登录（默认免费方案）

在 GitHub 个人设置的 Developer settings → OAuth Apps 创建网站所有者自己的 OAuth App：

```text
Application name: LIUHAN HankLau Portfolio Admin
Homepage URL: https://liuhan-hanklau.veritasrensheng.workers.dev
Authorization callback URL: https://liuhan-hanklau.veritasrensheng.workers.dev/api/auth/github/callback
```

不要启用 Device Flow。生成 Client Secret 后，在 Worker 的 Variables and Secrets 配置：

```text
AUTH_PROVIDER=github
ADMIN_EMAILS=<管理员邮箱>
ADMIN_GITHUB_LOGINS=<允许登录的 GitHub 用户名，多个用逗号分隔>
GITHUB_OAUTH_CLIENT_ID=<OAuth App Client ID>
GITHUB_OAUTH_CLIENT_SECRET=<OAuth App Client Secret，必须使用 Secret 类型>
SESSION_SECRET=<至少 32 字节随机值，必须使用 Secret 类型>
```

这些属于运行时配置，不写进 GitHub。代码只申请 GitHub `read:user` 只读权限，用随机 `state` 防止跨站请求伪造，只允许配置中的 GitHub 用户名，并签发 12 小时 HttpOnly、Secure、SameSite 会话；GitHub access token 完成身份确认后不会保存。缺少配置、会话签名错误、过期或账号不匹配时，后台默认拒绝访问。

Cloudflare Access 仍保留为可选企业方案；若账户开通 Zero Trust 并配置 `CF_ACCESS_TEAM_DOMAIN` 与 `CF_ACCESS_AUDS`，可把 `AUTH_PROVIDER` 改回 `cloudflare-access`。

## 4. GitHub Pages 镜像

Cloudflare 主站验证后，在 GitHub 仓库 Settings → Secrets and variables → Actions → Variables 新增：

```text
CONTENT_API_URL=https://<Cloudflare 主站域名>
```

随后重新运行 Pages 工作流。静态镜像会从 Cloudflare `/api/site` 读取后台内容；API 不可用时仍显示代码默认内容。

## 5. 发布顺序

1. `pnpm test`
2. 提交并推送 `main`
3. 确认 Cloudflare Workers Builds 成功
4. 应用新的 D1 迁移（如有）
5. 检查主站、`/api/site`、`/admin`、保存与素材上传
6. 确认 GitHub Pages Actions 成功并检查镜像
7. 两套新链路稳定后，再决定是否停用旧 OpenAI Sites；不要提前删除

## 6. 最小恢复流程

- 代码：从 GitHub 克隆并切到最近正常提交。
- 内容：从 D1 备份或 `/api/site` JSON 恢复。
- 素材：已开通 R2 时从 R2 与原始文件备份恢复；未开通时从作品外链和原始文件备份恢复。
- 权限：在 GitHub OAuth App 中重置 Client Secret，并在 Cloudflare 中轮换 `GITHUB_OAUTH_CLIENT_SECRET` 与 `SESSION_SECRET`；必要时修改允许的 GitHub 用户名。
- 域名：Worker 默认域名可独立工作；自定义域名应在 Cloudflare DNS 中维护。
