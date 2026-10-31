import type { Effect, EffectFactory } from '../types';
import { whenIdle } from '../_shared/idle';

/**
 * Falling rose petals. Desktop: instanced WebGL petals (three.js loaded after idle).
 * Phones / low-power: a dozen CSS petals, no WebGL. Reduced motion: none.
 */
function cssPetals(el: HTMLElement, count: number) {
  const layer = document.createElement('div');
  layer.className = 'css-petals';
  layer.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < count; i++) {
    const p = document.createElement('span');
    const size = 8 + Math.random() * 10;
    p.style.cssText = `left:${Math.random() * 100}%;width:${size}px;height:${size * 1.25}px;animation-duration:${9 + Math.random() * 9}s,${2 + Math.random() * 3}s;animation-delay:${-Math.random() * 18}s,${-Math.random() * 3}s;opacity:${0.55 + Math.random() * 0.4}`;
    layer.appendChild(p);
  }
  el.appendChild(layer);
  return layer;
}

const petals: EffectFactory = () => {
  let inner: Effect | undefined;
  let layer: HTMLElement | undefined;
  let cancelled = false;
  return {
    name: 'petals-webgl',
    async mount(el, opts, env) {
      cancelled = false;
      if (env.small || env.lowPower) {
        layer = cssPetals(el, env.lowPower ? 8 : 14);
        return;
      }
      await whenIdle();
      if (cancelled) return;
      try {
        const mod = await import('./webgl');
        if (cancelled) return;
        inner = mod.default();
        await inner.mount(el, opts, env);
      } catch {
        // No WebGL: fall back to the CSS petals.
        inner?.unmount();
        inner = undefined;
        layer = cssPetals(el, 14);
      }
    },
    unmount() {
      cancelled = true;
      inner?.unmount();
      inner = undefined;
      layer?.remove();
      layer = undefined;
    },
    pause() {
      layer?.style.setProperty('--play', 'paused');
    },
    resume() {
      layer?.style.removeProperty('--play');
    },
  };
};
export default petals;
