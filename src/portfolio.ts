import { categories, projects, profile } from './content.ts';
import type { Category, Project } from './content.ts';
export const categoryPath = (category: string, subcategory?: string) => `/works/${category}/${subcategory ? `${subcategory}/` : ''}`;
export const projectPath = (id: string) => `/project/${id}/`;
export type Page = { kind: 'home' } | { kind: 'category'; category: Category; subcategory?: Category['children'][number]; projects: Project[] } | { kind: 'project'; project: Project; category: Category } | { kind: 'not-found' };
export function resolvePage(pathname: string): Page {
  if (pathname === '/') return { kind: 'home' };
  const work = pathname.match(/^\/works\/([a-z0-9-]+)(?:\/([a-z0-9-]+))?\/?$/);
  if (work) {
    const category = categories.find(item => item.id === work[1]);
    const subcategory = category?.children.find(item => item.id === work[2]);
    if (!category || (work[2] && !subcategory)) return { kind: 'not-found' };
    return { kind: 'category', category, subcategory, projects: projects.filter(item => item.category === category.id && (!subcategory || item.subcategory === subcategory.id)).sort((a, b) => a.order - b.order) };
  }
  const detail = pathname.match(/^\/project\/([a-z0-9-]+)\/?$/);
  const project = detail && projects.find(item => item.id === detail[1]);
  if (project) return { kind: 'project', project, category: categories.find(item => item.id === project.category)! };
  return { kind: 'not-found' };
}
export function neighbours<T extends { id: string; category: string; order: number }>(project: T, items: T[] = projects as unknown as T[]) {
  const related = items.filter(item => item.category === project.category).sort((a, b) => a.order - b.order);
  const index = related.findIndex(item => item.id === project.id);
  return { previous: index > 0 ? related[index - 1] : undefined, next: index >= 0 ? related[index + 1] : undefined };
}
export function pagePaths() {
  return ['/', ...categories.flatMap(category => [categoryPath(category.id), ...category.children.map(child => categoryPath(category.id, child.id))]), ...projects.map(project => projectPath(project.id))];
}
export function pageMetadata(pathname: string) {
  const page = resolvePage(pathname);
  let title = `${profile.name} · 电商视觉设计师`;
  let description = '电商视觉设计师个人作品集，涵盖 3D、视觉设计、摄影与插画。';
  let image = '/og.png';
  if (page.kind === 'category') { title = `${page.subcategory?.name || page.category.name} · ${profile.name}`; description = page.category.description; }
  else if (page.kind === 'project') { title = `${page.project.title} · ${page.project.subtitle} · ${profile.name}`; description = page.project.description; image = page.project.cover; }
  else if (page.kind === 'not-found') title = `页面未找到 · ${profile.name}`;
  return { title, description, image };
}
