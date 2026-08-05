"use client";

import { useEffect, useState, type CSSProperties } from "react";

const navItems = [
  { id: "personal", label: "个人" },
  { id: "society", label: "社会世界" },
  { id: "nature", label: "自然世界" },
  { id: "contact", label: "联系方式" },
];

const skills = [
  ["三维世界构筑", "Unreal Engine 5 · Houdini · Maya · Nuke"],
  ["AI 生产力", "AI 工具探索 · 产品测评 · 工作流实践"],
  ["内容增长", "选题 · 剪辑 · 文字表达 · 多平台运营"],
  ["通用能力", "英语 · 记忆术 · 持续学习 · 组织领导"],
];

const honors = [
  ["211", "本科科班背景"],
  ["省级铜奖", "国创赛"],
  ["院级一等奖", "国创赛"],
  ["校级立项", "大学生创新创业"],
  ["校级一等奖", "三创赛 · 中医 AI 项目队长"],
  ["职业资格", "游泳救生员与教练"],
  ["学生会主席", "早期组织与领导经验"],
];

const experiences = [
  ["腾讯 QQ", "短视频运营", "在大厂内容场景中理解平台机制、内容节奏与用户反馈。"],
  ["中国移动", "营销实践", "从品牌传播与用户触达视角，理解完整营销链路。"],
  ["知乎", "内容运营", "深入图文生态，训练选题、表达与社区语境判断。"],
  ["公考机构", "全媒体运营", "参与多平台内容生产与分发，积累全媒体协同经验。"],
  ["36氪", "AI 产品内容测评", "围绕 AI 产品展开体验、测评与表达，让复杂技术被更多人理解。"],
];

const platforms = [
  ["视频号", "16,000", "200W+ 爆款播放"],
  ["Instagram", "5,000", "190W+ 爆款播放"],
  ["抖音 · 双账号", "5,300", "180W+ / 300W+ 流量作品"],
  ["微博", "3,000", "持续内容沉淀"],
  ["知乎", "1,400", "多篇高赞原创"],
  ["小红书", "1,100", "内容矩阵分发"],
  ["微信公众号", "300", "2 篇 10W+ 图文"],
  ["Threads / TikTok", "130 / 100", "海外阵地生长中"],
];

