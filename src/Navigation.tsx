import { useEffect, useRef, useState } from 'react';
import { categories, profile } from './content';
import { categoryPath } from './portfolio';
import BorderGlow from './BorderGlow';

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
    <BorderGlow className="nav-home" borderRadius={8} glowRadius={16} backgroundColor="#ffffff06"><a href="/" aria-current={pathname === '/' ? 'page' : undefined} onClick={onNavigate}>首页</a></BorderGlow>
    {categories.map(category => {
      const open = expanded === category.id || hovered === category.id;
      const id = `${mobile ? 'mobile' : 'desktop'}-${category.id}`;
      return <BorderGlow className="nav-group" key={category.id} borderRadius={8} glowRadius={16} glowIntensity={1.2} backgroundColor="#ffffff06"
        onPointerEnter={(event: React.PointerEvent<HTMLDivElement>) => { if (!mobile && event.pointerType === 'mouse') { setHovered(category.id); setExpanded(null); } }}
        onPointerLeave={() => { if (!mobile) setHovered(null); }}
        onBlur={(event: React.FocusEvent<HTMLDivElement>) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) { setExpanded(null); setHovered(null); } }}
        onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => { if (event.key === 'Escape' && open) { event.preventDefault(); event.stopPropagation(); setExpanded(null); setHovered(null); event.currentTarget.querySelector('button')?.focus(); } }}>
        <div className={`nav-label ${pathname.startsWith(categoryPath(category.id)) ? 'is-active' : ''}`}>
          <a href={categoryPath(category.id)} aria-current={pathname === categoryPath(category.id) ? 'page' : undefined} onClick={onNavigate}>{category.name}</a>
          {category.children.length > 0 && <button type="button" className="submenu-toggle" aria-label={`展开${category.name}分类`} aria-expanded={open} aria-controls={id} onClick={() => { setExpanded(expanded === category.id ? null : category.id); setHovered(null); }}><svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="m3 4.5 3 3 3-3" stroke="currentColor" strokeWidth="1.2" /></svg></button>}
        </div>
        {category.children.length > 0 && <div className={`nav-submenu ${open ? 'is-open' : ''}`} id={id} inert={!open} aria-hidden={!open}>{category.children.map(child => <a key={child.id} href={categoryPath(category.id, child.id)} aria-current={pathname === categoryPath(category.id, child.id) ? 'page' : undefined} onClick={onNavigate}>{child.name}</a>)}</div>}
      </BorderGlow>;
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
    <BorderGlow as="header" className="site-header" borderRadius={14} glowRadius={24} backgroundColor="#0b0e17e6" glowIntensity={1.4} fillOpacity={0.15} animated><a className="brand" href="/" aria-label={`${profile.name}，返回首页`}><span className="brand-dot" />{profile.name}<span className="brand-caption"><span>设计师</span><span>作品集</span></span></a>
      <NavItems pathname={pathname} /><a className="header-contact interface-button" href="#contact">联系我</a>
      <button className="menu-toggle interface-button" type="button" aria-label="打开导航菜单" aria-haspopup="dialog" aria-expanded={mobileOpen} aria-controls="mobile-menu" onClick={() => setMobileOpen(true)}><span /><span /></button>
    </BorderGlow>
    <dialog ref={dialog} id="mobile-menu" className="mobile-menu" aria-labelledby="mobile-menu-title" onClose={() => setMobileOpen(false)} onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
      <div className="mobile-menu-top"><p id="mobile-menu-title">{profile.name}<span>作品集导航</span></p><button className="interface-button" type="button" aria-label="关闭导航菜单" onClick={() => dialog.current?.close()}>×</button></div>
      <NavItems pathname={pathname} mobile onNavigate={() => dialog.current?.close()} />
      <a className="mobile-contact interface-button" href="#contact" onClick={() => dialog.current?.close()}>联系我</a>
      <p className="mobile-menu-note">以视觉呈现想法，<br />以作品回应需求。</p>
    </dialog>
  </>;
}


