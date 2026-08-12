/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";

interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  // Optional: add an R2 `MEDIA` binding after the owner enables R2 billing.
  MEDIA?: R2Bucket;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

function requestedByteRange(value: string, totalBytes: number): { start: number; end: number } | null {
  const match = /^bytes=(\d*)-(\d*)$/.exec(value.trim());
  if (!match || (!match[1] && !match[2]) || totalBytes <= 0) return null;
  if (!match[1]) {
    const suffixLength = Number(match[2]);
    if (!Number.isSafeInteger(suffixLength) || suffixLength <= 0) return null;
    return { start: Math.max(totalBytes - suffixLength, 0), end: totalBytes - 1 };
  }
  const start = Number(match[1]);
  const requestedEnd = match[2] ? Number(match[2]) : totalBytes - 1;
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(requestedEnd) || start < 0 || start >= totalBytes || requestedEnd < start) return null;
  return { start, end: Math.min(requestedEnd, totalBytes - 1) };
}

async function serveVideoAsset(request: Request, assets: Fetcher): Promise<Response> {
  const asset = await assets.fetch(new Request(request.url, { method: request.method }));
  if (!asset.ok || request.method === "HEAD") {
    const headers = new Headers(asset.headers);
    if (asset.ok) headers.set("Accept-Ranges", "bytes");
    return new Response(asset.body, { status: asset.status, statusText: asset.statusText, headers });
  }

  const rangeHeader = request.headers.get("Range");
  if (!rangeHeader) {
    const headers = new Headers(asset.headers);
    headers.set("Accept-Ranges", "bytes");
    return new Response(asset.body, { status: asset.status, statusText: asset.statusText, headers });
  }

  const bytes = await asset.arrayBuffer();
  const range = requestedByteRange(rangeHeader, bytes.byteLength);
  if (!range) {
    return new Response(null, {
      status: 416,
      headers: { "Accept-Ranges": "bytes", "Content-Range": `bytes */${bytes.byteLength}` },
    });
  }
  const headers = new Headers(asset.headers);
  headers.set("Accept-Ranges", "bytes");
  headers.set("Content-Range", `bytes ${range.start}-${range.end}/${bytes.byteLength}`);
  headers.set("Content-Length", String(range.end - range.start + 1));
  return new Response(bytes.slice(range.start, range.end + 1), { status: 206, headers });
}

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Return real 206 responses for mobile Safari/Chrome video streaming.
    // Cloudflare's app handler and asset binding can otherwise answer a partial
    // request with a full-file 200, delaying or preventing playback on phones.
    if ((request.method === "GET" || request.method === "HEAD") && url.pathname.toLowerCase().endsWith(".mp4")) {
      return serveVideoAsset(request, env.ASSETS);
    }

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      return handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths);
    }

    return handler.fetch(request, env, ctx);
  },
};

export default worker;
