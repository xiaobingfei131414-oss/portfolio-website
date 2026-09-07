// Adapted from the React Bits BorderGlow source supplied by the user.
// Preserve navigation semantics, allow dropdown overflow, and cancel decorative motion.
import { useEffect, useRef } from 'react';
import './BorderGlow.css';

const positions = ['80% 55%', '69% 34%', '8% 6%', '41% 38%', '86% 85%', '82% 18%', '51% 4%'];
const keys = ['one', 'two', 'three', 'four', 'five', 'six', 'seven'];
const colorMap = [0, 1, 2, 0, 1, 2, 1];
const defaultColors = ['#c084fc', '#f472b6', '#38bdf8'];

export default function BorderGlow({ children, as: Tag = 'div', className = '', edgeSensitivity = 30,
  glowColor = '270 100 80', backgroundColor = '#120F17', borderRadius = 28,
  glowRadius = 40, glowIntensity = 1, coneSpread = 25, animated = false,
  colors = defaultColors, fillOpacity = 0.5, followParent = false, ...attributes }) {
  const cardRef = useRef(null);
  const stopIntro = useRef(() => {});
  const reduced = useRef(false);
  const palette = colors.length ? colors : defaultColors;
  const [h = 40, s = 80, l = 80] = glowColor.match(/[\d.]+/g)?.map(Number) || [];
  const vars = {};
  [100, 60, 50, 40, 30, 20, 10].forEach(opacity => {
    vars[`--glow-color${opacity === 100 ? '' : `-${opacity}`}`] = `hsl(${h}deg ${s}% ${l}% / ${Math.min(opacity * glowIntensity, 100)}%)`;
  });
  positions.forEach((position, i) => { vars[`--gradient-${keys[i]}`] = `radial-gradient(at ${position}, ${palette[Math.min(colorMap[i], palette.length - 1)]} 0px, transparent 50%)`; });
  vars['--gradient-base'] = `linear-gradient(${palette[0]} 0 100%)`;

  useEffect(() => {
    const card = cardRef.current;
    const query = matchMedia('(prefers-reduced-motion: reduce)');
    reduced.current = query.matches;
    let frame = null;
    const stop = () => {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
      card.classList.remove('sweep-active');
      card.style.setProperty('--edge-proximity', '0');
    };
    stopIntro.current = stop;
    const change = () => { reduced.current = query.matches; if (query.matches) stop(); };
    query.addEventListener('change', change);
    if (animated && !reduced.current) {
      const start = performance.now();
      card.classList.add('sweep-active');
      const tick = now => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / 2600, 1);
        const proximity = Math.min(elapsed / 400, 1, (2600 - elapsed) / 800) * 100;
        card.style.setProperty('--cursor-angle', `${110 + 355 * (1 - (1 - progress) ** 3)}deg`);
        card.style.setProperty('--edge-proximity', `${Math.max(0, proximity)}`);
        if (progress < 1) frame = requestAnimationFrame(tick); else stop();
      };
      frame = requestAnimationFrame(tick);
    }
    const parent = followParent ? card.parentElement : null;
    const enterParent = () => card.classList.add('track-parent-active');
    const leaveParent = () => { card.classList.remove('track-parent-active'); stop(); };
    if (parent) {
      parent.addEventListener('pointerenter', enterParent);
      parent.addEventListener('pointermove', move);
      parent.addEventListener('pointerleave', leaveParent);
    }
    return () => {
      stop();
      query.removeEventListener('change', change);
      if (parent) {
        parent.removeEventListener('pointerenter', enterParent);
        parent.removeEventListener('pointermove', move);
        parent.removeEventListener('pointerleave', leaveParent);
      }
    };
  }, [animated, followParent]);

  const move = event => {
    if (reduced.current || event.pointerType === 'touch') return;
    stopIntro.current();
    const card = cardRef.current;
    card.classList.add('track-parent-active');
    const rect = card.getBoundingClientRect();
    const dx = event.clientX - rect.left - rect.width / 2;
    const dy = event.clientY - rect.top - rect.height / 2;
    const edge = Math.min(1, Math.max(Math.abs(dx) / (rect.width / 2 || 1), Math.abs(dy) / (rect.height / 2 || 1)));
    const angle = Math.atan2(dy, dx) * 180 / Math.PI + 90;
    card.style.setProperty('--edge-proximity', `${edge * 100}`);
    card.style.setProperty('--cursor-angle', `${angle}deg`);
  };
  return <Tag {...attributes} ref={cardRef} onPointerMove={move} className={`border-glow-card ${className}`}
    style={{ '--card-bg': backgroundColor, '--edge-sensitivity': Math.min(79, edgeSensitivity), '--border-radius': `${borderRadius}px`, '--glow-padding': `${glowRadius}px`, '--cone-spread': coneSpread, '--fill-opacity': fillOpacity, ...vars }}>
    <span className="edge-light" aria-hidden="true" />
    <div className="border-glow-inner">{children}</div>
  </Tag>;
}
