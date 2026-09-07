import { categories, profile } from './content';
import { categoryPath, resolvePage, pageMetadata } from './portfolio';
import { useEffect, useRef } from 'react';
import ParticleText from './ParticleText';
import GlowCursor from './GlowCursor';
import BorderGlow from './BorderGlow';
import SplashCursor from './components/SplashCursor/SplashCursor';
import ScrollReveal from './components/ScrollReveal/ScrollReveal';
import { Navigation } from './Navigation';
import { CategoryPage, ProjectPage, NotFound } from './WorkPages';
import { SafeImage, MediaGallery } from './Gallery';

export function App({ pathname }: { pathname: string }) {
  const page = resolvePage(pathname);
  useEffect(() => { document.title = pageMetadata(pathname).title; }, [pathname]);
  useEffect(() => {
    const preventMediaDownload = (event: Event) => {
      if (event.target instanceof Element && event.target.closest('img, video')) event.preventDefault();
    };
    document.addEventListener('contextmenu', preventMediaDownload);
    document.addEventListener('dragstart', preventMediaDownload);
    return () => {
      document.removeEventListener('contextmenu', preventMediaDownload);
      document.removeEventListener('dragstart', preventMediaDownload);
    };
  }, []);
  return <>
    <StarField />
    <SplashCursor SIM_RESOLUTION={128} DYE_RESOLUTION={1440} DENSITY_DISSIPATION={3.5} VELOCITY_DISSIPATION={2} PRESSURE={0.1} CURL={3} SPLAT_RADIUS={0.2} SPLAT_FORCE={6000} COLOR_UPDATE_SPEED={10} />
    <div className="site-content">
      <Navigation pathname={pathname} />
      <main id="main" tabIndex={-1}>{page.kind === 'home' ? <Home /> : page.kind === 'category' ? <CategoryPage page={page} /> : page.kind === 'project' ? <ProjectPage page={page} /> : <NotFound />}</main>
      <Contact />
      <GlowCursor />
    </div>
  </>;
}

const stars = Array.from({ length: 120 }, (_, index) => ({
  left: `${(index * 37 + 11) % 97}%`,
  top: `${(index * index * 13 + index * 17 + 7) % 96}%`,
  size: `${1.05 + ((index * 7) % 9) * 0.24}px`,
  delay: `${-(index % 9) * 0.47}s`,
  duration: `${0.85 + (index % 9) * 0.24}s`,
  opacity: 0.12 + ((index * 11) % 8) * 0.045,
}));

function StarField() {
  return <div className="star-field" aria-hidden="true">{stars.map((star, index) => <span key={index} style={{ left: star.left, top: star.top, width: star.size, height: star.size, animationDelay: star.delay, animationDuration: star.duration, opacity: star.opacity }} />)}</div>;
}

