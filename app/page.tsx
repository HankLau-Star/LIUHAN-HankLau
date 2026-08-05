"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { defaultSiteContent, normalizeSiteContent, type SiteContent } from "../lib/site-content";

const navItems = [
  { id: "personal", label: "个人" },
  { id: "society", label: "社会世界" },
  { id: "nature", label: "自然世界" },
  { id: "contact", label: "联系方式" },
];

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const hostedApi = "https://ascender-archive-01.valid-gnat-7482.chatgpt.site";
const soundtrackUrl = "https://cdn.pixabay.com/download/audio/2026/07/13/audio_a4679e250c.mp3";
const soundtrackPage = "https://pixabay.com/music/future-bass-sport-version-1-mortals-566579/";

function publicContentEndpoint(): string {
  if (typeof window !== "undefined" && window.location.hostname.endsWith("github.io")) {
    return `${hostedApi}/api/site`;
  }
  return "/api/site";
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("personal");
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [content, setContent] = useState<SiteContent>(defaultSiteContent);
  const soundtrackRef = useRef<HTMLAudioElement>(null);

  const toggleSoundtrack = async () => {
    const audio = soundtrackRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.volume = 0.36;
      try {
        await audio.play();
        setMusicPlaying(true);
      } catch {
        setMusicPlaying(false);
      }
    } else {
      audio.pause();
      setMusicPlaying(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetch(publicContentEndpoint(), { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (payload?.content) setContent(normalizeSiteContent(payload.content));
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    let frame = 0;
    let narrativeVideoActive = false;
    const narrativeStart = document.getElementById("personal");
    const narrativeEnd = document.getElementById("nature");
    const narrativeVideoLayer = document.querySelector<HTMLElement>(".site-video-layer");
    const narrativeVideo = narrativeVideoLayer?.querySelector<HTMLVideoElement>("video");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const updatePointer = (event: PointerEvent) => {
      if (!finePointer) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        root.style.setProperty("--pointer-x", `${event.clientX}px`);
        root.style.setProperty("--pointer-y", `${event.clientY}px`);
        root.style.setProperty("--hero-shift-x", `${(event.clientX / window.innerWidth - 0.5) * 18}px`);
        root.style.setProperty("--hero-shift-y", `${(event.clientY / window.innerHeight - 0.5) * 12}px`);
        root.style.setProperty("--hero-title-tilt-x", `${(0.5 - event.clientY / window.innerHeight) * 4}deg`);
        root.style.setProperty("--hero-title-tilt-y", `${(event.clientX / window.innerWidth - 0.5) * 5}deg`);
        root.style.setProperty("--hero-title-light", `${Math.round((event.clientX / window.innerWidth) * 100)}%`);
      });
    };
    const syncNarrativeVideo = () => {
      if (!narrativeStart || !narrativeEnd || !narrativeVideoLayer || !narrativeVideo) return;
      const startTop = narrativeStart.getBoundingClientRect().top;
      const endBottom = narrativeEnd.getBoundingClientRect().bottom;
      const shouldPlay = !reduceMotion && startTop <= window.innerHeight * 0.72 && endBottom >= window.innerHeight * 0.22;
      if (shouldPlay === narrativeVideoActive) return;
      narrativeVideoActive = shouldPlay;
      narrativeVideoLayer.classList.toggle("is-active", shouldPlay);
      if (shouldPlay) narrativeVideo.play().catch(() => undefined);
      else narrativeVideo.pause();
    };
    const updateScroll = () => {
      const range = document.documentElement.scrollHeight - window.innerHeight;
      root.style.setProperty("--scroll-progress", `${range > 0 ? Math.min((window.scrollY / range) * 100, 100) : 0}%`);
      root.style.setProperty("--hero-parallax", `${Math.min(window.scrollY, 700) * 0.08}px`);
      syncNarrativeVideo();
    };
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("is-visible");
      });
    }, { threshold: 0.08 });
    const sectionObserver = new IntersectionObserver((entries) => {
      const current = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (current?.target.id) setActiveSection(current.target.id);
    }, { rootMargin: "-30% 0px -55%", threshold: [0, 0.2, 0.6] });
    document.querySelectorAll(".reveal").forEach((item) => revealObserver.observe(item));
    document.querySelectorAll("main section[id]").forEach((item) => sectionObserver.observe(item));
    window.addEventListener("pointermove", updatePointer, { passive: true });
    window.addEventListener("scroll", updateScroll, { passive: true });
    updateScroll();

    return () => {
      cancelAnimationFrame(frame);
      revealObserver.disconnect();
      sectionObserver.disconnect();
      narrativeVideoLayer?.classList.remove("is-active");
      narrativeVideo?.pause();
      window.removeEventListener("pointermove", updatePointer);
      window.removeEventListener("scroll", updateScroll);
    };
  }, [content]);

  return (
    <>
      <a className="skip-link" href="#main-content">跳至主要内容</a>
      <div className="reading-progress" aria-hidden="true" />
      <div className="ambient-glow" aria-hidden="true" />
      <audio ref={soundtrackRef} src={soundtrackUrl} loop preload="none" onEnded={() => setMusicPlaying(false)} />
      <header className="site-header">
        <a className="brand" href="#top" aria-label="返回首页">
          <span className="brand-mark">HL</span>
          <span>{content.brand.name}<small>{content.brand.subtitle}</small></span>
        </a>
        <nav className={menuOpen ? "main-nav is-open" : "main-nav"} aria-label="主导航">
          {navItems.map((item) => (
            <a key={item.id} href={`#${item.id}`} className={activeSection === item.id ? "is-active" : ""} onClick={() => setMenuOpen(false)}>
              {item.label}
            </a>
          ))}
        </nav>
        <div className="header-actions">
          <button className={musicPlaying ? "music-toggle is-playing" : "music-toggle"} type="button" aria-label={musicPlaying ? "暂停背景音乐" : "播放背景音乐"} aria-pressed={musicPlaying} onClick={toggleSoundtrack} title="Sport Version 1 — BombinSound / Pixabay">
            <span aria-hidden="true"><i /><i /><i /><i /></span><b>{musicPlaying ? "SPORT ON" : "SPORT OFF"}</b>
          </button>
          <span className="status-pill"><i /> {content.brand.status}</span>
          <button className="menu-button" type="button" aria-label="切换导航菜单" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}><span /><span /></button>
        </div>
      </header>

      <main id="main-content">
        <section className="hero new-hero" id="top">
          <div className="hero-grid" aria-hidden="true" />
          <div className="hero-visual" aria-hidden="true">
            <img src={`${basePath}/solo-awakening.png`} alt="" />
            <div className="visual-veil" />
            <div className="energy-rift"><i /><i /><i /></div>
            <div className="energy-motes">
              {Array.from({ length: 24 }).map((_, index) => <i key={index} style={{ "--i": index } as CSSProperties} />)}
            </div>
          </div>
          <div className="hero-scanline" aria-hidden="true" />
          <div className="hero-copy">
            <div className="system-chip hero-stagger"><i /> {content.hero.system}</div>
            <div className="hero-identity hero-stagger">
              <strong>{content.brand.name}</strong>
              <span><b>刘涵 · 류한</b><small>{content.brand.subtitle}</small></span>
            </div>
            <div className="hero-title-wrap hero-stagger"><h1 data-text={content.hero.lineOne}>{content.hero.lineOne}</h1></div>
            <p className="hero-motto hero-stagger">{content.hero.lineTwo}<span>{content.hero.accent}</span></p>
            <p className="hero-intro hero-stagger">{content.hero.intro}</p>
            <blockquote className="hero-quote hero-stagger">
              <p>Nothing great was ever achieved without enthusiasm.</p>
              <cite>— Ralph Waldo Emerson</cite>
            </blockquote>
            <div className="hero-actions hero-stagger">
              <a className="button button-primary" href="#personal">打开个人档案 <b>↘</b></a>
              <a className="button button-ghost" href="#works">查看代表作品 →</a>
            </div>
          </div>
          <div className="awakening-mark hero-stagger" aria-hidden="true"><span>LEVEL</span><strong>∞</strong><i>EVOLVE / CREATE / ASCEND</i></div>
          <div className="world-map hero-stagger" aria-label="三部分内容结构">
            <a href="#personal"><small>01</small><strong>个人</strong><span>实力与背书 · 输入 · 输出 · 作品</span></a>
            <a href="#society"><small>02</small><strong>社会世界</strong><span>连接 · 协作 · 公共影响</span></a>
            <a href="#nature"><small>03</small><strong>自然世界</strong><span>身体 · 感知 · 长期主义</span></a>
          </div>
        </section>

        <div className="site-video-layer">
          <video aria-hidden="true" autoPlay muted loop playsInline preload="metadata">
            <source src={`${basePath}/ins-viral-video.mp4`} type="video/mp4" />
          </video>
          <span className="site-video-credit"><i /><b>我的原创 AI 作品</b><small>INSTAGRAM · 150万播放量</small></span>
        </div>

        <section className="section-shell personal" id="personal">
          <div className="section-code" aria-hidden="true">PERSON / 01</div>
          <div className="section-heading reveal">
            <div><span className="section-index">01 / PERSONAL</span><h2>个人 <em className="section-korean">개인</em></h2></div>
            <p>{content.personalSummary}</p>
          </div>

          <div className="chapter-block reveal" id="strength">
            <div className="chapter-intro"><span>01—A</span><h3>个人实力与背书</h3><p>能力决定能做什么，背书证明我已经走过什么。</p></div>
            <div className="strength-grid">
              <article className="glass-card"><span className="card-label">PERSONAL CAPABILITIES</span>{content.skills.map((item) => <div className="ability-row" key={`${item.title}-${item.detail}`}><strong>{item.title}</strong><p>{item.detail}</p></div>)}</article>
              <article className="glass-card"><span className="card-label">HONORS & CREDENTIALS</span><div className="honor-cloud">{content.honors.map((item) => <div key={`${item.title}-${item.detail}`}><strong>{item.title}</strong><span>{item.detail}</span></div>)}</div></article>
            </div>
          </div>

          <div className="chapter-block reveal" id="input">
            <div className="chapter-intro"><span>01—B</span><h3>输入</h3><p>持续学习、观察与体验，是能力更新的原料。</p></div>
            <div className="input-grid">{content.inputs.map((item) => <article key={`${item.label}-${item.title}`}><b>{item.label}</b><h4>{item.title}</h4><p>{item.body}</p></article>)}</div>
          </div>

          <div className="chapter-block output-block reveal" id="output">
            <div className="chapter-intro"><span>01—C</span><h3>输出</h3><p>所有积累最终都要变成作品、实践、连接，以及可被社会感知的价值。</p></div>
            <div className="output-grid">{content.outputs.map((item, index) => <article key={`${item.title}-${index}`}><span>{item.label || String(index + 1).padStart(2, "0")}</span><h4>{item.title}</h4><p>{item.body}</p></article>)}</div>
            <div className="experience-strip">{content.experiences.map((item) => <article key={`${item.company}-${item.role}`}><small>{item.role}</small><h4>{item.company}</h4><p>{item.body}</p></article>)}</div>
          </div>

          <div className="chapter-block selected-works reveal" id="works">
            <div className="works-watermark" aria-hidden="true">ORIGINAL</div>
            <div className="chapter-intro works-intro"><span>01—D / SELECTED WORKS</span><h3>代表作品</h3><p>{content.worksIntro}</p></div>
            <div className="works-grid">
              {content.works.map((work, index) => {
                const isWechat = work.platform.startsWith("WECHAT");
                const cardContent = (
                  <>
                    <div className="work-card-top"><span>{work.platform}</span><strong>{work.metric}</strong></div>
                    <span className="work-number">{String(index + 1).padStart(2, "0")}</span>
                    <h3>{work.title}</h3>
                    <p className={isWechat ? "work-excerpt is-note" : "work-excerpt"}>{isWechat ? work.summary : <><i>“</i>{work.summary}<i>”</i></>}</p>
                    <div className="work-card-foot"><span>LIUHAN · ORIGINAL</span><b>阅读全文 ↗</b></div>
                  </>
                );
                return <a className="work-card" href={work.url} target="_blank" rel="noreferrer" key={`${work.title}-${index}`} aria-label={`阅读原创作品：${work.title}`}>{cardContent}</a>;
              })}
            </div>
          </div>
        </section>

        <section className="impact section-shell society" id="society">
          <div className="signal-field" aria-hidden="true"><i /><i /><i /><i /></div>
          <div className="section-heading reveal">
            <div><span className="section-index">02 / SOCIAL WORLD</span><h2>社会世界 <em className="section-korean">사회 세계</em></h2></div>
            <p>{content.societySummary}</p>
          </div>
          <div className="impact-dashboard reveal">
            {content.metrics.map((metric, index) => (
              <article className={`${index === 0 ? "impact-primary" : "impact-stat"} glass-card`} key={`${metric.label}-${metric.value}`}>
                <span className="data-label">{metric.label}</span><strong className={index === 0 ? "big-number" : ""}>{metric.value}</strong><p>{metric.detail}</p>
                <i className="metric-pulse" aria-hidden="true" />
              </article>
            ))}
          </div>
          <div className="platform-console reveal">
            <div className="console-head"><span>NETWORK / LIVE SIGNAL</span><i>DATA UPDATED VIA CONTENT CONSOLE</i></div>
            <div className="platform-grid">{content.platforms.map((platform, index) => (
              <article className="platform-card" key={`${platform.name}-${platform.value}`}>
                <div><span>{String(index + 1).padStart(2, "0")}</span><em>PLATFORM</em></div>
                <h3>{platform.name}</h3><strong>{platform.value}<small> FOLLOWERS</small></strong><p>{platform.detail}</p>
                <div className="platform-track"><i style={{ "--track": `${Math.max(24, 100 - index * 9)}%` } as CSSProperties} /></div>
              </article>
            ))}</div>
          </div>
          <div className="social-note reveal"><strong>{content.socialNote.title}</strong><p>{content.socialNote.body}</p><span aria-hidden="true">CONNECT / AMPLIFY / IMPACT</span></div>
        </section>

        <section className="section-shell nature" id="nature">
          <div className="nature-horizon" aria-hidden="true"><i /><i /><i /></div>
          <div className="nature-orbit" aria-hidden="true"><span>LONG TERM</span><i /><i /><i /></div>
          <div className="section-heading reveal">
            <div><span className="section-index">03 / NATURAL WORLD</span><h2>自然世界 <em className="section-korean">자연 세계</em></h2></div>
            <p>{content.natureSummary}</p>
          </div>
          <div className="nature-grid">{content.natureItems.map((item, index) => (
            <article className="reveal" key={`${item.label}-${item.title}`}>
              <div className="nature-index">0{index + 1}</div><span>{item.label}</span><h3>{item.title}</h3><p>{item.body}</p><i className="nature-line" aria-hidden="true" />
            </article>
          ))}</div>
          <div className="nature-manifesto reveal"><span>BODY IS THE FIRST SYSTEM</span><strong>让身体承载野心，<br />让感知校准方向。</strong><p>STAY ALIVE · STAY SENSITIVE · STAY LONG-TERM</p></div>
        </section>

        <section className="contact section-shell" id="contact">
          <div className="contact-panel reveal">
            <div className="contact-orbit" aria-hidden="true"><i /><i /><span>OPEN CHANNEL</span></div>
            <div className="contact-profile-grid">
              <figure className="contact-portrait">
                <img src={`${basePath}/liuhan-avatar.jpg`} alt="刘涵 HankLau 个人头像" />
                <span aria-hidden="true" />
                <figcaption><small>ASCENDER / 04</small><strong>LIUHAN</strong><b>HankLau · HL</b></figcaption>
              </figure>
              <div className="contact-content">
                <span className="section-index">04 / CONTACT</span>
                <h2>{content.contact.heading} <em className="section-korean">연락하기</em></h2>
                <p>{content.contact.body}</p>
                <div className="contact-actions">
                  {content.contact.emailUrl ? <a className="button button-primary" href={content.contact.emailUrl}>{content.contact.emailLabel}</a> : <span className="button button-primary is-placeholder">{content.contact.emailLabel}</span>}
                  {content.contact.socialUrl ? <a className="button button-ghost" href={content.contact.socialUrl} target="_blank" rel="noreferrer">{content.contact.socialLabel}</a> : <span className="button button-ghost is-placeholder">{content.contact.socialLabel}</span>}
                </div>
                <div className="contact-qr-grid" aria-label="社交媒体二维码">
                  <article className="contact-qr-card">
                    <div><img src={`${basePath}/qr-wechat.png`} alt="刘涵的个人微信二维码" /></div>
                    <span><b>微信</b><small>WECHAT / PRIVATE</small></span>
                  </article>
                  <article className="contact-qr-card">
                    <div><img src={`${basePath}/qr-instagram.png`} alt="HankLau 的 Instagram 二维码" /></div>
                    <span><b>Instagram</b><small>@HANKLAU.AI</small></span>
                  </article>
                  <article className="contact-qr-card">
                    <div><img src={`${basePath}/qr-linktree.png`} alt="HankLau 的 Linktree 二维码" /></div>
                    <span><b>Linktree</b><small>ALL CHANNELS</small></span>
                  </article>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <div className="brand footer-brand"><span className="brand-mark">HL</span><span>{content.brand.name}<small>{content.brand.subtitle}</small></span></div>
        <p>PERSON · SOCIETY · NATURE<br /><span>向内生长，向外创造。</span></p>
        <div><span>© 2026</span><a href={soundtrackPage} target="_blank" rel="noreferrer" className="music-credit">MUSIC · BOMBINSOUND / PIXABAY</a><a href="/admin" className="admin-entry">CONTENT CONSOLE</a><a href="#top">BACK TO TOP ↑</a></div>
      </footer>
    </>
  );
}
