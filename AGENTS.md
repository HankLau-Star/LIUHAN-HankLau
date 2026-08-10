# ASCENDER 网站协作约定

本文件供未来接手此仓库的 ChatGPT、Codex 或其他代码代理自动读取。开始修改前，请先阅读 `docs/网站维护与账号交接说明.md`。

## 项目身份

- 网站所有者：LIUHAN / HankLau / HL（刘涵 · 류한）
- GitHub 仓库：https://github.com/HankLau-Star/LIUHAN-HankLau
- GitHub Pages：https://hanklau-star.github.io/LIUHAN-HankLau/
- Cloudflare 全栈主站：以 Cloudflare Workers 部署后的地址为准
- 旧站回退：https://ascender-archive-01.valid-gnat-7482.chatgpt.site/

## 产品与内容边界

- 保持网站“极简、高级、热血、飘逸科幻”的 ASCENDER 视觉方向。
- 一级内容结构固定为：个人、社会世界、自然世界、联系方式。
- 代表作品属于“个人”部分，不单独成为一级栏目；首页的“查看代表作品”入口需要保留。
- “个人”包含：个人实力与背书、输入、输出。能力和荣誉放在“实力与背书”；实习实践、社群、自媒体、书籍、创业公司、百科与公共影响力放在“输出”。
- 联系区保持开放表达，不把联系对象限制为某个行业或兴趣方向。
- 不擅自替换人物身份、原创作品署名、社交数据、联系方式或外部作品链接。

## 架构事实

- `main` 分支是唯一源码源。GitHub Pages 和 Cloudflare Workers 均从它构建；不要在线上直接维护另一份代码。
- `.github/workflows/deploy-pages.yml` 发布静态镜像；仓库变量 `CONTENT_API_URL` 指向 Cloudflare 主站，使镜像读取同一份内容。
- `wrangler.jsonc` 默认只定义 Cloudflare Worker、D1 数据库和静态资产；R2 `MEDIA` 是所有者主动开通计费后才添加的可选素材桶。Cloudflare Access 保护 `/admin*` 与 `/api/admin/*`。
- Cloudflare 运行时变量 `AUTH_PROVIDER`、`ADMIN_EMAILS`、`CF_ACCESS_TEAM_DOMAIN`、`CF_ACCESS_AUDS` 只能保存在 Cloudflare 控制台，不能提交到仓库。
- `.openai/hosting.json` 仅用于保留旧 OpenAI Sites 回退部署；Cloudflare 完成核验前不要删除旧站或旧数据。
- `lib/site-content.ts` 中的 `defaultSiteContent` 是代码级默认内容和故障回退。后台有已保存内容时，数据库内容优先。
- 不要把密码、访问令牌、Cookie、私钥或其他凭据写进仓库、文档、远程地址或 Git 配置。

## 修改规则

- 保留现有包管理器、锁文件、vinext/Next.js 结构和 GitHub + Cloudflare 双发布方案，除非所有者明确要求迁移。
- 内容数据结构统一在 `lib/site-content.ts` 维护；新增字段时同步更新类型、默认值、归一化逻辑、管理后台和测试。
- 首页动态内容入口在 `app/page.tsx`；后台界面在 `app/admin/`；公共及管理 API 在 `app/api/`。
- 图片、二维码、视频等静态资产放在 `public/`，引用时必须兼容 GitHub Pages 的仓库子路径。
- 保留 `personal`、`works`、`society`、`nature`、`contact` 等现有锚点，避免破坏导航和外部链接。
- 保持桌面端与手机端可用，并尊重现有的无障碍标签、键盘操作和减少动画偏好。
- 修改前先检查 `git status`，保留所有者已有且与任务无关的改动。

## 验证与发布

- Node.js：`>=22.13.0`
- 包管理器：pnpm（遵循 `pnpm-lock.yaml`）
- 安装：`pnpm install --frozen-lockfile`
- 完整验证：`pnpm test`
- 本地开发：`pnpm dev`
- GitHub Pages 本地预览：`pnpm preview:pages`
- D1 迁移：`pnpm cloudflare:migrate`
- 手动发布 Cloudflare：`pnpm cloudflare:deploy`
- 源码修改验证通过后提交到 `main`；推送 GitHub 后同时检查 Cloudflare 构建和 GitHub Pages 工作流。
- 数据库结构变更先添加 Drizzle 迁移并在 Cloudflare D1 执行；不要手工删除生产数据。

## 交接原则

新账号或新代理不会继承旧聊天记录、本地目录、浏览器登录或托管后台权限。接手时必须以仓库代码、此文件和维护文档为准，并通过 GitHub 官方授权获得写入权限。
