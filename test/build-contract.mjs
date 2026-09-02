import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pagePaths } from '../src/portfolio.ts';
import { profile, categories, projects } from '../src/content.ts';

const root = 'dist';
const staticFile = pathname => join(root, pathname.endsWith('/') ? `${pathname}index.html` : pathname);
const paths = [...pagePaths(), '/404.html'];
for (const pathname of paths) {
  const file = staticFile(pathname);
  assert.ok(existsSync(file), `Missing static page: ${pathname}`);
  const html = readFileSync(file, 'utf8');
  assert.ok(html.includes('<main'), `Page has no prerendered content: ${pathname}`);
  assert.ok(!html.includes('<!--app-html-->'), `Unrendered placeholder: ${pathname}`);
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const value = match[1].replaceAll('&amp;', '&');
    if (!value.startsWith('/') && !value.startsWith('#')) continue;
    const url = new URL(value, `https://portfolio.test${pathname}`);
    const target = staticFile(url.pathname);
    assert.ok(existsSync(target), `${pathname} has a broken local destination: ${value}`);
    if (url.hash && target.endsWith('.html')) {
      assert.ok(readFileSync(target, 'utf8').includes(`id="${url.hash.slice(1)}"`), `Missing anchor: ${value}`);
    }
  }
}
assert.equal(new Set(projects.map(project => project.id)).size, projects.length, 'Duplicate project IDs');
for (const project of projects) {
  assert.match(project.id, /^[a-z0-9-]+$/);
  const category = categories.find(category => category.id === project.category);
  assert.ok(category, `Unknown category: ${project.id}`);
  assert.ok(!project.subcategory || category.children.some(child => child.id === project.subcategory), `Unknown subcategory: ${project.id}`);
  const html = readFileSync(staticFile(`/project/${project.id}/`), 'utf8');
  assert.ok(html.includes(project.title), `Missing project title: ${project.id}`);
  for (const media of project.media) {
    if (media.src.startsWith('/')) assert.ok(existsSync(staticFile(media.src)), `Missing media: ${media.src}`);
  }
}
if (profile.resumeUrl) {
  assert.match(profile.resumeUrl, /^\/.*\.pdf$/i, 'Resume must be a local PDF');
  assert.ok(readFileSync(staticFile(profile.resumeUrl)).subarray(0, 5).toString() === '%PDF-', 'Resume is not a PDF');
}
if (profile.email) assert.match(profile.email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/);
assert.ok(existsSync('dist/images/portrait.png'));
console.log(`Verified ${paths.length} static pages, all internal links, assets and configured contact files.`);