export function Home() {
  const skillsRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const grids = [skillsRef.current, categoriesRef.current].filter(Boolean) as HTMLDivElement[];
    if (!grids.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const observers = grids.map(grid => {
      grid.classList.add('is-animated');
      const observer = new IntersectionObserver(([entry]) => {
        grid.classList.toggle('is-visible', entry.isIntersecting);
      }, { threshold: 0.18 });
      observer.observe(grid);
      return observer;
    });
    return () => observers.forEach(observer => observer.disconnect());
  }, []);

  return <>
    <section className="hero" id="home" aria-labelledby="hero-title"><div className="hero-inner"><div className="hero-copy">
      <BorderGlow className="hero-semicircle" borderRadius={999} glowRadius={34} glowIntensity={1.4} backgroundColor="transparent" fillOpacity={0.12} animated aria-hidden="true"><span /></BorderGlow>
      <div className="hero-geometry" aria-hidden="true"><span className="geometry-line" /></div>
      <p className="availability"><span />正在寻找新的设计机会</p>
      <p className="hero-hello">你好，我是 <strong>{profile.name}</strong></p>
      <h1 id="hero-title" className="particle-heading"><ParticleText text={'让设计回应需求，\n让视觉创造价值。'} particleSize={1.45} density={3} color="#fff" highlightColor="#f27aff" fontFamily="Alibaba PuHuiTi Heavy" letterSpacing={0.1} lineHeight={1.4} fontSize="clamp(42px, 5.2vw, 78px)" fontWeight={900} /></h1>
      <p className="hero-description">{profile.introduction}</p>
      <div className="hero-divider" aria-hidden="true" />
    </div><figure className="hero-portrait"><img src={profile.portrait} srcSet="/images/portrait-dark-768.webp 768w, /images/portrait-dark-1152.webp 1152w, /images/portrait-dark-1536.webp 1536w" sizes="(max-width: 767px) 92vw, 48vw" width="1536" height="2304" alt="设计师身穿黑色西装的坐姿职业照" fetchPriority="high" /></figure><div className="hero-cta-block"><div className="hero-actions"><GlowLink href="#work-categories">查看我的作品</GlowLink><GlowLink href={profile.resumeUrl} download>下载简历</GlowLink></div>
      <p className="profile-note">求职意向：{profile.jobIntent}</p></div></div>
    </section>
    <section className="section-shell strengths" id="strengths">
      <div className="section-heading"><SectionTitle text="个人优势" /></div>
      <ScrollReveal containerClassName="strength-scroll-reveal" textClassName="strength-statement" baseOpacity={0} enableBlur baseRotation={0} blurStrength={10}>{profile.strengths.split(/(5 年电商视觉设计实战经验|C4D 关键帧动画、动力学、布料与域|「建模 — 材质 — 动画 — 渲染 —AE 合成」)/).map((part, i) => i % 2 ? <strong key={i}>{part}</strong> : part)}</ScrollReveal>
      <div className="skills-heading"><h3>技能掌握</h3></div>
      <div ref={skillsRef} className="skills-grid neon-skills skills-reveal">{profile.skills.map((item, index) => <article className={`neon-skill neon-skill-${index}`} key={item.title}><SkillIcon index={item.icon} /><h4>{item.title}</h4><div className="tool-tags">{item.tags.map(tag => <span key={tag}>{tag}</span>)}</div><p>{item.use}</p></article>)}</div>
    </section>
    <section className="section-shell categories-section" id="work-categories">
      <div className="section-heading"><SectionTitle text="精选作品" /></div>
      <div ref={categoriesRef} className="category-grid categories-reveal">{categories.map((category, index) => <article className={`category-card category-${category.id}`} key={category.id}>
        <a className="category-cover" href={categoryPath(category.id)} aria-label={`浏览${category.name}`}>{category.cover ? <SafeImage src={category.cover} alt={`${category.name}分类封面`} loading="lazy" /> : <div className="illustration-placeholder"><span>插画创作</span><p>想象，<br /><em>不设边界。</em></p><small>新作品，正在路上。</small></div>}<span className="cover-number">0{index + 1}</span><span className="cover-note">{category.coverNote}</span></a>
        <div className="category-description"><div><a href={categoryPath(category.id)}><h3>{category.name}</h3></a><p>{category.description}</p></div><div className="category-tags">{category.children.length ? category.children.map(child => <GlowLink key={child.id} href={categoryPath(category.id, child.id)}>{child.name}</GlowLink>) : <GlowLink href={categoryPath(category.id)}>全部插画</GlowLink>}</div></div>
      </article>)}</div>
    </section>
  </>;
}
export function Contact() {
  const hasContact = Boolean(profile.phone || profile.email || profile.wechat || profile.resumeUrl);
  const contactRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const section = contactRef.current;
    if (!section || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    section.classList.add('is-animated');
    const observer = new IntersectionObserver(([entry]) => {
      section.classList.toggle('is-visible', entry.isIntersecting);
    }, { threshold: 0.16 });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);
  return <><section className="contact-section" id="contact"><div ref={contactRef} className="section-shell contact-inner contact-reveal"><div className="contact-copy"><BorderGlow className="contact-copy-glow" borderRadius={36} glowRadius={34} glowIntensity={1.4} backgroundColor="transparent" fillOpacity={0.12} animated aria-hidden="true"><span /></BorderGlow><span className="contact-kicker" aria-label="联系"><svg className="contact-smile" viewBox="0 0 32 32" fill="none" aria-hidden="true"><circle cx="16" cy="16" r="13.5" /><circle cx="11.5" cy="13" r="1.4" fill="currentColor" stroke="none" /><circle cx="20.5" cy="13" r="1.4" fill="currentColor" stroke="none" /><path d="M10.5 19c1.7 2.5 3.5 3.7 5.5 3.7s3.8-1.2 5.5-3.7" /></svg></span><h2>下一个好作品，<br />也许从一次交流开始<span>。</span></h2><p>正在寻找{profile.jobIntent}相关机会，期待与你共事。</p></div><div className="contact-details"><BorderGlow className="contact-details-glow" borderRadius={28} glowRadius={34} glowIntensity={1.4} backgroundColor="transparent" fillOpacity={0.12} animated followParent aria-hidden="true"><span /></BorderGlow><span className="contact-details-label">保持联系</span><div className="wechat-qr"><MediaGallery media={[{ kind: 'image', src: profile.wechatQrUrl, alt: '肖丙飞的微信二维码', caption: '微信联系 · 点击放大' }]} /></div>{hasContact ? <div className="contact-links">{profile.phone && <a href={`tel:${profile.phone}`}>电话：{profile.phone} </a>}{profile.email && <a href={`mailto:${profile.email}`}>邮箱：{profile.email} </a>}{profile.wechat && <p>微信：{profile.wechat}</p>}{profile.resumeUrl && <a className="contact-resume interface-button" href={profile.resumeUrl} download>下载简历</a>}</div> : <><p>联系方式待补充</p><small>邮箱、微信与简历将在补充后显示。</small></>}</div></div></section><footer className="site-footer"><a href="/">{profile.name}<span> · {profile.role}</span></a><a className="back-to-top interface-button" href="#main">返回顶部</a></footer></>;
}

function SectionTitle({ text }: { text: string }) {
  return <h2 className="section-particle-title"><ParticleText text={text} particleSize={1.45} density={3} color="#fff" highlightColor="#fff" fontFamily="Alibaba PuHuiTi Heavy" letterSpacing={0.12} lineHeight={1.27} fontSize="var(--section-particle-size)" fontWeight={900} /></h2>;
}
function SkillIcon({ index }: { index: number }) {
  if (index === 3) return <img className="skill-icon chatgpt-icon" src="/images/chatgpt.svg" width="28" height="28" alt="ChatGPT" />;
  const paths = [
    'M4 4h16v12H4z M8 20h8 M12 16v4',
    'm12 2 9 5v10l-9 5-9-5V7l9-5z M3 7l9 5 9-5 M12 12v10',
    'm13 2-9 12h7l-1 8 10-13h-7l1-7z',
    'M4 6h4l2-3h4l2 3h4v15H4z M16 13a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  ];
  return <svg className="skill-icon" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true"><path d={paths[index]} /></svg>;
}

function GlowLink({ href, children, download }: { href: string; children: React.ReactNode; download?: boolean }) {
  return <BorderGlow className="glow-link interface-button" borderRadius={8} glowRadius={16} backgroundColor="#ffffff06" fillOpacity={0.2}><a href={href} download={download}>{children}</a></BorderGlow>;
}



