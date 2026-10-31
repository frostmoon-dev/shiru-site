import type { EffectFactory } from '../types';

/**
 * A silent, looping background video that only exists while you're near it.
 * Markup: <video data-effect="ambient-video" data-src="/media/x.mp4" muted loop playsinline poster="…">
 * The file isn't requested until the element nears the viewport, and it's dropped again when
 * far away. Reduced motion and save-data keep the poster frame only.
 */
const ambientVideo: EffectFactory = () => {
  let video: HTMLVideoElement | undefined;
  return {
    name: 'ambient-video',
    mount(el, _opts, env) {
      // not shown (e.g. display:none on phones) or saving data: never download it
      if (!(el instanceof HTMLVideoElement) || env.saveData || el.offsetParent === null) return;
      video = el;
      const src = el.dataset.src;
      if (!src) return;
      el.muted = true;
      el.src = src;
      void el.play().catch(() => {
        /* autoplay refused (e.g. low-power mode): the poster stays, which is fine */
      });
      el.classList.add('is-playing');
    },
    unmount() {
      if (!video) return;
      video.pause();
      video.removeAttribute('src');
      video.load(); // release the decoder and buffered data
      video.classList.remove('is-playing');
      video = undefined;
    },
    pause() {
      video?.pause();
    },
    resume() {
      void video?.play().catch(() => undefined);
    },
  };
};
export default ambientVideo;
