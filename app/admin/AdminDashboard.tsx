"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { defaultSiteContent, normalizeSiteContent, type SiteContent } from "../../lib/site-content";

type CollectionKey =
  | "skills"
  | "honors"
  | "inputs"
  | "outputs"
  | "experiences"
  | "works"
  | "metrics"
  | "platforms"
  | "natureItems"
  | "spiritualAssets"
  | "physicalAssets"
  | "workAssets";
type StaticTab = "siteSettings" | "personalOverview" | "societyOverview" | "natureOverview";
type AdminTab = StaticTab | CollectionKey;
type FieldConfig = { key: string; label: string; kind?: "text" | "textarea" | "url" };
type CollectionConfig = { key: CollectionKey; title: string; eyebrow: string; description: string; fields: FieldConfig[]; blank: Record<string, string | string[]> };
type NavGroup = { key: string; code: string; title: string; subtitle: string; items: Array<{ tab: AdminTab; code: string; label: string }> };
type AssetCollectionKey = "spiritualAssets" | "physicalAssets" | "workAssets";
type AssetUploadKind = "text" | "audio" | "video" | "image";

const TEXT_ACCEPT = ".txt,.md,.rtf,.pdf,.doc,.docx,.epub,text/plain,text/markdown,application/pdf,application/rtf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/epub+zip";
const AUDIO_ACCEPT = ".mp3,.wav,.m4a,.aac,.ogg,.flac,audio/*";
const VIDEO_ACCEPT = ".mp4,.webm,.mov,.m4v,video/*";
const IMAGE_ACCEPT = ".jpg,.jpeg,.png,.webp,.gif,.avif,image/*";
const ALL_ASSET_ACCEPT = [TEXT_ACCEPT, AUDIO_ACCEPT, VIDEO_ACCEPT, IMAGE_ACCEPT].join(",");

const uploadKindLabels: Record<AssetUploadKind, { code: string; title: string; detail: string; accept: string }> = {
  text: { code: "TXT", title: "文字作品", detail: "文章、PDF、Word、Markdown、电子书", accept: TEXT_ACCEPT },
  audio: { code: "AUD", title: "音乐作品", detail: "MP3、WAV、M4A、AAC、OGG、FLAC", accept: AUDIO_ACCEPT },
  video: { code: "VID", title: "视频作品", detail: "MP4、WebM、MOV、M4V", accept: VIDEO_ACCEPT },
  image: { code: "IMG", title: "图片作品", detail: "JPG、PNG、WebP、GIF、AVIF", accept: IMAGE_ACCEPT },
};

const assetFields: FieldConfig[] = [
  { key: "title", label: "资产名称" },
  { key: "category", label: "类别 / 标签" },
  { key: "status", label: "状态" },
  { key: "value", label: "数量 / 价值 / 备注值（可选）" },
  { key: "detail", label: "资产说明", kind: "textarea" },
  { key: "url", label: "相关链接（可选）", kind: "url" },
];

