import { getD1 } from "../../../../db";
import { getAuthorizedAdmin } from "../../../../lib/admin-auth";
import { getMediaBucket, mediaBindingUnavailable } from "../../../../lib/media-storage";

export const dynamic = "force-dynamic";

const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;
const ALLOWED_MEDIA_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "audio/mpeg",
  "audio/wav",
  "application/pdf",
]);

function safeFilename(value: string): string {
  const base = value
    .normalize("NFKC")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(-96);
  return base || "portfolio-asset";
}

function publicMediaUrl(request: Request, objectKey: string): string {
  return new URL(`/media/${objectKey.split("/").map(encodeURIComponent).join("/")}`, request.url).toString();
}

export async function GET() {
  const admin = await getAuthorizedAdmin();
  if (!admin) return Response.json({ error: "没有管理权限。" }, { status: 403 });

  try {
    const d1 = await getD1();
    const result = await d1
      .prepare("SELECT id, object_key AS objectKey, filename, content_type AS contentType, size, created_at AS createdAt FROM media_assets ORDER BY created_at DESC LIMIT 100")
      .all();
    return Response.json({ assets: result.results ?? [] });
  } catch {
    return Response.json({ assets: [] });
  }
}

export async function POST(request: Request) {
  const admin = await getAuthorizedAdmin();
  if (!admin) return Response.json({ error: "没有管理权限。" }, { status: 403 });

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) return Response.json({ error: "请选择需要上传的文件。" }, { status: 400 });
    if (!ALLOWED_MEDIA_TYPES.has(file.type)) return Response.json({ error: "暂不支持这种文件格式。" }, { status: 415 });
    if (file.size <= 0 || file.size > MAX_UPLOAD_BYTES) return Response.json({ error: "单个文件需要小于 50MB。" }, { status: 413 });

    const id = crypto.randomUUID();
    const objectKey = `portfolio/${new Date().toISOString().slice(0, 10)}/${id}-${safeFilename(file.name)}`;
    const bucket = await getMediaBucket();
    await bucket.put(objectKey, file.stream(), {
      httpMetadata: { contentType: file.type, cacheControl: "public, max-age=31536000, immutable" },
      customMetadata: { filename: file.name.slice(0, 180), uploadedBy: admin.email },
    });

    try {
      const d1 = await getD1();
      await d1
        .prepare("INSERT INTO media_assets (id, object_key, filename, content_type, size, created_at, created_by) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)")
        .bind(id, objectKey, file.name.slice(0, 180), file.type, file.size, admin.email)
        .run();
    } catch (error) {
      await bucket.delete(objectKey);
      throw error;
    }

    return Response.json({
      asset: {
        id,
        filename: file.name,
        contentType: file.type,
        size: file.size,
        mediaType: file.type.split("/")[0],
        url: publicMediaUrl(request, objectKey),
      },
    });
  } catch (error) {
    return Response.json(
      { error: mediaBindingUnavailable(error) ? "作品素材存储尚未完成配置。" : "上传失败，请稍后重试。" },
      { status: mediaBindingUnavailable(error) ? 503 : 500 },
    );
  }
}
