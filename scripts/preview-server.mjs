import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import worker from "../dist/server/index.js";

const host = process.env.PREVIEW_HOST ?? "127.0.0.1";
const port = Number(process.env.PREVIEW_PORT ?? 4173);
const clientRoot = path.resolve("dist/client");

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".json": "application/json; charset=utf-8",
};

function clientPath(pathname) {
  const resolved = path.resolve(clientRoot, `.${decodeURIComponent(pathname)}`);
  return resolved.startsWith(`${clientRoot}${path.sep}`) ? resolved : null;
}

async function readStatic(pathname) {
  const filePath = clientPath(pathname);
  if (!filePath) return null;
  try {
    const info = await stat(filePath);
    if (!info.isFile()) return null;
    const body = await readFile(filePath);
    return { body, type: contentTypes[path.extname(filePath).toLowerCase()] ?? "application/octet-stream" };
  } catch {
    return null;
  }
}

const server = createServer(async (request, response) => {
  const requestUrl = new URL(request.url ?? "/", `http://${host}:${port}`);
  const staticAsset = await readStatic(requestUrl.pathname);
  if (staticAsset) {
    response.writeHead(200, { "Content-Type": staticAsset.type, "Cache-Control": "no-store" });
    response.end(staticAsset.body);
    return;
  }

  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  const body = chunks.length ? Buffer.concat(chunks) : undefined;

  try {
    const webResponse = await worker.fetch(
      new Request(requestUrl, {
        method: request.method,
        headers: request.headers,
        body: request.method === "GET" || request.method === "HEAD" ? undefined : body,
      }),
      {
        ASSETS: {
          fetch: async (assetRequest) => {
            const asset = await readStatic(new URL(assetRequest.url).pathname);
            return asset ? new Response(asset.body, { headers: { "Content-Type": asset.type } }) : new Response("Not found", { status: 404 });
          },
        },
      },
      { waitUntil() {}, passThroughOnException() {} },
    );

    const responseBody = Buffer.from(await webResponse.arrayBuffer());
    response.writeHead(webResponse.status, Object.fromEntries(webResponse.headers.entries()));
    response.end(responseBody);
  } catch (error) {
    response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    response.end(error instanceof Error ? error.message : "Preview failed");
  }
});

server.listen(port, host, () => {
  console.log(`LIUHAN preview: http://${host}:${port}`);
});
