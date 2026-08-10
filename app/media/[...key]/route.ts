import { getMediaBucket, mediaBindingUnavailable } from "../../../lib/media-storage";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ key: string[] }> }) {
  try {
    const { key } = await context.params;
    const objectKey = key.map((segment) => decodeURIComponent(segment)).join("/");
    if (!objectKey.startsWith("portfolio/")) return new Response("Not found", { status: 404 });

    const bucket = await getMediaBucket();
    const object = await bucket.get(objectKey);
    if (!object) return new Response("Not found", { status: 404 });

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);
    headers.set("cache-control", "public, max-age=31536000, immutable");
    headers.set("x-content-type-options", "nosniff");
    return new Response(object.body, { headers });
  } catch (error) {
    return new Response(mediaBindingUnavailable(error) ? "Media storage unavailable" : "Unable to load media", { status: 503 });
  }
}
