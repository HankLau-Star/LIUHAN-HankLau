import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { defaultSiteContent, normalizeSiteContent } from "../lib/site-content.ts";

test("default content contains the complete portfolio structure", () => {
  assert.equal(defaultSiteContent.projects.length, 3);
  assert.ok(defaultSiteContent.skills.length >= 4);
  assert.ok(defaultSiteContent.outputs.some((item) => item.title === "自媒体"));
  assert.ok(defaultSiteContent.metrics.some((item) => item.value === "300W+"));
  assert.match(defaultSiteContent.hero.lineOne, /独自升级/);
});

test("content normalization blocks unsafe links and limits collections", () => {
  const content = normalizeSiteContent({
    ...defaultSiteContent,
    projects: Array.from({ length: 30 }, (_, index) => ({
      id: `作品 ${index}`,
      type: "TEST",
      year: "2026",
      title: `作品 ${index}`,
      summary: "测试",
      imageUrl: "javascript:alert(1)",
      projectUrl: "https://example.com",
      tags: ["ONE", "TWO"],
    })),
  });

  assert.equal(content.projects.length, 18);
  assert.equal(content.projects[0].imageUrl, "");
  assert.equal(content.projects[0].projectUrl, "https://example.com");
  assert.equal(content.projects[0].id, "---0");
});

test("front page and protected admin routes are wired", async () => {
  const [page, adminPage, publicApi, adminApi] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/admin/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/site/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/admin/site/route.ts", import.meta.url), "utf8"),
  ]);

  assert.match(page, /代表作品/);
  assert.match(page, /CONTENT CONSOLE/);
  assert.match(page, /publicContentEndpoint/);
  assert.match(adminPage, /requireChatGPTUser/);
  assert.match(publicApi, /Access-Control-Allow-Origin/);
  assert.match(adminApi, /getAuthorizedAdmin/);
});
