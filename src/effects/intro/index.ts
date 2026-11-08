import type { EffectFactory } from '../types';
import { gsap, lockScroll } from '../../lib/motion';

/**
 * The intro: the glasshouse at dusk. A gothic arched window is drawn line by line in olive ink,
 * the dusk fills its glass, the moon rises inside it, leaves climb from the sill, then the page
 * opens onto the hero. ≤ 3 s, skippable (button or Esc), once per session. No flashes.
 * Reduced motion: the finished drawing for a moment, then a plain fade.
 */
const SEEN = 'site:intro-seen';

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
    // CSS transition (compositor) rather than a tween, so a busy main thread can't stretch it.
    node.style.transition = 'opacity 300ms ease-out';
    node.style.opacity = '0';
    window.setTimeout(() => {
      document.documentElement.classList.remove('intro-pending');
      node.style.opacity = '';
      node.style.transition = '';
      lockScroll(false);
      window.dispatchEvent(new Event('site:intro-done'));
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
      const full = start(target, !env.saveData);
      if (!document.documentElement.classList.contains('intro-pending')) return;
      const ink = [...target.querySelectorAll<SVGGeometryElement>('.intro__ink > *, .intro__leaves > *')];
      // each line starts undrawn: its dash is as long as the line, offset by all of it
      ink.forEach((p) => {
        const len = p.getTotalLength();
        gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
      });
      const frame = ink.filter((p) => p.closest('.intro__ink'));
      const leaves = ink.filter((p) => p.closest('.intro__leaves'));
      const speed = full ? 1 : 0.6; // arrived late: the same drawing, quicker
      tl = gsap.timeline({ onComplete: finish, defaults: { ease: 'power2.inOut' } });
      tl.to(frame, { strokeDashoffset: 0, duration: 1.1 * speed, stagger: 0.06 * speed }, 0)
        .fromTo(target.querySelector('.intro__dusk'), { opacity: 0 }, { opacity: 1, duration: 0.9 * speed, ease: 'power1.out' }, 0.35 * speed)
        .fromTo(target.querySelector('.intro__moon'), { y: 230, opacity: 0.4 }, { y: 0, opacity: 1, duration: 1.3 * speed, ease: 'power2.out' }, 0.5 * speed)
        .to(leaves, { strokeDashoffset: 0, duration: 0.8 * speed, stagger: 0.07 * speed }, 1.0 * speed)
        // a breath at the finished drawing before the page opens
        .to({}, { duration: 0.35 * speed });
    },
    unmount() {
      tl?.kill();
      if (onKey) document.removeEventListener('keydown', onKey);
    },
    reducedMotion(target) {
      // No motion: the finished drawing for a moment, then a plain fade.
      if (!start(target, false) && !document.documentElement.classList.contains('intro-pending')) return;
      window.setTimeout(finish, 1200);
    },
  };
};
export default introEffect;
