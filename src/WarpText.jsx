// React Bits WarpText, based on the source supplied by the user.
// Keep Chinese headlines left aligned, with readable HTML when WebGL is unavailable.
import { useEffect, useRef } from 'react';
import { Renderer, Program, Mesh, Triangle, Texture } from 'ogl';
import './WarpText.css';

const vertex = `#version 300 es
in vec2 position;
in vec2 uv;
out vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}`;
const fragment = `#version 300 es
precision highp float;
uniform sampler2D uTextTexture;
uniform vec2 uResolution;
uniform vec2 uPointer;
uniform float uPointerActive;
uniform float uTime;
uniform float uWarpStrength;
uniform float uWarpScale;
uniform float uSpeed;
uniform float uPointerInfluence;
uniform float uPointerStrength;
uniform float uRefraction;
uniform float uRipple;
in vec2 vUv;
out vec4 fragColor;
float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i), b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float fbm(vec2 p) {
  float value = 0.0, amplitude = 0.5;
  for (int i = 0; i < 4; i++) {
    value += amplitude * noise(p); p *= 2.02; amplitude *= 0.5;
  }
  return value;
}
vec4 sampleText(vec2 uv) {
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) return vec4(0.0);
  return texture(uTextTexture, uv);
}
void main() {
  vec2 uv = vUv;
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float time = uTime * uSpeed, scale = max(uWarpScale, 0.001);
  vec2 drift = vec2(time * 0.055, -time * 0.045);
  float n1 = fbm(uv * scale * 3.1 + drift);
  float n2 = fbm((uv + 19.17) * scale * 3.4 - drift.yx);
  vec2 ambient = (vec2(n1, n2) - 0.5) * uWarpStrength * 0.045;
  vec2 pointerDelta = uv - uPointer;
  vec2 aspectDelta = vec2(pointerDelta.x * aspect, pointerDelta.y);
  float dist = length(aspectDelta), radius = max(uPointerInfluence, 0.001);
  float t = clamp(dist / radius, 0.0, 1.0);
  float lens = (1.0 - smoothstep(0.0, radius, dist)) * uPointerActive;
  float bulge = t * (1.0 - t) * (1.0 - t) * 6.75 * uPointerActive;
  vec2 dir = dist > 0.0001 ? vec2(aspectDelta.x / aspect, aspectDelta.y) / dist : vec2(0.0);
  float rippleWave = sin(dist * 28.0 - time * 4.2) * 0.5 + 0.5;
  float rippleRing = (rippleWave - 0.5) * uRipple;
  vec2 pointerWarp = -dir * bulge * uPointerStrength * 0.045;
  pointerWarp += dir * rippleRing * bulge * uPointerStrength * 0.016;
  vec2 displaced = uv + ambient + pointerWarp;
  vec2 splitDir = ambient + pointerWarp;
  float splitLen = length(splitDir);
  splitDir = splitLen > 0.00001 ? splitDir / splitLen : vec2(0.7071);
  vec2 split = splitDir * uRefraction * 0.16 * (0.35 + lens * 1.65);
  vec4 base = sampleText(displaced);
  vec4 red = sampleText(displaced + split), blue = sampleText(displaced - split);
  float a = max(max(red.a, base.a), blue.a);
  vec3 color = vec3(red.r, base.g, blue.b) + lens * base.a * 0.055;
  fragColor = vec4(color, a);
}`;