const outputs = [
  ["01", "实习实践", "腾讯 QQ、中国移动、知乎、公考机构、36氪，以及网易云音乐大使、腾讯青科实训营、阿里云 AI 实践、网易小蜜蜂与 AI 工作坊。"],
  ["02", "社群", "校园万人频道管理员、千人社群管理、10+ 百人内容社群、百人频道主，以及 AI 与校园社群实践。"],
  ["03", "自媒体", "覆盖中外多个内容平台，形成 25K+ 粉丝矩阵；单个作品最高获得 300W+ 流量。"],
  ["04", "书籍", "长期写作与书籍计划正在构思，把短内容判断力沉淀为更完整的表达。"],
  ["05", "创业公司", "创业计划处于问题探索阶段，目标是让技术、内容和真实需求形成可持续产品。"],
  ["06", "百科 · 公共影响力", "报道、百科与公共记录尚在积累，以可验证的作品和社会价值作为未来入口。"],
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("personal");

  useEffect(() => {
    const root = document.documentElement;
    let frame = 0;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const updatePointer = (event: PointerEvent) => {
      if (!finePointer) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        root.style.setProperty("--pointer-x", `${event.clientX}px`);
        root.style.setProperty("--pointer-y", `${event.clientY}px`);
        root.style.setProperty("--hero-shift-x", `${(event.clientX / window.innerWidth - .5) * 18}px`);
        root.style.setProperty("--hero-shift-y", `${(event.clientY / window.innerHeight - .5) * 12}px`);
      });
    };
    const updateScroll = () => {
      const range = document.documentElement.scrollHeight - window.innerHeight;
      root.style.setProperty("--scroll-progress", `${range > 0 ? Math.min(window.scrollY / range * 100, 100) : 0}%`);
      root.style.setProperty("--hero-scroll", `${Math.min(window.scrollY, 700)}px`);
      root.style.setProperty("--hero-parallax", `${Math.min(window.scrollY, 700) * .08}px`);
    };
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("is-visible");
      });
    }, { threshold: 0.08 });
    const sectionObserver = new IntersectionObserver((entries) => {
      const current = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (current?.target.id) setActiveSection(current.target.id);
    }, { rootMargin: "-30% 0px -55%", threshold: [0, .2, .6] });
    document.querySelectorAll(".reveal").forEach((item) => revealObserver.observe(item));
    document.querySelectorAll("main section[id]").forEach((item) => sectionObserver.observe(item));
    window.addEventListener("pointermove", updatePointer, { passive: true });
    window.addEventListener("scroll", updateScroll, { passive: true });
    updateScroll();
    return () => {
      cancelAnimationFrame(frame);
      revealObserver.disconnect();
      sectionObserver.disconnect();
      window.removeEventListener("pointermove", updatePointer);
      window.removeEventListener("scroll", updateScroll);
    };
  }, []);

  return (
    <>
      <a className="skip-link" href="#main-content">跳至主要内容</a>
      <div className="reading-progress" aria-hidden="true" />
      <div className="ambient-glow" aria-hidden="true" />
      <header className="site-header">
        <a className="brand" href="#top" aria-label="返回首页"><span className="brand-mark">A</span><span>ASCENDER<small>PERSONAL ARCHIVE</small></span></a>
        <nav className={menuOpen ? "main-nav is-open" : "main-nav"} aria-label="主导航">
          {navItems.map((item) => <a key={item.id} href={`#${item.id}`} className={activeSection === item.id ? "is-active" : ""} onClick={() => setMenuOpen(false)}>{item.label}</a>)}
        </nav>
        <div className="header-actions"><span className="status-pill"><i /> OPEN TO CREATE</span><button className="menu-button" type="button" aria-label="切换导航菜单" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}><span /><span /></button></div>
      </header>

      <main id="main-content">
        <section className="hero new-hero" id="top">
          <div className="hero-grid" aria-hidden="true" />
          <div className="hero-visual" aria-hidden="true">
            <img src="/solo-awakening.png" alt="" />
            <div className="visual-veil" />
            <div className="energy-rift"><i /><i /><i /></div>
            <div className="energy-motes">
              {Array.from({ length: 24 }).map((_, index) => <i key={index} style={{ "--i": index } as CSSProperties} />)}
            </div>
          </div>
          <div className="hero-scanline" aria-hidden="true" />
          <div className="hero-copy">
            <div className="system-chip hero-stagger"><i /> SYSTEM // AWAKENING</div>
            <div className="eyebrow hero-stagger">PERSON · SOCIETY · NATURE</div>
            <h1 className="hero-stagger">独自升级，<br />向外<span>创造。</span></h1>
            <p className="hero-intro hero-stagger">一个跨界数字创作者的个人档案：从能力、输入与输出出发，持续理解社会，也重新连接自然世界。</p>
            <div className="hero-actions hero-stagger"><a className="button button-primary" href="#personal">打开个人档案 <b>↘</b></a><a className="button button-ghost" href="#society">进入社会世界 →</a></div>
          </div>
          <div className="awakening-mark hero-stagger" aria-hidden="true"><span>LEVEL</span><strong>∞</strong><i>EVOLVE / CREATE / ASCEND</i></div>
          <div className="world-map hero-stagger" aria-label="三部分内容结构"><a href="#personal"><small>01</small><strong>个人</strong><span>实力与背书 · 输入 · 输出</span></a><a href="#society"><small>02</small><strong>社会世界</strong><span>连接 · 协作 · 公共影响</span></a><a href="#nature"><small>03</small><strong>自然世界</strong><span>身体 · 感知 · 长期主义</span></a></div>
        </section>

        <section className="section-shell personal" id="personal">
          <div className="section-heading reveal"><div><span className="section-index">01 / PERSONAL</span><h2>个人</h2></div><p>个人不是标签的集合，而是一套由实力、输入与输出构成，并持续循环升级的系统。</p></div>

          <div className="chapter-block reveal" id="strength"><div className="chapter-intro"><span>01—A</span><h3>个人实力与背书</h3><p>能力决定能做什么，背书证明我已经走过什么。</p></div><div className="strength-grid"><article className="glass-card"><span className="card-label">PERSONAL CAPABILITIES</span>{skills.map(([title, detail]) => <div className="ability-row" key={title}><strong>{title}</strong><p>{detail}</p></div>)}</article><article className="glass-card"><span className="card-label">HONORS & CREDENTIALS</span><div className="honor-cloud">{honors.map(([title, detail]) => <div key={title}><strong>{title}</strong><span>{detail}</span></div>)}</div></article></div></div>

          <div className="chapter-block reveal" id="input"><div className="chapter-intro"><span>01—B</span><h3>输入</h3><p>持续学习、观察与体验，是能力更新的原料。</p></div><div className="input-grid"><article><b>系统学习</b><h4>科班训练 × 技术工具</h4><p>以 211 本科的系统训练建立专业认知，并持续学习实时引擎、程序化生成、三维制作、合成与 AI 工具。</p></article><article><b>跨域观察</b><h4>技术 × 内容 × 用户</h4><p>在中文互联网与海外平台中观察内容传播、社区语境、产品体验与真实反馈。</p></article><article><b>生活输入</b><h4>阅读 × 运动 × 审美</h4><p>从长期阅读、跑步、力量训练、游泳、素描与动漫中保持感知力，也为持续创造储备体力。</p></article></div></div>

          <div className="chapter-block output-block reveal" id="output"><div className="chapter-intro"><span>01—C</span><h3>输出</h3><p>所有积累最终都要变成作品、实践、连接，以及可被社会感知的价值。</p></div><div className="output-grid">{outputs.map(([no, title, text]) => <article key={no}><span>{no}</span><h4>{title}</h4><p>{text}</p></article>)}</div><div className="experience-strip">{experiences.map(([company, role, text]) => <article key={company}><small>{role}</small><h4>{company}</h4><p>{text}</p></article>)}</div></div>
        </section>

        <section className="impact section-shell society" id="society">
          <div className="section-heading reveal"><div><span className="section-index">02 / SOCIAL WORLD</span><h2>社会世界</h2></div><p>通过内容、社群与协作进入更大的关系网络，让个人输出在真实世界中产生回声。</p></div>
          <div className="impact-dashboard reveal"><article className="impact-primary glass-card"><span className="data-label">PUBLIC REACH</span><strong className="big-number">25K+</strong><p>全平台粉丝矩阵</p></article><article className="impact-stat glass-card"><span>PEAK FLOW</span><strong>300W+</strong><p>单作流量峰值</p></article><article className="impact-stat glass-card"><span>COMMUNITIES</span><strong>10+</strong><p>百人内容社群</p></article><article className="impact-stat glass-card"><span>SERVICE</span><strong>130h+</strong><p>志愿服务</p></article></div>
          <div className="platform-grid">{platforms.map(([name, followers, reach], index) => <article className="platform-card reveal" key={name}><div><span>{String(index + 1).padStart(2, "0")}</span><em>PLATFORM</em></div><h3>{name}</h3><strong>{followers}<small> FOLLOWERS</small></strong><p>{reach}</p></article>)}</div>
          <div className="social-note reveal"><strong>连接不是数字。</strong><p>校园万人频道管理员、千人社群管理、百人频道主和 AI 社群实践，让影响力从“被看见”走向“让事情发生”。</p></div>
        </section>

        <section className="section-shell nature" id="nature">
          <div className="section-heading reveal"><div><span className="section-index">03 / NATURAL WORLD</span><h2>自然世界</h2></div><p>回到身体、节律与感知。自然世界不是工作之外的装饰，而是长期输出的底盘。</p></div>
          <div className="nature-grid"><article className="reveal"><span>BODY</span><h3>跑步 × 力量训练</h3><p>稳定的身体状态，支撑持续创造与长线进化。</p></article><article className="reveal"><span>WATER</span><h3>游泳救生员与教练</h3><p>一项与水相处的技能，也是一项能够保护他人的能力。</p></article><article className="reveal"><span>SENSE</span><h3>素描 × 动漫 × 审美</h3><p>从中学时期延续至今的视觉敏感度，构成叙事与创作的底色。</p></article><article className="reveal"><span>RHYTHM</span><h3>自我照料 × 规律生活</h3><p>护肤、训练与休息，让纪律变成可持续的日常节律。</p></article></div>
        </section>

        <section className="contact section-shell" id="contact"><div className="contact-panel reveal"><span className="section-index">04 / CONTACT</span><h2>保持联系。</h2><p>对创意技术、内容项目、品牌合作、AI 产品与跨界实验保持开放。</p><div className="contact-actions"><span className="button button-primary is-placeholder">邮箱 · 待补充</span><span className="button button-ghost is-placeholder">社交账号 · 待补充</span></div></div></section>
      </main>
      <footer className="site-footer"><div className="brand footer-brand"><span className="brand-mark">A</span><span>ASCENDER<small>PERSONAL ARCHIVE</small></span></div><p>PERSON · SOCIETY · NATURE<br /><span>向内生长，向外创造。</span></p><div><span>© 2026</span><a href="#top">BACK TO TOP ↑</a></div></footer>
    </>
  );
}
