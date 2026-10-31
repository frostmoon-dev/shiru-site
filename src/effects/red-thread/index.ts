import type { EffectFactory } from '../types';
import { gsap, ScrollTrigger } from '../../lib/motion';

/**
 * The employment history's red thread. As the reader scrolls, the thread draws itself down the
 * page; when it reaches a job, that job's pin catches like a bad bulb, its string runs out to the
 * card, and the card's edge lights. The big ghost years drift a little slower than the page.
 *
 *   <div class="trail" data-effect="red-thread"> .trail__fill, .job, .job__year </div>
 *
 * Without JS, or with reduced motion, the thread is simply complete and every pin is lit.
 */
const redThread: EffectFactory = () => {
  let ctx: gsap.Context | undefined;
  let root: HTMLElement | undefined;

  return {
    name: 'red-thread',
    mount(el) {
      root = el;
      const fill = el.querySelector<HTMLElement>('.trail__fill');
      const jobs = [...el.querySelectorAll<HTMLElement>('.job')];
      el.classList.add('is-armed');
      ctx = gsap.context(() => {
        if (fill)
          gsap.fromTo(
            fill,
            { scaleY: 0 },
            { scaleY: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top 65%', end: 'bottom 65%', scrub: 0.4 } },
          );
        jobs.forEach((job) => {
          ScrollTrigger.create({
            trigger: job,
            start: 'top 65%',
            once: true,
            onEnter: () => job.classList.add('is-lit'),
          });
          const year = job.querySelector('.job__year');
          if (year)
            gsap.fromTo(
              year,
              { yPercent: 30 },
              { yPercent: -30, ease: 'none', scrollTrigger: { trigger: job, start: 'top bottom', end: 'bottom top', scrub: true } },
            );
        });
      }, el);
    },
    unmount() {
      ctx?.revert();
      ctx = undefined;
      root?.classList.remove('is-armed');
      root?.querySelectorAll('.job').forEach((j) => j.classList.add('is-lit'));
      root = undefined;
    },
    reducedMotion(el) {
      el.querySelectorAll('.job').forEach((j) => j.classList.add('is-lit'));
    },
  };
};
export default redThread;
