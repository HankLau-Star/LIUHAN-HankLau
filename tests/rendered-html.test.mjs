import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { defaultSiteContent, normalizeSiteContent } from "../lib/site-content.ts";

test("default content contains the complete portfolio structure", () => {
  assert.ok(defaultSiteContent.skills.length >= 4);
  assert.ok(defaultSiteContent.outputs.some((item) => item.title === "自媒体"));
  assert.ok(defaultSiteContent.metrics.some((item) => item.value === "300W+"));
  assert.equal(defaultSiteContent.hero.lineOne, "ASCENDER");
  assert.equal(defaultSiteContent.hero.lineTwo, "向内生长，");
  assert.equal(defaultSiteContent.works.length, 5);
  assert.ok(defaultSiteContent.works.slice(0, 3).every((item) => item.url.startsWith("https://www.zhihu.com/pin/")));
  assert.ok(defaultSiteContent.works.slice(3).every((item) => item.url.startsWith("https://mp.weixin.qq.com/s/")));
  assert.ok(defaultSiteContent.works.every((item) => item.mediaUrl === "" && item.mediaType === ""));
  assert.equal(defaultSiteContent.brand.name, "LIUHAN");
  assert.match(defaultSiteContent.brand.subtitle, /HankLau · HL/);
  assert.equal(defaultSiteContent.metrics.find((item) => item.label === "PUBLIC REACH")?.value, "38K+");
  assert.equal(defaultSiteContent.platforms.find((item) => item.name === "视频号")?.value, "20,000");
  assert.equal(defaultSiteContent.platforms.find((item) => item.name.startsWith("抖音"))?.value, "7,000");
  assert.equal(defaultSiteContent.platforms.find((item) => item.name === "知乎")?.value, "1,700");
  assert.equal(defaultSiteContent.platforms.find((item) => item.name === "小红书")?.value, "1,200");
  assert.equal(defaultSiteContent.contact.emailUrl, "mailto:veritasrensheng@gmail.com");
  assert.equal(defaultSiteContent.contact.socialUrl, "https://linktr.ee/HankLau");
  assert.match(defaultSiteContent.contact.body, /保持开放，快速成长/);
});

test("content normalization blocks unsafe links and limits collections", () => {
  const content = normalizeSiteContent({
    ...defaultSiteContent,
    outputs: Array.from({ length: 30 }, (_, index) => ({ label: `${index}`, title: `输出 ${index}`, body: "测试" })),
    works: Array.from({ length: 40 }, (_, index) => ({
      platform: "TEST",
      metric: "100W+",
      title: `作品 ${index}`,
      summary: "测试",
      url: index === 0 ? "javascript:alert(1)" : "https://example.com/work",
      mediaUrl: index === 0 ? "javascript:alert(2)" : "https://media.example.com/work.jpg",
      mediaType: "image",
    })),
    contact: {
      ...defaultSiteContent.contact,
      emailUrl: "mailto:hello@example.com",
      socialUrl: "javascript:alert(1)",
    },
  });

  assert.equal(content.outputs.length, 18);
  assert.equal(content.works.length, 30);
  assert.equal(content.works[0].url, "");
  assert.equal(content.works[0].mediaUrl, "");
  assert.equal(content.works[1].url, "https://example.com/work");
  assert.equal(content.contact.emailUrl, "mailto:hello@example.com");
  assert.equal(content.contact.socialUrl, "");
});

test("front page and protected admin routes are wired", async () => {
  const [page, adminPage, publicApi, adminApi] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/admin/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/site/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/admin/site/route.ts", import.meta.url), "utf8"),
  ]);

  assert.match(page, /查看代表作品/);
  assert.match(page, /href="#works"/);
  assert.match(page, /id="works"/);
  assert.match(page, /CONTENT CONSOLE/);
  assert.match(page, /publicContentEndpoint/);
  assert.match(adminPage, /requireAdminUser/);
  assert.match(publicApi, /Access-Control-Allow-Origin/);
  assert.match(adminApi, /getAuthorizedAdmin/);
});

test("each world has its own optimized muted video backdrop", async () => {
  const [page, personalVideo, societyVideo, natureVideo] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../public/ins-viral-video.mp4", import.meta.url)),
    readFile(new URL("../public/ue-first-project.mp4", import.meta.url)),
    readFile(new URL("../public/chopsticks-ai-film.mp4", import.meta.url)),
  ]);

  assert.match(page, /ins-viral-video\.mp4/);
  assert.match(page, /ue-first-project\.mp4/);
  assert.match(page, /chopsticks-ai-film\.mp4/);
  assert.match(page, /data-section="personal"/);
  assert.match(page, /data-section="society"/);
  assert.match(page, /data-section="nature"/);
  assert.match(page, /<video aria-hidden="true" muted loop playsInline/);
  assert.match(page, /我的原创 AI 作品/);
  assert.match(page, /150万播放量/);
  assert.match(page, /我的首个虚幻引擎 UE 作品/);
  assert.match(page, /我的首个 AI 全流程电影/);
  assert.match(page, /《一双筷子》 · ORIGINAL FILM/);
  assert.match(page, /Nothing great was ever achieved without enthusiasm\./);
  assert.match(page, /刘涵 · 류한/);
  for (const video of [personalVideo, societyVideo, natureVideo]) {
    assert.equal(video.subarray(4, 8).toString("ascii"), "ftyp");
    assert.ok(video.length > 1_000_000);
  }
  assert.ok(natureVideo.length < 5_000_000);
});

