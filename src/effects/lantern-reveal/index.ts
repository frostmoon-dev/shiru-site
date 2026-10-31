import type { EffectFactory } from '../types';

/**
 * Lantern reveal: something hidden in the dark is uncovered only where the light falls.
 * Mouse: the light follows the cursor, a beat too slowly. Touch: it drifts on its own.
 * Reduced motion: the light stays still (the CSS default position).
 *
 * The element's CSS reads --lx / --ly (percentages) in its mask. See .hero__portrait.
 */
const lantern: EffectFactory = () => {
  let el: HTMLElement | undefined;
  let raf = 0;
  const cur = { x: 58, y: 34 };
  const target = { x: 58, y: 34 };

  const tick = () => {
    if (!el) return;
    cur.x += (target.x - cur.x) * 0.045;
    cur.y += (target.y - cur.y) * 0.045;
    el.style.setProperty('--lx', `${cur.x.toFixed(2)}%`);
    el.style.setProperty('--ly', `${cur.y.toFixed(2)}%`);
    raf = Math.abs(target.x - cur.x) + Math.abs(target.y - cur.y) > 0.1 ? requestAnimationFrame(tick) : 0;
  };
  const onMove = (e: PointerEvent) => {
    if (!el || e.pointerType !== 'mouse') return;
    const r = el.getBoundingClientRect();
    if (r.bottom < 0) return;
    target.x = Math.min(Math.max(((e.clientX - r.left) / r.width) * 100, -10), 110);
    target.y = Math.min(Math.max(((e.clientY - r.top) / r.height) * 100, -10), 110);
    if (!raf) raf = requestAnimationFrame(tick);
  };

  return {
    name: 'lantern-reveal',
    mount(target, _opts, env) {
      el = target;
      if (env.coarsePointer) {
        target.classList.add('is-drifting');
        return;
      }
      window.addEventListener('pointermove', onMove, { passive: true });
    },
    unmount() {
      cancelAnimationFrame(raf);
      raf = 0;
      window.removeEventListener('pointermove', onMove);
      el?.classList.remove('is-drifting');
      el?.style.removeProperty('--lx');
      el?.style.removeProperty('--ly');
      el = undefined;
    },
    pause() {
      el?.style.setProperty('animation-play-state', 'paused');
    },
    resume() {
      el?.style.removeProperty('animation-play-state');
    },
  };
};
export default lantern;
