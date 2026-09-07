import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';

async function portfolio() {
  const url = new URL('../src/portfolio.ts', import.meta.url);
  assert.ok(existsSync(url), 'The shared portfolio routes and content model must exist');
  return import(url.href);
}

test('direct category URLs resolve the requested subset', async () => {
  const { resolvePage } = await portfolio();
  const page = resolvePage('/works/visual/detail-pages/');
  assert.equal(page.kind, 'category');
  assert.equal(page.category.id, 'visual');
  assert.equal(page.subcategory.id, 'detail-pages');
  assert.deepEqual(page.projects.map(project => project.id), ['product-detail-pages']);
  assert.equal(resolvePage('/works/photography/').kind, 'category');
  const productPhotography = resolvePage('/works/photography/product/');
  assert.equal(productPhotography.kind, 'category');
  assert.deepEqual(productPhotography.projects.map(project => project.id), ['eyewear-product-photography']);
  const productRendering = resolvePage('/works/3d/render/');
  assert.equal(productRendering.kind, 'category');
  assert.deepEqual(productRendering.projects.map(project => project.id), ['product-rendering-collection']);
  const productAnimation = resolvePage('/works/3d/animation/');
  assert.equal(productAnimation.kind, 'category');
  assert.deepEqual(productAnimation.projects.map(project => project.id), ['product-animation-collection']);
  const productMainImages = resolvePage('/works/visual/main-images/');
  assert.equal(productMainImages.kind, 'category');
  assert.deepEqual(productMainImages.projects.map(project => project.id), ['product-main-images']);
  const productPosters = resolvePage('/works/visual/posters/');
  assert.equal(productPosters.kind, 'category');
  assert.deepEqual(productPosters.projects.map(project => project.id), ['product-posters']);
  const productDetailPages = resolvePage('/works/visual/detail-pages/');
  assert.equal(productDetailPages.kind, 'category');
  assert.deepEqual(productDetailPages.projects.map(project => project.id), ['product-detail-pages']);
});

test('unknown and cross-category paths cannot silently show unrelated work', async () => {
  const { resolvePage } = await portfolio();
  for (const pathname of ['/works/missing/', '/works/3d/portrait/', '/project/missing/', '/works/3d/render/extra/', '/%ZZ']) {
    assert.equal(resolvePage(pathname).kind, 'not-found', pathname);
  }
  assert.equal(resolvePage('/').kind, 'home');
});

test('project pages resolve independently and navigation stays within their category', async () => {
  const { resolvePage, neighbours } = await portfolio();
  const page = resolvePage('/project/product-animation-collection/');
  assert.equal(page.kind, 'project');
  assert.equal(page.project.id, 'product-animation-collection');
  const fixtures = [
    { id: 'a', category: '3d', order: 1 },
    { id: 'b', category: 'visual', order: 2 },
    { id: 'c', category: '3d', order: 3 },
  ];
  assert.equal(neighbours(fixtures[0], fixtures).next.id, 'c');
  assert.equal(neighbours(fixtures[0], fixtures).previous, undefined);
  assert.equal(neighbours(fixtures[2], fixtures).previous.id, 'a');
  assert.equal(neighbours(fixtures[2], fixtures).next, undefined);
  assert.deepEqual(neighbours(fixtures[1], fixtures), { previous: undefined, next: undefined });
});

test('static export includes every category and project with no duplicate paths', async () => {
  const { pagePaths } = await portfolio();
  const paths = pagePaths();
  for (const expected of ['/', '/works/3d/', '/works/3d/animation/', '/works/3d/render/', '/works/visual/main-images/', '/works/visual/detail-pages/', '/works/visual/posters/', '/works/photography/product/', '/works/photography/portrait/', '/works/illustration/', '/project/product-animation-collection/', '/project/product-rendering-collection/', '/project/product-main-images/', '/project/product-posters/', '/project/product-detail-pages/', '/project/eyewear-product-photography/']) {
    assert.ok(paths.includes(expected), expected);
  }
  assert.equal(new Set(paths).size, paths.length);
});

test('selected collection covers use the requested images', async () => {
  const { projects } = await import(new URL('../src/content.ts', import.meta.url).href);
  assert.equal(projects.find(project => project.id === 'product-rendering-collection').cover, '/images/rendering/render-44.webp');
  assert.equal(projects.find(project => project.id === 'product-main-images').cover, '/images/main-images/main-image-28.webp');
  assert.equal(projects.find(project => project.id === 'product-posters').cover, '/images/posters/poster-15.webp');
  assert.equal(projects.find(project => project.id === 'product-animation-collection').cover, '/images/product-animation/animation-07.webp');
});
