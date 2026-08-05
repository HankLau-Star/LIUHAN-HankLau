export type PairItem = {
  title: string;
  detail: string;
};

export type StoryItem = {
  label: string;
  title: string;
  body: string;
};

export type ExperienceItem = {
  company: string;
  role: string;
  body: string;
};

export type MetricItem = {
  label: string;
  value: string;
  detail: string;
};

export type PlatformItem = {
  name: string;
  value: string;
  detail: string;
};

export type WorkItem = {
  platform: string;
  metric: string;
  title: string;
  summary: string;
  url: string;
};

export type SiteContent = {
  brand: {
    name: string;
    subtitle: string;
    status: string;
  };
  hero: {
    system: string;
    eyebrow: string;
    lineOne: string;
    lineTwo: string;
    accent: string;
    intro: string;
  };
  personalSummary: string;
  skills: PairItem[];
  honors: PairItem[];
  inputs: StoryItem[];
  outputs: StoryItem[];
  experiences: ExperienceItem[];
  worksIntro: string;
  works: WorkItem[];
  societySummary: string;
  metrics: MetricItem[];
  platforms: PlatformItem[];
  socialNote: {
    title: string;
    body: string;
  };
  natureSummary: string;
  natureItems: StoryItem[];
  contact: {
    heading: string;
    body: string;
    emailLabel: string;
    emailUrl: string;
    socialLabel: string;
    socialUrl: string;
  };
};

