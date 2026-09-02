# 肖丙飞 · 个人作品集

React + TypeScript + Vite。首页、分类页和作品详情页在构建时输出完整 HTML，可独立打开、刷新和分享。

## 本地运行

使用 Node.js 24+ 与 pnpm。

```sh
pnpm install
pnpm dev
pnpm test
pnpm build
pnpm preview
```

开发和成品预览都使用 `http://127.0.0.1:4173/`，一次运行其中一个。Windows 环境使用原生配置加载器，避免配置打包时的路径解析问题。

## 修改真实内容

- `src/content.ts`：姓名、职业定位、求职意向、简介、优势、技能、联系方式、四类导航和全部作品。
- `public/images/portrait.png`：提供的职业照原图，人物和坐姿保持原样。
- `public/images/`：项目封面、完整图片和视频素材；内容中的地址以 `/images/` 开头。
- `src/ParticleText.jsx` / `src/ParticleText.css`：基于用户提供的 React Bits 源码，适配中文分行、静态后备、触屏滚动与减少动态效果。
- `src/portfolio.css`：首页布局；`src/chrome.css`：玻璃导航与弹窗；`src/works.css`：分类和详情；`src/theme.css`：黑色主题。

当前姓名为肖丙飞，求职意向为 3D设计师。简介、优势和软件仍是待确认示例；`profile.draft` 控制示例提示，确认实际内容后改为 `false`。

### 简历和联系方式

把真实 PDF 放到 `public/resume.pdf`，在 `src/content.ts` 设置 `resumeUrl: '/resume.pdf'`。构建会检查文件的 PDF 签名。填写真实 `email` 和 `wechat` 后自动显示对应入口；空值时隐藏。不要使用旧版 `resume.txt`。

### 增加作品

在 `projects` 中增加一项。填写唯一的英文小写 `id`、标题、所属分类与子分类、说明、封面和排序值 `order`。一组系列作品共用一项，把每张图按顺序放入 `media`。

```ts
{
  id: 'my-project',
  title: '项目名称',
  subtitle: '产品渲染',
  category: '3d',
  subcategory: 'render',
  description: '一两句项目说明。',
  cover: '/images/my-project-cover.jpg',
  order: 1,
  sample: false,
  media: [
    { kind: 'image', src: '/images/my-project-01.jpg', alt: '完整产品渲染', caption: '产品正面' },
    { kind: 'video', src: '/images/my-project.mp4', poster: '/images/my-project-cover.jpg', alt: '产品动画' },
  ],
}
```

分类标识：`3d`（`animation`、`render`）、`visual`（`main-images`、`detail-pages`、`posters`）、`photography`（`product`、`portrait`）、`illustration`（无子分类）。

现有 PULSE、AERO、HALO 都是明确标记的演示内容，不是本人作品；替换为真实素材后再改为 `sample: false`。摄影分类使用职业照作为封面，不将其列为本人摄影作品。没有内容的分类显示整理中。

## 页面与构建

`src/portfolio.ts` 统一解析地址和筛选作品，`src/App.tsx` 组合页面，`src/Navigation.tsx` 处理菜单，`src/Gallery.tsx` 处理图片和视频。旧版的 Hero、鼠标视频脚本和根目录样式保留为历史参考，新站不引用它们。

`pnpm build` 构建浏览器代码和服务端渲染入口，再由 `scripts/prerender.mjs` 输出静态页面到 `dist/`，包含 `404.html`。只发布 `dist/`，不发布 `.cache/ssr/`。

正式站点的可信 HTTPS 地址通过 `SITE_ORIGIN` 环境变量传入构建，生成规范链接、站点地图及绝对地址的 Open Graph / X 图片。未提供地址时不输出猜测的分享图片 URL。作品详情分享卡使用该作品封面。

验收覆盖分类筛选、空分类、无效地址、同类作品前后导航、无 JavaScript 内容、手动视频控件、粒子文字后备，以及构建产物的全部内部链接和资源。浏览器还需检查手机布局、菜单焦点、大图预览和真实视频素材播放。
