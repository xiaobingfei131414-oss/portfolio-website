import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { render, pageMetadata, pagePaths } from '../.cache/ssr/entry-server.mjs';

const root = resolve('dist');
const template = await readFile(join(root, 'index.html'), 'utf8');
if (!template.includes('<!--app-html-->')) throw new Error('Missing prerender insertion point');
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const origin = process.env.SITE_ORIGIN ? new URL(process.env.SITE_ORIGIN).origin : '';
if (origin && !/^https?:\/\//.test(origin)) throw new Error('SITE_ORIGIN must be an HTTP(S) origin');
const paths = [...pagePaths(), '/404.html'];

for (const pathname of paths) {
  const { title, description, image } = pageMetadata(pathname);
  const metadata = [
    '<meta property="og:type" content="website" />',
    `<meta property="og:title" content="${escape(title)}" />`,
    `<meta property="og:description" content="${escape(description)}" />`,
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${escape(title)}" />`,
    `<meta name="twitter:description" content="${escape(description)}" />`,
    ...(origin ? [`<link rel="canonical" href="${escape(origin + pathname)}" />`, `<meta property="og:url" content="${escape(origin + pathname)}" />`, `<meta property="og:image" content="${escape(new URL(image, origin).href)}" />`, `<meta name="twitter:image" content="${escape(new URL(image, origin).href)}" />`] : []),
  ].join('\n');
  const html = template.replace(/<title>.*?<\/title>/, `<title>${escape(title)}</title>`)
    .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${escape(description)}" />`)
    .replace('<!--page-meta-->', metadata).replace('<!--app-html-->', render(pathname));
  const file = pathname === '/404.html' ? join(root, '404.html') : join(root, pathname.slice(1), 'index.html');
  await mkdir(pathname === '/404.html' ? root : join(root, pathname.slice(1)), { recursive: true });
  await writeFile(file, html);
}
if (origin) await writeFile(join(root, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pagePaths().map(path => `<url><loc>${escape(origin + path)}</loc></url>`).join('')}</urlset>`);
await writeFile(join(root, 'robots.txt'), 'User-agent: *\nAllow: /\n' + (origin ? `Sitemap: ${origin}/sitemap.xml\n` : ''));
console.log(`Prerendered ${paths.length} complete HTML pages.`);
