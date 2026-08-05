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
  assert.equal(defaultSiteContent.brand.name, "LIUHAN");
  assert.match(defaultSiteContent.brand.subtitle, /HankLau · HL/);
  assert.equal(defaultSiteContent.metrics.find((item) => item.label === "PUBLIC REACH")?.value, "38K+");
  assert.equal(defaultSiteContent.platforms.find((item) => item.name === "视频号")?.value, "20,000");
  assert.equal(defaultSiteContent.platforms.find((item) => item.name.startsWith("抖音"))?.value, "7,000");
  assert.equal(defaultSiteContent.platforms.find((item) => item.name === "知乎")?.value, "1,700");
  assert.equal(defaultSiteContent.platforms.find((item) => item.name === "小红书")?.value, "1,200");
  assert.equal(defaultSiteContent.contact.emailUrl, "mailto:veritasrensheng@gmail.com");
  assert.equal(defaultSiteContent.contact.socialUrl, "https://linktr.ee/HankLau");
});

test("content normalization blocks unsafe links and limits collections", () => {
  const content = normalizeSiteContent({
    ...defaultSiteContent,
    outputs: Array.from({ length: 30 }, (_, index) => ({ label: `${index}`, title: `输出 ${index}`, body: "测试" })),
    works: Array.from({ length: 20 }, (_, index) => ({
      platform: "TEST",
      metric: "100W+",
      title: `作品 ${index}`,
      summary: "测试",
      url: index === 0 ? "javascript:alert(1)" : "https://example.com/work",
    })),
    contact: {
      ...defaultSiteContent.contact,
      emailUrl: "mailto:hello@example.com",
      socialUrl: "javascript:alert(1)",
    },
  });

  assert.equal(content.outputs.length, 18);
  assert.equal(content.works.length, 12);
  assert.equal(content.works[0].url, "");
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
  assert.match(adminPage, /requireChatGPTUser/);
  assert.match(publicApi, /Access-Control-Allow-Origin/);
  assert.match(adminApi, /getAuthorizedAdmin/);
});

test("the Instagram video is bundled as a muted scrolling backdrop", async () => {
  const [page, video] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../public/ins-viral-video.mp4", import.meta.url)),
  ]);

  assert.match(page, /ins-viral-video\.mp4/);
  assert.match(page, /<video aria-hidden="true" autoPlay muted loop playsInline/);
  assert.match(page, /我的原创 AI 作品/);
  assert.match(page, /150万播放量/);
  assert.match(page, /Nothing great was ever achieved without enthusiasm\./);
  assert.match(page, /刘涵 · 류한/);
  assert.equal(video.subarray(4, 8).toString("ascii"), "ftyp");
  assert.ok(video.length > 1_000_000);
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
