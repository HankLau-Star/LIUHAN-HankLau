"use client";

import { useEffect, useMemo, useState } from "react";
import { defaultSiteContent, normalizeSiteContent, type SiteContent } from "../../lib/site-content";

type CollectionKey = "skills" | "honors" | "inputs" | "outputs" | "experiences" | "projects" | "metrics" | "platforms" | "natureItems";
type FieldConfig = { key: string; label: string; kind?: "text" | "textarea" | "url" | "tags" };
type CollectionConfig = { key: CollectionKey; title: string; description: string; fields: FieldConfig[]; blank: Record<string, string | string[]> };

const collections: CollectionConfig[] = [
  { key: "skills", title: "个人能力", description: "能力名称与对应工具、方法。", fields: [{ key: "title", label: "能力" }, { key: "detail", label: "说明", kind: "textarea" }], blank: { title: "新能力", detail: "能力说明" } },
  { key: "honors", title: "荣誉与背书", description: "荣誉名称与证明信息。", fields: [{ key: "title", label: "荣誉" }, { key: "detail", label: "说明" }], blank: { title: "新荣誉", detail: "补充说明" } },
  { key: "inputs", title: "输入", description: "学习、观察与生活输入。", fields: [{ key: "label", label: "分类" }, { key: "title", label: "标题" }, { key: "body", label: "正文", kind: "textarea" }], blank: { label: "新输入", title: "输入标题", body: "补充说明" } },
  { key: "outputs", title: "输出", description: "实践、社群、自媒体、书籍、创业与公共影响。", fields: [{ key: "label", label: "编号" }, { key: "title", label: "标题" }, { key: "body", label: "正文", kind: "textarea" }], blank: { label: "00", title: "新输出", body: "补充说明" } },
  { key: "experiences", title: "实践经历", description: "公司、角色与经历说明。", fields: [{ key: "company", label: "机构" }, { key: "role", label: "角色" }, { key: "body", label: "经历", kind: "textarea" }], blank: { company: "新机构", role: "角色", body: "经历说明" } },
  { key: "projects", title: "代表作品", description: "新增作品后，前端会自动生成一张高级作品卡片。图片可填写公开图片网址，作品链接可填写文章、视频或项目地址。", fields: [{ key: "type", label: "作品类型" }, { key: "year", label: "年份" }, { key: "title", label: "作品标题" }, { key: "summary", label: "作品简介", kind: "textarea" }, { key: "imageUrl", label: "封面图片网址", kind: "url" }, { key: "projectUrl", label: "作品链接", kind: "url" }, { key: "tags", label: "标签（逗号分隔）", kind: "tags" }], blank: { id: "", type: "SELECTED WORK", year: new Date().getFullYear().toString(), title: "新作品", summary: "补充作品简介", imageUrl: "", projectUrl: "", tags: [] } },
  { key: "metrics", title: "社会影响力数值", description: "首页数据看板中的核心数值。", fields: [{ key: "label", label: "英文标签" }, { key: "value", label: "数值" }, { key: "detail", label: "说明" }], blank: { label: "NEW METRIC", value: "0", detail: "数据说明" } },
  { key: "platforms", title: "平台矩阵", description: "各内容平台的数据与代表成绩。", fields: [{ key: "name", label: "平台" }, { key: "value", label: "粉丝数" }, { key: "detail", label: "代表成绩" }], blank: { name: "新平台", value: "0", detail: "补充成绩" } },
  { key: "natureItems", title: "自然世界", description: "身体、运动、感知与生活节律。", fields: [{ key: "label", label: "英文标签" }, { key: "title", label: "标题" }, { key: "body", label: "正文", kind: "textarea" }], blank: { label: "LIFE", title: "新条目", body: "补充说明" } },
];

type GroupKey = "brand" | "hero" | "socialNote" | "contact";

