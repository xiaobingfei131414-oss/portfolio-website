import { Fragment, useEffect, useRef, useState } from 'react';
import { createScrubber } from './scrub';
import { useTypewriter } from './useTypewriter';

const VIDEO_URL = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260826_041744_63efcd78-bf7d-4039-99e2-2461e8a61903.mp4';
const EMAIL = 'yourname@example.com';
const INTRO = '让产品被看见、理解、记住。通过建模、光影与动画，把产品的细节变成令人心动的观看体验。';
const LINKS = [
  ['作品', '#projects'], ['视觉', '#archive'], ['关于', '#about'], ['简历', 'resume.txt'],
] as const;

function useReducedMotion() {
  const [reduced, setReduced] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return reduced;
}

export function Navigation() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 40);
    const desktop = window.matchMedia('(min-width: 768px)');
    const resize = () => { if (desktop.matches) setOpen(false); };
    update();
    window.addEventListener('scroll', update, { passive: true });
    desktop.addEventListener('change', resize);
    return () => { window.removeEventListener('scroll', update); desktop.removeEventListener('change', resize); };
  }, []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const outside = [document.querySelector('main'), document.querySelector('footer')].filter(Boolean) as HTMLElement[];
    const previousInert = outside.map(element => element.inert);
    outside.forEach(element => { element.inert = true; });
    menu.current?.querySelector<HTMLAnchorElement>('a')?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setOpen(false); return; }
      if (event.key !== 'Tab') return;
      const controls = [button.current, ...Array.from(menu.current?.querySelectorAll<HTMLAnchorElement>('a') || [])].filter(Boolean) as HTMLElement[];
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', keydown);
    return () => {
      document.body.style.overflow = previousOverflow;
      outside.forEach((element, index) => { element.inert = previousInert[index]; });
      document.removeEventListener('keydown', keydown);
      button.current?.focus();
    };
  }, [open]);

  return <>
    <header className={`scene-header fixed inset-x-0 top-0 z-10 flex items-center justify-between px-5 py-4 sm:px-8 sm:py-5 ${scrolled && !open ? 'is-scrolled' : ''}`}>
      <a className="scene-brand flex items-center gap-3 text-[21px] tracking-tight sm:text-[26px]" href="#home" aria-label="个人作品集，返回首页" onClick={() => setOpen(false)}>
        <span>NAME<sup>®</sup></span><span className="select-none text-[25px] sm:text-[30px]" aria-hidden="true">✳︎</span>
      </a>
      <nav className="hidden text-[23px] md:flex" aria-label="主导航">
        {LINKS.map(([label, href], index) => <Fragment key={href}>
          {index > 0 && <span aria-hidden="true">,&nbsp;</span>}
          <a href={href} download={href === 'resume.txt' || undefined} className="transition-opacity hover:opacity-60">{label}</a>
        </Fragment>)}
      </nav>
      <a href="#contact" className="scene-contact hidden text-[23px] underline underline-offset-2 transition-opacity hover:opacity-60 md:block">联系我</a>
      <button ref={button} className={`scene-menu-toggle flex flex-col gap-[5px] md:hidden ${open ? 'is-open' : ''}`} type="button" aria-label={open ? '关闭导航' : '打开导航'} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(!open)}>
        <span /><span /><span />
      </button>
    </header>
    <div ref={menu} id="mobile-navigation" className={`scene-mobile-menu fixed inset-0 z-[9] flex flex-col justify-center gap-8 px-8 md:hidden ${open ? 'is-open' : ''}`} inert={!open} aria-hidden={!open}>
      <nav className="flex flex-col gap-8 text-[32px] font-medium" aria-label="移动端导航">
        {LINKS.map(([label, href]) => <a key={href} href={href} download={href === 'resume.txt' || undefined} onClick={() => setOpen(false)}>{label}</a>)}
        <a href="#contact" className="underline underline-offset-2" onClick={() => setOpen(false)}>联系我 ↗</a>
      </nav>
    </div>
  </>;
}