export const defaultSiteContent: SiteContent = {
  brand: {
    name: "LIUHAN",
    subtitle: "HankLau · HL",
    status: "OPEN TO CREATE",
  },
  hero: {
    system: "SYSTEM // AWAKENING",
    eyebrow: "LIUHAN · HankLau · HL",
    lineOne: "ASCENDER",
    lineTwo: "向内生长，",
    accent: "向外创造。",
    intro: "一个跨界数字创作者的个人档案，在个人、社会与自然三个世界里持续升级。",
  },
  personalSummary: "个人不是标签的集合，而是一套由实力、输入与输出构成，并持续循环升级的系统。",
  skills: [
    { title: "三维世界构筑", detail: "Unreal Engine 5 · Houdini · Maya · Nuke" },
    { title: "AI 生产力", detail: "AI 工具探索 · 产品测评 · 工作流实践" },
    { title: "内容增长", detail: "选题 · 剪辑 · 文字表达 · 多平台运营" },
    { title: "通用能力", detail: "英语 · 记忆术 · 持续学习 · 组织领导" },
  ],
  honors: [
    { title: "211", detail: "本科科班背景" },
    { title: "省级铜奖", detail: "国创赛" },
    { title: "院级一等奖", detail: "国创赛" },
    { title: "校级立项", detail: "大学生创新创业" },
    { title: "校级一等奖", detail: "三创赛 · 中医 AI 项目队长" },
    { title: "职业资格", detail: "游泳救生员与教练" },
    { title: "学生会主席", detail: "早期组织与领导经验" },
  ],
  inputs: [
    { label: "系统学习", title: "科班训练 × 技术工具", body: "以 211 本科的系统训练建立专业认知，并持续学习实时引擎、程序化生成、三维制作、合成与 AI 工具。" },
    { label: "跨域观察", title: "技术 × 内容 × 用户", body: "在中文互联网与海外平台中观察内容传播、社区语境、产品体验与真实反馈。" },
    { label: "生活输入", title: "阅读 × 运动 × 审美", body: "从长期阅读、跑步、力量训练、游泳、素描与动漫中保持感知力，也为持续创造储备体力。" },
  ],
  outputs: [
    { label: "01", title: "实习实践", body: "腾讯 QQ、中国移动、知乎、公考机构、36氪，以及网易云音乐大使、腾讯青科实训营、阿里云 AI 实践、网易小蜜蜂与 AI 工作坊。" },
    { label: "02", title: "社群", body: "校园万人频道管理员、千人社群管理、10+ 百人内容社群、百人频道主，以及 AI 与校园社群实践。" },
    { label: "03", title: "自媒体", body: "覆盖中外多个内容平台，形成 25K+ 粉丝矩阵；单个作品最高获得 300W+ 流量。" },
    { label: "04", title: "书籍", body: "长期写作与书籍计划正在构思，把短内容判断力沉淀为更完整的表达。" },
    { label: "05", title: "创业公司", body: "创业计划处于问题探索阶段，目标是让技术、内容和真实需求形成可持续产品。" },
    { label: "06", title: "百科 · 公共影响力", body: "报道、百科与公共记录尚在积累，以可验证的作品和社会价值作为未来入口。" },
  ],
  experiences: [
    { company: "腾讯 QQ", role: "短视频运营", body: "在大厂内容场景中理解平台机制、内容节奏与用户反馈。" },
    { company: "中国移动", role: "营销实践", body: "从品牌传播与用户触达视角，理解完整营销链路。" },
    { company: "知乎", role: "内容运营", body: "深入图文生态，训练选题、表达与社区语境判断。" },
    { company: "公考机构", role: "全媒体运营", body: "参与多平台内容生产与分发，积累全媒体协同经验。" },
    { company: "36氪", role: "AI 产品内容测评", body: "围绕 AI 产品展开体验、测评与表达，让复杂技术被更多人理解。" },
  ],
  worksIntro: "从代表性原创内容中保留一句核心表达；点击卡片，即可进入原平台阅读全文。",
  works: [
    {
      platform: "ZHIHU · ORIGINAL",
      metric: "100W+ 阅读",
      title: "坚持这几个事情，2个月后人生重启开挂",
      summary: "自律不是目的，而是手段。",
      url: "https://www.zhihu.com/pin/2061387114298848969?native=1&scene=share&share_code=FiV6BGTvk0WW&utm_psn=2068366396443170552",
    },
    {
      platform: "ZHIHU · AI OBSERVATION",
      metric: "100W+ 阅读",
      title: "DeepSeek 团队主要成员毕业大学",
      summary: "高学历、高素质人才的汇聚，让 DeepSeek 在人工智能领域不断突破。",
      url: "https://www.zhihu.com/pin/1890776233031235495?native=1&scene=share&share_code=pvao0IqC6Ax&utm_psn=2068366482757662346",
    },
    {
      platform: "ZHIHU · INSIGHT",
      metric: "100W+ 阅读",
      title: "什么样的人活得最幸福？",
      summary: "幸福从来不是得到更多，而是消耗更少。",
      url: "https://www.zhihu.com/pin/2063325186527704695?native=1&scene=share&share_code=JoZyCNVxsD5W&utm_psn=2068366594774917974",
    },
    {
      platform: "WECHAT · ORIGINAL",
      metric: "10W+ 阅读",
      title: "公众号高赞原创 · 01",
      summary: "第一篇公众号 10W+ 高赞原创内容，点击卡片进入公众号阅读全文。",
      url: "https://mp.weixin.qq.com/s/oYxU13oc-7GOdB3NgHZxeQ",
    },
    {
      platform: "WECHAT · ORIGINAL",
      metric: "10W+ 阅读",
      title: "公众号高赞原创 · 02",
      summary: "第二篇公众号 10W+ 高赞原创内容，点击卡片进入公众号阅读全文。",
      url: "https://mp.weixin.qq.com/s/sIMBxdjq2zfMlHgy4UjRWQ",
    },
  ],
  societySummary: "通过内容、社群与协作进入更大的关系网络，让个人输出在真实世界中产生回声。",
  metrics: [
    { label: "PUBLIC REACH", value: "38K+", detail: "全平台粉丝矩阵" },
    { label: "PEAK FLOW", value: "300W+", detail: "单作流量峰值" },
    { label: "COMMUNITIES", value: "10+", detail: "百人内容社群" },
    { label: "SERVICE", value: "130h+", detail: "志愿服务" },
  ],
  platforms: [
    { name: "视频号", value: "20,000", detail: "200W+ 爆款播放" },
    { name: "Instagram", value: "5,000", detail: "190W+ 爆款播放" },
    { name: "抖音 · 双账号", value: "7,000", detail: "180W+ / 300W+ 流量作品" },
    { name: "微博", value: "3,000", detail: "持续内容沉淀" },
    { name: "知乎", value: "1,700", detail: "多篇高赞原创" },
    { name: "小红书", value: "1,200", detail: "内容矩阵分发" },
    { name: "微信公众号", value: "300", detail: "2 篇 10W+ 图文" },
    { name: "Threads / TikTok", value: "130 / 100", detail: "海外阵地生长中" },
  ],
  socialNote: {
    title: "连接不是数字。",
    body: "校园万人频道管理员、千人社群管理、百人频道主和 AI 社群实践，让影响力从“被看见”走向“让事情发生”。",
  },
  natureSummary: "回到身体、节律与感知。自然世界不是工作之外的装饰，而是长期输出的底盘。",
  natureItems: [
    { label: "BODY", title: "跑步 × 力量训练", body: "稳定的身体状态，支撑持续创造与长线进化。" },
    { label: "WATER", title: "游泳救生员与教练", body: "一项与水相处的技能，也是一项能够保护他人的能力。" },
    { label: "SENSE", title: "素描 × 动漫 × 审美", body: "从中学时期延续至今的视觉敏感度，构成叙事与创作的底色。" },
    { label: "RHYTHM", title: "自我照料 × 规律生活", body: "护肤、训练与休息，让纪律变成可持续的日常节律。" },
  ],
  contact: {
    heading: "保持联系。",
    body: "对创意技术、内容项目、品牌合作、AI 产品与跨界实验保持开放。你可以通过邮箱或 Linktree 找到 LIUHAN / HankLau / HL。",
    emailLabel: "veritasrensheng@gmail.com",
    emailUrl: "mailto:veritasrensheng@gmail.com",
    socialLabel: "LINKTREE · HANKLAU",
    socialUrl: "https://linktr.ee/HankLau",
  },
};

