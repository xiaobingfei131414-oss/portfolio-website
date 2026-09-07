function filterProjects(category, projects) {
  return category === 'all'
    ? projects
    : projects.filter((project) => project.category === category);
}

function getProject(id, projects) {
  return projects.find((project) => project.id === id) || null;
}

function nextProject(id, projects) {
  const index = projects.findIndex((project) => project.id === id);
  return projects[(index + 1) % projects.length] || null;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function pointerOffset(pointer, center, limit) {
  return clamp(pointer - center, -limit, limit);
}

function progress(value, max) {
  return max > 0 ? clamp(value / max, 0, 1) : 0;
}

const caseStudies = [
  {
    id: 'pulse',
    category: 'animation',
    title: 'PULSE / 概念耳机动画',
    type: '产品动画 · 个人练习 · 2026',
    role: '概念、建模、材质、灯光、动画、合成',
    summary: '以“脉冲”为视觉线索，通过环形运动、微距材质和节奏剪辑建立科技产品的能量感。',
    challenge: '难点：在简洁造型中保持镜头变化。解决：用灯光节奏和局部特写替代复杂场景。',
    image: 'assets/project-pulse.png',
  },
  {
    id: 'aero',
    category: 'animation',
    title: 'AERO / 香氛产品影片',
    type: '产品动画 · 个人练习 · 2026',
    role: '视觉概念、产品建模、流体氛围、动画、后期',
    summary: '用透明材质、漂浮运动与柔和渐变表达轻盈、洁净的香氛体验。',
    challenge: '难点：透明材质容易失去轮廓。解决：使用分层轮廓光控制产品边缘。',
    image: 'assets/project-aero.png',
  },
  {
    id: 'halo',
    category: 'render',
    title: 'HALO / 护肤品静帧',
    type: '静帧渲染 · 个人练习 · 2025',
    role: '场景构思、材质、灯光、渲染、后期',
    summary: '以乳白半透明材质和柔和阴影，建立克制、洁净的高端护肤视觉。',
    challenge: '难点：白色产品层次不足。解决：通过色温差与明暗面塑造体积。',
    image: 'assets/project-halo.png',
  },
  {
    id: 'form',
    category: 'modeling',
    title: 'FORM / 智能手表建模',
    type: '产品建模 · 个人练习 · 2025',
    role: '结构分析、高模建模、拓扑整理、材质测试',
    summary: '围绕曲面衔接、旋钮细节和装配关系，完成可用于广告镜头的产品模型。',
    challenge: '难点：连续曲面的高光容易断裂。解决：统一曲率并用检测材质反复校正。',
    image: 'assets/project-form.png',
  },
];

function initSite() {
  const cards = [...document.querySelectorAll('[data-project]')];
  const filters = [...document.querySelectorAll('[data-filter]')];
  const dialog = document.querySelector('#case-dialog');
  const menuButton = document.querySelector('[data-menu-button]');
  const nav = document.querySelector('[data-nav]');
  const soundButton = document.querySelector('[data-sound-toggle]');
  const reel = document.querySelector('#showreel-video');
  const reelFrame = document.querySelector('.reel-frame');
  const playButton = document.querySelector('.reel-play');
  const header = document.querySelector('.site-header');
  const cursor = document.querySelector('.cursor');
  const transition = document.querySelector('.page-transition');
  const archiveTrack = document.querySelector('.archive-track');
  const motionTrack = document.querySelector('.motion-track');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(pointer: fine)').matches;
  const interactivePointer = finePointer && innerWidth > 760;

  document.documentElement.classList.add('motion-ready');

  const revealTargets = [...document.querySelectorAll('[data-reveal]')];
  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealTargets.forEach((element) => element.classList.add('is-revealed'));
  } else {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: .12, rootMargin: '0px 0px -5% 0px' });
    revealTargets.forEach((element) => revealObserver.observe(element));
  }

  let scrollFrame = 0;
  function updateScrollEffects() {
    scrollFrame = 0;
    const maxScroll = document.documentElement.scrollHeight - innerHeight;
    const amount = progress(scrollY, maxScroll);
    document.documentElement.style.setProperty('--scroll-progress', amount);
    motionTrack?.style.setProperty('--track-shift', amount);
    header?.classList.toggle('is-compact', scrollY > 80);
  }
  addEventListener('scroll', () => {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScrollEffects);
  }, { passive: true });
  updateScrollEffects();

  document.addEventListener('pointerdown', (event) => {
    if (reducedMotion || !event.target.closest('a, button, [data-open-case]')) return;
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.left = `${event.clientX}px`;
    ripple.style.top = `${event.clientY}px`;
    document.body.append(ripple);
    ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
  });

  if (interactivePointer && !reducedMotion) {
    document.body.classList.add('has-custom-cursor');
    let cursorX = -50;
    let cursorY = -50;
    let targetX = cursorX;
    let targetY = cursorY;
    let cursorFrame = 0;

    function renderCursor() {
      cursorX += (targetX - cursorX) * .22;
      cursorY += (targetY - cursorY) * .22;
      cursor.style.transform = `translate3d(${cursorX - 9}px, ${cursorY - 9}px, 0)`;
      if (Math.abs(targetX - cursorX) + Math.abs(targetY - cursorY) > .3) {
        cursorFrame = requestAnimationFrame(renderCursor);
      } else {
        cursorFrame = 0;
      }
    }

    document.addEventListener('pointermove', (event) => {
      targetX = event.clientX;
      targetY = event.clientY;
      if (!cursorFrame) cursorFrame = requestAnimationFrame(renderCursor);
    }, { passive: true });

    document.addEventListener('pointerover', (event) => {
      cursor.classList.toggle('is-active', Boolean(event.target.closest('a, button, [data-tilt], .archive-track')));
    });

    document.querySelectorAll('[data-magnetic]').forEach((element) => {
      element.addEventListener('pointermove', (event) => {
        const rect = element.getBoundingClientRect();
        const x = pointerOffset(event.clientX, rect.left + rect.width / 2, 10);
        const y = pointerOffset(event.clientY, rect.top + rect.height / 2, 10);
        element.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      });
      element.addEventListener('pointerleave', () => { element.style.transform = ''; });
    });

    document.querySelectorAll('[data-tilt]').forEach((element) => {
      element.addEventListener('pointermove', (event) => {
        const rect = element.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        element.style.setProperty('--tilt-y', `${(x - .5) * 7}deg`);
        element.style.setProperty('--tilt-x', `${(.5 - y) * 7}deg`);
        element.style.setProperty('--pointer-x', `${x * 100}%`);
        element.style.setProperty('--pointer-y', `${y * 100}%`);
      });
      element.addEventListener('pointerleave', () => {
        element.style.removeProperty('--tilt-x');
        element.style.removeProperty('--tilt-y');
      });
    });

    const hero = document.querySelector('.hero');
    hero?.addEventListener('pointermove', (event) => {
      hero.style.setProperty('--hero-x', `${(event.clientX / innerWidth - .5) * 26}px`);
      hero.style.setProperty('--hero-y', `${(event.clientY / innerHeight - .5) * 26}px`);
      hero.style.setProperty('--hero-x-rev', `${(event.clientX / innerWidth - .5) * -16}px`);
      hero.style.setProperty('--hero-y-rev', `${(event.clientY / innerHeight - .5) * -16}px`);
    }, { passive: true });
  }

  if (archiveTrack && interactivePointer) {
    let dragging = false;
    let dragStart = 0;
    let scrollStart = 0;
    archiveTrack.addEventListener('pointerdown', (event) => {
      dragging = true;
      dragStart = event.clientX;
      scrollStart = archiveTrack.scrollLeft;
      archiveTrack.classList.add('is-dragging');
      archiveTrack.setPointerCapture(event.pointerId);
    });
    archiveTrack.addEventListener('pointermove', (event) => {
      if (dragging) archiveTrack.scrollLeft = scrollStart - (event.clientX - dragStart);
    });
    const stopDragging = () => {
      dragging = false;
      archiveTrack.classList.remove('is-dragging');
    };
    archiveTrack.addEventListener('pointerup', stopDragging);
    archiveTrack.addEventListener('pointercancel', stopDragging);
    archiveTrack.addEventListener('wheel', (event) => {
      const direction = Math.sign(event.deltaY);
      const canScroll = direction > 0
        ? archiveTrack.scrollLeft < archiveTrack.scrollWidth - archiveTrack.clientWidth
        : archiveTrack.scrollLeft > 0;
      if (!canScroll || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      event.preventDefault();
      archiveTrack.scrollLeft += event.deltaY;
    }, { passive: false });
  }

  filters.forEach((button) => button.addEventListener('click', () => {
    filters.forEach((item) => {
      item.classList.toggle('is-active', item === button);
      item.setAttribute('aria-pressed', String(item === button));
    });
    const visible = new Set(filterProjects(button.dataset.filter, caseStudies).map(({ id }) => id));
    cards.forEach((card) => {
      card.hidden = !visible.has(card.dataset.project);
      if (!card.hidden) card.animate?.([
        { opacity: 0, transform: 'translateY(24px) scale(.97)' },
        { opacity: 1, transform: 'translateY(0) scale(1)' },
      ], { duration: 480, easing: 'cubic-bezier(.16, 1, .3, 1)' });
    });
  }));

  function openCase(id) {
    const project = getProject(id, caseStudies);
    if (!project || !dialog) return;
    dialog.querySelector('[data-case-image]').src = project.image;
    dialog.querySelector('[data-case-image]').alt = `${project.title} 示例视觉`;
    dialog.querySelector('[data-case-title]').textContent = project.title;
    dialog.querySelector('[data-case-type]').textContent = project.type;
    dialog.querySelector('[data-case-role]').textContent = project.role;
    dialog.querySelector('[data-case-summary]').textContent = project.summary;
    dialog.querySelector('[data-case-challenge]').textContent = project.challenge;
    dialog.querySelector('[data-next-case]').dataset.openCase = nextProject(id, caseStudies).id;
    dialog.showModal();
  }

  document.addEventListener('click', (event) => {
    const opener = event.target.closest('[data-open-case]');
    if (opener && transition && !reducedMotion) {
      transition.style.left = `${event.clientX || innerWidth / 2}px`;
      transition.style.top = `${event.clientY || innerHeight / 2}px`;
      transition.classList.add('is-active');
      setTimeout(() => {
        openCase(opener.dataset.openCase);
        transition.classList.remove('is-active');
      }, 360);
    } else if (opener) {
      openCase(opener.dataset.openCase);
    }
    if (event.target.closest('[data-close-dialog]')) dialog?.close();
  });

  dialog?.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });

  menuButton?.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  });

  nav?.addEventListener('click', () => {
    menuButton?.setAttribute('aria-expanded', 'false');
    nav.classList.remove('is-open');
  });

  soundButton?.addEventListener('click', () => {
    reel.muted = !reel.muted;
    soundButton.setAttribute('aria-pressed', String(!reel.muted));
    soundButton.querySelector('span').textContent = reel.muted ? '开启声音' : '关闭声音';
  });

  playButton?.addEventListener('click', () => {
    if (reel.currentSrc) {
      if (reel.paused) reel.play(); else reel.pause();
      playButton.firstChild.textContent = reel.paused ? 'PLAY ' : 'PAUSE ';
    } else {
      reelFrame?.classList.add('is-previewing');
      setTimeout(() => reelFrame?.classList.remove('is-previewing'), 900);
    }
  });
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initSite);
}

if (typeof module !== 'undefined') {
  module.exports = {
    filterProjects,
    getProject,
    nextProject,
    clamp,
    pointerOffset,
    progress,
    caseStudies,
  };
}
