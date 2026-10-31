import type { EffectFactory } from '../types';

/**
 * Lantern reveal: what is hidden in the dark is uncovered only where the light falls.
 * Mouse: the light sits under the Lumos cursor. Touch: it drifts on its own.
 * Reduced motion: the light stays still (the CSS default position).
 *
 * The element's CSS reads --lx / --ly (percentages of the element) in its mask.
 * Children marked [data-watch] slowly turn to look at the light, a beat too late.
 */
const lantern: EffectFactory = () => {
  let el: HTMLElement | undefined;
  let raf = 0;
  let watchers: { node: HTMLElement; base: string; turn: number; shift: number }[] = [];
  const cur = { x: 62, y: 34 };
  const target = { x: 62, y: 34 };
  const pointer = { x: 0, y: 0 };

  const tick = () => {
    if (!el) return;
    cur.x += (target.x - cur.x) * 0.22;
    cur.y += (target.y - cur.y) * 0.22;
    el.style.setProperty('--lx', `${cur.x.toFixed(2)}%`);
    el.style.setProperty('--ly', `${cur.y.toFixed(2)}%`);
    let moving = Math.abs(target.x - cur.x) + Math.abs(target.y - cur.y) > 0.05;
    for (const w of watchers) {
      const r = w.node.getBoundingClientRect();
      const dx = pointer.x - (r.left + r.width / 2);
      const dy = pointer.y - (r.top + r.height / 2);
      const want = Math.max(-1, Math.min(1, dx / 600));
      w.turn += (want - w.turn) * 0.03; // very slowly
      w.shift += (Math.max(-1, Math.min(1, dy / 600)) - w.shift) * 0.03;
      w.node.style.transform = `${w.base} translate(${(w.turn * 6).toFixed(2)}px, ${(w.shift * 4).toFixed(2)}px) rotate(${(w.turn * 14).toFixed(2)}deg)`;
      if (Math.abs(want - w.turn) > 0.002) moving = true;
    }
    raf = moving ? requestAnimationFrame(tick) : 0;
  };
  const onMove = (e: PointerEvent) => {
    if (!el || e.pointerType !== 'mouse') return;
    const r = el.getBoundingClientRect();
    if (r.bottom < 0) return;
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    target.x = ((e.clientX - r.left) / r.width) * 100;
    target.y = ((e.clientY - r.top) / r.height) * 100;
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
      watchers = [...target.querySelectorAll<HTMLElement>('[data-watch]')].map((node) => ({
        node,
        base: getComputedStyle(node).transform === 'none' ? '' : getComputedStyle(node).transform,
        turn: 0,
        shift: 0,
      }));
      window.addEventListener('pointermove', onMove, { passive: true });
    },
    unmount() {
      cancelAnimationFrame(raf);
      raf = 0;
      window.removeEventListener('pointermove', onMove);
      watchers.forEach((w) => (w.node.style.transform = ''));
      watchers = [];
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
