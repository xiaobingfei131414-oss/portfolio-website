type SeekableVideo = Pick<HTMLVideoElement, 'duration' | 'currentTime' | 'seeking'>;

export function createScrubber(video: SeekableVideo) {
  let previousX: number | null = null;
  let targetTime = Number.isFinite(video.currentTime) ? video.currentTime : 0;
  const ready = () => Number.isFinite(video.duration) && video.duration > 0;

  function seek() {
    if (!ready() || video.seeking || Math.abs(video.currentTime - targetTime) < 0.01) return;
    video.currentTime = targetTime;
  }

  return {
    move(x: number, width: number) {
      const delta = previousX === null ? 0 : x - previousX;
      previousX = Number.isFinite(x) ? x : null;
      if (!ready() || !Number.isFinite(delta) || !Number.isFinite(width) || width <= 0) return;
      targetTime = Math.min(video.duration, Math.max(0, targetTime + delta / width * 0.8 * video.duration));
      seek();
    },
    setProgress(value: number) {
      if (!ready() || !Number.isFinite(value)) return;
      targetTime = Math.min(1, Math.max(0, value)) * video.duration;
      seek();
    },
    resetPointer() { previousX = null; },
    seeked: seek,
  };
}
