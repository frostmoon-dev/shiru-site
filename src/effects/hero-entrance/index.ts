import type { EffectFactory } from '../types';
import { gsap } from '../../lib/motion';

/**
 * The hero arrives after the intro: the name sharpens out of a blur, the newspaper slides in
 * from its corner, the hand rises from below, the tagline surfaces,
 * and the eye (the menu) opens with "Navigate.". The lines type themselves
 * (typewriter effect) and "keeps me awake" glitches (CSS) on their own.
 *
 * Elements marked [data-enter] are hidden by CSS until this runs (with an 8 s CSS fail-safe).
 * The name is never hidden, only blurred, so it still counts as painted for LCP.
 * Reduced motion: everything simply appears.
 */
const heroEntrance: EffectFactory = () => {
  let tl: gsap.core.Timeline | undefined;
  let waiting: (() => void) | undefined;
  let root: HTMLElement | undefined;

  const show = (el: HTMLElement) => {
    document.documentElement.classList.add('hero-entered');
    el.querySelectorAll<HTMLElement>('[data-enter]').forEach((n) => (n.style.opacity = ''));
  };

  return {
    name: 'hero-entrance',
    mount(el) {
      root = el;
      const run = () => {
        const q = (s: string) => document.querySelector<HTMLElement>(s);
        document.documentElement.classList.add('hero-entered');
        tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
        const name = el.querySelector('.hero__title');
        if (name) tl.fromTo(name, { filter: 'blur(14px)', letterSpacing: '0.12em' }, { filter: 'blur(0px)', letterSpacing: '0.01em', duration: 1.8, ease: 'power2.out', clearProps: 'filter,letterSpacing' }, 0);
        // Text is uncovered with a wipe rather than faded, so it is never half-transparent
        // (low-contrast) at any moment: each letter is either hidden or at full strength.
        const wipe = { clipPath: 'inset(-10% 100% -10% 0)' };
        const wiped = { clipPath: 'inset(-10% 0% -10% 0)', clearProps: 'clipPath,transform' };
        tl.fromTo(el.querySelector('.hero__kicker'), { ...wipe, y: -8 }, { ...wiped, y: 0, duration: 0.9, ease: 'power2.inOut' }, 0.2)
          .fromTo(
            el.querySelector('.hero__newspaper'),
            { x: 0, y: 0, xPercent: 35, yPercent: -35, rotate: 8 },
            { xPercent: 0, yPercent: 0, rotate: 0, duration: 1.4, clearProps: 'transform' },
            0.1,
          )
          .from(el.querySelector('.hero__hand'), { yPercent: 60, opacity: 0, duration: 2.2, ease: 'power2.out' }, 0.6)
          .fromTo(el.querySelector('.hero__tagline'), { ...wipe, y: 10 }, { ...wiped, y: 0, duration: 1.1, ease: 'power2.inOut' }, 1.3)
          .fromTo(el.querySelector('.hero__cta'), { ...wipe }, { ...wiped, duration: 0.8, ease: 'power2.inOut' }, 1.9);
        const menu = q('.dock__btn');
        if (menu && document.documentElement.classList.contains('at-hero'))
          tl.from(menu.querySelector('.dock__eye'), { scaleY: 0.05, opacity: 0, duration: 0.7, ease: 'power3.out', clearProps: 'transform,opacity' }, 1.6).fromTo(
            menu.querySelector('.dock__label'),
            { ...wipe },
            { ...wiped, duration: 0.6, ease: 'power2.inOut' },
            2,
          );
        tl.eventCallback('onComplete', () => show(el));
      };
      if (document.documentElement.classList.contains('intro-pending')) {
        waiting = run;
        window.addEventListener('site:intro-done', run, { once: true });
      } else run();
    },
    unmount() {
      if (waiting) window.removeEventListener('site:intro-done', waiting);
      waiting = undefined;
      tl?.progress(1).kill();
      if (root) show(root);
      root = undefined;
    },
    reducedMotion(el) {
      show(el);
    },
  };
};
export default heroEntrance;