const collections: CollectionConfig[] = [
  { key: "skills", title: "个人能力", eyebrow: "01 / PERSONAL · CREDIBILITY", description: "归入个人实力与背书，管理能力名称、工具和方法。", fields: [{ key: "title", label: "能力" }, { key: "detail", label: "说明", kind: "textarea" }], blank: { title: "新能力", detail: "能力说明" } },
  { key: "honors", title: "荣誉与背书", eyebrow: "01 / PERSONAL · CREDIBILITY", description: "归入个人实力与背书，管理荣誉、称号与证明信息。", fields: [{ key: "title", label: "荣誉" }, { key: "detail", label: "说明" }], blank: { title: "新荣誉", detail: "补充说明" } },
  { key: "inputs", title: "输入", eyebrow: "01 / PERSONAL · INPUT", description: "管理学习、观察、阅读与生活输入。", fields: [{ key: "label", label: "分类" }, { key: "title", label: "标题" }, { key: "body", label: "正文", kind: "textarea" }], blank: { label: "新输入", title: "输入标题", body: "补充说明" } },
  { key: "outputs", title: "输出", eyebrow: "01 / PERSONAL · OUTPUT", description: "管理社群、自媒体、书籍、创业与百科公共影响力等个人输出。", fields: [{ key: "label", label: "编号" }, { key: "title", label: "标题" }, { key: "body", label: "正文", kind: "textarea" }], blank: { label: "00", title: "新输出", body: "补充说明" } },
  { key: "experiences", title: "实习与实践", eyebrow: "01 / PERSONAL · OUTPUT", description: "作为个人输出的一部分，管理公司、角色与实践经历。", fields: [{ key: "company", label: "机构" }, { key: "role", label: "角色" }, { key: "body", label: "经历", kind: "textarea" }], blank: { company: "新机构", role: "角色", body: "经历说明" } },
  { key: "works", title: "代表作品", eyebrow: "01 / PERSONAL · SELECTED WORKS", description: "作为个人输出的一部分，管理作品标题、内容摘录、成绩、原文链接与素材。", fields: [{ key: "platform", label: "平台与类型" }, { key: "metric", label: "代表成绩" }, { key: "title", label: "作品标题" }, { key: "summary", label: "内容摘录或说明", kind: "textarea" }, { key: "url", label: "原文链接", kind: "url" }, { key: "mediaUrl", label: "作品图片或视频链接", kind: "url" }, { key: "mediaType", label: "素材类型（image / video）" }], blank: { platform: "ORIGINAL WORK", metric: "代表成绩", title: "新作品", summary: "补充内容摘录", url: "", mediaUrl: "", mediaType: "" } },
  { key: "metrics", title: "社会影响力数值", eyebrow: "02 / SOCIAL WORLD · IMPACT", description: "管理社会世界数据看板中的核心数值。", fields: [{ key: "label", label: "英文标签" }, { key: "value", label: "数值" }, { key: "detail", label: "说明" }], blank: { label: "NEW METRIC", value: "0", detail: "数据说明" } },
  { key: "platforms", title: "平台矩阵", eyebrow: "02 / SOCIAL WORLD · NETWORK", description: "管理各内容平台的数据与代表成绩。", fields: [{ key: "name", label: "平台" }, { key: "value", label: "粉丝数" }, { key: "detail", label: "代表成绩" }], blank: { name: "新平台", value: "0", detail: "补充成绩" } },
  { key: "natureItems", title: "身体、感知与生活", eyebrow: "03 / NATURAL WORLD · RHYTHM", description: "管理身体、运动、感知与生活节律。", fields: [{ key: "label", label: "英文标签" }, { key: "title", label: "标题" }, { key: "body", label: "正文", kind: "textarea" }], blank: { label: "LIFE", title: "新条目", body: "补充说明" } },
  { key: "spiritualAssets", title: "个人精神资产", eyebrow: "ASSET LIBRARY · MIND", description: "独立记录价值观、知识框架、方法论、经验与长期认知。可上传文档、图片与影音记录。", fields: assetFields, blank: { title: "新精神资产", category: "精神资产", status: "持续沉淀", detail: "补充资产说明", value: "", url: "", assetType: "text", mediaUrl: "", mediaType: "", filename: "" } },
  { key: "physicalAssets", title: "个人实物资产", eyebrow: "ASSET LIBRARY · OBJECT", description: "独立记录设备、藏书、收藏与其他支持生活和创作的实物。可上传图片、凭证与说明文件。", fields: assetFields, blank: { title: "新实物资产", category: "实物资产", status: "使用中", detail: "补充资产说明", value: "", url: "", assetType: "object", mediaUrl: "", mediaType: "", filename: "" } },
  { key: "workAssets", title: "个人作品资产", eyebrow: "ASSET LIBRARY · WORK", description: "分别归档文字、音乐、视频与图片作品；上传后可继续补充说明、状态、成绩与外部链接。", fields: assetFields, blank: { title: "新作品资产", category: "文字作品", status: "已完成", detail: "补充资产说明", value: "", url: "", assetType: "text", mediaUrl: "", mediaType: "", filename: "" } },
];

