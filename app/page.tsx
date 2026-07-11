"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

const navItems = [
  { id: "origin", label: "觉醒" },
  { id: "arsenal", label: "能力" },
  { id: "missions", label: "经历" },
  { id: "impact", label: "战绩" },
  { id: "network", label: "社群" },
  { id: "next", label: "进阶" },
];

const skills = [
  { code: "U5", name: "Unreal Engine 5", role: "实时世界构筑", note: "REAL-TIME" },
  { code: "HO", name: "Houdini", role: "程序化生成", note: "PROCEDURAL" },
  { code: "NU", name: "Nuke", role: "视觉合成", note: "COMPOSITING" },
  { code: "MY", name: "Maya", role: "三维制作", note: "3D CRAFT" },
  { code: "AI", name: "AI Tools", role: "智能生产力", note: "AUGMENTED" },
];

const experiences = [
  {
    index: "01",
    company: "腾讯 QQ",
    role: "短视频运营",
    text: "在大厂内容场景中理解短视频节奏、平台机制与用户反馈。",
    tag: "CONTENT OPS",
  },
  {
    index: "02",
    company: "中国移动",
    role: "营销实践",
    text: "从品牌传播和用户触达视角，补足对营销链路的理解。",
    tag: "MARKETING",
  },
  {
    index: "03",
    company: "知乎",
    role: "内容运营",
    text: "深入图文内容生态，训练选题、表达与社区语境判断。",
    tag: "EDITORIAL",
  },
  {
    index: "04",
    company: "公考机构",
    role: "全媒体运营",
    text: "参与多平台内容生产与分发，积累全媒体协同经验。",
    tag: "OMNIMEDIA",
  },
  {
    index: "05",
    company: "36氪",
    role: "AI 产品内容测评",
    text: "围绕 AI 产品展开体验、测评与表达，让复杂技术被更多人理解。",
    tag: "AI REVIEW",
  },
];

const achievements = [
  { mark: "省铜", title: "国创赛", detail: "省级铜奖", tone: "violet" },
  { mark: "院一", title: "国创赛", detail: "院级一等奖", tone: "blue" },
  { mark: "立项", title: "大学生创新创业", detail: "校级立项", tone: "cyan" },
  { mark: "队长", title: "三创赛 · 中医 AI", detail: "校级一等奖", tone: "amber" },
];

const platforms = [
  { name: "视频号", followers: "16,000", reach: "200W+ 爆款播放", group: "CN", size: "xl" },
  { name: "Instagram", followers: "5,000", reach: "190W+ 爆款播放", group: "GLOBAL", size: "lg" },
  { name: "抖音 · 双账号", followers: "5,300", reach: "180W+ / 300W+ 流量作品", group: "CN", size: "lg" },
  { name: "微博", followers: "3,000", reach: "持续内容沉淀", group: "CN", size: "md" },
  { name: "知乎", followers: "1,400", reach: "多篇高赞原创", group: "CN", size: "md" },
  { name: "小红书", followers: "1,100", reach: "内容矩阵分发", group: "CN", size: "md" },
  { name: "微信公众号", followers: "300", reach: "2 × 10W+ 图文", group: "CN", size: "sm" },
  { name: "Threads / TikTok", followers: "130 / 100", reach: "海外阵地生长中", group: "GLOBAL", size: "sm" },
];

const futureItems = [
  { no: "01", name: "VENTURE", cn: "创业计划", status: "问题探索中", glyph: "↗" },
  { no: "02", name: "MUSIC LAB", cn: "音乐作品", status: "学习与制作中", glyph: "≈" },
  { no: "03", name: "LONGFORM", cn: "书籍与长期写作", status: "构思中", glyph: "¶" },
  { no: "04", name: "PUBLIC RECORD", cn: "报道与百科", status: "尚未解锁", glyph: "◇" },
];

