import { Children, cloneElement, isValidElement, useEffect, useMemo, useRef } from 'react';
import './ScrollReveal.css';

function splitNode(node, path = 'unit') {
  if (typeof node === 'string') {
    return Array.from(node).map((character, index) => character === '\n'
      ? <br key={path + '-' + index} />
      : <span className="scroll-reveal-unit" key={path + '-' + index}>{character === ' ' ? '\u00a0' : character}</span>);
  }
  if (isValidElement(node)) {
    return cloneElement(node, {
      ...node.props,
      key: node.key ?? path,
      children: Children.map(node.props.children, (child, index) => splitNode(child, path + '-' + index)),
    });
  }
  return node;
}

export default function ScrollReveal({
  children,
  scrollContainerRef = null,
  enableBlur = true,
  baseOpacity = 0.1,
  baseRotation = 3,
  blurStrength = 4,
  containerClassName = '',
  textClassName = '',
  rotationEnd = 'bottom bottom',
  wordAnimationEnd = 'bottom bottom',
}) {
  const containerRef = useRef(null);
  const splitContent = useMemo(() => Children.map(children, (child, index) => splitNode(child, 'content-' + index)), [children]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    let cancelled = false;
    let context;

    Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([gsapModule, triggerModule]) => {
      if (cancelled) return;
      const gsap = gsapModule.gsap;
      const ScrollTrigger = triggerModule.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);
      const scroller = scrollContainerRef?.current || window;
      const units = element.querySelectorAll('.scroll-reveal-unit');
      context = gsap.context(() => {
        gsap.fromTo(element, { transformOrigin: '0% 50%', rotate: baseRotation }, {
          ease: 'none', rotate: 0, scrollTrigger: { trigger: element, scroller, start: 'top bottom', end: rotationEnd, scrub: true },
        });
        gsap.fromTo(units, { opacity: baseOpacity, willChange: 'opacity, filter' }, {
          ease: 'none', opacity: 1, stagger: 0.025,
          scrollTrigger: { trigger: element, scroller, start: 'top bottom-=12%', end: wordAnimationEnd, scrub: true },
        });
        if (enableBlur) {
          gsap.fromTo(units, { filter: 'blur(' + blurStrength + 'px)' }, {
            ease: 'none', filter: 'blur(0px)', stagger: 0.025,
            scrollTrigger: { trigger: element, scroller, start: 'top bottom-=12%', end: wordAnimationEnd, scrub: true },
          });
        }
      }, element);
    }).catch(() => { element.classList.add('scroll-reveal-fallback'); });

    return () => { cancelled = true; context?.revert(); };
  }, [scrollContainerRef, enableBlur, baseRotation, baseOpacity, rotationEnd, wordAnimationEnd, blurStrength]);

  return <div ref={containerRef} className={('scroll-reveal ' + containerClassName).trim()}>
    <p className={('scroll-reveal-text ' + textClassName).trim()}>{splitContent}</p>
  </div>;
}
