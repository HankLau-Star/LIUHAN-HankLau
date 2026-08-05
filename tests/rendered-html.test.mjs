import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { defaultSiteContent, normalizeSiteContent } from "../lib/site-content.ts";

test("default content contains the complete portfolio structure", () => {
  assert.ok(defaultSiteContent.skills.length >= 4);
  assert.ok(defaultSiteContent.outputs.some((item) => item.title === "自媒体"));
  assert.ok(defaultSiteContent.metrics.some((item) => item.value === "300W+"));
  assert.match(defaultSiteContent.hero.lineOne, /独自升级/);
  assert.equal(defaultSiteContent.brand.name, "LIUHAN");
  assert.match(defaultSiteContent.brand.subtitle, /HankLau · HL/);
  assert.equal(defaultSiteContent.contact.emailUrl, "mailto:veritasrensheng@gmail.com");
  assert.equal(defaultSiteContent.contact.socialUrl, "https://linktr.ee/HankLau");
});

test("content normalization blocks unsafe links and limits collections", () => {
  const content = normalizeSiteContent({
    ...defaultSiteContent,
    outputs: Array.from({ length: 30 }, (_, index) => ({ label: `${index}`, title: `输出 ${index}`, body: "测试" })),
    contact: {
      ...defaultSiteContent.contact,
      emailUrl: "mailto:hello@example.com",
      socialUrl: "javascript:alert(1)",
    },
  });

  assert.equal(content.outputs.length, 18);
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
  assert.match(page, /href="#output"/);
  assert.doesNotMatch(page, /id="works"/);
  assert.match(page, /CONTENT CONSOLE/);
  assert.match(page, /publicContentEndpoint/);
  assert.match(adminPage, /requireChatGPTUser/);
  assert.match(publicApi, /Access-Control-Allow-Origin/);
  assert.match(adminApi, /getAuthorizedAdmin/);
});
