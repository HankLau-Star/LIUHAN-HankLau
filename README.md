# ASCENDER · LIUHAN / HankLau

LIUHAN / HankLau（刘涵 · 류한）的个人网站，以“向内生长，向外创造”为核心，围绕个人、社会世界、自然世界与联系方式展开。

- 正式网站：https://hanklau-star.github.io/LIUHAN-HankLau/
- 源码仓库：https://github.com/HankLau-Star/LIUHAN-HankLau
- 维护与换账号交接：[docs/网站维护与账号交接说明.md](docs/网站维护与账号交接说明.md)
- Cloudflare 部署手册：[docs/Cloudflare独立部署说明.md](docs/Cloudflare独立部署说明.md)
- AI/Codex 协作约定：[AGENTS.md](AGENTS.md)

## 本地开发

需要 Node.js 22.13 或更高版本，并使用仓库现有的 pnpm 锁文件。

```bash
pnpm install --frozen-lockfile
pnpm dev
pnpm test
```

项目基于 vinext/Next.js。GitHub 是唯一源码源；Cloudflare Workers、免费 D1 与 Access 承载独立全栈主站和后台，R2 素材上传为所有者主动开通后的可选扩展，GitHub Pages 保留为静态公开镜像。旧 OpenAI Sites 在迁移核验完成前仅作为回退。具体架构、修改方式和发布流程请阅读交接说明。
