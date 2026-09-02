export type CategoryId = '3d' | 'visual' | 'photography' | 'illustration';
export type Media = { kind: 'image' | 'video'; src: string; alt: string; poster?: string; caption?: string };
export type Project = { id: string; title: string; subtitle: string; category: CategoryId; subcategory?: string; description: string; cover: string; order: number; sample: boolean; year?: string; role?: string; tools?: string[]; media: Media[] };
export type Category = { id: CategoryId; name: string; english: string; description: string; cover?: string; coverNote: string; children: { id: string; name: string }[] };

// Replace draft text with verified personal information. Empty contact fields stay hidden.
// Place an actual PDF in public/ before enabling resumeUrl.
export const profile = {
  name: '肖丙飞', role: '电商视觉设计师', draft: true,
  introduction: '以设计表达产品，让每一处细节，都成为被选择的理由。',
  city: '', experience: '', jobIntent: '3D设计师',
  email: '', wechat: '', resumeUrl: '', portrait: '/images/portrait.png',
  strengths: [
    { title: '从卖点，到视觉', description: '梳理产品信息，让画面的主次与表达更清晰。' },
    { title: '让质感，被看见', description: '关注材质、光影与细节，呈现产品的独特气质。' },
    { title: '多维度的表达', description: '将平面、三维、摄影与插画融入同一个视觉语言。' },
    { title: '让创意，落地', description: '从沟通到交付，让设计回应实际的项目需求。' },
  ],
  // Draft software examples, visibly labelled on the page.
  skills: [
    { title: '视觉设计', english: 'VISUAL DESIGN', tools: ['Photoshop', 'Illustrator'], use: '主图 · 详情页 · 产品海报' },
    { title: '3D 制作', english: '3D & MOTION', tools: ['Cinema 4D', 'Blender'], use: '产品动画 · 材质灯光 · 渲染' },
    { title: '摄影后期', english: 'PHOTOGRAPHY', tools: ['Lightroom', 'Photoshop'], use: '产品精修 · 人像调色' },
    { title: '插画绘制', english: 'ILLUSTRATION', tools: ['Procreate', 'Illustrator'], use: '创意表达 · 数字绘画' },
  ],
};
export const categories: Category[] = [
  { id: '3d', name: '3D作品', english: '3D & MOTION', description: '用光影、材质与动态，探索产品的另一种可能。', cover: '/images/project-pulse.png', coverNote: '示例封面', children: [{ id: 'animation', name: '产品动画' }, { id: 'render', name: '产品渲染' }] },
  { id: 'visual', name: '视觉作品', english: 'VISUAL DESIGN', description: '让产品信息成为有吸引力、有秩序的视觉表达。', cover: '/images/project-halo.png', coverNote: '示例封面', children: [{ id: 'main-images', name: '产品主图' }, { id: 'detail-pages', name: '详情页' }, { id: 'posters', name: '产品海报' }] },
  { id: 'photography', name: '摄影作品', english: 'PHOTOGRAPHY', description: '观察光与真实，记录物的质感与人的情绪。', cover: '/images/portrait.png', coverNote: '职业照封面 · 摄影作品待补充', children: [{ id: 'product', name: '产品摄影' }, { id: 'portrait', name: '人像摄影' }] },
  { id: 'illustration', name: '插画作品', english: 'ILLUSTRATION', description: '以线条与色彩，记录日常之外的想象。', coverNote: '作品整理中', children: [] },
];
// Existing demo imagery demonstrates browsing only. Replace entries and set sample: false.
export const projects: Project[] = [
  { id: 'pulse', title: 'PULSE', subtitle: '耳机产品动画 · 关键帧', category: '3d', subcategory: 'animation', order: 1, sample: true, cover: '/images/project-pulse.png', description: '以结构拆解呈现耳机的内部细节。这是页面展示示例，当前仅提供静帧，待补充本人动画成片。', media: [{ kind: 'image', src: '/images/project-pulse.png', alt: '耳机结构拆解的示例渲染图', caption: '结构与细节 / 示例静帧' }] },
  { id: 'aero', title: 'AERO', subtitle: '香氛产品 · 光影练习', category: '3d', subcategory: 'render', order: 2, sample: true, cover: '/images/project-aero.png', description: '透明材质与柔和光影的视觉展示示例，待替换为本人作品。', media: [{ kind: 'image', src: '/images/project-aero.png', alt: '香氛产品的示例渲染图', caption: '材质与光影 / 示例视觉' }] },
  { id: 'halo', title: 'HALO', subtitle: '护肤产品 · 静帧渲染', category: '3d', subcategory: 'render', order: 3, sample: true, cover: '/images/project-halo.png', description: '围绕产品质感展开的静帧展示示例，待替换为本人作品。', media: [{ kind: 'image', src: '/images/project-halo.png', alt: '护肤产品的示例渲染图', caption: '产品质感 / 示例视觉' }] },
];
