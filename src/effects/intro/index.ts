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
    const node = el;
    gsap.to(node, {
      opacity: 0,
      duration: 0.35,
      ease: 'power1.out',
      onComplete: () => {
        document.documentElement.classList.remove('intro-pending');
        node.style.opacity = '';
        lockScroll(false);
        window.dispatchEvent(new Event('shiru:intro-done'));
        document.getElementById('main')?.focus({ preventScroll: true });
      },
    });
    if (onKey) document.removeEventListener('keydown', onKey);
  };

  const start = (target: HTMLElement, burst: boolean) => {
    el = target;
    if (!document.documentElement.classList.contains('intro-pending')) return false;
    window.clearTimeout(window.__introFailsafe);
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
      const frames = [...target.querySelectorAll<HTMLElement>('.intro__frame')];
      const flame = target.querySelector('.intro__flame');
      const progress = target.querySelector<HTMLElement>('[data-intro-progress]');
      const candle = target.querySelector('.intro__candle');

      tl = gsap.timeline({ onComplete: finish });
      tl.from([candle, target.querySelector('.intro__glow')], { opacity: 0, duration: 0.6, ease: 'power1.out' });

      if (burst) {
        // Start fetching the frames now; show whichever have arrived.
        const imgs = frames.map((f) => f.querySelector('img')).filter((i): i is HTMLImageElement => !!i);
        imgs.forEach((i) => (i.loading = 'eager'));
        let loaded = 0;
        imgs.forEach((i) =>
          i
            .decode()
            .catch(() => undefined)
            .then(() => {
              loaded++;
              if (progress) progress.textContent = `${Math.round((loaded / imgs.length) * 100)}%`;
            }),
        );
        const frameDur = 0.05; // ~3 frames at 60 Hz
        tl.addLabel('burst', 0.95);
        frames.forEach((f, i) => {
          const at = 0.95 + i * 0.26;
          const jx = (Math.random() - 0.5) * 24;
          const sk = (Math.random() - 0.5) * 6;
          tl!
            .set(f, { visibility: 'visible', x: jx, skewX: sk, rotate: (Math.random() - 0.5) * 5 }, at)
            .set(f, { x: -jx * 0.4, skewX: 0 }, at + frameDur * 0.5)
            .set(f, { visibility: 'hidden' }, at + frameDur);
          tl!.to(candle, { opacity: 0.35, duration: 0.03 }, at).to(candle, { opacity: 1, duration: 0.12 }, at + frameDur);
        });
      }
      // The candle goes out.
      tl.to(flame, { scaleY: 0, opacity: 0, transformOrigin: '60px 88px', duration: 0.35, ease: 'power2.in' }, burst ? 2.3 : 1.2)
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