const MAX_TEXT = 1200;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cleanText(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value.trim().slice(0, MAX_TEXT) : fallback;
}

function cleanUrl(value: unknown, fallback = ""): string {
  const text = cleanText(value, fallback);
  if (!text) return "";
  if (text.startsWith("/") && !text.startsWith("//")) return text;
  try {
    const url = new URL(text);
    return url.protocol === "https:" || url.protocol === "http:" || url.protocol === "mailto:" ? text : "";
  } catch {
    return "";
  }
}

function cleanObject<T extends Record<string, string>>(
  value: unknown,
  fallback: T,
  urlKeys: Array<keyof T> = [],
): T {
  const source = isRecord(value) ? value : {};
  return Object.fromEntries(
    Object.entries(fallback).map(([key, defaultValue]) => [
      key,
      urlKeys.includes(key) ? cleanUrl(source[key], defaultValue) : cleanText(source[key], defaultValue),
    ]),
  ) as T;
}

function cleanList<T extends Record<string, string>>(
  value: unknown,
  fallback: T[],
  limit: number,
  urlKeys: Array<keyof T> = [],
): T[] {
  if (!Array.isArray(value)) return fallback;
  return value.slice(0, limit).map((item, index) => cleanObject(item, fallback[index] ?? fallback[0], urlKeys));
}

export function normalizeSiteContent(value: unknown): SiteContent {
  const source = isRecord(value) ? value : {};

  return {
    brand: cleanObject(source.brand, defaultSiteContent.brand),
    hero: cleanObject(source.hero, defaultSiteContent.hero),
    personalSummary: cleanText(source.personalSummary, defaultSiteContent.personalSummary),
    skills: cleanList(source.skills, defaultSiteContent.skills, 16),
    honors: cleanList(source.honors, defaultSiteContent.honors, 24),
    inputs: cleanList(source.inputs, defaultSiteContent.inputs, 12),
    outputs: cleanList(source.outputs, defaultSiteContent.outputs, 18),
    experiences: cleanList(source.experiences, defaultSiteContent.experiences, 18),
    worksIntro: cleanText(source.worksIntro, defaultSiteContent.worksIntro),
    works: cleanList(source.works, defaultSiteContent.works, 12, ["url"]),
    societySummary: cleanText(source.societySummary, defaultSiteContent.societySummary),
    metrics: cleanList(source.metrics, defaultSiteContent.metrics, 8),
    platforms: cleanList(source.platforms, defaultSiteContent.platforms, 18),
    socialNote: cleanObject(source.socialNote, defaultSiteContent.socialNote),
    natureSummary: cleanText(source.natureSummary, defaultSiteContent.natureSummary),
    natureItems: cleanList(source.natureItems, defaultSiteContent.natureItems, 12),
    contact: cleanObject(source.contact, defaultSiteContent.contact, ["emailUrl", "socialUrl"]),
  };
}
