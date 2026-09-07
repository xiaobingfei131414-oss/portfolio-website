// React Bits GlowCursor shader supplied by the user, adapted to one viewport overlay.
import { useEffect, useRef } from 'react';
import { Mesh, Program, Renderer, Triangle } from 'ogl';
import './GlowCursor.css';

const MAX_POINTS = 64;
const vertex = `attribute vec2 position; attribute vec2 uv; varying vec2 vUv;
void main(){vUv=uv;gl_Position=vec4(position,0.0,1.0);}`;
const fragment = `
precision highp float;
#define MAX_POINTS 64
uniform vec2 uResolution;
uniform vec2 uPoints[MAX_POINTS];
uniform float uPointCount;
uniform vec3 uColor;
uniform vec3 uSecondaryColor;
uniform float uTrailWidth,uTaper,uGlowIntensity,uGlowSpread,uHotspot,uBrightness,uOpacity,uPulseSpeed,uNoiseStrength,uNormalBlend,uTime,uFade;
varying vec2 vUv;
float sRGB(float x){if(x<=0.00031308)return 12.92*x;return 1.055*pow(x,1.0/2.4)-0.055;}
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}
float filmGrain(vec2 p,float time){
  float frame=time*18.0;float index=mod(floor(frame),256.0);float nextIndex=mod(index+1.0,256.0);
  float blend=fract(frame);blend=blend*blend*(3.0-2.0*blend);vec2 pixel=floor(p);
  return mix(hash(pixel+vec2(index*17.0,index*31.0)),hash(pixel+vec2(nextIndex*17.0,nextIndex*31.0)),blend)*2.0-1.0;
}
void main(){
  vec2 pixel=vUv*uResolution;float denominator=max(uPointCount-1.0,1.0);
  float strongest=0.0;float strongestCore=0.0;float colorWeight=0.0;vec3 colorSum=vec3(0.0);
  for(int i=0;i<MAX_POINTS-1;i++){
    float index=float(i);if(index>=uPointCount-1.0)break;
    vec2 start=uPoints[i];vec2 end=uPoints[i+1];vec2 toPixel=pixel-start;vec2 segment=end-start;
    float along=clamp(dot(toPixel,segment)/max(dot(segment,segment),0.0001),0.0,1.0);
    float progress=clamp((index+along)/denominator,0.0,1.0);
    float life=pow(max(1.0-progress,0.0),mix(0.55,1.25,uTaper));
    float width=uTrailWidth*mix(1.0,0.25,pow(progress,mix(0.55,1.6,uTaper)));
    float distanceToTrail=length(toPixel-segment*along);float falloff=max(width*(0.8+uGlowSpread*1.4),0.5);
    float beam=min(1.0,(falloff*falloff)/(distanceToTrail*distanceToTrail+falloff*falloff));
    float core=exp(-pow(distanceToTrail/max(width,0.5),2.0)*2.5);
    float pulse=1.0+sin(uTime*uPulseSpeed*3.0-progress*11.0)*0.16*min(abs(uPulseSpeed),1.0);
    float intensity=(core+beam*uGlowIntensity*0.55)*life*pulse;
    strongest=max(strongest,intensity);strongestCore=max(strongestCore,core*life);
    colorSum+=mix(uColor,uSecondaryColor,progress)*intensity;colorWeight+=intensity;
  }
  float noiseAmount=(1.0-exp(-uNoiseStrength*2.2))*0.4;
  float alpha=clamp(strongest*uOpacity*uFade,0.0,1.0);if(alpha<0.0005)discard;
  vec3 color=colorSum/max(colorWeight,0.0001);
  color=mix(color,vec3(1.0),smoothstep(0.25,0.95,strongestCore)*uHotspot);
  float luminance=sRGB(clamp(strongest*uBrightness,0.0,1.0));luminance*=1.0+filmGrain(pixel,uTime)*noiseAmount;
  float normalAlpha=clamp(strongest*uBrightness*uOpacity*uFade,0.0,1.0);
  vec3 normalColor=mix(color,vec3(1.0),smoothstep(0.45,1.0,strongestCore)*uHotspot*0.35);
  gl_FragColor=vec4(mix(color*luminance,normalColor,uNormalBlend),mix(alpha,normalAlpha,uNormalBlend));
}`;
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const rgb = hex => {
  let value = hex.replace('#', '');
  if (value.length === 3) value = [...value].map(char => char + char).join('');
  const n = parseInt(value, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

export default function GlowCursor({ color = '#4dd5ff', secondaryColor = '#a855ff', trailLength = 25,
  trailWidth = 8, trailTaper = 0.8, followSpeed = 0.3, glowIntensity = 2, glowSpread = 1.45,
  hotspot = 0.5, brightness = 1.1, opacity = 0.8, pulseSpeed = 1.5, noiseStrength = 0.035,
  idleFade = true, idleTimeout = 700, fadeDuration = 700, blendMode = 'screen',
  maxDevicePixelRatio = 1, enabled = true }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = matchMedia('(any-pointer: fine)');
    let dispose = () => {};
    const setup = () => {
      dispose(); dispose = () => {};
      if (!enabled || motion.matches || !finePointer.matches) return;
      let renderer, program, geometry;
      try {
        renderer = new Renderer({ canvas, alpha: true, dpr: Math.min(devicePixelRatio || 1, maxDevicePixelRatio) });
        const gl = renderer.gl;
        if (!gl) return;
        gl.clearColor(0, 0, 0, 0);
        const pointData = new Float32Array(MAX_POINTS * 2);
        const count = clamp(Math.round(trailLength), 2, MAX_POINTS);
        const uniform = value => ({ value });
        program = new Program(gl, { vertex, fragment, transparent: true, depthTest: false, depthWrite: false,
          uniforms: {
            uResolution: uniform([1, 1]), 'uPoints[0]': uniform(pointData), uPointCount: uniform(count),
            uColor: uniform(rgb(color)), uSecondaryColor: uniform(rgb(secondaryColor)),
            uTrailWidth: uniform(Math.max(trailWidth, 0.1)), uTaper: uniform(clamp(trailTaper, 0, 1)),
            uGlowIntensity: uniform(glowIntensity), uGlowSpread: uniform(glowSpread),
            uHotspot: uniform(clamp(hotspot, 0, 1)), uBrightness: uniform(brightness), uOpacity: uniform(opacity),
            uPulseSpeed: uniform(pulseSpeed), uNoiseStrength: uniform(noiseStrength),
            uNormalBlend: uniform(blendMode === 'normal' ? 1 : 0), uTime: uniform(0), uFade: uniform(0),
          },
        });
        if (!gl.getProgramParameter(program.program, gl.LINK_STATUS)) { program.remove(); return; }
        geometry = new Triangle(gl);
        const mesh = new Mesh(gl, { geometry, program });
        let width = 1, height = 1, initialized = false, inside = false, fade = 0;
        let lastInput = 0, lastFrame = performance.now(), raf = 0, destroyed = false, lost = false;
        const target = { x: 0, y: 0 };
        const clear = () => { gl.clear(gl.COLOR_BUFFER_BIT); canvas.style.opacity = '0'; };
        const stop = () => { cancelAnimationFrame(raf); raf = 0; };
        const wake = () => { if (!raf && !destroyed && !lost && !document.hidden) { lastFrame = performance.now(); raf = requestAnimationFrame(render); } };
        const render = now => {
          raf = 0;
          if (destroyed || lost || document.hidden) return;
          const delta = clamp((now - lastFrame) / 16.667, 0, 3); lastFrame = now;
          const headEase = 1 - (1 - clamp(followSpeed, 0.01, 0.99)) ** delta;
          const chainEase = 1 - (1 - clamp(0.28 + followSpeed * 0.35, 0.08, 0.92)) ** delta;
          pointData[0] += (target.x - pointData[0]) * headEase;
          pointData[1] += (target.y - pointData[1]) * headEase;
          for (let i = 1; i < count; i++) {
            pointData[i * 2] += (pointData[(i - 1) * 2] - pointData[i * 2]) * chainEase;
            pointData[i * 2 + 1] += (pointData[(i - 1) * 2 + 1] - pointData[i * 2 + 1]) * chainEase;
          }
          const fading = idleFade && (!inside || now - lastInput > idleTimeout);
          fade += ((initialized && !fading ? 1 : 0) - fade) * Math.min(1, 16.667 * delta / Math.max(16, fadeDuration) * 7);
          if (fading && fade < 0.002) { initialized = false; clear(); return; }
          program.uniforms.uTime.value = now * 0.001; program.uniforms.uFade.value = fade;
          canvas.style.opacity = '1'; renderer.render({ scene: mesh });
          raf = requestAnimationFrame(render);
        };
        const resize = () => {
          width = innerWidth; height = innerHeight; renderer.setSize(width, height);
          program.uniforms.uResolution.value = [width, height]; initialized = false; fade = 0; stop(); clear();
        };
        const move = event => {
          if (event.pointerType === 'touch') return;
          target.x = clamp(event.clientX, 0, width); target.y = clamp(height - event.clientY, 0, height);
          if (!initialized) {
            for (let i = 0; i < MAX_POINTS; i++) { pointData[i * 2] = target.x; pointData[i * 2 + 1] = target.y; }
            initialized = true; fade = 1;
          }
          inside = true; lastInput = performance.now(); wake();
        };
        const leave = () => { inside = false; lastInput = performance.now(); if (initialized) wake(); };
        const visibility = () => { if (document.hidden) { stop(); initialized = false; fade = 0; clear(); } };
        const contextLost = () => { lost = true; stop(); canvas.style.opacity = '0'; };
        document.addEventListener('pointermove', move, { passive: true });
        document.documentElement.addEventListener('pointerleave', leave);
        document.addEventListener('visibilitychange', visibility);
        window.addEventListener('blur', leave); window.addEventListener('resize', resize);
        canvas.addEventListener('webglcontextlost', contextLost);
        resize();
        dispose = () => {
          destroyed = true; stop();
          document.removeEventListener('pointermove', move);
          document.documentElement.removeEventListener('pointerleave', leave);
          document.removeEventListener('visibilitychange', visibility);
          window.removeEventListener('blur', leave); window.removeEventListener('resize', resize);
          canvas.removeEventListener('webglcontextlost', contextLost);
          canvas.style.opacity = '0'; geometry.remove(); program.remove();
          if (!lost) gl.clear(gl.COLOR_BUFFER_BIT);
        };
      } catch { geometry?.remove(); program?.remove(); canvas.style.opacity = '0'; }
    };
    setup(); motion.addEventListener('change', setup); finePointer.addEventListener('change', setup);
    return () => { dispose(); motion.removeEventListener('change', setup); finePointer.removeEventListener('change', setup); };
  }, [color, secondaryColor, trailLength, trailWidth, trailTaper, followSpeed, glowIntensity, glowSpread, hotspot, brightness, opacity, pulseSpeed, noiseStrength, idleFade, idleTimeout, fadeDuration, blendMode, maxDevicePixelRatio, enabled]);
  return <canvas ref={canvasRef} className="glow-cursor__canvas" style={{ mixBlendMode: blendMode }} aria-hidden="true" />;
}
