import type { Effect, EffectFactory } from '../types';
import { whenIdle } from '../_shared/idle';

/**
 * Ink edge loader. Desktop: the WebGL shader (three.js is fetched only now, after idle).
 * Phones / low-power: the inline SVG drips keep their slow CSS breathing instead, so three.js
 * never loads on first view there. Reduced motion: the SVG, frozen.
 */
const inkEdge: EffectFactory = () => {
  let inner: Effect | undefined;
  let cancelled = false;
  return {
    name: 'ink-edge',
    async mount(el, opts, env) {
      cancelled = false;
      if (env.small || env.lowPower) return;
      await whenIdle();
      if (cancelled) return;
      try {
        const mod = await import('./shader');
        if (cancelled) return;
        inner = mod.default();
        await inner.mount(el, opts, env);
      } catch {
        // No WebGL: the animated SVG drips stay on.
        inner?.unmount();
        inner = undefined;
      }
    },
    unmount() {
      cancelled = true;
      inner?.unmount();
      inner = undefined;
    },
    reducedMotion(el) {
      el.dataset.static = 'true';
    },
  };
};
export default inkEdge;
