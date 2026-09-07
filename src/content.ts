export type CategoryId = '3d' | 'visual' | 'photography' | 'illustration';
export type Media = { kind: 'image' | 'video'; src: string; alt: string; poster?: string; caption?: string; width?: number; height?: number };
export type Project = { id: string; title: string; subtitle: string; category: CategoryId; subcategory?: string; description: string; cover: string; order: number; sample: boolean; year?: string; role?: string; tools?: string[]; galleryLayout?: 'adaptive' | 'stack'; media: Media[] };
export type Category = { id: CategoryId; name: string; description: string; cover?: string; coverNote: string; children: { id: string; name: string }[] };

// Replace draft text with verified personal information. Empty contact fields stay hidden.
// Place an actual PDF in public/ before enabling resumeUrl.
export const profile = {
  name: '肖丙飞', role: '3D设计师', draft: false,
  introduction: '以设计表达产品，让每一处细节，都成为被选择的理由。',
  city: '', experience: '5 年', jobIntent: '3D设计师',
  phone: '15902004002', email: '2563847188@qq.com', wechat: '', wechatQrUrl: '/images/wechat-qr.jpg', resumeUrl: '/resume.pdf', portrait: '/images/portrait-dark-1536.webp',
  strengths: '拥有 5 年电商视觉设计实战经验，熟悉亚马逊、阿里巴巴国际站、沃尔玛、TikTok Shop、速卖通、eBay 等多平台视觉规范，能独立完成从产品建模、渲染到主图、A+、活动专题页、品牌店的全链路视觉产出。掌握 C4D 关键帧动画、动力学、布料与域等动态表现，可独立完成「建模 — 材质 — 动画 — 渲染 —AE 合成」全流程产品动画制作，具备从静态视觉向动态视觉延伸的完整能力。深入掌握镜头语言、动画节奏、转场与动态质感表现。长期的摄影与美工经验带来敏锐的布光、构图与色彩审美，注重产品光影质感和细节表达。学习与自驱能力强，目标是做出有质感、有节奏、有记忆点的产品动态作品。具备良好的职业素养，平时注重设计理论知识的积累，并将理论运用到工作当中。',
  // Skills below summarize the experience and software supplied by the designer.
  skills: [
    { title: '产品动画', icon: 2, tags: ['C4D / AE', '动画与合成'], use: '掌握关键帧、动力学、布料与域，完成从动画到合成的动态制作。' },
    { title: '三维制作', icon: 1, tags: ['C4D', '材质与布光'], use: '以建模、材质与渲染呈现产品质感，注重光影和细节表达。' },
    { title: '电商视觉', icon: 0, tags: ['多平台规范', '主图 / A+'], use: '从主图、活动专题页到品牌店，独立完成全链路电商视觉产出。' },
    { title: 'AI工具', icon: 3, tags: ['辅助产品设计'], use: 'ChatGPT、Codex、DeepSeek、豆包、即梦等等来辅助产品设计，拓展创意与视觉表达。' },
  ],
};
export const categories: Category[] = [
  { id: '3d', name: '3D作品', description: '用光影、材质与动态，探索产品的另一种可能。', cover: '/images/rendering/render-44.webp', coverNote: '产品渲染作品', children: [{ id: 'animation', name: '产品动画' }, { id: 'render', name: '产品渲染' }] },
  { id: 'visual', name: '视觉作品', description: '让产品信息成为有吸引力、有秩序的视觉表达。', cover: '/images/main-images/main-image-28.webp', coverNote: '产品主图作品', children: [{ id: 'main-images', name: '产品主图' }, { id: 'detail-pages', name: '详情页' }, { id: 'posters', name: '产品海报' }] },
  { id: 'photography', name: '摄影作品', description: '观察光与真实，记录物的质感与人的情绪。', cover: '/images/photography/eyewear-01.webp', coverNote: '眼镜产品摄影', children: [{ id: 'product', name: '产品摄影' }, { id: 'portrait', name: '人像摄影' }] },
  { id: 'illustration', name: '插画作品', description: '以线条与色彩，记录日常之外的想象。', cover: '/images/illustration/illustration-02.png', coverNote: '个人插画作品', children: [] },
];
const illustrationTitles = [
  '月下莲花', '东方幻想', '星光肖像', '红色肖像',
  '鹤舞山河', '秋日红衣', '龙与精灵', '并肩守护',
  '城市生态', '云海冒险', '国风天坛', '蓝莓甜点',
  '秋日伞下', '月下玉兔', '国风角色', '醒狮少年',
];
const illustrationProjects: Project[] = illustrationTitles.map((title, index) => {
  const number = String(index + 1).padStart(2, '0');
  const extension = index === 1 ? 'png' : 'webp';
  const image = `/images/illustration/illustration-${number}.${extension}`;
  return {
    id: `illustration-${number}`,
    title,
    subtitle: '个人插画 · 数字绘画',
    category: 'illustration',
    description: '个人插画作品，以角色、场景与色彩进行视觉表达。',
    cover: image,
    order: index + 1,
    sample: false,
    role: '个人创作',
    media: [{ kind: 'image', src: image, alt: `${title}插画作品` }],
  };
});
const productRenderingSizes = [[2000,2000],[1688,2532],[2500,2500],[696,1024],[2000,2000],[2000,2000],[2000,2000],[2000,2000],[2000,2000],[2000,2000],[2000,2000],[2000,2000],[1280,1920],[5850,10400],[3750,5000],[3000,3000],[2000,3000],[2000,3000],[3000,5334],[2000,3000],[3534,5000],[1200,675],[1920,1080],[1920,1102],[750,1000],[1920,1000],[1700,2367],[1000,1000],[1500,2718],[1600,1600],[1500,2336],[2000,2000],[1920,1080],[2292,1434],[2000,2000],[1929,1080],[1929,1080],[1080,1080],[1080,1080],[1080,1080],[1911,1080],[1911,1080],[1080,1512],[1080,1656],[1080,1512],[1728,1080]];
const productRenderingMedia: Media[] = Array.from({ length: 46 }, (_, index) => index + 1).filter(number => ![5, 9].includes(number)).map(sourceNumber => {
  const number = String(sourceNumber).padStart(2, '0');
  const [width, height] = productRenderingSizes[sourceNumber - 1];
  return {
    kind: 'image',
    src: `/images/rendering/render-${number}.webp`,
    alt: `产品渲染作品 ${sourceNumber}`,
    caption: `产品渲染 · ${number}`,
    width,
    height,
  };
});
const productMainImageSizes = [[2000,2000],[1500,1500],[2000,2000],[2000,2000],[2000,2000],[2000,2000],[2000,2000],[2000,2000],[1500,1500],[1500,1500],[1500,1500],[1500,1500],[1500,1500],[2000,2000],[2000,2000],[2560,2560],[2560,2560],[2560,2560],[2560,2560],[2560,2560],[1600,1600],[1600,1600],[1600,1600],[1600,1600],[2000,2000],[2000,2000],[2000,2000],[2000,2000],[2000,2000],[2000,2000],[2000,2000],[2000,2000],[2000,2000],[2000,2000],[2000,2000],[2000,2000],[1600,1600],[1600,1600],[2000,2000],[2000,2000],[2000,2000],[2000,2000],[2000,2000],[2000,2000],[2000,2000],[2000,2000],[2000,2000],[2000,2000]];
const productMainImageMedia: Media[] = Array.from({ length: 48 }, (_, index) => index + 1).filter(number => ![1, 2, 15, 18, 20, 34].includes(number)).map(sourceNumber => {
  const number = String(sourceNumber).padStart(2, '0');
  const [width, height] = productMainImageSizes[sourceNumber - 1];
  return {
    kind: 'image',
    src: `/images/main-images/main-image-${number}.webp`,
    alt: `产品主图作品 ${sourceNumber}`,
    caption: `产品主图 · ${number}`,
    width,
    height,
  };
});
const productPosterSizes = [[1500,750],[1500,750],[3000,1500],[1500,750],[1500,750],[1500,750],[1500,750],[1500,750],[1500,750],[1500,750],[1500,750],[3000,1500],[3000,2000],[3000,1500],[1920,750],[1920,750],[1920,750],[1920,950]];
const productPosterMedia: Media[] = Array.from({ length: 18 }, (_, index) => {
  const number = String(index + 1).padStart(2, '0');
  const [width, height] = productPosterSizes[index];
  return {
    kind: 'image',
    src: `/images/posters/poster-${number}.webp`,
    alt: `产品海报作品 ${index + 1}`,
    caption: `产品海报 · ${number}`,
    width,
    height,
  };
});
const productDetailPageSizes = [[1464,3000],[970,4200],[1464,4200],[1464,3000],[1464,3600],[1464,4200],[1464,3600],[1464,4200],[1464,3600],[1464,3600],[1464,4200],[1464,3600],[1464,3000],[1464,3600],[1464,4200],[1464,3000],[1464,3600],[1464,3000],[1464,4200],[1464,3000],[1464,3000],[1464,3600],[1464,3000],[1464,4200],[1464,3600],[1464,3600],[1464,3000],[1464,3000],[1464,4800],[1464,3600],[1464,3600],[1464,3000],[1464,3000],[970,3017],[970,3640],[1000,4334],[1940,9600],[2928,14400],[2928,9600],[2928,12000],[2928,13199],[2928,7200],[1940,10800]];
const productDetailPageMedia: Media[] = Array.from({ length: 43 }, (_, index) => {
  const number = String(index + 1).padStart(2, '0');
  const [width, height] = productDetailPageSizes[index];
  return {
    kind: 'image',
    src: `/images/detail-pages/detail-${number}.webp`,
    alt: `产品详情页作品 ${index + 1}`,
    caption: `产品详情页 · ${number}`,
    width,
    height,
  };
});
const productAnimationSizes = [[1280,720],[1920,1080],[1920,1080],[1280,720],[1280,720],[1280,720],[1920,1080],[1280,720],[1280,720],[1280,720],[960,540],[1920,1080],[1280,720],[1280,720],[1280,720],[1280,720]];
const productAnimationMedia: Media[] = productAnimationSizes.map(([width, height], index) => {
  const number = String(index + 1).padStart(2, '0');
  return {
    kind: 'video',
    src: `/videos/product-animation/animation-${number}.mp4`,
    poster: `/images/product-animation/animation-${number}.webp`,
    alt: `产品动画作品 ${index + 1}`,
    caption: `产品动画 · ${number}`,
    width,
    height,
  };
});
// Existing demo imagery demonstrates browsing only. Replace entries and set sample: false.
export const projects: Project[] = [
  { id: 'eyewear-product-photography', title: '眼镜产品摄影', subtitle: '商业产品摄影 · 光影与细节', category: 'photography', subcategory: 'product', order: 1, sample: false, year: '2021', role: '摄影 / 布光 / 后期', cover: '/images/photography/eyewear-01.webp', description: '以黑色背景、金属高光与蓝色镜片为视觉线索，通过整体造型和微距细节呈现镜架的结构、材质与精致感。', media: [
    { kind: 'image', src: '/images/photography/eyewear-01.webp', alt: '蓝色镜片眼镜立于灰色球体上的产品摄影', caption: '整体造型 · 蓝色镜片与金属高光' },
    { kind: 'image', src: '/images/photography/eyewear-02.webp', alt: '蓝色镜片眼镜正面产品摄影', caption: '正面结构 · 镜框比例' },
    { kind: 'image', src: '/images/photography/eyewear-03.webp', alt: '蓝色镜片眼镜侧立产品摄影', caption: '侧面造型 · 镜腿结构' },
    { kind: 'image', src: '/images/photography/eyewear-04.webp', alt: '方形蓝色镜片眼镜产品摄影', caption: '方框款式 · 金属质感' },
    { kind: 'image', src: '/images/photography/eyewear-05.webp', alt: '眼镜铰链和镜腿微距摄影', caption: '微距细节 · 铰链工艺' },
    { kind: 'image', src: '/images/photography/eyewear-06.webp', alt: '蓝色镜片边框微距摄影', caption: '微距细节 · 镜片与包边' },
    { kind: 'image', src: '/images/photography/eyewear-07.webp', alt: '眼镜鼻托和双镜片微距摄影', caption: '微距细节 · 鼻托结构' },
    { kind: 'image', src: '/images/photography/eyewear-08.webp', alt: '眼镜镜腿金属结构微距摄影', caption: '微距细节 · 镜腿线条' },
  ] },
  { id: 'product-animation-collection', title: '产品动画作品集', subtitle: '产品动态 · 建模、动画与合成', category: '3d', subcategory: 'animation', order: 1, sample: false, role: '建模 / 材质 / 动画 / 渲染 / AE 合成', cover: '/images/product-animation/animation-07.webp', description: '通过镜头运动、关键帧、动力学与后期合成呈现产品结构、功能和视觉质感。', media: productAnimationMedia },
  { id: 'product-rendering-collection', title: '产品渲染作品集', subtitle: '多品类产品 · 建模与视觉呈现', category: '3d', subcategory: 'render', order: 1, sample: false, role: '建模 / 材质 / 灯光 / 渲染', cover: '/images/rendering/render-44.webp', description: '涵盖数码、美妆、家电与生活方式产品，通过材质、灯光、构图和场景塑造，呈现产品结构、质感与商业视觉氛围。', media: productRenderingMedia },
  { id: 'product-main-images', title: '产品主图作品集', subtitle: '跨境电商视觉 · 产品卖点呈现', category: 'visual', subcategory: 'main-images', order: 1, sample: false, role: '视觉设计 / 产品合成 / 信息排版', cover: '/images/main-images/main-image-28.webp', description: '涵盖迷你电脑、平板电脑、数码配件与节日用品等产品，通过场景合成、卖点梳理与信息层级设计，完成适用于跨境电商平台的产品主图视觉。', media: productMainImageMedia },
  { id: 'product-detail-pages', title: '产品详情页作品集', subtitle: '跨境电商详情页 · 卖点梳理与长图设计', category: 'visual', subcategory: 'detail-pages', order: 1, sample: false, role: '视觉设计 / 信息排版 / 场景合成', cover: '/images/detail-pages/detail-01.webp', description: '涵盖营养补充剂、数码设备与节日用品等品类，通过卖点梳理、信息层级、场景合成与长图节奏，完成适用于跨境电商平台的产品详情页视觉。', galleryLayout: 'stack', media: productDetailPageMedia },
  { id: 'product-posters', title: '产品海报作品集', subtitle: '商业视觉 · 场景合成与产品表现', category: 'visual', subcategory: 'posters', order: 1, sample: false, role: '视觉设计 / 场景合成 / 产品表现', cover: '/images/posters/poster-15.webp', description: '涵盖营养补充剂与迷你电脑等产品，通过场景搭建、光影塑造、色彩规划和信息排版，呈现适用于品牌宣传与电商推广的横版产品海报。', media: productPosterMedia },
  ...illustrationProjects,
];
