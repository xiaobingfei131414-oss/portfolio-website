import { categories } from './content';
import { categoryPath, neighbours, projectPath } from './portfolio';
import type { Page } from './portfolio';
import { MediaGallery, SafeImage } from './Gallery';

export function CategoryPage({ page }: { page: Extract<Page, { kind: 'category' }> }) {
  const { category, subcategory, projects } = page;
  return <section className="section-shell works-page">
    <div className="breadcrumb"><a href="/">首页</a><span>/</span>{subcategory ? <><a href={categoryPath(category.id)}>{category.name}</a><span>/</span><span>{subcategory.name}</span></> : <span>{category.name}</span>}</div>
    <div className="works-heading"><div><p className="eyebrow">{category.english} / SELECTED WORKS</p><h1>{subcategory?.name || category.name}<span>作品集</span></h1><p>{category.description}</p></div><span className="works-index">0{categories.indexOf(category) + 1}<sup>/ 04</sup></span></div>
    <div className="filter-row"><nav aria-label={`${category.name}筛选`}><a href={categoryPath(category.id)} aria-current={!subcategory ? 'page' : undefined}>全部作品</a>{category.children.map(child => <a href={categoryPath(category.id, child.id)} key={child.id} aria-current={subcategory?.id === child.id ? 'page' : undefined}>{child.name}</a>)}</nav><span>{String(projects.length).padStart(2, '0')} 个项目{projects.some(project => project.sample) ? ' · 含示例' : ''}</span></div>
    {projects.length ? <>{projects.some(project => project.sample) && <p className="sample-disclaimer">标记“示例”的内容仅用于展示网站效果，非本人作品。</p>}<div className="project-grid">{projects.map(project => <article className="project-card" key={project.id}>
      <a href={projectPath(project.id)} className="project-cover" aria-label={`查看 ${project.title} ${project.subtitle}`}><SafeImage src={project.cover} alt={project.subtitle} loading="lazy" />{project.sample && <span className="sample-badge">示例作品</span>}<span className="project-arrow" aria-hidden="true">↗</span></a>
      <div className="project-card-info"><div><a href={projectPath(project.id)}><h2>{project.title}</h2></a><p>{project.subtitle}</p></div><span>{project.year || '—'}</span></div>
    </article>)}</div></> : <div className="empty-state"><span className="empty-mark" aria-hidden="true">＋</span><p className="eyebrow">GOOD THINGS TAKE TIME</p><h2>作品整理中</h2><p>这一部分正在准备。<br />你可以先看看其他方向的作品。</p><div className="empty-links">{categories.filter(item => item.id !== category.id).map(item => <a key={item.id} href={categoryPath(item.id)}>{item.name} ↗</a>)}</div></div>}
    <a className="back-overview" href="/#work-categories">← 返回作品分类</a>
  </section>;
}

export function ProjectPage({ page }: { page: Extract<Page, { kind: 'project' }> }) {
  const { project, category } = page;
  const subcategory = category.children.find(child => child.id === project.subcategory);
  const { previous, next } = neighbours(project);
  return <article className="section-shell project-page">
    <a className="back-link" href={categoryPath(category.id, project.subcategory)}>← 返回{subcategory?.name || category.name}</a>
    <header className="project-heading"><div><p className="eyebrow">{category.english}{project.sample && ' / 示例作品'}</p><h1>{project.title}</h1><p className="project-subtitle">{project.subtitle}</p></div><div className="project-summary"><p>{project.description}</p>{project.sample && <p className="sample-disclaimer">示例作品 · 非本人作品，待替换。</p>}<dl>{project.year && <div><dt>年份</dt><dd>{project.year}</dd></div>}{project.role && <div><dt>我的职责</dt><dd>{project.role}</dd></div>}{project.tools?.length && <div><dt>制作工具</dt><dd>{project.tools.join(' / ')}</dd></div>}</dl></div></header>
    <MediaGallery media={project.media} />
    <nav className="project-pagination" aria-label="相邻作品">{previous ? <a href={projectPath(previous.id)}><small>← 上一件作品</small><span>{previous.title}</span></a> : <span /> }<a className="pagination-all" href={categoryPath(category.id)}>全部{category.name} ↗</a>{next ? <a className="pagination-next" href={projectPath(next.id)}><small>下一件作品 →</small><span>{next.title}</span></a> : <span />}</nav>
  </article>;
}

export function NotFound() {
  return <section className="section-shell not-found"><p className="eyebrow">404 / PAGE NOT FOUND</p><h1>这页暂时不在这里。</h1><p>链接可能有误，一起回到作品集继续看看。</p><a className="button button-dark" href="/">返回首页 <span>↗</span></a></section>;
}
