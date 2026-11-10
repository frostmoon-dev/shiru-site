import type { EffectEnv, EffectFactory } from '../types';

/**
 * Marginalia: handwriting in the margins that the paper keeps to itself.
 *
 * Mouse / trackpad: a note is only legible where the cursor's light (see lumos) falls on it.
 * The light's position is handed to CSS as --mx / --my and used as the centre of a radial mask.
 * Touch: there is no light to carry, so each note surfaces for a few seconds as it is scrolled
 * into the middle of the screen, then sinks back into the paper.
 * Reduced motion: with a mouse it behaves the same (nothing moves on its own); on touch the
 * notes are simply there, faint.
 *
 *   <span class="margin-note" data-effect="marginalia" data-note="…"></span>
 */
const SURFACE_MS = 5200;

const marginalia: EffectFactory = () => {
  let el: HTMLElement | undefined;
  let io: IntersectionObserver | undefined;
  let raf = 0;
  let timer = 0;
  let onScreen = false;
  const p = { x: -9999, y: -9999 };

  const paint = () => {
    raf = 0;
    if (!el || !onScreen) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${(p.x - r.left).toFixed(1)}px`);
    el.style.setProperty('--my', `${(p.y - r.top).toFixed(1)}px`);
  };
  const queue = () => {
    if (!raf && onScreen) raf = requestAnimationFrame(paint);
  };
  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    p.x = e.clientX;
    p.y = e.clientY;
    queue();
  };
  const onLeave = () => {
    p.x = p.y = -9999;
    queue();
  };

  const build = (target: HTMLElement, env: EffectEnv, reduced: boolean) => {
    el = target;
    if (env.coarsePointer) {
      if (reduced) {
        target.classList.add('is-faint');
        return;
      }
      // surfaces once each time it comes to the middle of the screen
      io = new IntersectionObserver(
        ([entry]) => {
          if (!entry?.isIntersecting || !el) return;
          window.clearTimeout(timer);
          el.classList.add('is-surfacing');
          timer = window.setTimeout(() => el?.classList.remove('is-surfacing'), SURFACE_MS);
        },
        { rootMargin: '-25% 0px -25% 0px', threshold: 0.6 },
      );
      io.observe(target);
      return;
    }
    target.classList.add('is-lightsensitive');
    io = new IntersectionObserver(([entry]) => {
      onScreen = !!entry?.isIntersecting;
    });
    io.observe(target);
    window.addEventListener('pointermove', onMove, { passive: true });
    // the page moves under a still cursor too
    window.addEventListener('scroll', queue, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeave);
  };

  return {
    name: 'marginalia',
    mount(target, _opts, env) {
      build(target, env, false);
    },
    reducedMotion(target, _opts, env) {
      build(target, env, true);
    },
    unmount() {
      cancelAnimationFrame(raf);
      raf = 0;
      window.clearTimeout(timer);
      io?.disconnect();
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('scroll', queue);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      el?.classList.remove('is-lightsensitive', 'is-surfacing', 'is-faint');
      el = io = undefined;
    },
  };
};
export default marginalia;
