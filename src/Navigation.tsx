import { useEffect, useRef, useState } from 'react';
import { categories, profile } from './content';
import { categoryPath } from './portfolio';

function NavItems({ pathname, mobile = false, onNavigate }: { pathname: string; mobile?: boolean; onNavigate?: () => void }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const outside = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) { setExpanded(null); setHovered(null); } };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, []);
  return <nav ref={root} className={mobile ? 'mobile-nav' : 'desktop-nav'} aria-label={mobile ? '移动端导航' : '主导航'}>
    <a href="/" aria-current={pathname === '/' ? 'page' : undefined} onClick={onNavigate}>首页</a>
    {categories.map(category => {
      const open = expanded === category.id || hovered === category.id;
      const id = `${mobile ? 'mobile' : 'desktop'}-${category.id}`;
      return <div className="nav-group" key={category.id}
        onPointerEnter={event => { if (!mobile && event.pointerType === 'mouse') { setHovered(category.id); setExpanded(null); } }}
        onPointerLeave={() => { if (!mobile) setHovered(null); }}
        onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node)) { setExpanded(null); setHovered(null); } }}
        onKeyDown={event => { if (event.key === 'Escape' && open) { event.preventDefault(); event.stopPropagation(); setExpanded(null); setHovered(null); event.currentTarget.querySelector('button')?.focus(); } }}>
        <div className={`nav-label ${pathname.startsWith(categoryPath(category.id)) ? 'is-active' : ''}`}>
          <a href={categoryPath(category.id)} aria-current={pathname === categoryPath(category.id) ? 'page' : undefined} onClick={onNavigate}>{category.name}</a>
          {category.children.length > 0 && <button type="button" className="submenu-toggle" aria-label={`展开${category.name}分类`} aria-expanded={open} aria-controls={id} onClick={() => { setExpanded(expanded === category.id ? null : category.id); setHovered(null); }}><svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="m3 4.5 3 3 3-3" stroke="currentColor" strokeWidth="1.2" /></svg></button>}
        </div>
        {category.children.length > 0 && <div className={`nav-submenu ${open ? 'is-open' : ''}`} id={id} inert={!open} aria-hidden={!open}>{category.children.map(child => <a key={child.id} href={categoryPath(category.id, child.id)} aria-current={pathname === categoryPath(category.id, child.id) ? 'page' : undefined} onClick={onNavigate}>{child.name}<span aria-hidden="true">↗</span></a>)}</div>}
      </div>;
    })}
  </nav>;
}

export function Navigation({ pathname }: { pathname: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    if (!mobileOpen) return;
    dialog.current?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const desktop = window.matchMedia('(min-width: 768px)');
    const close = () => { if (desktop.matches) dialog.current?.close(); };
    desktop.addEventListener('change', close);
    return () => { document.body.style.overflow = previous; desktop.removeEventListener('change', close); };
  }, [mobileOpen]);
  return <>
    <a className="skip-link" href="#main">跳到主要内容</a>
    <header className="site-header"><a className="brand" href="/" aria-label={`${profile.name}，返回首页`}><span className="brand-dot" />{profile.name}<span className="brand-caption">DESIGNER / PORTFOLIO</span></a>
      <NavItems pathname={pathname} /><a className="header-contact" href="#contact">一起聊聊 <span>↗</span></a>
      <button className="menu-toggle" type="button" aria-label="打开导航菜单" aria-haspopup="dialog" aria-expanded={mobileOpen} aria-controls="mobile-menu" onClick={() => setMobileOpen(true)}><span /><span /></button>
    </header>
    <dialog ref={dialog} id="mobile-menu" className="mobile-menu" aria-labelledby="mobile-menu-title" onClose={() => setMobileOpen(false)} onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
      <div className="mobile-menu-top"><p id="mobile-menu-title">{profile.name}<span>PORTFOLIO / MENU</span></p><button type="button" aria-label="关闭导航菜单" onClick={() => dialog.current?.close()}>×</button></div>
      <NavItems pathname={pathname} mobile onNavigate={() => dialog.current?.close()} />
      <a className="mobile-contact" href="#contact" onClick={() => dialog.current?.close()}>一起聊聊 <span>↗</span></a>
      <p className="mobile-menu-note">VISUAL THINKING.<br />THOUGHTFUL MAKING.</p>
    </dialog>
  </>;
}
