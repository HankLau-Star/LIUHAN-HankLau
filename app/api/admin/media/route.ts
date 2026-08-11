import { getD1 } from "../../../../db";
import { getAuthorizedAdmin } from "../../../../lib/admin-auth";
import { getMediaBucket, mediaBindingUnavailable } from "../../../../lib/media-storage";

export const dynamic = "force-dynamic";

const MAX_UPLOAD_BYTES = 90 * 1024 * 1024;
const ALLOWED_MEDIA_TYPES = new Set([
  "text/plain",
  "text/markdown",
  "application/rtf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/epub+zip",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-m4v",
  "audio/mpeg",
  "audio/wav",
  "audio/mp4",
  "audio/aac",
  "audio/ogg",
  "audio/flac",
  "audio/x-flac",
  "application/pdf",
]);

const EXTENSION_MEDIA_TYPES: Record<string, string> = {
  ".txt": "text/plain",
  ".md": "text/markdown",
  ".rtf": "application/rtf",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".epub": "application/epub+zip",
  ".pdf": "application/pdf",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".m4v": "video/x-m4v",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".m4a": "audio/mp4",
  ".aac": "audio/aac",
  ".ogg": "audio/ogg",
  ".flac": "audio/flac",
};

function normalizedContentType(file: File): string {
  if (file.type) return file.type.toLowerCase();
  const match = file.name.toLowerCase().match(/\.[a-z0-9]+$/);
  return match ? EXTENSION_MEDIA_TYPES[match[0]] ?? "" : "";
}

function assetTypeFor(contentType: string): "text" | "image" | "audio" | "video" {
  if (contentType.startsWith("image/")) return "image";
  if (contentType.startsWith("audio/")) return "audio";
  if (contentType.startsWith("video/")) return "video";
  return "text";
}

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
    await getMediaBucket();
  } catch (error) {
    if (mediaBindingUnavailable(error)) return Response.json({ assets: [], storageConfigured: false });
    throw error;
  }

  try {
    const d1 = await getD1();
    const result = await d1
      .prepare("SELECT id, object_key AS objectKey, filename, content_type AS contentType, size, created_at AS createdAt FROM media_assets ORDER BY created_at DESC LIMIT 100")
      .all();
    return Response.json({ assets: result.results ?? [], storageConfigured: true });
  } catch {
    return Response.json({ assets: [], storageConfigured: true });
  }
}

export async function POST(request: Request) {
  const admin = await getAuthorizedAdmin();
  if (!admin) return Response.json({ error: "没有管理权限。" }, { status: 403 });

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) return Response.json({ error: "请选择需要上传的文件。" }, { status: 400 });
    const contentType = normalizedContentType(file);
    if (!ALLOWED_MEDIA_TYPES.has(contentType)) return Response.json({ error: "暂不支持这种文件格式。" }, { status: 415 });
    if (file.size <= 0 || file.size > MAX_UPLOAD_BYTES) return Response.json({ error: "单个文件需要小于 90MB。" }, { status: 413 });

    const id = crypto.randomUUID();
    const objectKey = `portfolio/${new Date().toISOString().slice(0, 10)}/${id}-${safeFilename(file.name)}`;
    const bucket = await getMediaBucket();
    await bucket.put(objectKey, file.stream(), {
      httpMetadata: { contentType, cacheControl: "public, max-age=31536000, immutable" },
      customMetadata: { filename: file.name.slice(0, 180), uploadedBy: admin.email },
    });

    try {
      const d1 = await getD1();
      await d1
        .prepare("INSERT INTO media_assets (id, object_key, filename, content_type, size, created_at, created_by) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)")
        .bind(id, objectKey, file.name.slice(0, 180), contentType, file.size, admin.email)
        .run();
    } catch (error) {
      await bucket.delete(objectKey);
      throw error;
    }

    return Response.json({
      asset: {
        id,
        filename: file.name,
        contentType,
        size: file.size,
        mediaType: assetTypeFor(contentType),
        assetType: assetTypeFor(contentType),
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
