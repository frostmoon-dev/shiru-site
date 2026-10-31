import type { EffectFactory } from '../types';

/**
 * Every link bleeds the same way (consistency heuristic): on hover or keyboard focus, two or
 * three drops run from the underline and fall. The blot itself is CSS (a:hover text-shadow),
 * so reduced-motion visitors still get the colour change without moving drips.
 */
const SELECTOR = 'a[href]:not(.btn):not([data-no-bleed])';

const linkBleed: EffectFactory = () => {
  const cooling = new WeakSet<Element>();
  const onEnter = (e: Event) => {
    const link = (e.target as Element | null)?.closest?.(SELECTOR) as HTMLAnchorElement | null;
    if (!link || cooling.has(link)) return;
    cooling.add(link);
    window.setTimeout(() => cooling.delete(link), 1400);
    bleed(link);
  };
  return {
    name: 'link-bleed',
    mount() {
      document.addEventListener('pointerover', onEnter, { passive: true });
      document.addEventListener('focusin', onEnter);
    },
    unmount() {
      document.removeEventListener('pointerover', onEnter);
      document.removeEventListener('focusin', onEnter);
    },
  };
};

function bleed(link: HTMLAnchorElement) {
  const rects = link.getClientRects();
  const last = rects[rects.length - 1];
  if (!last) return;
  const host = document.createElement('span');
  host.className = 'link-drips';
  host.setAttribute('aria-hidden', 'true');
  const box = link.getBoundingClientRect();
  Object.assign(host.style, {
    position: 'absolute',
    left: `${last.left - box.left}px`,
    top: `${last.bottom - box.top - 2}px`,
    width: `${last.width}px`,
    height: '0',
    pointerEvents: 'none',
    overflow: 'visible',
  });
  if (getComputedStyle(link).position === 'static') link.style.position = 'relative';
  const n = 2 + Math.round(Math.random());
  for (let i = 0; i < n; i++) {
    const drop = document.createElement('span');
    const w = 2 + Math.random() * 2.5;
    Object.assign(drop.style, {
      position: 'absolute',
      left: `${10 + Math.random() * 80}%`,
      top: '0',
      width: `${w}px`,
      height: `${8 + Math.random() * 10}px`,
      borderRadius: `0 0 ${w}px ${w}px`,
      background: 'var(--drip, var(--blood))',
      transformOrigin: '50% 0',
    });
    host.appendChild(drop);
    const delay = i * 90 + Math.random() * 120;
    drop.animate(
      [
        { transform: 'scaleY(0)', opacity: 1 },
        { transform: 'scaleY(1)', opacity: 1, offset: 0.45 },
        { transform: 'translateY(14px) scaleY(.6)', opacity: 0 },
      ],
      { duration: 1100, delay, easing: 'cubic-bezier(.55,0,.9,.4)', fill: 'both' },
    );
  }
  link.appendChild(host);
  window.setTimeout(() => host.remove(), 1500);
}

export default linkBleed;