export function Hero() {
  const video = useRef<HTMLVideoElement>(null);
  const scrubber = useRef<ReturnType<typeof createScrubber> | null>(null);
  const reducedMotion = useReducedMotion();
  const { displayed, done } = useTypewriter(INTRO, 38, 600, reducedMotion);
  const [actionsVisible, setActionsVisible] = useState(false);
  const [mediaState, setMediaState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [position, setPosition] = useState(0);
  const [copyStatus, setCopyStatus] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(() => setActionsVisible(true), 400);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const media = video.current;
    if (!media) return;
    const controller = createScrubber(media);
    scrubber.current = controller;
    const move = (event: MouseEvent) => {
      if (reducedMotion || document.hidden || window.scrollY >= window.innerHeight || (event.target instanceof Element && event.target.closest('a, button, input'))) {
        controller.resetPointer();
        return;
      }
      controller.move(event.clientX, window.innerWidth);
    };
    const reset = () => controller.resetPointer();
    window.addEventListener('mousemove', move, { passive: true });
    window.addEventListener('blur', reset);
    window.addEventListener('scroll', reset, { passive: true });
    document.documentElement.addEventListener('mouseleave', reset);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('blur', reset);
      window.removeEventListener('scroll', reset);
      document.documentElement.removeEventListener('mouseleave', reset);
      scrubber.current = null;
    };
  }, [reducedMotion]);

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopyStatus('已复制示例邮箱，请替换为你的真实邮箱');
    } catch {
      setCopyStatus(`复制未成功，请手动复制：${EMAIL}`);
    }
  }

  return <>
    <div className="scene-backdrop" aria-hidden="true">
      <video ref={video} className="scene-video" src={VIDEO_URL} muted playsInline controlsList="nodownload" disablePictureInPicture preload="auto" tabIndex={-1}
        onLoadedData={() => setMediaState('ready')} onError={() => setMediaState('error')}
        onSeeked={() => {
          const media = video.current;
          if (media && Number.isFinite(media.duration) && media.duration > 0) setPosition(media.currentTime / media.duration);
          scrubber.current?.seeked();
        }} />
      <div className="scene-shade" />
    </div>
    <div className="scrub-hero relative z-[1] flex flex-col justify-end overflow-hidden px-5 pb-12 sm:px-8 md:justify-center md:px-10 md:pb-0">
      <div className="scene-content relative z-10 max-w-xl">
        <h1 id="hero-title" className="scene-role">电商 3D 视觉设计师 <span> / OPEN TO WORK</span></h1>
        <p className="scene-intro pointer-events-none mb-5 select-none sm:mb-6" aria-hidden="true">你好，我是你的名字，<br />专注于产品建模、渲染与动画。</p>
        <p className="scene-typewriter mb-5 sm:mb-6">
          <span className="sr-only">{INTRO}</span>
          <span aria-hidden="true">{displayed}{!done && <span className="typing-cursor" />}</span>
        </p>
        <div className={`scene-actions flex flex-wrap gap-y-1 ${actionsVisible || reducedMotion ? 'is-visible' : ''}`}>
          <a className="scene-pill" href="#showreel">观看产品动画 ↗</a>
          <a className="scene-pill" href="#projects">浏览精选作品</a>
          <a className="scene-pill" href="resume.txt" download>下载我的简历</a>
          <a className="scene-pill" href="#about">了解我的工作方式</a>
          <button className="scene-pill scene-pill-outline" type="button" onClick={copyEmail} aria-label={`复制示例邮箱 ${EMAIL}`}>
            <span>联系：<span className="underline underline-offset-1">{EMAIL}</span></span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true"><rect x="4" y="4" width="6.5" height="6.5" rx="1" /><path d="M7.5 2.5v-1h-6v6h1" /></svg>
          </button>
        </div>
        <p className="scene-contact-note" role="status">{copyStatus || '姓名 / 邮箱 / 简历待替换为你的真实信息'}</p>
      </div>
      <div className="scene-footnote">
        <div className="scene-scrub-control">
          <label htmlFor="hero-progress">{mediaState === 'error' ? '视频暂不可用 · 仍可浏览作品' : mediaState === 'loading' ? '正在载入交互视频' : reducedMotion ? '已减少动态效果 · 可手动调整画面' : '左右移动鼠标，探索光影 ↔'}</label>
          <input id="hero-progress" type="range" min="0" max="100" step="0.1" value={position * 100} disabled={mediaState !== 'ready'} aria-label="调整背景视频画面" onChange={event => {
            const next = Number(event.target.value) / 100;
            setPosition(next);
            scrubber.current?.setProgress(next);
          }} />
        </div>
        <p>REFERENCE VIDEO · 交互演示素材，非本人作品</p>
        <a href="#showreel" className="scene-scroll-link">向下探索 ↓</a>
      </div>
    </div>
  </>;
}
