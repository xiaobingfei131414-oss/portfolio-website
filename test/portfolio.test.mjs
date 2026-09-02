import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';

async function portfolio() {
  const url = new URL('../src/portfolio.ts', import.meta.url);
  assert.ok(existsSync(url), 'The shared portfolio routes and content model must exist');
  return import(url.href);
}

test('direct category URLs resolve the requested subset, including empty categories', async () => {
  const { resolvePage } = await portfolio();
  const page = resolvePage('/works/visual/detail-pages/');
  assert.equal(page.kind, 'category');
  assert.equal(page.category.id, 'visual');
  assert.equal(page.subcategory.id, 'detail-pages');
  assert.deepEqual(page.projects, []);
  assert.equal(resolvePage('/works/photography/').kind, 'category');
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
  const page = resolvePage('/project/pulse/');
  assert.equal(page.kind, 'project');
  assert.equal(page.project.id, 'pulse');
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
  for (const expected of ['/', '/works/3d/', '/works/3d/animation/', '/works/3d/render/', '/works/visual/main-images/', '/works/visual/detail-pages/', '/works/visual/posters/', '/works/photography/product/', '/works/photography/portrait/', '/works/illustration/', '/project/pulse/']) {
    assert.ok(paths.includes(expected), expected);
  }
  assert.equal(new Set(paths).size, paths.length);
});
