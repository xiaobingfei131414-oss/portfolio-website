import { useState } from 'react';
import { categories } from './content';
import { categoryPath, neighbours, projectPath } from './portfolio';
import type { Page } from './portfolio';
import { ImageLightbox, MediaGallery, SafeImage } from './Gallery';

export function CategoryPage({ page }: { page: Extract<Page, { kind: 'category' }> }) {
  const { category, subcategory, projects } = page;
  const collection = projects.length === 1 && projects[0].media.length > 1 ? projects[0] : null;
  const cards = collection
    ? collection.media.map((item, index) => ({
        key: `${collection.id}-${index}`,
        href: projectPath(collection.id),
        overviewHref: undefined,
        cover: item.kind === 'video' ? item.poster || collection.cover : item.src,
        media: item,
        title: `${collection.title} · ${item.caption?.match(/\d+$/)?.[0] || String(index + 1).padStart(2, '0')}`,
        subtitle: collection.subtitle,
        year: collection.year,
        sample: collection.sample,
      }))
    : projects.map(project => ({ key: project.id, href: projectPath(project.id), overviewHref: !subcategory && project.subcategory ? categoryPath(category.id, project.subcategory) : undefined, cover: project.cover, media: undefined, title: project.title, subtitle: project.subtitle, year: project.year, sample: project.sample }));
  const previewImages = cards.filter(card => card.media?.kind !== 'video').map(card => ({ kind: 'image' as const, src: card.cover, alt: card.title, caption: card.title }));
  const [activePreview, setActivePreview] = useState<number | null>(null);
  const headingDescription = category.id === '3d' && subcategory?.id === 'animation'
    ? '以下作品都是长期积累的个人练习和临摹'
    : category.id === '3d' && subcategory?.id === 'render'
      ? '以下作品部分是长期积累的个人练习和临摹'
      : category.description;
  return <section className="section-shell works-page">
    <div className="breadcrumb"><a href="/">首页</a><span>/</span>{subcategory ? <><a href={categoryPath(category.id)}>{category.name}</a><span>/</span><span>{subcategory.name}</span></> : <span>{category.name}</span>}</div>
    <div className="works-heading"><div><p className="eyebrow">精选作品</p><h1>{subcategory?.name || category.name}<span>作品集</span></h1><p>{headingDescription}</p></div><span className="works-index">0{categories.indexOf(category) + 1}<sup>/ 04</sup></span></div>
    <div className="filter-row"><nav aria-label={`${category.name}筛选`}><a className="interface-button" href={categoryPath(category.id)} aria-current={!subcategory ? 'page' : undefined}>全部作品</a>{category.children.map(child => <a className="interface-button" href={categoryPath(category.id, child.id)} key={child.id} aria-current={subcategory?.id === child.id ? 'page' : undefined}>{child.name}</a>)}</nav><span>{String(cards.length).padStart(2, '0')} {collection ? '件作品' : '个项目'}{projects.some(project => project.sample) ? ' · 含示例' : ''}</span></div>
    {projects.length ? <>{projects.some(project => project.sample) && <p className="sample-disclaimer">标记“示例”的内容仅用于展示网站效果，非本人作品。</p>}<div className="project-grid">{cards.map((card, index) => <article className="project-card" key={card.key}>
      {card.media?.kind === 'video'
        ? <video className="project-cover project-video" controls controlsList="nodownload" disablePictureInPicture playsInline preload="none" poster={card.cover} src={card.media.src} aria-label={card.title} />
        : card.overviewHref
          ? <a className="project-cover" href={card.overviewHref} aria-label={`查看${card.title}类目`}><SafeImage src={card.cover} alt={card.title} loading="lazy" />{card.sample && <span className="sample-badge">示例作品</span>}</a>
          : <button type="button" className="project-cover" aria-label={`放大查看：${card.title}`} onClick={() => setActivePreview(index)}><SafeImage src={card.cover} alt={card.title} loading="lazy" />{card.sample && <span className="sample-badge">示例作品</span>}</button>}
      <div className="project-card-info"><div><a href={card.href}><h2>{card.title}</h2></a><p>{card.subtitle}</p></div><span>{card.year || '—'}</span></div>
    </article>)}</div><ImageLightbox images={previewImages} active={activePreview} onChange={setActivePreview} onClose={() => setActivePreview(null)} /></> : <div className="empty-state"><span className="empty-mark" aria-hidden="true">＋</span><p className="eyebrow">敬请期待</p><h2>作品整理中</h2><p>这一部分正在准备。<br />你可以先看看其他方向的作品。</p><div className="empty-links">{categories.filter(item => item.id !== category.id).map(item => <a className="interface-button" key={item.id} href={categoryPath(item.id)}>{item.name} </a>)}</div></div>}
    <a className="back-overview interface-button" href="/#work-categories">返回作品分类</a>
  </section>;
}

export function ProjectPage({ page }: { page: Extract<Page, { kind: 'project' }> }) {
  const { project, category } = page;
  const subcategory = category.children.find(child => child.id === project.subcategory);
  const { previous, next } = neighbours(project);
  return <article className="section-shell project-page">
    <a className="back-link interface-button" href={categoryPath(category.id, project.subcategory)}>返回{subcategory?.name || category.name}</a>
    <header className="project-heading"><div><p className="eyebrow">{category.name}{project.sample && ' · 示例作品'}</p><h1>{project.title}</h1><p className="project-subtitle">{project.subtitle}</p></div><div className="project-summary"><p>{project.description}</p>{project.sample && <p className="sample-disclaimer">示例作品 · 非本人作品，待替换。</p>}<dl>{project.year && <div><dt>年份</dt><dd>{project.year}</dd></div>}{project.role && <div><dt>我的职责</dt><dd>{project.role}</dd></div>}{project.tools?.length && <div><dt>制作工具</dt><dd>{project.tools.join(' / ')}</dd></div>}</dl></div></header>
    <MediaGallery media={project.media} layout={project.galleryLayout} />
    <nav className="project-pagination" aria-label="相邻作品">{previous ? <a href={projectPath(previous.id)}><small> 上一件作品</small><span>{previous.title}</span></a> : <span /> }<a className="pagination-all interface-button" href={categoryPath(category.id)}>全部{category.name}</a>{next ? <a className="pagination-next" href={projectPath(next.id)}><small>下一件作品 </small><span>{next.title}</span></a> : <span />}</nav>
  </article>;
}

export function NotFound() {
  return <section className="section-shell not-found"><p className="eyebrow">404 · 页面未找到</p><h1>这页暂时不在这里。</h1><p>链接可能有误，一起回到作品集继续看看。</p><a className="button button-dark interface-button" href="/">返回首页</a></section>;
}

