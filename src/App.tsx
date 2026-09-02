import { categories, profile } from './content';
import { categoryPath, resolvePage, pageMetadata } from './portfolio';
import { useEffect } from 'react';
import ParticleText from './ParticleText';
import { Navigation } from './Navigation';
import { CategoryPage, ProjectPage, NotFound } from './WorkPages';
import { SafeImage } from './Gallery';

export function App({ pathname }: { pathname: string }) {
  const page = resolvePage(pathname);
  useEffect(() => { document.title = pageMetadata(pathname).title; }, [pathname]);
  return <>
    <Navigation pathname={pathname} />
    <main id="main" tabIndex={-1}>{page.kind === 'home' ? <Home /> : page.kind === 'category' ? <CategoryPage page={page} /> : page.kind === 'project' ? <ProjectPage page={page} /> : <NotFound />}</main>
    <Contact />
  </>;
}
export function Home() {
  return <>
    <section className="hero" id="home" aria-labelledby="hero-title"><div className="hero-inner"><div className="hero-copy">
      <p className="availability"><span />正在寻找新的设计机会 <i>OPEN TO WORK</i></p>
      <p className="hero-hello">你好，我是 <span>{profile.name}</span><sup>✳</sup></p>
      <h1 id="hero-title" className="particle-heading"><ParticleText text={'让好产品，\n拥有好视觉。'} particleSize={1.8} density={2} color="#ffffff" highlightColor="#c0c9d6" scatter={110} gatherDuration={1400} stagger={300} pointerRepel={32} repelRadius={95} idleDrift={0.35} trigger="hover" fontSize="clamp(42px, 5.2vw, 78px)" fontWeight={700} glow={false} /></h1>
      <p className="hero-role">电商视觉设计师<span> / </span>E-COMMERCE VISUAL DESIGNER</p>
      <p className="hero-description">{profile.introduction}</p>
      <div className="hero-actions"><a className="button button-dark" href="#work-categories">查看我的作品 <span>↗</span></a>{profile.resumeUrl && <a className="text-link" href={profile.resumeUrl} download>下载简历 ↓</a>}<a className="text-link" href="#contact">联系我 <span>↗</span></a></div>
      <p className="profile-note">{profile.name} · 求职意向：{profile.jobIntent}</p>
    </div><figure className="hero-portrait"><img src={profile.portrait} width="1536" height="2304" alt="设计师身穿黑色西装的坐姿职业照" fetchPriority="high" /><figcaption><span>DESIGN IS HOW I SEE THE WORLD.</span><span>以设计，回应每一种可能。</span></figcaption></figure></div>
    <div className="hero-bottom"><span>VISUAL THINKING. THOUGHTFUL MAKING.</span><a href="#strengths">向下探索 <span>↓</span></a><span>PORTFOLIO — 2026</span></div></section>
    <section className="section-shell strengths" id="strengths">
      <div className="section-heading"><div><p className="eyebrow">01 / WHAT I BRING</p><h2>不止于好看，<br /><span>更让产品被理解。</span></h2></div><p className="section-aside">从想法到画面，从细节到整体。<br />让视觉表达，回应产品本身。{profile.draft && <small>以下优势与软件为示例，待按实际经历确认。</small>}</p></div>
      <div className="strength-grid">{profile.strengths.map((item, index) => <article key={item.title}><span className="item-number">0{index + 1}</span><h3>{item.title}</h3><p>{item.description}</p></article>)}</div>
      <div className="skills-heading"><h3>技能掌握</h3><span>MY TOOLKIT {profile.draft && <i> / 示例</i>}</span></div>
      <div className="skills-grid">{profile.skills.map(item => <article key={item.title}><p className="eyebrow">{item.english}</p><h4>{item.title}</h4><div className="tool-tags">{item.tools.map(tool => <span key={tool}>{tool}</span>)}</div><p>{item.use}</p></article>)}</div>
    </section>
    <section className="section-shell categories-section" id="work-categories">
      <div className="section-heading"><div><p className="eyebrow">02 / EXPLORE MY WORK</p><h2>不同维度，同样用心。</h2></div><p className="section-aside">从平面到立体，从真实到想象。<br />选择一个方向，开始浏览。</p></div>
      <div className="category-grid">{categories.map((category, index) => <article className={`category-card category-${category.id}`} key={category.id}>
        <a className="category-cover" href={categoryPath(category.id)} aria-label={`浏览${category.name}`}>{category.cover ? <SafeImage src={category.cover} alt={`${category.name}分类封面`} loading="lazy" /> : <div className="illustration-placeholder"><span>ILLUSTRATION</span><p>想象，<br /><em>不设边界。</em></p><small>新作品，正在路上。</small></div>}<span className="cover-number">0{index + 1}</span><span className="cover-note">{category.coverNote}</span><span className="cover-arrow">↗</span></a>
        <div className="category-description"><div><a href={categoryPath(category.id)}><h3>{category.name}<span>{category.english}</span></h3></a><p>{category.description}</p></div><div className="category-tags">{category.children.length ? category.children.map(child => <a key={child.id} href={categoryPath(category.id, child.id)}>{child.name}<span>↗</span></a>) : <a href={categoryPath(category.id)}>全部插画<span>↗</span></a>}</div></div>
      </article>)}</div>
    </section>
  </>;
}
export function Contact() {
  const hasContact = Boolean(profile.email || profile.wechat || profile.resumeUrl);
  return <><section className="contact-section" id="contact"><div className="section-shell contact-inner"><div><p className="eyebrow">03 / LET’S CREATE SOMETHING</p><h2>下一个好作品，<br />也许从一次交流开始<span>。</span></h2><p>正在寻找{profile.jobIntent}相关机会，期待与你共事。</p></div><div className="contact-details"><span className="contact-symbol" aria-hidden="true">↗</span>{hasContact ? <div className="contact-links">{profile.email && <a href={`mailto:${profile.email}`}>{profile.email} ↗</a>}{profile.wechat && <p>微信：{profile.wechat}</p>}{profile.resumeUrl && <a href={profile.resumeUrl} download>下载 PDF 简历 ↓</a>}</div> : <><p>联系方式待补充</p><small>邮箱、微信与简历将在补充后显示。</small></>}</div></div></section><footer className="site-footer"><a href="/">{profile.name}<span> · 视觉设计师</span></a><span>© 2026 · MADE WITH INTENTION</span><a href="#main">返回顶部 ↑</a></footer></>;
}

