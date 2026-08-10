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

## 3. Cloudflare Access

在 Zero Trust 中启用 One-time PIN 身份源，并为同一 Worker 域名建立两条自托管应用路径：

1. `/admin*`
2. `/api/admin/*`

两条应用都使用 Allow 策略，只允许网站所有者的管理员邮箱。然后在 Worker 的 Variables and Secrets 配置：

```text
AUTH_PROVIDER=cloudflare-access
ADMIN_EMAILS=<管理员邮箱，多个用逗号分隔>
CF_ACCESS_TEAM_DOMAIN=<团队名>.cloudflareaccess.com
CF_ACCESS_AUDS=<两条 Access 应用的 AUD，用逗号分隔>
```

这四项属于运行时配置，不写进 GitHub。代码会验证 Access JWT 的签名、签发者、有效期、类型、AUD 与邮箱；缺少配置时后台默认拒绝访问。

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
- 权限：在 Access 中撤销旧邮箱/会话并重新配置允许邮箱。
- 域名：Worker 默认域名可独立工作；自定义域名应在 Cloudflare DNS 中维护。
