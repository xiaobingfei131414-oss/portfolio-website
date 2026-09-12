import { useEffect, useId, useRef, useState } from 'react';
import type { ImgHTMLAttributes } from 'react';
import type { Media } from './content';

export function SafeImage(props: ImgHTMLAttributes<HTMLImageElement>) {
  const [failed, setFailed] = useState(false);
  if (failed) return <span className="media-error" role="status"><span>图片暂时无法显示</span><small>{props.alt}</small></span>;
  return <img {...props} draggable={false} onError={() => setFailed(true)} />;
}

function GalleryItem({ media, onOpen }: { media: Media; onOpen: () => void }) {
  const [failed, setFailed] = useState(false);
  const orientation = media.width && media.height
    ? media.width / media.height > 1.2 ? 'landscape' : media.height / media.width > 1.2 ? 'portrait' : 'square'
    : 'standard';
  if (media.kind === 'video') return <figure className="media-item">
    {!failed ? <video controls controlsList="nodownload" disablePictureInPicture playsInline preload="none" poster={media.poster} src={media.src} aria-label={media.alt} onError={() => setFailed(true)} /> : <div className="video-fallback">{media.poster && <SafeImage src={media.poster} alt={media.alt} />}<p role="status">视频暂时无法播放，请稍后重试。你仍可继续浏览其他作品。</p><button className="text-link interface-button" type="button" onClick={() => setFailed(false)}>重新加载</button></div>}
    {media.caption && <figcaption>{media.caption}</figcaption>}
  </figure>;
  return <figure className={`media-item media-item--${orientation}`}><button className="image-open" type="button" onClick={onOpen} aria-label={`放大查看：${media.alt}`} disabled={failed}>
    {failed ? <span className="media-error" role="status">图片暂时无法显示</span> : <><img src={media.src} alt={media.alt} width={media.width} height={media.height} loading="lazy" draggable={false} onError={() => setFailed(true)} /><span className="enlarge-hint" aria-hidden="true">放大查看 </span></>}
  </button>{media.caption && <figcaption>{media.caption}</figcaption>}</figure>;
}

export function MediaGallery({ media, layout = 'adaptive' }: { media: Media[]; layout?: 'adaptive' | 'stack' }) {
  const images = media.filter(item => item.kind === 'image');
  const [active, setActive] = useState<number | null>(null);
  return <>
    <div className={`media-gallery${layout === 'adaptive' && media.some(item => item.kind === 'image' && item.width && item.height) ? ' media-gallery--adaptive' : ''}`}>{media.map((item, index) => <GalleryItem key={`${item.src}-${index}`} media={item} onOpen={() => setActive(images.indexOf(item))} />)}</div>
    <ImageLightbox images={images} active={active} onChange={setActive} onClose={() => setActive(null)} />
  </>;
}

export function ImageLightbox({ images, active, onChange, onClose }: { images: Media[]; active: number | null; onChange: (index: number) => void; onClose: () => void }) {
  const titleId = useId();
  const [zoomed, setZoomed] = useState(false);
  const modal = useRef<HTMLDialogElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const isOpen = active !== null;
  useEffect(() => {
    if (!isOpen) return;
    modal.current?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [isOpen]);
  useEffect(() => { setZoomed(false); body.current?.scrollTo(0, 0); }, [active]);
  const current = active === null ? null : images[active];
  return <>
    <dialog ref={modal} className={`lightbox ${zoomed ? 'is-zoomed' : ''}`} aria-labelledby={titleId} onClose={onClose}
      onClick={event => { if (event.target === event.currentTarget) modal.current?.close(); }}
      onKeyDown={event => {
        if (active === null) return;
        if (event.key === 'ArrowLeft' && !zoomed) { event.preventDefault(); onChange(Math.max(0, active - 1)); }
        if (event.key === 'ArrowRight' && !zoomed) { event.preventDefault(); onChange(Math.min(images.length - 1, active + 1)); }
      }}>
      <div className="lightbox-toolbar"><p id={titleId}>{current?.alt || '作品大图'}<small>{active === null ? '' : `${active + 1} / ${images.length}`}</small></p><button type="button" className="lightbox-close interface-button" aria-label="关闭大图预览" onClick={() => modal.current?.close()}>×</button></div>
      <div ref={body} className="lightbox-body">{current && <button type="button" className="lightbox-image-dismiss" aria-label="再次点击图片关闭大图预览" onClick={() => modal.current?.close()}><SafeImage key={current.src} src={current.src} alt={current.alt} /></button>}</div>
      <div className="lightbox-controls"><button className="interface-button" type="button" disabled={active === null || active === 0} onClick={() => onChange(active! - 1)}>上一张</button><div className="lightbox-center"><button className="lightbox-original-size interface-button" type="button" onClick={() => setZoomed(!zoomed)} aria-pressed={zoomed}>{zoomed ? '适应屏幕' : '原尺寸查看'}</button></div><button className="interface-button" type="button" disabled={active === null || active === images.length - 1} onClick={() => onChange(active! + 1)}>下一张</button></div>
    </dialog>
  </>;
}

