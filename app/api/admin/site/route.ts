import { getD1 } from "../../../../db";
import { getAuthorizedAdmin } from "../../../../lib/admin-auth";
import { normalizeSiteContent } from "../../../../lib/site-content";

export const dynamic = "force-dynamic";

export async function PUT(request: Request) {
  const admin = await getAuthorizedAdmin();
  if (!admin) {
    return Response.json({ error: "没有管理权限，请使用站点管理员账号登录。" }, { status: 403 });
  }

  try {
    const body = (await request.json()) as { content?: unknown };
    const content = normalizeSiteContent(body.content);
    const payload = JSON.stringify(content);

    if (payload.length > 180_000) {
      return Response.json({ error: "内容数据过大，请减少超长文本或作品数量。" }, { status: 413 });
    }

    const d1 = await getD1();
    const result = await d1
      .prepare(`
        INSERT INTO site_content (id, payload, revision, updated_at, updated_by)
        VALUES (?, ?, 1, CURRENT_TIMESTAMP, ?)
        ON CONFLICT(id) DO UPDATE SET
          payload = excluded.payload,
          revision = site_content.revision + 1,
          updated_at = CURRENT_TIMESTAMP,
          updated_by = excluded.updated_by
      `)
      .bind("main", payload, admin.email)
      .run();

    if (!result.success) {
      throw new Error("D1 write failed");
    }

    const saved = await d1
      .prepare("SELECT revision, updated_at AS updatedAt FROM site_content WHERE id = ?")
      .bind("main")
      .first<{ revision: number; updatedAt: string }>();

    return Response.json({ content, revision: saved?.revision ?? 1, updatedAt: saved?.updatedAt ?? null });
  } catch (error) {
    const message = error instanceof Error ? error.message : "保存失败";
    const needsSetup = message.includes("no such table") || message.includes("binding `DB`");
    return Response.json(
      { error: needsSetup ? "内容数据库尚未初始化，请完成一次包含数据库迁移的部署。" : "保存失败，请稍后重试。" },
      { status: needsSetup ? 503 : 500 },
    );
  }
}