test("the calligraphic Korean headings and contact identity assets are bundled", async () => {
  const [page, avatar, wechat, instagram, linktree] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../public/liuhan-avatar.jpg", import.meta.url)),
    readFile(new URL("../public/qr-wechat.png", import.meta.url)),
    readFile(new URL("../public/qr-instagram.png", import.meta.url)),
    readFile(new URL("../public/qr-linktree.png", import.meta.url)),
  ]);

  assert.match(page, /section-korean/);
  assert.match(page, /개인/);
  assert.match(page, /사회 세계/);
  assert.match(page, /자연 세계/);
  assert.match(page, /연락하기/);
  assert.match(page, /liuhan-avatar\.jpg/);
  assert.match(page, /qr-wechat\.png/);
  assert.match(page, /qr-instagram\.png/);
  assert.match(page, /qr-linktree\.png/);
  assert.ok(avatar.length > 10_000);
  assert.ok(wechat.length > 10_000 && instagram.length > 10_000 && linktree.length > 10_000);
});

test("the licensed Sport Version 1 soundtrack autoplays with a browser-policy fallback", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

  assert.match(page, /audio_a4679e250c\.mp3/);
  assert.match(page, /src=\{soundtrackUrl\} autoPlay loop preload="auto"/);
  assert.match(page, /resumeAfterInteraction/);
  assert.match(page, /musicSuppressedRef/);
  assert.match(page, /aria-pressed=\{musicPlaying\}/);
  assert.match(page, /SPORT ON/);
  assert.match(page, /SPORT OFF/);
  assert.match(page, /BOMBINSOUND \/ PIXABAY/);
});

test("the phone homepage has an isolated responsive composition", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  const mobile = css.split("/* Phone-only home adaptation: desktop rules above remain unchanged. */")[1] ?? "";

  assert.match(mobile, /@media \(max-width: 680px\)/);
  assert.match(mobile, /min-height: max\(100svh, 1010px\)/);
  assert.match(mobile, /object-position: 50% 18%/);
  assert.match(mobile, /font-size: clamp\(3rem, 15vw, 4\.8rem\)/);
  assert.match(mobile, /env\(safe-area-inset-top\)/);
  assert.match(mobile, /@media \(max-width: 390px\)/);
  assert.match(mobile, /orientation: landscape/);
});

test("the iPad layout has isolated portrait and landscape compositions", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  const tablet = css.split("/* Touch-tablet adaptation: iPad portrait and landscape, without changing desktop. */")[1]
    ?.split("/* Phone-only home adaptation: desktop rules above remain unchanged. */")[0] ?? "";

  assert.match(tablet, /min-width: 681px/);
  assert.match(tablet, /max-width: 1100px/);
  assert.match(tablet, /orientation: portrait/);
  assert.match(tablet, /min-width: 921px/);
  assert.match(tablet, /max-width: 1366px/);
  assert.match(tablet, /orientation: landscape/);
  assert.match(tablet, /any-pointer: coarse/);
  assert.match(tablet, /min-height: max\(100svh, 1160px\)/);
  assert.match(tablet, /grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(tablet, /min-height: max\(100svh, 820px\)/);
});

test("the GitHub Pages workflow exports only static routes and keeps the hosted content console", async () => {
  const [page, workflow] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../.github/workflows/deploy-pages.yml", import.meta.url), "utf8"),
  ]);

  assert.match(page, /const adminHref = basePath \? `\$\{contentApiOrigin\}\/admin` : "\/admin"/);
  assert.match(page, /NEXT_PUBLIC_CONTENT_API/);
  assert.match(workflow, /mv app\/api _pages-api/);
  assert.match(workflow, /mv app\/admin _pages-admin/);
  assert.match(workflow, /actions\/configure-pages@v5/);
  assert.match(workflow, /NEXT_PUBLIC_BASE_PATH/);
});

test("owner-controlled Cloudflare hosting uses free D1 and supports optional R2 media uploads", async () => {
  const [page, adminAuth, accessVerifier, uploadRoute, mediaRoute, wranglerSource, hostingSource, migration] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../lib/admin-auth.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/cloudflare-access.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/admin/media/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/media/[...key]/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../wrangler.jsonc", import.meta.url), "utf8"),
    readFile(new URL("../.openai/hosting.json", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0001_unique_hellion.sql", import.meta.url), "utf8"),
  ]);
  const wrangler = JSON.parse(wranglerSource);
  const hosting = JSON.parse(hostingSource);

  assert.match(page, /NEXT_PUBLIC_CONTENT_API/);
  assert.match(page, /work-card-media/);
  assert.match(adminAuth, /cloudflare-access/);
  assert.match(adminAuth, /verifiedCloudflareAccessEmail/);
  assert.match(accessVerifier, /cf-access-jwt-assertion/);
  assert.match(accessVerifier, /crypto\.subtle\.verify/);
  assert.match(uploadRoute, /MAX_UPLOAD_BYTES/);
  assert.match(uploadRoute, /bucket\.put/);
  assert.match(mediaRoute, /bucket\.get/);
  assert.equal(wrangler.name, "liuhan-hanklau");
  assert.equal(wrangler.d1_databases[0].binding, "DB");
  assert.equal(wrangler.r2_buckets, undefined);
  assert.equal(hosting.r2, "MEDIA");
  assert.match(uploadRoute, /mediaBindingUnavailable/);
  assert.match(migration, /CREATE TABLE `media_assets`/);
  assert.match(migration, /idx_media_assets_created_at/);
  assert.doesNotMatch(migration, /CREATE TABLE `site_content`/);
});
