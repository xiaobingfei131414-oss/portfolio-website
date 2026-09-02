import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { existsSync } from 'node:fs';
let server, App;
before(async () => {
  server = await createServer({ configLoader: 'native', server: { middlewareMode: true }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] } });
  ({ App } = await server.ssrLoadModule('/src/App.tsx'));
});
after(async () => { await server?.close(); });
const render = path => renderToStaticMarkup(createElement(App, { pathname: path }));

test('project URL renders its media, sample notice and category return link without client JavaScript', () => {
  const html = render('/project/pulse/');
  assert.match(html, /src="\/images\/project-pulse\.png"/);
  assert.match(html, /href="\/works\/3d\/animation\/"/);
  assert.match(html, /示例作品/);
  assert.doesNotMatch(html, /href="\/project\/pulse\/"[^>]*>下一/);
});
test('empty categories retain navigation without leaking unrelated demo projects', () => {
  const html = render('/works/visual/detail-pages/');
  assert.match(html, /作品整理中/);
  assert.match(html, /aria-current="page"[^>]*>详情页/);
  assert.doesNotMatch(html, /PULSE|AERO|HALO/);
});
test('home exposes subcategory routes and hides unknown contact and resume destinations', () => {
  const html = render('/');
  assert.match(html, /aria-expanded="false"/);
  assert.match(html, /href="\/works\/photography\/portrait\/"/);
  assert.match(html, /src="\/images\/portrait\.png"/);
  assert.doesNotMatch(html, /mailto:|resume\.txt|yourname@example|<video/);
});
test('particle headline keeps readable server-rendered text before canvas is ready', async () => {
  assert.ok(existsSync(new URL('../src/ParticleText.jsx', import.meta.url)), 'ParticleText must be integrated');
  const { default: ParticleText } = await server.ssrLoadModule('/src/ParticleText.jsx');
  const html = renderToStaticMarkup(createElement(ParticleText, { text: '让好产品，\n拥有好视觉。' }));
  assert.match(html, /让好产品，\n拥有好视觉。/);
  assert.match(html, /<canvas[^>]*aria-hidden="true"/);
  assert.match(html, /particle-text__fallback/);
});
test('video work renders native manual controls and complete image series in source order', async () => {
  const { MediaGallery } = await server.ssrLoadModule('/src/Gallery.tsx');
  const html = renderToStaticMarkup(createElement(MediaGallery, { media: [
    { kind: 'video', src: '/film.mp4', poster: '/cover.png', alt: '产品动画' },
    { kind: 'image', src: '/top.png', alt: '详情页上半部' },
    { kind: 'image', src: '/bottom.png', alt: '详情页下半部' },
  ] }));
  assert.match(html, /<video[^>]*controls=""/);
  assert.match(html, /poster="\/cover.png"/);
  assert.doesNotMatch(html, /autoPlay/i);
  assert.ok(html.indexOf('src="/top.png"') < html.indexOf('src="/bottom.png"'));
});
