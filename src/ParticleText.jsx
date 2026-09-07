// Based on the React Bits ParticleText source supplied by the user.
// Adaptations: multiline Chinese text, HTML fallback, touch scrolling, and paused offscreen animation.
import { useEffect, useRef } from 'react';
import './ParticleText.css';

const hexToRgb = hex => {
  const clean = hex.replace('#', '').trim();
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return null;
  return { r: parseInt(clean.slice(0, 2), 16), g: parseInt(clean.slice(2, 4), 16), b: parseInt(clean.slice(4, 6), 16) };
};
const mixRgb = (a, b, t) => ({ r: Math.round(a.r + (b.r - a.r) * t), g: Math.round(a.g + (b.g - a.g) * t), b: Math.round(a.b + (b.b - a.b) * t) });
const rgbToCss = rgb => `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
const resolveFontSize = (value, container, weight, family) => {
  if (typeof value === 'number') return value;
  const probe = document.createElement('span');
  Object.assign(probe.style, { position: 'absolute', visibility: 'hidden', pointerEvents: 'none', fontSize: value, fontWeight: String(weight), fontFamily: family });
  probe.textContent = 'M';
  container.appendChild(probe);
  const size = parseFloat(window.getComputedStyle(probe).fontSize) || 96;
  probe.remove();
  return size;
};
const waitForFonts = async font => {
  if (!('fonts' in document)) return;
  try { await document.fonts.load(font); } catch { /* The inherited fallback font remains usable. */ }
  await document.fonts.ready;
};

const ParticleText = ({
  text = 'React Bits', particleSize = 1.45, density = 2, color = '#ffffff',
  highlightColor = '#8b5cf6', scatter = 180, gatherDuration = 1600, stagger = 420,
  pointerRepel = 40, repelRadius = 120, idleDrift = 0.7, trigger = 'mount',
  fontSize = 'clamp(3rem, 12vw, 8rem)', fontWeight = 800, fontFamily = 'inherit',
  glow = true, rainbow = false, letterSpacing = 0, lineHeight = 1.27, className = '', style = undefined,
}) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!container || !canvas || !ctx) return;
    let particles = [], animationFrame = null, resizeFrame = null;
    let buildId = 0, gathering = false, gatherStart = 0, width = 0, height = 0;
    let inView = true, disposed = false;
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reducedMotion = motionQuery.matches;
    const pointer = { active: false, x: 0, y: 0, smoothX: 0, smoothY: 0 };

    const startGather = (fromScatter = true) => {
      if (!particles.length || reducedMotion) return;
      particles.forEach(particle => {
        if (fromScatter) {
          const angle = particle.seed * Math.PI * 2;
          const distance = scatter * (0.35 + particle.depth * 0.75);
          particle.x = particle.targetX + Math.cos(angle) * distance + (particle.depth - 0.5) * scatter * 0.55;
          particle.y = particle.targetY + Math.sin(angle) * distance + (particle.seed - 0.5) * scatter * 0.55;
        }
        particle.startX = particle.x;
        particle.startY = particle.y;
        particle.delay = particle.seed * stagger;
      });
      gatherStart = performance.now();
      gathering = true;
    };

    const render = now => {
      animationFrame = null;
      if (disposed || !inView || document.hidden || reducedMotion) return;
      ctx.clearRect(0, 0, width, height);
      ctx.shadowBlur = glow ? particleSize * 3 : 0;
      pointer.smoothX += (pointer.x - pointer.smoothX) * 0.18;
      pointer.smoothY += (pointer.y - pointer.smoothY) * 0.18;
      let complete = true;
      particles.forEach(particle => {
        let baseX = particle.targetX, baseY = particle.targetY, progress = 1;
        if (gathering) {
          progress = clamp((now - gatherStart - particle.delay) / Math.max(1, gatherDuration), 0, 1);
          const eased = easeOutCubic(progress);
          baseX = particle.startX + (particle.targetX - particle.startX) * eased;
          baseY = particle.startY + (particle.targetY - particle.startY) * eased;
          if (progress < 1) complete = false;
        } else if (idleDrift > 0) {
          baseX += Math.sin(now * 0.0009 + particle.seed * 10) * idleDrift * particle.depth;
          baseY += Math.cos(now * 0.00075 + particle.depth * 10) * idleDrift * particle.depth;
        }
        if (pointer.active && pointerRepel > 0 && repelRadius > 0) {
          const dx = baseX - pointer.smoothX, dy = baseY - pointer.smoothY;
          const distance = Math.hypot(dx, dy);
          if (distance > 0 && distance < repelRadius) {
            const force = Math.pow(1 - distance / repelRadius, 2) * pointerRepel;
            baseX += dx / distance * force;
            baseY += dy / distance * force;
          }
        }
        particle.x += (baseX - particle.x) * 0.22;
        particle.y += (baseY - particle.y) * 0.22;
        ctx.globalAlpha = clamp(0.35 + progress * 0.65, 0, 1);
        ctx.fillStyle = particle.color;
        if (glow) ctx.shadowColor = particle.color;
        if (particle.size <= 2.1) ctx.fillRect(particle.x - particle.size / 2, particle.y - particle.size / 2, particle.size, particle.size);
        else { ctx.beginPath(); ctx.arc(particle.x, particle.y, particle.size / 2, 0, Math.PI * 2); ctx.fill(); }
      });
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      if (gathering && complete) gathering = false;
      animationFrame = window.requestAnimationFrame(render);
    };
    const ensureRenderLoop = () => {
      if (!disposed && inView && !document.hidden && !reducedMotion && particles.length && animationFrame === null) animationFrame = window.requestAnimationFrame(render);
    };
    const stop = () => { if (animationFrame !== null) window.cancelAnimationFrame(animationFrame); animationFrame = null; };

    const sampleText = async () => {
      const currentBuild = ++buildId;
      container.classList.remove('is-ready');
      if (reducedMotion || disposed) { stop(); return; }
      const rect = container.getBoundingClientRect();
      width = Math.floor(rect.width); height = Math.floor(rect.height);
      if (width <= 0 || height <= 0) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr); canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const family = fontFamily === 'inherit' ? window.getComputedStyle(container).fontFamily : fontFamily;
      let size = resolveFontSize(fontSize, container, fontWeight, family);
      let font = `${fontWeight} ${size}px ${family}`;
      await waitForFonts(font);
      if (disposed || currentBuild !== buildId) return;
      const offscreen = document.createElement('canvas');
      const offCtx = offscreen.getContext('2d', { willReadFrequently: true });
      if (!offCtx) return;
      const lines = String(text || ' ').split('\n');
      offCtx.font = font;
      const measuredWidth = Math.max(1, ...lines.map(line => [...line].reduce((sum, char) => sum + offCtx.measureText(char).width, 0) + Math.max(0, [...line].length - 1) * size * letterSpacing));
      size *= Math.min(1, (width - 16) / measuredWidth, (height - 18) / (lines.length * size * lineHeight));
      font = `${fontWeight} ${size}px ${family}`;
      await waitForFonts(font);
      if (disposed || currentBuild !== buildId) return;
      offscreen.width = width; offscreen.height = height;
      offCtx.font = font; offCtx.textAlign = 'left'; offCtx.textBaseline = 'alphabetic'; offCtx.fillStyle = '#fff';
      const linePixels = size * lineHeight;
      const top = (height - lines.length * linePixels) / 2;
      lines.forEach((line, index) => {
        let x = 5;
        for (const char of line) {
          offCtx.fillText(char, x, top + index * linePixels + size);
          x += offCtx.measureText(char).width + size * letterSpacing;
        }
      });
      const data = offCtx.getImageData(0, 0, width, height).data;
      const targets = [], step = Math.max(2, Math.floor(density));
      for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
          const alpha = data[(y * width + x) * 4 + 3];
          if (alpha > 40) targets.push({ x, y, alpha: alpha / 255 });
        }
      }
      // Chinese strokes need a denser field than short Latin words.
      const maxParticles = Math.max(3000, Math.min(12000, Math.floor(width * height / 12)));
      const stride = Math.max(1, Math.ceil(targets.length / maxParticles));
      const baseRgb = hexToRgb(color), highlightRgb = hexToRgb(highlightColor);
      particles = targets.filter((_, index) => index % stride === 0).map((target, index) => {
        const seed = ((index * 9301 + 49297) % 233280) / 233280;
        const depth = 0.45 + ((index * 233 + 97) % 1000) / 1000 * 0.9;
        const blend = clamp(target.x / Math.max(1, width), 0, 1);
        const distance = scatter * (0.35 + depth * 0.75);
        const startX = target.x + Math.cos(seed * Math.PI * 2) * distance;
        const startY = target.y + Math.sin(seed * Math.PI * 2) * distance;
        const hue = (190 + target.x / Math.max(1, width) * 230 + target.y / Math.max(1, height) * 65 + seed * 22) % 360;
        return { x: startX, y: startY, startX, startY, targetX: target.x, targetY: target.y, size: Math.max(0.6, particleSize * (0.75 + target.alpha * 0.45)), color: rainbow ? `hsl(${hue} 100% 73%)` : baseRgb && highlightRgb ? rgbToCss(mixRgb(baseRgb, highlightRgb, blend)) : color, seed, depth, delay: seed * stagger };
      });
      pointer.x = pointer.smoothX = width / 2;
      pointer.y = pointer.smoothY = height / 2;
      container.classList.add('is-ready');
      startGather(false);
      ensureRenderLoop();
    };
    const queueSample = () => {
      if (resizeFrame !== null) window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(() => { resizeFrame = null; sampleText().catch(() => container.classList.remove('is-ready')); });
    };
    const handlePointerMove = event => {
      if (event.pointerType === 'touch') return;
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left; pointer.y = event.clientY - rect.top; pointer.active = true;
    };
    const handlePointerLeave = () => { pointer.active = false; };
    const handlePointerEnter = event => { handlePointerMove(event); if (trigger === 'hover' && event.pointerType !== 'touch') startGather(true); };
    const handleClick = () => { if (trigger === 'click') startGather(true); };
    const changeMotion = event => { reducedMotion = event.matches; queueSample(); };
    const visibility = () => { if (document.hidden) stop(); else ensureRenderLoop(); };
    motionQuery.addEventListener('change', changeMotion);
    document.addEventListener('visibilitychange', visibility);
    canvas.addEventListener('pointerenter', handlePointerEnter);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerleave', handlePointerLeave);
    canvas.addEventListener('click', handleClick);
    const resizeObserver = new ResizeObserver(queueSample);
    resizeObserver.observe(container);
    const intersection = new IntersectionObserver(entries => { inView = entries[0].isIntersecting; if (inView) ensureRenderLoop(); else stop(); });
    intersection.observe(container);
    queueSample();
    return () => {
      disposed = true; buildId += 1; stop();
      if (resizeFrame !== null) window.cancelAnimationFrame(resizeFrame);
      resizeObserver.disconnect(); intersection.disconnect();
      motionQuery.removeEventListener('change', changeMotion);
      document.removeEventListener('visibilitychange', visibility);
      canvas.removeEventListener('pointerenter', handlePointerEnter);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerleave', handlePointerLeave);
      canvas.removeEventListener('click', handleClick);
    };
  }, [text, particleSize, density, color, highlightColor, scatter, gatherDuration, stagger, pointerRepel, repelRadius, idleDrift, trigger, fontSize, fontWeight, fontFamily, glow, rainbow, letterSpacing, lineHeight]);

  const hasGradient = !rainbow && color !== highlightColor;
  return <span ref={containerRef} className={`particle-text ${rainbow ? 'particle-text--rainbow' : ''} ${hasGradient ? 'particle-text--gradient' : ''} ${className}`} style={{ '--particle-color-start': color, '--particle-color-end': highlightColor, fontSize, fontWeight, fontFamily, color, letterSpacing: `${letterSpacing}em`, lineHeight, ...style }}>
    <canvas ref={canvasRef} className="particle-text__canvas" aria-hidden="true" />
    <span className="particle-text__fallback" aria-hidden="true">{text}</span>
    <span className="particle-text__sr">{text}</span>
  </span>;
};
export default ParticleText;