const fontValue = value => typeof value === 'number' ? `${value}px` : value;
const measureLine = (ctx, line, spacing) => [...line].reduce((width, char) => width + ctx.measureText(char).width, 0) + Math.max(0, [...line].length - 1) * spacing;
const buildTextCanvas = (container, width, height, dpr, props) => {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.floor(width * dpr));
  canvas.height = Math.max(1, Math.floor(height * dpr));
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const computed = window.getComputedStyle(container);
  let size = parseFloat(computed.fontSize) || 48;
  let spacing = parseFloat(computed.letterSpacing) || 0;
  let lineHeight = parseFloat(computed.lineHeight) || size * 1.27;
  const lines = String(props.text).split('\n');
  const setFont = () => { ctx.font = `${computed.fontWeight} ${size}px ${computed.fontFamily}`; };
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  setFont();
  const widest = Math.max(1, ...lines.map(line => measureLine(ctx, line, spacing)));
  const fit = Math.min(1, (width - 20) / widest, (height - 18) / (lineHeight * lines.length));
  size *= fit; spacing *= fit; lineHeight *= fit; setFont();
  ctx.fillStyle = props.color;
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  const startY = height / 2 - lineHeight * (lines.length - 1) / 2;
  lines.forEach((line, index) => {
    let x = 10;
    for (const char of line) { ctx.fillText(char, x, startY + index * lineHeight); x += ctx.measureText(char).width + spacing; }
  });
  return canvas;
};

