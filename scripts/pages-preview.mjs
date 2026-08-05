import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";

const host = "127.0.0.1";
const port = Number(process.env.PAGES_PREVIEW_PORT ?? 4174);
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "/LIUHAN-HankLau";
const outputRoot = path.resolve("out");
const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mp4": "video/mp4",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
};

function outputPath(pathname) {
  if (pathname === basePath) pathname = `${basePath}/`;
  if (!pathname.startsWith(`${basePath}/`)) return null;
  const relative = decodeURIComponent(pathname.slice(basePath.length + 1)) || "index.html";
  const candidate = path.resolve(outputRoot, relative);
  return candidate === outputRoot || candidate.startsWith(`${outputRoot}${path.sep}`) ? candidate : null;
}

async function staticAsset(pathname) {
  let filePath = outputPath(pathname);
  if (!filePath) return null;
  try {
    const info = await stat(filePath);
    if (info.isDirectory()) filePath = path.join(filePath, "index.html");
    const body = await readFile(filePath);
    return { body, type: contentTypes[path.extname(filePath).toLowerCase()] ?? "application/octet-stream" };
  } catch {
    return null;
  }
}

createServer(async (request, response) => {
  const requestUrl = new URL(request.url ?? "/", `http://${host}:${port}`);
  if (requestUrl.pathname === "/") {
    response.writeHead(302, { Location: `${basePath}/` });
    response.end();
    return;
  }
  const asset = await staticAsset(requestUrl.pathname);
  if (!asset) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }
  const range = request.headers.range?.match(/^bytes=(\d*)-(\d*)$/);
  if (range) {
    const start = range[1] ? Number(range[1]) : 0;
    const end = range[2] ? Math.min(Number(range[2]), asset.body.length - 1) : asset.body.length - 1;
    if (start > end || start >= asset.body.length) {
      response.writeHead(416, { "Content-Range": `bytes */${asset.body.length}` });
      response.end();
      return;
    }
    const partial = asset.body.subarray(start, end + 1);
    response.writeHead(206, {
      "Content-Type": asset.type,
      "Content-Range": `bytes ${start}-${end}/${asset.body.length}`,
      "Content-Length": partial.length,
      "Accept-Ranges": "bytes",
      "Cache-Control": "no-store",
    });
    response.end(request.method === "HEAD" ? undefined : partial);
    return;
  }
  response.writeHead(200, {
    "Content-Type": asset.type,
    "Content-Length": asset.body.length,
    "Accept-Ranges": "bytes",
    "Cache-Control": "no-store",
  });
  response.end(request.method === "HEAD" ? undefined : asset.body);
}).listen(port, host, () => {
  console.log(`GitHub Pages preview: http://${host}:${port}${basePath}/`);
});