function CountUp({ target, suffix = "", label }: { target: number; suffix?: string; label: string }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setValue(target);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        const started = performance.now();
        const duration = 900;
        const tick = (now: number) => {
          const progress = Math.min((now - started) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 4);
          setValue(Math.round(target * eased));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        observer.disconnect();
      },
      { threshold: 0.45 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span className="count-wrap" aria-label={`${target}${suffix} ${label}`}>
      <span ref={ref} aria-hidden="true">
        {value}
        {suffix}
      </span>
    </span>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("origin");
  const [openMission, setOpenMission] = useState<number | null>(0);

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
      });
    };

    const updateProgress = () => {
      const range = document.documentElement.scrollHeight - window.innerHeight;
      const progress = range > 0 ? window.scrollY / range : 0;
      root.style.setProperty("--scroll-progress", `${Math.min(progress * 100, 100)}%`);
    };

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const current = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (current?.target.id) setActiveSection(current.target.id);
      },
      { rootMargin: "-35% 0px -55%", threshold: [0, 0.25, 0.6] },
    );

    document.querySelectorAll(".reveal").forEach((item) => revealObserver.observe(item));
    document.querySelectorAll("main section[id]").forEach((item) => sectionObserver.observe(item));
    window.addEventListener("pointermove", updatePointer, { passive: true });
    window.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();

    const tiltItems = Array.from(document.querySelectorAll<HTMLElement>("[data-tilt]"));
    const tiltHandlers = tiltItems.map((item) => {
      const move = (event: PointerEvent) => {
        if (!finePointer) return;
        const rect = item.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        item.style.setProperty("--tilt-x", `${y * -5}deg`);
        item.style.setProperty("--tilt-y", `${x * 5}deg`);
      };
      const leave = () => {
        item.style.setProperty("--tilt-x", "0deg");
        item.style.setProperty("--tilt-y", "0deg");
      };
      item.addEventListener("pointermove", move);
      item.addEventListener("pointerleave", leave);
      return { item, move, leave };
    });

    return () => {
      cancelAnimationFrame(frame);
      revealObserver.disconnect();
      sectionObserver.disconnect();
      window.removeEventListener("pointermove", updatePointer);
      window.removeEventListener("scroll", updateProgress);
      tiltHandlers.forEach(({ item, move, leave }) => {
        item.removeEventListener("pointermove", move);
        item.removeEventListener("pointerleave", leave);
      });
    };
  }, []);

  return (
    <>
      <a className="skip-link" href="#main-content">
        跳至主要内容
      </a>
      <div className="reading-progress" aria-hidden="true" />
      <div className="ambient-glow" aria-hidden="true" />

      <header className="site-header">
        <a className="brand" href="#origin" aria-label="返回首页">
          <span className="brand-mark">A</span>
          <span>
            ASCENDER
            <small>ARCHIVE // 01</small>
          </span>
        </a>

        <nav className={menuOpen ? "main-nav is-open" : "main-nav"} aria-label="主导航">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={activeSection === item.id ? "is-active" : ""}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="header-actions">
          <span className="status-pill"><i /> ONLINE</span>
          <button
            className="menu-button"
            type="button"
            aria-label="切换导航菜单"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((value) => !value)}
          >
            <span />
            <span />
          </button>
        </div>
      </header>

      <main id="main-content">
        <section className="hero" id="origin">
          <div className="hero-grid" aria-hidden="true" />
          <div className="hero-art" aria-hidden="true">
            <div className="art-veil" />
          </div>
          <div className="legion" aria-hidden="true">
            {Array.from({ length: 13 }).map((_, index) => (
              <span
                className="wraith"
                key={index}
                style={{ "--i": index, "--spread": index - 6 } as CSSProperties}
              />
            ))}
          </div>
          <div className="ascender-silhouette" aria-hidden="true">
            <span className="aura" />
            <span className="head" />
            <span className="body" />
            <span className="blade" />
          </div>

          <div className="hero-copy">
            <div className="eyebrow hero-stagger">CROSS-DISCIPLINARY CREATOR · AWAKENING</div>
            <h1 className="hero-stagger">
              一人，<br />
              即一支<span>军团。</span>
            </h1>
            <p className="hero-intro hero-stagger">
              211 科班底色 × 3D 视觉技术 × AI 内容探索 × 全网 25K+ 影响力。
              <br />
              让技术、内容与连接能力并肩作战。
            </p>
            <div className="hero-tags hero-stagger" aria-label="核心身份">
              <span>3D WORLD BUILDING</span>
              <span>AI EXPLORATION</span>
              <span>CONTENT GROWTH</span>
              <span>COMMUNITY LEADERSHIP</span>
            </div>
            <div className="hero-actions hero-stagger">
              <a className="button button-primary" href="#arsenal">
                <span>查看能力面板</span><b>↘</b>
              </a>
              <a className="button button-ghost" href="#impact">
                查看战绩 <span>→</span>
              </a>
            </div>
          </div>

          <aside className="player-panel glass-card hero-stagger" data-tilt aria-label="角色能力档案">
            <div className="panel-topline">
              <span>PLAYER PROFILE</span>
              <span>LEVEL 01 → ∞</span>
            </div>
            <div className="player-title">
              <small>CLASS</small>
              <strong>跨界数字创作者</strong>
              <span>MULTI-DISCIPLINARY BUILDER</span>
            </div>
            <div className="attribute-list">
              <div><span>VISUAL</span><i><b style={{ width: "88%" }} /></i><em>构筑</em></div>
              <div><span>CONTENT</span><i><b style={{ width: "95%" }} /></i><em>传播</em></div>
              <div><span>NETWORK</span><i><b style={{ width: "91%" }} /></i><em>连接</em></div>
              <div><span>STAMINA</span><i><b style={{ width: "84%" }} /></i><em>长期</em></div>
            </div>
            <div className="panel-footer">
              <span><i /> SYSTEM ACTIVE</span>
              <span>SEOUL · CN</span>
            </div>
          </aside>

          <div className="hero-metrics hero-stagger" aria-label="核心数据">
            <div><strong>25K+</strong><span>全平台粉丝矩阵</span></div>
            <div><strong>300W+</strong><span>单作流量峰值</span></div>
            <div><strong>10+</strong><span>百人内容社群</span></div>
            <div><strong>130h+</strong><span>志愿服务</span></div>
          </div>

          <a className="scroll-cue" href="#manifesto" aria-label="继续向下浏览">
            <span>SCROLL TO UNLOCK</span>
            <i />
          </a>
        </section>

        <section className="manifesto section-shell" id="manifesto">
          <div className="section-index reveal">00 / ORIGIN</div>
          <div className="manifesto-grid">
            <p className="manifesto-kicker reveal">NOT A LIST OF TITLES.<br />A SYSTEM OF ABILITIES.</p>
            <div className="manifesto-copy reveal">
              <h2>跨界不是分散，<br />而是建立自己的<span>能力系统。</span></h2>
              <p>
                我用三维技术构筑世界，用内容能力获得传播，用 AI 提升生产效率，再用社群把人与机会连接起来。
                真正的升级，不是收集更多标签，而是让每一种能力都能在真实项目中发挥作用。
              </p>
            </div>
          </div>
        </section>

        <section className="arsenal section-shell" id="arsenal">
          <div className="section-heading reveal">
            <div>
              <span className="section-index">01 / SKILL ARSENAL</span>
              <h2>能力军团</h2>
            </div>
            <p>每一项长期积累的能力，都是一名可以随时被召集的同行者。</p>
          </div>

          <div className="skill-bento">
            <article className="skill-main glass-card reveal" data-tilt>
              <div className="card-label"><span>CORE SYSTEM</span><i>ACTIVE</i></div>
              <h3>三维世界构筑</h3>
              <p>从实时引擎、程序化生成，到三维制作、渲染与后期合成。</p>
              <div className="software-grid">
                {skills.map((skill) => (
                  <div className="software-item" key={skill.code}>
                    <b>{skill.code}</b>
                    <span><strong>{skill.name}</strong><small>{skill.role}</small></span>
                    <em>{skill.note}</em>
                  </div>
                ))}
              </div>
            </article>

            <article className="education-card glass-card reveal" data-tilt>
              <div className="card-orbit" aria-hidden="true"><i /><i /><i /></div>
              <span className="card-label">ACADEMIC BASE</span>
              <strong>211</strong>
              <h3>本科 · 科班底色</h3>
              <p>用系统训练建立专业认知，再以跨界实践拓宽能力边界。</p>
            </article>

            <article className="content-card glass-card reveal" data-tilt>
              <div className="card-label"><span>GROWTH ENGINE</span><i>PROVEN</i></div>
              <h3>内容增长引擎</h3>
              <p>短视频剪辑、自媒体运营、内容选题、文字表达与多平台分发。</p>
              <div className="signal-bars" aria-hidden="true">
                {Array.from({ length: 16 }).map((_, i) => <i key={i} style={{ height: `${24 + ((i * 17) % 68)}%` }} />)}
              </div>
              <span className="micro-copy">CREATE · DISTRIBUTE · GROW</span>
            </article>

            <article className="survival-card glass-card reveal" data-tilt>
              <div className="card-label"><span>TRANSFERABLE</span><i>CORE</i></div>
              <h3>现实生存能力</h3>
              <div className="core-skill-list">
                <span>英语 <small>ENGLISH</small></span>
                <span>记忆术 <small>MEMORY</small></span>
                <span>游泳 <small>SWIMMING</small></span>
                <span>持续学习 <small>EVOLVE</small></span>
              </div>
              <p className="cert-note">国家职业资格 · 游泳救生员与教练</p>
            </article>
          </div>
        </section>

        <section className="missions section-shell" id="missions">
          <div className="section-heading reveal">
            <div>
              <span className="section-index">02 / EXPERIENCE LOG</span>
              <h2>任务记录</h2>
            </div>
            <p>在大厂、内容平台、教育机构与 AI 项目中，建立对内容、用户与技术产品的复合认知。</p>
          </div>

          <div className="mission-layout">
            <div className="mission-list reveal">
              {experiences.map((item, index) => {
                const expanded = openMission === index;
                return (
                  <article className={expanded ? "mission-item is-open" : "mission-item"} key={item.company}>
                    <button
                      type="button"
                      aria-expanded={expanded}
                      onClick={() => setOpenMission(expanded ? null : index)}
                    >
                      <span className="mission-number">{item.index}</span>
                      <span className="mission-name"><strong>{item.company}</strong><small>{item.role}</small></span>
                      <span className="mission-tag">{item.tag}</span>
                      <i>{expanded ? "−" : "+"}</i>
                    </button>
                    <div className="mission-detail"><p>{item.text}</p></div>
                  </article>
                );
              })}
            </div>

            <aside className="side-quests glass-card reveal">
              <div className="side-quest-head">
                <span>SIDE QUESTS</span><i>5 COMPLETE</i>
              </div>
              <h3>实践支线</h3>
              <ul>
                <li><b>01</b><span>网易云音乐大使</span><em>COMPLETE</em></li>
                <li><b>02</b><span>腾讯青科实训营</span><em>COMPLETE</em></li>
                <li><b>03</b><span>阿里云 AI 实践</span><em>COMPLETE</em></li>
                <li><b>04</b><span>网易小蜜蜂</span><em>COMPLETE</em></li>
                <li><b>05</b><span>AI 工作坊</span><em>COMPLETE</em></li>
              </ul>
              <div className="quest-footer"><span>EXPERIENCE GAINED</span><i /></div>
            </aside>
          </div>

          <div className="achievement-grid">
            {achievements.map((item) => (
              <article className={`achievement-card ${item.tone} reveal`} key={`${item.title}-${item.mark}`} data-tilt>
                <div className="achievement-mark"><span>{item.mark}</span></div>
                <div><small>ACHIEVEMENT UNLOCKED</small><h3>{item.title}</h3><p>{item.detail}</p></div>
              </article>
            ))}
          </div>
        </section>

        <section className="impact section-shell" id="impact">
          <div className="impact-glow" aria-hidden="true" />
          <div className="section-heading reveal">
            <div>
              <span className="section-index">03 / DIGITAL INFLUENCE</span>
              <h2>让内容穿过<br />平台边界。</h2>
            </div>
            <p>从图文到短视频，从中文互联网到海外平台，把真实反馈沉淀为可复用的内容判断力。</p>
          </div>

          <div className="impact-dashboard">
            <article className="impact-primary glass-card reveal" data-tilt>
              <span className="data-label">NETWORK REACH / CONFIRMED MINIMUM</span>
              <CountUp target={25} suffix="K+" label="全平台粉丝矩阵" />
              <p>全平台粉丝矩阵</p>
              <div className="reach-track" aria-hidden="true"><i /><i /><i /><i /></div>
              <div className="impact-foot"><span>CONTENT × COMMUNITY</span><span>2026 ARCHIVE</span></div>
            </article>
            <article className="impact-stat glass-card reveal">
              <span>PEAK FLOW</span><strong>300W+</strong><p>抖音单作流量峰值</p><i className="stat-spark" />
            </article>
            <article className="impact-stat glass-card reveal">
              <span>VIDEO CHANNEL</span><strong>200W+</strong><p>视频号爆款播放</p><i className="stat-spark alt" />
            </article>
            <article className="impact-stat glass-card reveal">
              <span>GLOBAL REACH</span><strong>190W+</strong><p>Instagram 爆款播放</p><i className="stat-spark cyan" />
            </article>
          </div>

          <div className="platform-header reveal">
            <span>PLATFORM MATRIX</span>
            <span>粉丝数据为各平台公开口径</span>
          </div>
          <div className="platform-grid">
            {platforms.map((platform, index) => (
              <article className={`platform-card ${platform.size} reveal`} key={platform.name}>
                <div><span>{String(index + 1).padStart(2, "0")}</span><em>{platform.group}</em></div>
                <h3>{platform.name}</h3>
                <strong>{platform.followers}<small> FOLLOWERS</small></strong>
                <p>{platform.reach}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="network section-shell" id="network">
          <div className="section-heading reveal">
            <div>
              <span className="section-index">04 / COMMUNITY LEADERSHIP</span>
              <h2>连接，即是<br />另一种影响力。</h2>
            </div>
            <p>账号代表个人影响力，社群则证明了连接、协调与长期运营能力。</p>
          </div>

          <div className="network-stage reveal" aria-label="社群规模网络图">
            <div className="network-rings" aria-hidden="true"><i /><i /><i /></div>
            <div className="network-lines" aria-hidden="true">
              {Array.from({ length: 6 }).map((_, i) => <i key={i} style={{ "--line-i": i } as CSSProperties} />)}
            </div>
            <div className="core-node"><small>CENTRAL NODE</small><strong>YOU</strong><span>内容连接人<br />社群放大可能</span></div>
            <div className="satellite-node node-a"><strong>10,000</strong><span>校园万人频道<br />管理员</span></div>
            <div className="satellite-node node-b"><strong>1,000+</strong><span>千人社群<br />管理经验</span></div>
            <div className="satellite-node node-c"><strong>10+</strong><span>百人内容社群<br />抖音 · 小红书</span></div>
            <div className="satellite-node node-d"><strong>100+</strong><span>百人频道主</span></div>
            <div className="satellite-node node-e"><strong>AI</strong><span>AI 社群<br />校园社群</span></div>
          </div>
        </section>

        <section className="reality section-shell" id="reality">
          <div className="section-heading reveal">
            <div>
              <span className="section-index">05 / CORE STATS</span>
              <h2>长期主义，<br />也写在身体里。</h2>
            </div>
            <p>现实世界的属性，不靠光效加成。稳定的身体、审美与纪律，是长期输出的底盘。</p>
          </div>
          <div className="reality-grid">
            <article className="reality-card wide reveal"><span>01 / STAMINA</span><h3>跑步 × 力量训练</h3><p>让稳定的身体状态，支撑持续创造与长线进化。</p><div className="pulse-line" aria-hidden="true" /></article>
            <article className="reality-card reveal"><span>02 / WATER</span><h3>游泳救生员<br />与教练</h3><p>国家职业资格，亦是一项真正能保护他人的能力。</p><b>QUALIFIED</b></article>
            <article className="reality-card reveal"><span>03 / AESTHETIC</span><h3>素描 · 动漫</h3><p>从中学时期延续的视觉敏感度，构成审美与叙事的底色。</p><div className="sketch-lines" aria-hidden="true"><i /><i /><i /></div></article>
            <article className="reality-card reveal"><span>04 / LEADERSHIP</span><h3>学生会主席</h3><p>领导力的起点，不是站在中心，而是组织人与推动事情发生。</p><b>EARLY ORIGIN</b></article>
            <article className="reality-card wide reveal"><span>05 / SELF MANAGEMENT</span><h3>形象管理 × 自我照料</h3><p>护肤、训练与规律生活。自律不是展示，而是维持状态的日常系统。</p><div className="routine-tags"><i>DISCIPLINE</i><i>CONSISTENCY</i><i>CARE</i></div></article>
          </div>
        </section>

        <section className="future section-shell" id="next">
          <div className="future-heading reveal">
            <span className="section-index">06 / INCUBATING</span>
            <h2>地图仍在扩张。<br /><span>下一章，尚未命名。</span></h2>
            <p>真正值得期待的，不是已经获得的称号，而是下一次能够交付的作品。</p>
          </div>
          <div className="future-grid">
            {futureItems.map((item) => (
              <article className="future-card reveal" key={item.no} tabIndex={0}>
                <div><span>{item.no}</span><i>LOCKED / INCUBATING</i></div>
                <b aria-hidden="true">{item.glyph}</b>
                <h3>{item.name}<small>{item.cn}</small></h3>
                <p><i /> {item.status}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="contact section-shell" id="contact">
          <div className="contact-panel reveal">
            <div className="contact-orb" aria-hidden="true"><i /><i /><i /></div>
            <span className="section-index">07 / NEXT MISSION</span>
            <h2>下一场任务，<br />是否与你有关？</h2>
            <p>对创意技术、内容项目、品牌合作、AI 产品与跨界实验保持开放。</p>
            <div className="contact-actions">
              <span className="button button-primary is-placeholder" aria-label="邮箱待接入">邮箱 · 待接入</span>
              <a className="button button-ghost" href="#impact">查看社交矩阵 <span>↗</span></a>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="brand footer-brand"><span className="brand-mark">A</span><span>ASCENDER<small>ARCHIVE // 01</small></span></div>
        <p>Built from curiosity, discipline and unfinished ambition.<br /><span>好奇、纪律，以及尚未完成的野心。</span></p>
        <div><span>© 2026</span><a href="#origin">BACK TO TOP ↑</a></div>
      </footer>
    </>
  );
}
