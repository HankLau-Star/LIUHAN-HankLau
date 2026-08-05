import { getD1 } from "../../../db";
import { defaultSiteContent, normalizeSiteContent } from "../../../lib/site-content";

export const dynamic = "force-dynamic";

const publicHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "public, max-age=30, stale-while-revalidate=120",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: publicHeaders });
}

export async function GET() {
  try {
    const d1 = await getD1();
    const row = await d1
      .prepare("SELECT payload, revision, updated_at AS updatedAt FROM site_content WHERE id = ? LIMIT 1")
      .bind("main")
      .first<{ payload: string; revision: number; updatedAt: string }>();

    if (!row) {
      return Response.json(
        { content: defaultSiteContent, revision: 0, updatedAt: null, persisted: false },
        { headers: publicHeaders },
      );
    }

    return Response.json(
      {
        content: normalizeSiteContent(JSON.parse(row.payload)),
        revision: row.revision,
        updatedAt: row.updatedAt,
        persisted: true,
      },
      { headers: publicHeaders },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Content storage unavailable";
    const needsSetup = message.includes("no such table") || message.includes("binding `DB`");

    if (needsSetup) {
      return Response.json(
        { content: defaultSiteContent, revision: 0, updatedAt: null, persisted: false },
        { headers: publicHeaders },
      );
    }

    return Response.json({ error: "Unable to load site content" }, { status: 500, headers: publicHeaders });
  }
}
