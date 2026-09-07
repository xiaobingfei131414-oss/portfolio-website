import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { existsSync, readFileSync } from 'node:fs';
let server, App;
before(async () => {
  server = await createServer({ configLoader: 'native', server: { middlewareMode: true }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] } });
  ({ App } = await server.ssrLoadModule('/src/App.tsx'));
});
after(async () => { await server?.close(); });
const render = path => renderToStaticMarkup(createElement(App, { pathname: path }));

test('project URL renders its media and category return link without client JavaScript', () => {
  const html = render('/project/product-animation-collection/');
  assert.match(html, /src="\/videos\/product-animation\/animation-01\.mp4"/);
  assert.match(html, /href="\/works\/3d\/animation\/"/);
  assert.doesNotMatch(html, /示例作品/);
});
test('empty categories retain navigation without leaking unrelated demo projects', () => {
  const html = render('/works/photography/portrait/');
  assert.match(html, /作品整理中/);
  assert.match(html, /aria-current="page"[^>]*>人像摄影/);
  assert.doesNotMatch(html, /PULSE|AERO|HALO/);
});
test('illustration category publishes all supplied personal work in source order', () => {
  const html = render('/works/illustration/');
  assert.match(html, /16 个项目/);
  assert.match(html, /href="\/project\/illustration-01\/"/);
  assert.match(html, /src="\/images\/illustration\/illustration-01\.webp"/);
  assert.match(html, /href="\/project\/illustration-16\/"/);
  assert.doesNotMatch(html, /示例作品|作品整理中/);
  for (let i = 1; i <= 16; i++) {
    const number = String(i).padStart(2, '0');
    const extension = i === 2 ? 'png' : 'webp';
    assert.ok(existsSync(new URL(`../public/images/illustration/illustration-${number}.${extension}`, import.meta.url)));
  }
});
test('product photography publishes the supplied eyewear series at full resolution', () => {
  const category = render('/works/photography/product/');
  const project = render('/project/eyewear-product-photography/');
  assert.match(category, /8 件作品/);
  assert.equal([...category.matchAll(/class="project-card"/g)].length, 8);
  assert.match(category, /眼镜产品摄影/);
  assert.doesNotMatch(category, /示例作品|作品整理中/);
  for (let i = 1; i <= 8; i++) {
    const number = String(i).padStart(2, '0');
    const source = `/images/photography/eyewear-${number}.webp`;
    assert.match(project, new RegExp(`src="${source.replaceAll('/', '\\/')}"`));
    assert.ok(existsSync(new URL(`../public${source}`, import.meta.url)));
  }
});
test('product rendering publishes all supplied work in source order', () => {
  const category = render('/works/3d/render/');
  const project = render('/project/product-rendering-collection/');
  assert.match(category, /44 件作品/);
  assert.equal([...category.matchAll(/class="project-card"/g)].length, 44);
  assert.match(category, /产品渲染作品集/);
  assert.doesNotMatch(category, /示例作品|作品整理中/);
  assert.match(project, /class="media-gallery media-gallery--adaptive"/);
  assert.match(project, /class="media-item media-item--portrait"/);
  assert.match(project, /class="media-item media-item--landscape"/);
  for (let i = 1; i <= 46; i++) {
    const number = String(i).padStart(2, '0');
    const source = `/images/rendering/render-${number}.webp`;
    if ([5, 9].includes(i)) assert.doesNotMatch(project, new RegExp(`src="${source.replaceAll('/', '\\/')}"`));
    else assert.match(project, new RegExp(`src="${source.replaceAll('/', '\\/')}"`));
    assert.ok(existsSync(new URL(`../public${source}`, import.meta.url)));
  }
});
test('product animation category publishes every supplied compressed video inline', () => {
  const category = render('/works/3d/animation/');
  const project = render('/project/product-animation-collection/');
  assert.match(category, /16 件作品/);
  assert.equal([...category.matchAll(/<video/g)].length, 16);
  assert.doesNotMatch(category, /示例作品|作品整理中/);
  assert.match(project, /产品动画作品集/);
  for (let i = 1; i <= 16; i++) {
    const number = String(i).padStart(2, '0');
    const source = `/videos/product-animation/animation-${number}.mp4`;
    const poster = `/images/product-animation/animation-${number}.webp`;
    assert.match(project, new RegExp(`src="${source.replaceAll('/', '\\/')}"`));
    assert.ok(existsSync(new URL(`../public${source}`, import.meta.url)));
    assert.ok(existsSync(new URL(`../public${poster}`, import.meta.url)));
  }
});
test('3D practice categories disclose the supplied authorship notes', () => {
  assert.match(render('/works/3d/animation/'), /以下作品都是长期积累的个人练习和临摹/);
  assert.match(render('/works/3d/render/'), /以下作品部分是长期积累的个人练习和临摹/);
});
test('product main images publish all supplied work in source order', () => {
  const category = render('/works/visual/main-images/');
  const project = render('/project/product-main-images/');
  assert.match(category, /42 件作品/);
  assert.equal([...category.matchAll(/class="project-card"/g)].length, 42);
  assert.match(category, /产品主图作品集/);
  assert.doesNotMatch(category, /示例作品|作品整理中/);
  assert.match(project, /class="media-gallery media-gallery--adaptive"/);
  for (let i = 1; i <= 48; i++) {
    const number = String(i).padStart(2, '0');
    const source = `/images/main-images/main-image-${number}.webp`;
    if ([1, 2, 15, 18, 20, 34].includes(i)) assert.doesNotMatch(project, new RegExp(`src="${source.replaceAll('/', '\\/')}"`));
    else assert.match(project, new RegExp(`src="${source.replaceAll('/', '\\/')}"`));
    assert.ok(existsSync(new URL(`../public${source}`, import.meta.url)));
  }
});
test('product posters publish all supplied work in source order', () => {
  const category = render('/works/visual/posters/');
  const project = render('/project/product-posters/');
  assert.match(category, /18 件作品/);
  assert.equal([...category.matchAll(/class="project-card"/g)].length, 18);
  assert.match(category, /产品海报作品集/);
  assert.doesNotMatch(category, /示例作品|作品整理中/);
  assert.match(project, /class="media-gallery media-gallery--adaptive"/);
  assert.match(project, /class="media-item media-item--landscape"/);
  for (let i = 1; i <= 18; i++) {
    const number = String(i).padStart(2, '0');
    const source = `/images/posters/poster-${number}.webp`;
    assert.match(project, new RegExp(`src="${source.replaceAll('/', '\\/')}"`));
    assert.ok(existsSync(new URL(`../public${source}`, import.meta.url)));
  }
});
test('product detail pages publish all supplied long-form work in source order', () => {
  const category = render('/works/visual/detail-pages/');
  const project = render('/project/product-detail-pages/');
  assert.match(category, /43 件作品/);
  assert.equal([...category.matchAll(/class="project-card"/g)].length, 43);
  assert.match(category, /产品详情页作品集/);
  assert.doesNotMatch(category, /示例作品|作品整理中/);
  assert.doesNotMatch(project, /media-gallery--adaptive/);
  assert.match(project, /class="media-item media-item--portrait"/);
  for (let i = 1; i <= 43; i++) {
    const number = String(i).padStart(2, '0');
    const source = `/images/detail-pages/detail-${number}.webp`;
    assert.match(project, new RegExp(`src="${source.replaceAll('/', '\\/')}"`));
    assert.ok(existsSync(new URL(`../public${source}`, import.meta.url)));
  }
});
test('clicking the enlarged image provides a direct way to leave the preview', async () => {
  const gallery = readFileSync(new URL('../src/Gallery.tsx', import.meta.url), 'utf8');
  assert.match(gallery, /className="lightbox-image-dismiss"/);
  assert.match(gallery, /aria-label="再次点击图片关闭大图预览"/);
  assert.match(gallery, /onClick=\{\(\) => modal\.current\?\.close\(\)\}/);
});
test('category thumbnails open a preview instead of navigating away', () => {
  const category = render('/works/visual/main-images/');
  assert.match(category, /class="project-cover"[^>]*aria-label="放大查看：产品主图作品集/);
  assert.doesNotMatch(category, /<a[^>]*class="project-cover"/);
  const gallery = readFileSync(new URL('../src/Gallery.tsx', import.meta.url), 'utf8');
  assert.match(gallery, /aria-label="再次点击图片关闭大图预览"/);
});
test('overview cards link directly to their matching subcategory', () => {
  const threeD = render('/works/3d/');
  assert.match(threeD, /<a[^>]*class="project-cover"[^>]*href="\/works\/3d\/animation\/"/);
  assert.match(threeD, /<a[^>]*class="project-cover"[^>]*href="\/works\/3d\/render\/"/);
  const visual = render('/works/visual/');
  assert.match(visual, /<a[^>]*class="project-cover"[^>]*href="\/works\/visual\/main-images\/"/);
  assert.match(visual, /<a[^>]*class="project-cover"[^>]*href="\/works\/visual\/detail-pages\/"/);
  assert.match(visual, /<a[^>]*class="project-cover"[^>]*href="\/works\/visual\/posters\/"/);
});
test('home exposes subcategory routes, supplied contacts and a real downloadable resume', () => {
  const html = render('/');
  assert.match(html, /aria-expanded="false"/);
  assert.match(html, /href="\/works\/photography\/portrait\/"/);
  assert.match(html, /src="\/images\/photography\/eyewear-01\.webp"/);
  assert.match(html, /href="mailto:2563847188@qq.com"/);
  assert.match(html, /href="tel:15902004002"/);
  assert.match(html, /href="\/resume\.pdf" download=""/);
  assert.match(html, /src="\/images\/illustration\/illustration-02\.png"/);
  assert.equal([...html.matchAll(/class="particle-text /g)].length, 3);
  assert.doesNotMatch(html, /warp-text/);
  assert.doesNotMatch(html, /3D &amp; MOTION|VISUAL DESIGN|PHOTOGRAPHY|ILLUSTRATION/);
  assert.match(html, /class="back-to-top interface-button"[^>]*>返回顶部/);
  assert.match(html, /让设计回应需求，\n让视觉创造价值。/);
  assert.doesNotMatch(html, /让好的产品，\n拥有好的视觉。/);
  assert.doesNotMatch(html, /用视觉建立质感，\n让产品更有说服力。/);
  assert.doesNotMatch(html, /让好产品，\n拥有与价值相称的视觉。/);
  assert.doesNotMatch(html, /让产品被看见，\n让价值被记住。/);
  assert.doesNotMatch(html, /让好产品，\n拥有好视觉。/);
  assert.match(html, />求职意向：3D设计师</);
  assert.doesNotMatch(html, />肖丙飞 · 求职意向/);
  assert.ok(existsSync(new URL('../public/resume.pdf', import.meta.url)));
  assert.doesNotMatch(html, /resume\.txt|yourname@example|<video/);
});
test('particle headline keeps the supplied typeface, size and white fallback text', async () => {
  assert.ok(existsSync(new URL('../src/ParticleText.jsx', import.meta.url)), 'ParticleText must be integrated');
  const { default: ParticleText } = await server.ssrLoadModule('/src/ParticleText.jsx');
  const html = renderToStaticMarkup(createElement(ParticleText, { text: '让好产品，\n拥有好视觉。', color: '#fff', fontFamily: 'Alibaba PuHuiTi Heavy', fontSize: 'clamp(42px, 5.2vw, 78px)' }));
  assert.match(html, /让好产品，\n拥有好视觉。/);
  assert.match(html, /particle-text__fallback/);
  assert.match(html, /font-family:Alibaba PuHuiTi Heavy/);
  assert.match(html, /font-size:clamp\(42px, 5.2vw, 78px\)/);
  assert.match(html, /color:#fff/);
  const gradientHtml = renderToStaticMarkup(createElement(ParticleText, { text: '渐变标题', color: '#69d28e', highlightColor: '#ff9b58' }));
  assert.match(gradientHtml, /particle-text--gradient/);
  assert.match(gradientHtml, /--particle-color-start:#69d28e/);
  assert.match(gradientHtml, /--particle-color-end:#ff9b58/);
  assert.ok(existsSync(new URL('../public/fonts/AlibabaPuHuiTi-Heavy-subset.woff2', import.meta.url)));
});
test('animated hero headline does not flash its static fallback before particles are ready', () => {
  const css = readFileSync(new URL('../src/ParticleText.css', import.meta.url), 'utf8');
  assert.match(css, /prefers-reduced-motion:no-preference[^}]*\.particle-heading \.particle-text__fallback\{opacity:0;visibility:hidden\}/);
});
test('visible copy removes decorative English and keeps a clear type hierarchy', () => {
  const pages = [render('/'), render('/works/visual/'), render('/project/product-animation-collection/'), render('/missing/')].join('\n');
  assert.doesNotMatch(pages, /DESIGNER \/ PORTFOLIO|PORTFOLIO \/ MENU|VISUAL THINKING|SELECTED WORKS|GOOD THINGS TAKE TIME|PAGE NOT FOUND|>ILLUSTRATION</);
  assert.doesNotMatch(pages, />PULSE<|>AERO<|>HALO</);
  assert.match(pages, /ChatGPT/);
  assert.match(pages, /3D作品/);
  assert.match(pages, /产品动画作品集/);
  const theme = readFileSync(new URL('../src/theme.css', import.meta.url), 'utf8');
  assert.match(theme, /--type-display:/);
  assert.match(theme, /--type-section:/);
  assert.match(theme, /--type-body:/);
  assert.match(theme, /--weight-bold:/);
  assert.match(theme, /--weight-medium:/);
  assert.match(theme, /--weight-regular:/);
});
test('navigation caption, section titles and interface buttons share the requested visual system', () => {
  const home = render('/');
  const illustration = render('/works/illustration/');
  assert.match(home, /class="brand-caption"><span>设计师<\/span><span>作品集<\/span>/);
  assert.match(home, /font-size:var\(--section-particle-size\)/);
  assert.equal([...home.matchAll(/font-size:var\(--section-particle-size\)/g)].length, 2);
  assert.match(illustration, /class="back-overview interface-button"/);
  const theme = readFileSync(new URL('../src/theme.css', import.meta.url), 'utf8');
  assert.match(theme, /--control-background:#ffffff06/);
  assert.match(theme, /--section-particle-size:clamp\(42px,4\.5vw,62px\)/);
  assert.doesNotMatch(theme, /\.strengths \.section-particle-title\{height:86px\}/);
});
test('home hero and strengths expose the requested layout and scroll animations', () => {
  const home = render('/');
  assert.match(home, /class="hero-hello">你好，我是 <strong>肖丙飞<\/strong>/);
  assert.doesNotMatch(home, /typewriter-(?:line|reveal)/);
  assert.match(home, /class="scroll-reveal strength-scroll-reveal"/);
  assert.match(home, /class="scroll-reveal-unit"/);
  assert.match(home, /class="skills-grid neon-skills skills-reveal"/);
  assert.match(home, /class="category-grid categories-reveal"/);
  assert.match(home, /class="section-shell contact-inner contact-reveal"/);
  assert.match(home, /--particle-color-start:#fff/);
  assert.match(home, /--particle-color-end:#f27aff/);
  assert.match(home, /class="hero-geometry"/);
  assert.match(home, /class="hero-divider"/);
  assert.doesNotMatch(home, /geometry-(?:ring|square|dot)|contact-orbit/);
  assert.match(home, /class="contact-kicker" aria-label="联系"><svg[^>]*class="contact-smile"/);
  assert.match(home, /class="border-glow-card hero-semicircle"/);
  assert.match(home, /class="border-glow-card contact-copy-glow"/);
  assert.match(home, /class="border-glow-card contact-details-glow"/);
  assert.match(home, /class="star-field" aria-hidden="true"/);
  assert.match(home, /class="contact-resume interface-button"/);
  assert.ok(existsSync(new URL('../src/components/ScrollReveal/ScrollReveal.jsx', import.meta.url)));
  assert.ok(existsSync(new URL('../src/components/ScrollReveal/ScrollReveal.css', import.meta.url)));
  const theme = readFileSync(new URL('../src/theme.css', import.meta.url), 'utf8');
  assert.match(theme, /\.hero-copy\{[^}]*display:flex[^}]*flex-direction:column[^}]*justify-content:center/);
  assert.match(theme, /\.hero-copy\{[^}]*transform:translateY\(-40px\)/);
  assert.match(theme, /\.hero-hello\{font-size:24px/);
  assert.match(theme, /\.particle-heading \.particle-text__canvas\{filter:brightness\(1\.2\) saturate\(1\.08\)\}/);
  assert.match(theme, /\.hero-copy \.availability\{margin:0 0 clamp\(36px,3\.2vw,52px\)/);
  assert.match(theme, /\.menu-toggle\.interface-button\{display:none/);
  assert.match(theme, /\.strength-statement\{font-size:18px;line-height:2\.35/);
  assert.match(theme, /main \.interface-button\.interface-button,\.contact-section \.interface-button\.interface-button,\.site-footer \.interface-button\.interface-button\{[^}]*border-radius:999px[^}]*radial-gradient\(ellipse 48% 48% at 50% 112%,#f079ff 0%,#b33bd2 42%,transparent 72%\)/);
  assert.match(theme, /\.hero-portrait\{[^}]*border:0/);
  assert.match(theme, /\.hero-portrait img\{[^}]*mask-image:linear-gradient\(to bottom,#000 0,#000 88%,transparent 100%\)/);
  assert.match(theme, /\.hero-cta-block\{[^}]*position:absolute[^}]*bottom:80px/);
  assert.match(theme, /\.site-header \.interface-button,\.mobile-menu \.interface-button\{[^}]*background:var\(--control-background\)/);
  assert.match(theme, /\.site-header\.border-glow-card\{background:transparent\}/);
  assert.match(theme, /\.categories-section\{border-top:0\}/);
  assert.match(theme, /\.contact-copy\{[^}]*border-radius:36px/);
  assert.match(theme, /\.contact-copy h2>span\{color:#fff/);
  assert.match(theme, /\.contact-smile\{width:30px;height:30px[^}]*color:#d85cff/);
  assert.match(theme, /\.hero-hello strong\{color:#a855f7/);
  assert.match(theme, /\.hero-geometry::before\{[^}]*#6b249f[^}]*opacity:\.5/);
  assert.match(theme, /\.hero-geometry::after\{[^}]*border:1px solid #79439a[^}]*box-shadow:0 0 6px #6f288055/);
  assert.match(theme, /\.geometry-line\{[^}]*#8d42a980/);
  assert.match(theme, /\.geometry-line::before\{[^}]*background:#8f2490[^}]*box-shadow:0 0 6px #7d227966/);
  assert.match(theme, /\.hero-divider\{[^}]*#5d276faa[^}]*#82329199/);
  assert.match(theme, /\.hero-divider::before\{[^}]*background:#7d2b8f[^}]*box-shadow:0 0 6px #68247666/);
  assert.match(theme, /\.contact-details::before\{display:none\}/);
  assert.match(theme, /\.star-field\{position:fixed;inset:0;z-index:0;pointer-events:none/);
  assert.match(readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8'), /Array\.from\(\{ length: 120 \}/);
  assert.match(readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8'), /size: `\$\{1\.05 \+ \(\(index \* 7\) % 9\) \* 0\.24\}px`/);
  assert.match(theme, /\.star-field>span:nth-child\(4n\+1\).*#67e8f9/);
  assert.match(theme, /\.star-field>span:nth-child\(4n\+2\).*#c084fc/);
  assert.match(theme, /\.star-field>span:nth-child\(4n\+3\).*#60a5fa/);
  assert.match(theme, /\.star-field>span:nth-child\(4n\).*#fff/);
  assert.doesNotMatch(theme, /#f9a8d4/);
  assert.match(theme, /\.hero-semicircle\{[^}]*border-radius:0 50% 50% 0[^}]*mask-image:linear-gradient\(to bottom,transparent 0%,#000 14%,#000 86%,transparent 100%\)/);
  assert.match(theme, /\.hero-semicircle\{[^}]*clip-path:inset\(-40px -40px -40px 2px\)/);
  assert.match(theme, /\.hero-semicircle::before,\.hero-semicircle::after\{clip-path:inset\(0 0 0 12px\)\}/);
  assert.match(theme, /\.hero-semicircle>\.edge-light\{clip-path:inset\(-40px -40px -40px 48px\)\}/);
  assert.doesNotMatch(theme, /\.hero-geometry::before,\.hero-geometry::after\{display:none\}/);
  assert.match(theme, /\.skills-reveal\.is-animated\.is-visible \.neon-skill/);
  assert.match(theme, /\.categories-reveal\.is-animated \.category-card/);
  assert.match(theme, /\.contact-reveal\.is-animated \.contact-copy/);
  const appSource = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
  assert.match(appSource, /classList\.toggle\('is-visible', entry\.isIntersecting\)/);
  const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  assert.ok(packageJson.dependencies.gsap);
});
test('desktop hero actions sit with the portrait instead of the copy column', () => {
  const source = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
  assert.match(source, /<\/div><figure className="hero-portrait">[\s\S]*?<\/figure><div className="hero-cta-block">/);
  const theme = readFileSync(new URL('../src/theme.css', import.meta.url), 'utf8');
  assert.match(theme, /\.hero-cta-block\{position:absolute;left:5\.7%;bottom:80px/);
  assert.match(theme, /\.hero-cta-block \.hero-actions\{[^}]*justify-content:flex-start/);
});
test('mobile navigation hide rule wins the final stylesheet cascade', () => {
  const theme = readFileSync(new URL('../src/theme.css', import.meta.url), 'utf8');
  const desktopDisplayRule = theme.lastIndexOf('.site-header .desktop-nav{display:grid');
  const mobileHideRule = theme.lastIndexOf('@media(max-width:767px){.site-header .desktop-nav{display:none}}');
  assert.ok(desktopDisplayRule >= 0);
  assert.ok(mobileHideRule > desktopDisplayRule);
});
test('category cards use a slightly thicker white frame at 10 percent opacity', () => {
  const theme = readFileSync(new URL('../src/theme.css', import.meta.url), 'utf8');
  assert.match(theme, /\.categories-reveal \.category-card\{[^}]*border:2px solid #ffffff1a[^}]*border-radius:29px/);
  assert.doesNotMatch(theme, /\.categories-reveal \.category-(?:3d|visual|photography|illustration)\{--category-gradient:/);
});
test('original-size control sits between previous and next in the bottom controls', () => {
  const gallery = readFileSync(new URL('../src/Gallery.tsx', import.meta.url), 'utf8');
  assert.match(gallery, /className="lightbox-controls"[\s\S]*?>上一张<[\s\S]*?className="lightbox-center"[\s\S]*?className="lightbox-original-size interface-button"[\s\S]*?>下一张</);
  assert.doesNotMatch(gallery, /className="lightbox-center"[\s\S]*?<span>\{current\?\.caption\}<\/span>/);
  assert.doesNotMatch(gallery, /className="lightbox-toolbar"[\s\S]{0,400}className="lightbox-original-size/);
});
test('project gallery and contact QR keep distinct dialog labels and one global glow cursor', () => {
  const html = render('/project/aero/');
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(ids.length, new Set(ids).size, 'Dialog identifiers must not collide');
  assert.match(html, /src="\/images\/wechat-qr.jpg"/);
  assert.equal([...html.matchAll(/class="glow-cursor__canvas"/g)].length, 1);
  assert.equal([...html.matchAll(/id="fluid"/g)].length, 1);
  assert.match(html, /class="site-content"/);
  assert.ok(html.indexOf('id="fluid"') < html.indexOf('class="site-content"'), 'SplashCursor must render below site content');
  assert.doesNotMatch(html, /cursor-grid/);
  const glowCursor = readFileSync(new URL('../src/GlowCursor.jsx', import.meta.url), 'utf8');
  assert.match(glowCursor, /'uPoints\[0\]': uniform\(pointData\)/);
});
test('video work renders native manual controls and complete image series in source order', async () => {
  const { MediaGallery } = await server.ssrLoadModule('/src/Gallery.tsx');
  const html = renderToStaticMarkup(createElement(MediaGallery, { media: [
    { kind: 'video', src: '/film.mp4', poster: '/cover.png', alt: '产品动画' },
    { kind: 'image', src: '/top.png', alt: '详情页上半部' },
    { kind: 'image', src: '/bottom.png', alt: '详情页下半部' },
  ] }));
  assert.match(html, /<video[^>]*controls=""/);
  assert.match(html, /controlsList="nodownload"/);
  assert.match(html, /disablePictureInPicture=""/);
  assert.match(html, /poster="\/cover.png"/);
  assert.doesNotMatch(html, /autoPlay/i);
  assert.ok(html.indexOf('src="/top.png"') < html.indexOf('src="/bottom.png"'));
});
test('site deters direct image and video downloads while keeping the resume downloadable', () => {
  const source = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
  const gallery = readFileSync(new URL('../src/Gallery.tsx', import.meta.url), 'utf8');
  const theme = readFileSync(new URL('../src/theme.css', import.meta.url), 'utf8');
  const home = render('/');
  assert.match(source, /addEventListener\('contextmenu', preventMediaDownload\)/);
  assert.match(source, /addEventListener\('dragstart', preventMediaDownload\)/);
  assert.match(gallery, /draggable=\{false\}/);
  assert.match(theme, /img,video\{[^}]*-webkit-user-drag:none[^}]*user-select:none/);
  assert.match(home, /href="\/resume\.pdf"[^>]*download=""/);
});
