import type { EffectFactory } from '../types';
import { gsap, lockScroll } from '../../lib/motion';

/**
 * The intro: a candle in the dark, an AHS-style burst of photos, then the hero.
 * ≤ 3 s, skippable (button or Esc), once per session.
 *
 * Photosensitivity (owner-approved exception): the burst cuts faster than 3/s, in AHS style.
 * Mitigations kept: frames are luminance-matched dark sepia (no bright/white frames), no red
 * flashes, frames cover ~60% of the viewport, and reduced motion / save-data skip the burst.
 */
const SEEN = 'shiru:intro-seen';

const introEffect: EffectFactory = () => {
  let tl: gsap.core.Timeline | undefined;
  let el: HTMLElement | undefined;
  let done = false;
  let cap = 0;
  let onKey: ((e: KeyboardEvent) => void) | undefined;

  const finish = () => {
    if (done || !el) return;
    done = true;
    tl?.kill();
    try {
      sessionStorage.setItem(SEEN, '1');
    } catch {
      /* ignore */
    }
    window.clearTimeout(cap);
    const node = el;
    node.querySelector<HTMLElement>('.intro__frames')?.style.setProperty('visibility', 'hidden');
    // CSS transition (compositor) rather than a tween, so a busy main thread can't stretch it.
    node.style.transition = 'opacity 300ms ease-out';
    node.style.opacity = '0';
    window.setTimeout(() => {
      document.documentElement.classList.remove('intro-pending');
      node.style.opacity = '';
      node.style.transition = '';
      lockScroll(false);
      window.dispatchEvent(new Event('shiru:intro-done'));
      document.getElementById('main')?.focus({ preventScroll: true });
    }, 300);
    if (onKey) document.removeEventListener('keydown', onKey);
  };

  const start = (target: HTMLElement, burst: boolean) => {
    el = target;
    if (!document.documentElement.classList.contains('intro-pending')) return false;
    window.clearTimeout(window.__introFailsafe);
    // Hard cap: whatever the device does, the intro is over 2.7 s after it starts (+0.3 s fade).
    cap = window.setTimeout(finish, 2700);
    lockScroll(true);
    const skip = target.querySelector<HTMLButtonElement>('[data-intro-skip]');
    skip?.addEventListener('click', finish, { once: true });
    skip?.focus({ preventScroll: true });
    onKey = (e) => e.key === 'Escape' && finish();
    document.addEventListener('keydown', onKey);
    // Spent too long loading? Skip straight to the end so the whole thing stays under 3 s.
    const late = performance.now() > 1800;
    return burst && !late;
  };

  return {
    name: 'intro',
    mount(target, _opts, env) {
      const burst = start(target, !env.saveData);
      if (!document.documentElement.classList.contains('intro-pending')) return;
      const canvas = target.querySelector<HTMLCanvasElement>('.intro__frames');
      const urls: string[] = canvas ? JSON.parse(canvas.dataset.frames ?? '[]') : [];
      const g = canvas?.getContext('2d');
      const flame = target.querySelector('.intro__flame');
      const progress = target.querySelector<HTMLElement>('[data-intro-progress]');
      const candle = target.querySelector('.intro__candle');

      // TV static: a 320×180 canvas of grey snow, scaled up, with a slow rolling bar.
      const staticCanvas = target.querySelector<HTMLCanvasElement>('.intro__static');
      const sctx = staticCanvas?.getContext('2d');
      let staticRaf = 0;
      const snow = sctx ? sctx.createImageData(320, 180) : undefined;
      const drawStatic = (t: number) => {
        if (!sctx || !snow) return;
        const d = snow.data;
        const bar = ((t / 6) % 220) - 20;
        for (let y = 0; y < 180; y++) {
          const rowBoost = Math.abs(y - bar) < 8 ? 40 : 0;
          for (let x = 0; x < 320; x++) {
            const v = Math.min(255, (Math.random() * 170) | 0) + rowBoost;
            const i = (y * 320 + x) * 4;
            d[i] = d[i + 1] = d[i + 2] = v;
            d[i + 3] = 255;
          }
        }
        sctx.putImageData(snow, 0, 0);
      };
      const staticBurst = (seconds: number) => {
        if (!staticCanvas) return;
        const end = performance.now() + seconds * 1000;
        gsap.set(staticCanvas, { opacity: 0.32 });
        const loop = (now: number) => {
          drawStatic(now);
          if (now < end) staticRaf = requestAnimationFrame(loop);
          else gsap.set(staticCanvas, { opacity: 0 });
        };
        cancelAnimationFrame(staticRaf);
        staticRaf = requestAnimationFrame(loop);
      };

      tl = gsap.timeline({ onComplete: finish });
      tl.from([candle, target.querySelector('.intro__glow')], { opacity: 0, duration: 0.6, ease: 'power1.out' });

      if (burst) {
        // Fetch the frames now and pre-tone each one into its own bitmap during the candle beat,
        // so a flash is a single cheap drawImage. Frames that aren't ready in time are skipped.
        const canFilter = !!g && 'filter' in g;
        if (canFilter) canvas!.style.filter = 'none';
        let loaded = 0;
        const imgs = urls.map((url) => {
          const img = new Image();
          img.decoding = 'async';
          img.src = url;
          const toned = document.createElement('canvas');
          toned.width = canvas?.width ?? 420;
          toned.height = canvas?.height ?? 525;
          img
            .decode()
            .then(() => {
              const t = toned.getContext('2d');
              if (t) {
                // luminance-matched: every frame toned to the same dark sepia
                if (canFilter) t.filter = 'sepia(1) brightness(0.55) contrast(1.1)';
                t.drawImage(img, 0, 0, toned.width, toned.height);
                toned.dataset.ready = '1';
              }
              loaded++;
              if (progress) progress.textContent = `${Math.round((loaded / urls.length) * 100)}%`;
            })
            .catch(() => undefined);
          return toned;
        });
        // Each photo stays up for exactly 3 rendered frames, however janky the device is.
        const flash = (img: HTMLCanvasElement) => {
          if (!g || !canvas || !img.dataset.ready) return;
          g.drawImage(img, 0, 0);
          const jx = (Math.random() - 0.5) * 24;
          gsap.set(canvas, { visibility: 'visible', x: jx, skewX: (Math.random() - 0.5) * 6, rotate: (Math.random() - 0.5) * 5 });
          gsap.set(candle, { opacity: 0.35 });
          let n = 0;
          const step = () => {
            n++;
            if (n === 2) gsap.set(canvas, { x: -jx * 0.4, skewX: 0 });
            if (n < 3) requestAnimationFrame(step);
            else {
              gsap.set(canvas, { visibility: 'hidden' });
              gsap.to(candle, { opacity: 1, duration: 0.12 });
            }
          };
          requestAnimationFrame(step);
        };
        tl.call(staticBurst, [0.28], 0.55);
        imgs.forEach((img, i) => {
          tl!.call(flash, [img], 0.85 + i * 0.24);
          if (i % 2 === 1) tl!.call(staticBurst, [0.07], 0.85 + i * 0.24 + 0.12);
        });
        tl.call(staticBurst, [0.2], 1.95);
      }
      // The candle goes out.
      tl.to(flame, { scaleY: 0, opacity: 0, transformOrigin: '60px 88px', duration: 0.3, ease: 'power2.in' }, burst ? 2.05 : 1.1)
        .to(target.querySelector('.intro__glow'), { opacity: 0, duration: 0.3 }, '<');
    },
    unmount() {
      tl?.kill();
      if (onKey) document.removeEventListener('keydown', onKey);
    },
    reducedMotion(target) {
      // No flashes, no jitter: a still candle for a moment, then a plain fade.
      if (!start(target, false) && !document.documentElement.classList.contains('intro-pending')) return;
      window.setTimeout(finish, 1200);
    },
  };
};
export default introEffect;
