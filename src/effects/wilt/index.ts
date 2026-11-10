import type { EffectFactory } from '../types';

/**
 * Wilt: flowers that lose their colour while you watch them.
 *
 * A few seconds after the element comes into view it starts, very slowly, to dry out: its colour
 * drains to the brown of a pressed flower (a CSS filter transition; see `.wilts` in global.css).
 * Look away and it is fresh again the next time you see it. With a mouse there is one more rule:
 * the cursor's light (see lumos) revives it, and it stays alive for as long as the light is near.
 *
 *   <span data-effect="wilt" data-effect-options='{"grace":8000}'> <img> </span>
 *
 * The filter goes on the element itself, so give it to a wrapper and keep any drop shadow on the
 * image inside (a filter without blur or shadow can be animated off the main thread).
 * Reduced motion: nothing happens; the flowers stay as they are.
 */
const NEAR = 90; // px around the element that count as "in the light"

const wilt: EffectFactory = () => {
  let el: HTMLElement | undefined;
  let io: IntersectionObserver | undefined;
  let grace = 8000;
  let timer = 0;
  let raf = 0;
  let visible = false;
  let lit = false;
  const p = { x: -9999, y: -9999 };

  const startWilting = (after: number) => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      el?.classList.remove('is-fresh');
      el?.classList.add('is-wilting');
    }, after);
  };
  const check = () => {
    raf = 0;
    if (!el || !visible) return;
    const r = el.getBoundingClientRect();
    const inLight = p.x > r.left - NEAR && p.x < r.right + NEAR && p.y > r.top - NEAR && p.y < r.bottom + NEAR;
    if (inLight === lit) return;
    lit = inLight;
    if (lit) {
      // the light is on it: it comes back, quickly
      window.clearTimeout(timer);
      el.classList.remove('is-wilting', 'is-fresh');
    } else {
      startWilting(1800);
    }
  };
  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    p.x = e.clientX;
    p.y = e.clientY;
    if (!raf && visible) raf = requestAnimationFrame(check);
  };

  return {
    name: 'wilt',
    mount(target, opts, env) {
      el = target;
      if (typeof opts.grace === 'number') grace = opts.grace;
      target.classList.add('wilts');
      io = new IntersectionObserver(
        ([entry]) => {
          visible = !!entry?.isIntersecting;
          if (!el) return;
          if (visible) {
            if (!lit) startWilting(grace);
          } else {
            // out of sight: fresh again at once, with no transition to watch
            window.clearTimeout(timer);
            lit = false;
            el.classList.remove('is-wilting');
            el.classList.add('is-fresh');
          }
        },
        { threshold: 0.25 },
      );
      io.observe(target);
      if (!env.coarsePointer) window.addEventListener('pointermove', onMove, { passive: true });
    },
    reducedMotion() {},
    unmount() {
      window.clearTimeout(timer);
      cancelAnimationFrame(raf);
      raf = 0;
      io?.disconnect();
      window.removeEventListener('pointermove', onMove);
      el?.classList.remove('wilts', 'is-wilting', 'is-fresh');
      el = io = undefined;
      visible = lit = false;
    },
  };
};
export default wilt;