const navGroups: NavGroup[] = [
  { key: "settings", code: "00", title: "站点设置", subtitle: "HOME · CONTACT", items: [{ tab: "siteSettings", code: "00", label: "首页与联系方式" }] },
  {
    key: "personal", code: "01", title: "个人", subtitle: "PERSONAL WORLD", items: [
      { tab: "personalOverview", code: "A", label: "个人概览" },
      { tab: "skills", code: "B", label: "个人能力" },
      { tab: "honors", code: "C", label: "荣誉与背书" },
      { tab: "inputs", code: "D", label: "输入" },
      { tab: "outputs", code: "E", label: "输出" },
      { tab: "experiences", code: "F", label: "实习与实践" },
      { tab: "works", code: "G", label: "代表作品" },
    ],
  },
  {
    key: "society", code: "02", title: "社会世界", subtitle: "SOCIAL WORLD", items: [
      { tab: "societyOverview", code: "A", label: "社会世界概览" },
      { tab: "metrics", code: "B", label: "影响力数值" },
      { tab: "platforms", code: "C", label: "平台矩阵" },
    ],
  },
  {
    key: "nature", code: "03", title: "自然世界", subtitle: "NATURAL WORLD", items: [
      { tab: "natureOverview", code: "A", label: "自然世界概览" },
      { tab: "natureItems", code: "B", label: "身体与感知" },
    ],
  },
  {
    key: "assets", code: "∞", title: "个人资产库", subtitle: "PRIVATE ASSET LIBRARY", items: [
      { tab: "spiritualAssets", code: "M", label: "个人精神资产" },
      { tab: "physicalAssets", code: "O", label: "个人实物资产" },
      { tab: "workAssets", code: "W", label: "个人作品资产" },
    ],
  },
];

type GroupKey = "brand" | "hero" | "socialNote" | "contact";

function isAssetCollection(key: CollectionKey): key is AssetCollectionKey {
  return key === "spiritualAssets" || key === "physicalAssets" || key === "workAssets";
}

function filenameTitle(filename: string): string {
  return filename.replace(/\.[^.]+$/, "").trim() || "新资产";
}