export default function AdminDashboard({ displayName, email, signOutPath }: { displayName: string; email: string; signOutPath: string }) {
  const [content, setContent] = useState<SiteContent>(defaultSiteContent);
  const [activeTab, setActiveTab] = useState<"overview" | CollectionKey>("overview");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  const currentCollection = useMemo(() => collections.find((item) => item.key === activeTab), [activeTab]);

  function updateGroup(group: GroupKey, field: string, value: string) {
    setContent((previous) => ({
      ...previous,
      [group]: { ...previous[group], [field]: value },
    }));
  }

  function updateCollection(key: CollectionKey, index: number, field: string, value: string) {
    setContent((previous) => {
      const rows = previous[key] as unknown as Array<Record<string, string | string[]>>;
      const nextRows = rows.map((row, rowIndex) => rowIndex === index ? {
        ...row,
        [field]: field === "tags" ? value.split(/[,，]/).map((tag) => tag.trim()).filter(Boolean) : value,
        ...(key === "projects" && !row.id ? { id: `project-${Date.now()}-${index}` } : {}),
      } : row);
      return { ...previous, [key]: nextRows } as SiteContent;
    });
  }

  function addCollectionItem(config: CollectionConfig) {
    setContent((previous) => {
      const rows = previous[config.key] as unknown as Array<Record<string, string | string[]>>;
      const blank = { ...config.blank, ...(config.key === "projects" ? { id: `project-${Date.now()}` } : {}) };
      return { ...previous, [config.key]: [...rows, blank] } as SiteContent;
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
      const rows = [...(previous[key] as unknown as Array<Record<string, string | string[]>>)];
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

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <a className="admin-brand" href="/"><span>A</span><strong>ASCENDER<small>CONTENT CONSOLE</small></strong></a>
        <nav aria-label="内容编辑分类">
          <button className={activeTab === "overview" ? "is-active" : ""} onClick={() => setActiveTab("overview")}><span>00</span>全局文案</button>
          {collections.map((item, index) => <button key={item.key} className={activeTab === item.key ? "is-active" : ""} onClick={() => setActiveTab(item.key)}><span>{String(index + 1).padStart(2, "0")}</span>{item.title}</button>)}
        </nav>
        <div className="admin-account"><span>ADMINISTRATOR</span><strong>{displayName}</strong><small>{email}</small><a href={signOutPath}>退出登录</a></div>
      </aside>

      <section className="admin-workspace">
        <header className="admin-toolbar">
          <div><span>REVISION {revision}</span><strong>{message}</strong></div>
          <div><a href="/" target="_blank" rel="noreferrer">预览前台 ↗</a><button disabled={saving || loading} onClick={saveContent}>{saving ? "保存中…" : "保存全部修改"}</button></div>
        </header>

        {activeTab === "overview" ? (
          <div className="admin-panel">
            <div className="admin-panel-heading"><span>00 / GLOBAL CONTENT</span><h1>全局文案与联系方式</h1><p>这里控制品牌、首屏、三个世界的章节简介和联系入口。</p></div>
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
            <EditorSection title="章节简介">
              <TextField label="个人" value={content.personalSummary} multiline onChange={(value) => setContent((previous) => ({ ...previous, personalSummary: value }))} />
              <TextField label="代表作品" value={content.projectsIntro} multiline onChange={(value) => setContent((previous) => ({ ...previous, projectsIntro: value }))} />
              <TextField label="社会世界" value={content.societySummary} multiline onChange={(value) => setContent((previous) => ({ ...previous, societySummary: value }))} />
              <TextField label="自然世界" value={content.natureSummary} multiline onChange={(value) => setContent((previous) => ({ ...previous, natureSummary: value }))} />
            </EditorSection>
            <EditorSection title="社会世界结语">
              <TextField label="标题" value={content.socialNote.title} onChange={(value) => updateGroup("socialNote", "title", value)} />
              <TextField label="正文" value={content.socialNote.body} multiline onChange={(value) => updateGroup("socialNote", "body", value)} />
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
        ) : currentCollection ? (
          <div className="admin-panel">
            <div className="admin-panel-heading"><span>CONTENT MODULE</span><h1>{currentCollection.title}</h1><p>{currentCollection.description}</p></div>
            <div className="admin-list">
              {(content[currentCollection.key] as unknown as Array<Record<string, string | string[]>>).map((row, index) => (
                <article className="admin-list-item" key={`${currentCollection.key}-${index}`}>
                  <header><span>{String(index + 1).padStart(2, "0")}</span><div><button onClick={() => moveCollectionItem(currentCollection.key, index, -1)} aria-label="上移">↑</button><button onClick={() => moveCollectionItem(currentCollection.key, index, 1)} aria-label="下移">↓</button><button className="is-danger" onClick={() => removeCollectionItem(currentCollection.key, index)}>删除</button></div></header>
                  <div className="admin-form-grid">{currentCollection.fields.map((field) => (
                    <TextField key={field.key} label={field.label} multiline={field.kind === "textarea"} value={field.kind === "tags" ? (row[field.key] as string[] ?? []).join(", ") : String(row[field.key] ?? "")} onChange={(value) => updateCollection(currentCollection.key, index, field.key, value)} />
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

function EditorSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="admin-editor-section"><h2>{title}</h2><div className="admin-form-grid">{children}</div></section>;
}

function TextField({ label, value, onChange, multiline = false }: { label: string; value: string; onChange: (value: string) => void; multiline?: boolean }) {
  return <label className={multiline ? "admin-field is-wide" : "admin-field"}><span>{label}</span>{multiline ? <textarea value={value} rows={4} onChange={(event) => onChange(event.target.value)} /> : <input value={value} onChange={(event) => onChange(event.target.value)} />}</label>;
}
