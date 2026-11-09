import type { EffectFactory } from '../types';
import { gsap, lockScroll } from '../../lib/motion';

/**
 * The intro: roses open in two corners, a butterfly flutters in along a wandering curve, settles
 * in the middle with a few slow wing beats, then lifts away past the roses as the page opens onto
 * the hero. ≤ 3 s, skippable (button or Esc), once per session. No flashes.
 * Reduced motion: the butterfly resting among the roses for a moment, then a plain fade.
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
      // the wing beats are loose tweens (not on the timeline): stop them with the intro
      gsap.killTweensOf(node.querySelectorAll('.intro__wings, .intro__fly'));
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
      const fly = target.querySelector<HTMLElement>('.intro__fly');
      const wings = target.querySelector<HTMLElement>('.intro__wings');
      const roses = target.querySelectorAll<HTMLElement>('.intro__roses');
      const s = full ? 1 : 0.6; // arrived late: the same flight, quicker
      const w = window.innerWidth;
      const h = window.innerHeight;

      tl = gsap.timeline({ onComplete: finish });
      // the roses open in their corners
      tl.from(roses, { scale: 0.35, rotate: '-=18', opacity: 0, filter: 'blur(6px)', duration: 0.9 * s, ease: 'back.out(1.4)', stagger: 0.18 * s }, 0);
      // wings beat fast while it flies (scaleX folds them shut and open again, seen from above)
      const beat = gsap.to(wings, { scaleX: 0.18, duration: 0.09, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      tl.add(() => beat.kill(), 1.25 * s);
      // in from the lower left along a loose, wandering curve, banking into each turn
      tl.fromTo(
        fly,
        { x: -0.62 * w, y: 0.42 * h, rotate: -28, scale: 0.55, opacity: 0 },
        {
          keyframes: [
            { x: -0.34 * w, y: 0.08 * h, rotate: -12, scale: 0.75, opacity: 1, duration: 0.45 * s, ease: 'sine.out' },
            { x: -0.12 * w, y: 0.16 * h, rotate: 14, scale: 0.88, duration: 0.4 * s, ease: 'sine.inOut' },
            { x: 0, y: 0, rotate: 0, scale: 1, duration: 0.4 * s, ease: 'power2.out' },
          ],
        },
        0.1 * s,
      )
        // settled: two slow beats, the way they do when they land
        .fromTo(wings, { scaleX: 1 }, { scaleX: 0.35, duration: 0.2 * s, ease: 'sine.inOut', yoyo: true, repeat: 3 }, 1.25 * s)
        // and away, up past the far roses, as the page opens
        .add(() => {
          gsap.to(wings, { scaleX: 0.18, duration: 0.08, ease: 'sine.inOut', yoyo: true, repeat: -1 });
        }, 2.05 * s)
        .to(fly, { x: 0.5 * w, y: -0.55 * h, rotate: 24, scale: 0.6, duration: 0.5 * s, ease: 'power2.in' }, 2.05 * s);
    },
    unmount() {
      tl?.kill();
      if (el) gsap.killTweensOf(el.querySelectorAll('.intro__wings, .intro__fly'));
      if (onKey) document.removeEventListener('keydown', onKey);
    },
    reducedMotion(target) {
      // No motion: the butterfly at rest among the roses for a moment, then a plain fade.
      if (!start(target, false) && !document.documentElement.classList.contains('intro-pending')) return;
      window.setTimeout(finish, 1200);
    },
  };
};
export default introEffect;