function readableBytes(size: number): string {
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / 1024 / 1024).toFixed(size >= 10 * 1024 * 1024 ? 0 : 1)} MB`;
}

export default function AdminDashboard({ displayName, email, signOutPath }: { displayName: string; email: string; signOutPath: string }) {
  const [content, setContent] = useState<SiteContent>(defaultSiteContent);
  const [activeTab, setActiveTab] = useState<AdminTab>("personalOverview");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingWork, setUploadingWork] = useState<number | null>(null);
  const [uploadingAsset, setUploadingAsset] = useState<string | null>(null);
  const [mediaStorageReady, setMediaStorageReady] = useState<boolean | null>(null);
  const [message, setMessage] = useState("正在读取网站内容…");
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    fetch("/api/site")
      .then((response) => response.json())
      .then((payload) => {
        if (payload.content) setContent(normalizeSiteContent(payload.content));
        setRevision(payload.revision ?? 0);
        setMessage(payload.persisted ? "已连接云端内容" : "当前显示默认内容，首次保存后写入云端");
      })
      .catch(() => setMessage("读取失败，当前显示默认内容"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/admin/media")
      .then((response) => response.json())
      .then((payload) => setMediaStorageReady(Boolean(payload.storageConfigured)))
      .catch(() => setMediaStorageReady(false));
  }, []);

  const currentCollection = useMemo(() => collections.find((item) => item.key === activeTab), [activeTab]);

  function updateGroup(group: GroupKey, field: string, value: string) {
    setContent((previous) => ({ ...previous, [group]: { ...previous[group], [field]: value } }));
  }

  function updateCollection(key: CollectionKey, index: number, field: string, value: string) {
    setContent((previous) => {
      const rows = previous[key] as unknown as Array<Record<string, string | string[]>>;
      const nextRows = rows.map((row, rowIndex) => rowIndex === index ? { ...row, [field]: value } : row);
      return { ...previous, [key]: nextRows } as SiteContent;
    });
  }

  function addCollectionItem(config: CollectionConfig) {
    setContent((previous) => {
      const rows = previous[config.key] as unknown as Array<Record<string, string | string[]>>;
      return { ...previous, [config.key]: [...rows, { ...config.blank }] } as SiteContent;
    });
  }

  function removeCollectionItem(key: CollectionKey, index: number) {
    setContent((previous) => {
      const rows = previous[key] as unknown as Array<Record<string, string | string[]>>;
      return { ...previous, [key]: rows.filter((_, rowIndex) => rowIndex !== index) } as SiteContent;
    });
  }

  function moveCollectionItem(key: CollectionKey, index: number, direction: -1 | 1) {
    setContent((previous) => {
      const rows = [...(previous[key] as unknown as Array<Record<string, string | string[]>>)] as Array<Record<string, string | string[]>>;
      const destination = index + direction;
      if (destination < 0 || destination >= rows.length) return previous;
      [rows[index], rows[destination]] = [rows[destination], rows[index]];
      return { ...previous, [key]: rows } as SiteContent;
    });
  }

  async function saveContent() {
    setSaving(true);
    setMessage("正在保存并更新前端…");
    try {
      const response = await fetch("/api/admin/site", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "保存失败");
      setContent(normalizeSiteContent(payload.content));
      setRevision(payload.revision ?? revision + 1);
      setMessage("保存成功，刷新前台即可看到最新内容");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "保存失败，请稍后重试");
    } finally {
      setSaving(false);
    }
  }

  async function uploadWorkMedia(index: number, file: File) {
    setUploadingWork(index);
    setMessage(`正在上传作品素材：${file.name}`);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/admin/media", { method: "POST", body: formData });
      const payload = await response.json();
      if (!response.ok || !payload.asset?.url) throw new Error(payload.error || "上传失败");
      updateCollection("works", index, "mediaUrl", payload.asset.url);
      updateCollection("works", index, "mediaType", payload.asset.mediaType || "image");
      setMessage("素材上传成功，请点击“保存全部修改”完成作品更新");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "上传失败，请稍后重试");
    } finally {
      setUploadingWork(null);
    }
  }

  async function uploadAssetFile(key: AssetCollectionKey, kind: AssetUploadKind, file: File, index?: number) {
    const uploadKey = `${key}-${kind}-${index ?? "new"}`;
    setUploadingAsset(uploadKey);
    setMessage(`正在上传资产：${file.name}`);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/admin/media", { method: "POST", body: formData });
      const payload = await response.json();
      if (!response.ok || !payload.asset?.url) throw new Error(payload.error || "上传失败");

      const uploadedType = (payload.asset.assetType || kind) as AssetUploadKind;
      const category = key === "workAssets" ? uploadKindLabels[uploadedType]?.title ?? "作品资产" : key === "spiritualAssets" ? "精神资产" : "实物资产";
      setContent((previous) => {
        const rows = previous[key] as unknown as Array<Record<string, string>>;
        const uploadedFields = {
          assetType: uploadedType,
          mediaUrl: String(payload.asset.url),
          mediaType: String(payload.asset.contentType || ""),
          filename: String(payload.asset.filename || file.name),
        };
        if (typeof index === "number") {
          const nextRows = rows.map((row, rowIndex) => rowIndex === index ? {
            ...row,
            ...uploadedFields,
            title: row.title || filenameTitle(file.name),
            value: row.value || readableBytes(Number(payload.asset.size || file.size)),
          } : row);
          return { ...previous, [key]: nextRows } as SiteContent;
        }
        const nextItem = {
          title: filenameTitle(file.name),
          category,
          status: "已上传",
          detail: "可在这里补充作品介绍、创作背景、版权信息或其他说明。",
          value: readableBytes(Number(payload.asset.size || file.size)),
          url: "",
          ...uploadedFields,
        };
        return { ...previous, [key]: [...rows, nextItem] } as SiteContent;
      });
      setMessage("资产上传成功，请补充信息并点击“保存全部修改”完成归档");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "上传失败，请稍后重试");
    } finally {
      setUploadingAsset(null);
    }
  }

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <Link className="admin-brand" href="/"><span>HL</span><strong>LIUHAN<small>CONTENT CONSOLE</small></strong></Link>
        <nav aria-label="内容编辑分类">
          {navGroups.map((group) => (
            <section className={`admin-nav-group is-${group.key}`} key={group.key}>
              <header><span>{group.code}</span><strong>{group.title}<small>{group.subtitle}</small></strong></header>
              <div>{group.items.map((item) => (
                <button key={item.tab} className={activeTab === item.tab ? "is-active" : ""} onClick={() => setActiveTab(item.tab)}><span>{item.code}</span>{item.label}</button>
              ))}</div>
            </section>
          ))}
        </nav>
        <div className="admin-account"><span>ADMINISTRATOR</span><strong>{displayName}</strong><small>{email}</small><a href={signOutPath}>退出登录</a></div>
      </aside>

      <section className="admin-workspace">
        <header className="admin-toolbar">
          <div><span>REVISION {revision}</span><strong>{message}</strong></div>
          <div><a href="/" target="_blank" rel="noreferrer">预览前台 ↗</a><button disabled={saving || loading} onClick={saveContent}>{saving ? "保存中…" : "保存全部修改"}</button></div>
        </header>

        {activeTab === "siteSettings" ? (
          <div className="admin-panel">
            <PanelHeading eyebrow="00 / SITE SYSTEM" title="首页与联系方式" description="只管理全站共用的品牌状态、首页首屏与最终联系入口；三个世界的内容在对应分区内维护。" />
            <EditorSection title="品牌状态">
              <TextField label="品牌名称" value={content.brand.name} onChange={(value) => updateGroup("brand", "name", value)} />
              <TextField label="品牌副标题" value={content.brand.subtitle} onChange={(value) => updateGroup("brand", "subtitle", value)} />
              <TextField label="右上角状态" value={content.brand.status} onChange={(value) => updateGroup("brand", "status", value)} />
            </EditorSection>
            <EditorSection title="首页首屏">
              <TextField label="系统状态" value={content.hero.system} onChange={(value) => updateGroup("hero", "system", value)} />
              <TextField label="眉题" value={content.hero.eyebrow} onChange={(value) => updateGroup("hero", "eyebrow", value)} />
              <TextField label="标题第一行" value={content.hero.lineOne} onChange={(value) => updateGroup("hero", "lineOne", value)} />
              <TextField label="标题第二行" value={content.hero.lineTwo} onChange={(value) => updateGroup("hero", "lineTwo", value)} />
              <TextField label="标题强调词" value={content.hero.accent} onChange={(value) => updateGroup("hero", "accent", value)} />
              <TextField label="首页简介" value={content.hero.intro} multiline onChange={(value) => updateGroup("hero", "intro", value)} />
            </EditorSection>
            <EditorSection title="联系方式">
              <TextField label="标题" value={content.contact.heading} onChange={(value) => updateGroup("contact", "heading", value)} />
              <TextField label="简介" value={content.contact.body} multiline onChange={(value) => updateGroup("contact", "body", value)} />
              <TextField label="邮箱按钮文字" value={content.contact.emailLabel} onChange={(value) => updateGroup("contact", "emailLabel", value)} />
              <TextField label="邮箱链接（如 mailto:name@example.com）" value={content.contact.emailUrl} onChange={(value) => updateGroup("contact", "emailUrl", value)} />
              <TextField label="社交按钮文字" value={content.contact.socialLabel} onChange={(value) => updateGroup("contact", "socialLabel", value)} />
              <TextField label="社交主页链接" value={content.contact.socialUrl} onChange={(value) => updateGroup("contact", "socialUrl", value)} />
            </EditorSection>
          </div>
        ) : activeTab === "personalOverview" ? (
          <div className="admin-panel">
            <PanelHeading eyebrow="01 / PERSONAL WORLD" title="个人" description="前台个人世界的总览文案；能力、背书、输入、输出、实践与作品都已归入左侧个人分区。" />
            <EditorSection title="个人世界概览">
              <TextField label="个人章节简介" value={content.personalSummary} multiline onChange={(value) => setContent((previous) => ({ ...previous, personalSummary: value }))} />
            </EditorSection>
          </div>
        ) : activeTab === "societyOverview" ? (
          <div className="admin-panel">
            <PanelHeading eyebrow="02 / SOCIAL WORLD" title="社会世界" description="前台社会世界的总览与结语；影响力数字和平台矩阵在左侧对应子项中维护。" />
            <EditorSection title="社会世界概览">
              <TextField label="章节简介" value={content.societySummary} multiline onChange={(value) => setContent((previous) => ({ ...previous, societySummary: value }))} />
            </EditorSection>
            <EditorSection title="社会世界结语">
              <TextField label="标题" value={content.socialNote.title} onChange={(value) => updateGroup("socialNote", "title", value)} />
              <TextField label="正文" value={content.socialNote.body} multiline onChange={(value) => updateGroup("socialNote", "body", value)} />
            </EditorSection>
          </div>
        ) : activeTab === "natureOverview" ? (
          <div className="admin-panel">
            <PanelHeading eyebrow="03 / NATURAL WORLD" title="自然世界" description="前台自然世界的总览文案；身体、运动、感知和生活节律在左侧对应子项中维护。" />
            <EditorSection title="自然世界概览">
              <TextField label="章节简介" value={content.natureSummary} multiline onChange={(value) => setContent((previous) => ({ ...previous, natureSummary: value }))} />
            </EditorSection>
          </div>
        ) : currentCollection ? (
          <div className={`admin-panel ${isAssetCollection(currentCollection.key) ? "is-asset-library" : ""}`}>
            <PanelHeading eyebrow={currentCollection.eyebrow} title={currentCollection.title} description={currentCollection.description} />
            {currentCollection.key === "works" ? (
              <EditorSection title="作品模块导语">
                <TextField label="前台代表作品简介" value={content.worksIntro} multiline onChange={(value) => setContent((previous) => ({ ...previous, worksIntro: value }))} />
              </EditorSection>
            ) : null}
            {isAssetCollection(currentCollection.key) ? (
              <>
                <AssetUploadHub
                  collectionKey={currentCollection.key}
                  storageReady={mediaStorageReady}
                  uploadingAsset={uploadingAsset}
                  onUpload={(kind, file) => void uploadAssetFile(currentCollection.key as AssetCollectionKey, kind, file)}
                />
                <div className={`admin-private-note ${mediaStorageReady === false ? "is-storage-offline" : ""}`}>
                  <span>{mediaStorageReady === false ? "STORAGE / ACTIVATION REQUIRED" : "PRIVATE / BACKEND ONLY"}</span>
                  <p>{mediaStorageReady === false ? "上传入口已经就绪，但 Cloudflare 文件存储尚未启用。当前仍可新增条目、填写信息和保存外部作品链接。" : "资产库不在前台公开展示，只保存在你的云端后台中。单个上传文件最大 90MB。"}</p>
                </div>
              </>
            ) : null}
            <div className="admin-list">
              {(content[currentCollection.key] as unknown as Array<Record<string, string | string[]>>).map((row, index) => (
                <article className="admin-list-item" key={`${currentCollection.key}-${index}`}>
                  <header><span>{String(index + 1).padStart(2, "0")}</span><div><button onClick={() => moveCollectionItem(currentCollection.key, index, -1)} aria-label="上移">↑</button><button onClick={() => moveCollectionItem(currentCollection.key, index, 1)} aria-label="下移">↓</button><button className="is-danger" onClick={() => removeCollectionItem(currentCollection.key, index)}>删除</button></div></header>
                  {currentCollection.key === "works" ? (
                    <label className="admin-upload">
                      <span>{uploadingWork === index ? "正在上传…" : mediaStorageReady === false ? "媒体存储尚未启用" : "上传图片、视频、音频或 PDF（最大 90MB）"}</span>
                      <input
                        type="file"
                        accept={ALL_ASSET_ACCEPT}
                        disabled={uploadingWork !== null || mediaStorageReady !== true}
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (file) void uploadWorkMedia(index, file);
                          event.currentTarget.value = "";
                        }}
                      />
                    </label>
                  ) : null}
                  {isAssetCollection(currentCollection.key) ? (
                    <AssetFileStrip
                      row={row}
                      disabled={mediaStorageReady !== true || uploadingAsset !== null}
                      uploading={uploadingAsset === `${currentCollection.key}-${String(row.assetType || "text")}-${index}`}
                      onUpload={(file) => void uploadAssetFile(currentCollection.key as AssetCollectionKey, (String(row.assetType || "text") as AssetUploadKind), file, index)}
                    />
                  ) : null}
                  <div className="admin-form-grid">{currentCollection.fields.map((field) => (
                    <TextField key={field.key} label={field.label} multiline={field.kind === "textarea"} value={String(row[field.key] ?? "")} onChange={(value) => updateCollection(currentCollection.key, index, field.key, value)} />
                  ))}</div>
                </article>
              ))}
            </div>
            <button className="admin-add" onClick={() => addCollectionItem(currentCollection)}>＋ 新增一项</button>
          </div>
        ) : null}
      </section>
    </main>
  );
}

function AssetUploadHub({ collectionKey, storageReady, uploadingAsset, onUpload }: {
  collectionKey: AssetCollectionKey;
  storageReady: boolean | null;
  uploadingAsset: string | null;
  onUpload: (kind: AssetUploadKind, file: File) => void;
}) {
  const options = collectionKey === "workAssets"
    ? (Object.keys(uploadKindLabels) as AssetUploadKind[]).map((kind) => ({ kind, ...uploadKindLabels[kind] }))
    : [{
        kind: "text" as AssetUploadKind,
        code: collectionKey === "spiritualAssets" ? "MND" : "OBJ",
        title: collectionKey === "spiritualAssets" ? "上传精神资产" : "上传实物资产",
        detail: collectionKey === "spiritualAssets" ? "文档、图片、音频或视频记录" : "实物图片、凭证、清单或说明文件",
        accept: ALL_ASSET_ACCEPT,
      }];

  return (
    <section className={`admin-asset-upload-hub ${collectionKey === "workAssets" ? "is-work-hub" : ""}`}>
      <header>
        <div><span>UPLOAD GATEWAY</span><h2>{collectionKey === "workAssets" ? "选择作品类型并上传" : "上传并建立资产条目"}</h2></div>
        <small>{storageReady === null ? "正在检测云端存储…" : storageReady ? "云端存储已连接 · 单文件最大 90MB" : "等待启用云端文件存储"}</small>
      </header>
      <div className="admin-upload-types">
        {options.map((option) => {
          const uploadKey = `${collectionKey}-${option.kind}-new`;
          return (
            <label className={storageReady !== true ? "is-disabled" : ""} key={`${collectionKey}-${option.kind}`}>
              <span>{option.code}</span>
              <strong>{uploadingAsset === uploadKey ? "正在上传…" : option.title}</strong>
              <small>{option.detail}</small>
              <b>{storageReady === true ? "选择文件 ＋" : "暂未启用"}</b>
              <input
                type="file"
                accept={option.accept}
                disabled={storageReady !== true || uploadingAsset !== null}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) onUpload(option.kind, file);
                  event.currentTarget.value = "";
                }}
              />
            </label>
          );
        })}
      </div>
    </section>
  );
}

function AssetFileStrip({ row, disabled, uploading, onUpload }: {
  row: Record<string, string | string[]>;
  disabled: boolean;
  uploading: boolean;
  onUpload: (file: File) => void;
}) {
  const mediaUrl = String(row.mediaUrl || "");
  const filename = String(row.filename || "");
  const assetType = String(row.assetType || "file").toUpperCase();
  const mediaType = String(row.mediaType || "");

  return (
    <div className="admin-asset-file-strip">
      <div><span>{assetType}</span><strong>{filename || "尚未绑定上传文件"}</strong><small>{mediaType || "可保留外部链接，也可以上传文件归档"}</small></div>
      {mediaUrl ? <a href={mediaUrl} target="_blank" rel="noreferrer">打开文件 ↗</a> : null}
      <label className={disabled ? "is-disabled" : ""}>
        {uploading ? "正在上传…" : mediaUrl ? "替换文件" : "上传文件"}
        <input
          type="file"
          accept={ALL_ASSET_ACCEPT}
          disabled={disabled}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onUpload(file);
            event.currentTarget.value = "";
          }}
        />
      </label>
    </div>
  );
}

function PanelHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <div className="admin-panel-heading"><span>{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>;
}

function EditorSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="admin-editor-section"><h2>{title}</h2><div className="admin-form-grid">{children}</div></section>;
}

function TextField({ label, value, onChange, multiline = false }: { label: string; value: string; onChange: (value: string) => void; multiline?: boolean }) {
  return <label className={multiline ? "admin-field is-wide" : "admin-field"}><span>{label}</span>{multiline ? <textarea value={value} rows={4} onChange={(event) => onChange(event.target.value)} /> : <input value={value} onChange={(event) => onChange(event.target.value)} />}</label>;
}
