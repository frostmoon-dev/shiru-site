import type { EffectFactory } from '../types';
import { gsap } from '../../lib/motion';

/**
 * The hero arrives after the intro: the name sharpens out of a blur, the newspaper slides in
 * from its corner, the bow drops onto it, the hand rises from below, the tagline surfaces,
 * and the hamster (the menu) peeks up with "Navigate.". The lines type themselves
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
        tl.from(el.querySelector('.hero__kicker'), { opacity: 0, y: -8, duration: 0.8 }, 0.2)
          .from(el.querySelector('.hero__newspaper'), { xPercent: 35, yPercent: -35, rotate: 8, opacity: 0, duration: 1.4 }, 0.1)
          .from(el.querySelector('.hero__bow'), { y: -120, rotate: -25, opacity: 0, duration: 1.1, ease: 'back.out(1.5)' }, 0.9)
          .from(el.querySelector('.hero__hand'), { yPercent: 60, opacity: 0, duration: 2.2, ease: 'power2.out' }, 0.6)
          .from(el.querySelector('.hero__tagline'), { y: 14, opacity: 0, duration: 1 }, 1.3);
        const menu = q('.menu-btn');
        if (menu && document.documentElement.classList.contains('at-hero'))
          tl.from(menu.querySelector('.menu-btn__pet'), { y: 40, scale: 0.7, opacity: 0, duration: 0.9, ease: 'back.out(1.8)' }, 1.6).from(
            menu.querySelector('.menu-btn__label'),
            { opacity: 0, y: 6, duration: 0.6 },
            2,
          );
        tl.eventCallback('onComplete', () => show(el));
      };
      if (document.documentElement.classList.contains('intro-pending')) {
        waiting = run;
        window.addEventListener('shiru:intro-done', run, { once: true });
      } else run();
    },
    unmount() {
      if (waiting) window.removeEventListener('shiru:intro-done', waiting);
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