export default function WarpText({
  text = 'Bend the moment', color = '#f8f5ff', warpStrength = 0.08,
  warpScale = 1.7, speed = 0.55, pointerInfluence = 0.42, pointerStrength = 0.38,
  refraction = 0.018, ripple = true, fontSize = 'clamp(3rem, 10vw, 9rem)',
  fontWeight = 800, fontFamily = 'inherit', letterSpacing = '-0.06em',
  lineHeight = 0.9, className = '', style = undefined
}) {
  const containerRef = useRef(null), propsRef = useRef({}), contextRef = useRef(null);
  propsRef.current = { text, color, warpStrength, warpScale, speed, pointerInfluence, pointerStrength, refraction, ripple };
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let renderer, gl, program, geometry, texture;
    let raf = 0, disposed = false, lost = false, visible = true, version = 0;
    const pointer = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, active: 0, target: 0 };
    const cleanupGpu = () => {
      if (!gl) return;
      if (texture?.texture) gl.deleteTexture(texture.texture);
      geometry?.remove(); program?.remove();
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
    try {
      renderer = new Renderer({ webgl: 2, alpha: true, premultipliedAlpha: false, antialias: true, dpr: Math.min(window.devicePixelRatio || 1, 2) });
      gl = renderer.gl;
      if (!renderer.isWebgl2) { cleanupGpu(); return; }
      gl.clearColor(0, 0, 0, 0);
      texture = new Texture(gl, { generateMipmaps: false, minFilter: gl.LINEAR, magFilter: gl.LINEAR, wrapS: gl.CLAMP_TO_EDGE, wrapT: gl.CLAMP_TO_EDGE });
      geometry = new Triangle(gl);
      program = new Program(gl, { vertex, fragment, transparent: true, depthTest: false, depthWrite: false, uniforms: {
        uTextTexture: { value: texture }, uResolution: { value: [1, 1] },
        uPointer: { value: [0.5, 0.5] }, uPointerActive: { value: 0 }, uTime: { value: 0 },
        uWarpStrength: { value: warpStrength }, uWarpScale: { value: warpScale }, uSpeed: { value: speed },
        uPointerInfluence: { value: pointerInfluence }, uPointerStrength: { value: pointerStrength },
        uRefraction: { value: refraction }, uRipple: { value: ripple ? 1 : 0 }
      } });
      if (!gl.getProgramParameter(program.program, gl.LINK_STATUS)) { cleanupGpu(); return; }
    } catch { cleanupGpu(); return; }
    const canvas = gl.canvas;
    canvas.className = 'warp-text__canvas'; canvas.setAttribute('aria-hidden', 'true');
    container.appendChild(canvas);
    const mesh = new Mesh(gl, { geometry, program });
    const canRun = () => !disposed && !lost && visible && !document.hidden && !motion.matches;
    const stop = () => { cancelAnimationFrame(raf); raf = 0; };
    const render = now => {
      raf = 0;
      if (!canRun()) return;
      const elapsed = now * 0.001;
      pointer.x += ((pointer.target ? pointer.tx : 0.5 + Math.sin(elapsed * 0.33) * 0.12) - pointer.x) * 0.12;
      pointer.y += ((pointer.target ? pointer.ty : 0.5 + Math.cos(elapsed * 0.27) * 0.1) - pointer.y) * 0.12;
      pointer.active += ((pointer.target ? 1 : 0.18) - pointer.active) * 0.06;
      program.uniforms.uPointer.value = [pointer.x, pointer.y];
      program.uniforms.uPointerActive.value = pointer.active;
      program.uniforms.uTime.value = elapsed;
      if (texture.image) renderer.render({ scene: mesh });
      raf = requestAnimationFrame(render);
    };
    const wake = () => { if (!raf && canRun()) raf = requestAnimationFrame(render); };
    const rasterize = async () => {
      const current = ++version;
      if (document.fonts) {
        const css = window.getComputedStyle(container);
        try { await document.fonts.load(`${css.fontWeight} ${css.fontSize} ${css.fontFamily}`, propsRef.current.text); await document.fonts.ready; } catch { /* Use the system font fallback. */ }
      }
      if (disposed || lost || current !== version) return;
      const rect = container.getBoundingClientRect();
      if (rect.width <= 20 || rect.height <= 18) return;
      const p = propsRef.current;
      const raster = buildTextCanvas(container, rect.width, rect.height, Math.min(window.devicePixelRatio || 1, 2), p);
      if (!raster) return;
      renderer.dpr = Math.min(window.devicePixelRatio || 1, 2);
      renderer.setSize(rect.width, rect.height);
      program.uniforms.uResolution.value = [rect.width, rect.height];
      for (const key of ['warpStrength', 'warpScale', 'speed', 'pointerInfluence', 'pointerStrength', 'refraction']) {
        program.uniforms[`u${key[0].toUpperCase()}${key.slice(1)}`].value = p[key];
      }
      program.uniforms.uRipple.value = p.ripple ? 1 : 0;
      texture.image = raster; texture.needsUpdate = true;
      if (canRun()) renderer.render({ scene: mesh });
      container.classList.add('is-ready'); wake();
    };
    const refresh = () => { rasterize().catch(() => { container.classList.remove('is-ready'); stop(); }); };
    contextRef.current = { refresh };
    const onPointerMove = event => {
      if (event.pointerType === 'touch' || motion.matches) return;
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      pointer.tx = (event.clientX - rect.left) / rect.width;
      pointer.ty = 1 - (event.clientY - rect.top) / rect.height; pointer.target = 1;
    };
    const onLeave = () => { pointer.target = 0; };
    const onLost = event => { event.preventDefault(); lost = true; container.classList.remove('is-ready'); stop(); };
    const onState = () => { if (canRun()) wake(); else stop(); };
    const resize = new ResizeObserver(refresh);
    const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; onState(); });
    resize.observe(container); intersection.observe(container);
    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerleave', onLeave);
    canvas.addEventListener('webglcontextlost', onLost);
    document.addEventListener('visibilitychange', onState); motion.addEventListener('change', onState);
    refresh();
    return () => {
      disposed = true; version++; stop(); contextRef.current = null;
      resize.disconnect(); intersection.disconnect(); container.classList.remove('is-ready');
      container.removeEventListener('pointermove', onPointerMove); container.removeEventListener('pointerleave', onLeave);
      canvas.removeEventListener('webglcontextlost', onLost);
      document.removeEventListener('visibilitychange', onState); motion.removeEventListener('change', onState);
      if (!lost) cleanupGpu();
      canvas.remove();
    };
  }, []);
  useEffect(() => { contextRef.current?.refresh(); }, [text, color, fontSize, fontWeight, fontFamily, letterSpacing, lineHeight, warpStrength, warpScale, speed, pointerInfluence, pointerStrength, refraction, ripple]);
  return <span ref={containerRef} className={`warp-text ${className}`.trim()} style={{ fontSize: fontValue(fontSize), fontWeight, fontFamily, color, letterSpacing: fontValue(letterSpacing), lineHeight, ...style }}>
    <span className="warp-text__fallback" aria-hidden="true">{text}</span>
    <span className="warp-text__sr">{text}</span>
  </span>;
}
