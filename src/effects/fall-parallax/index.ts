import type { EffectFactory } from '../types';
import { gsap, ScrollTrigger } from '../../lib/motion';

/**
 * The rabbit-hole fall. Children with data-depth="-1…1" drift past at different speeds and
 * tumble; [data-fall-zoom] grows from a little smaller as you fall in; [data-floor] tilts up.
 * Static fallback: everything stays where the CSS put it.
 */
const fallParallax: EffectFactory = () => {
  let ctx: gsap.Context | undefined;
  return {
    name: 'fall-parallax',
    mount(el, _opts, env) {
      ctx = gsap.context(() => {
        const travel = env.small ? 0.35 : 0.6;
        el.querySelectorAll<HTMLElement>('[data-depth]').forEach((item) => {
          const depth = Number(item.dataset.depth) || 0;
          const spin = Number(item.dataset.spin ?? 0);
          gsap.fromTo(
            item,
            { yPercent: 0, y: depth * window.innerHeight * travel, rotate: -spin },
            {
              y: -depth * window.innerHeight * travel,
              rotate: spin,
              ease: 'none',
              scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
            },
          );
        });
        el.querySelectorAll<HTMLElement>('[data-fall-zoom]').forEach((item) => {
          gsap.fromTo(
            item,
            { scale: 0.9, transformOrigin: '50% 0%' },
            { scale: 1, ease: 'power1.out', scrollTrigger: { trigger: el, start: 'top 85%', end: 'top 15%', scrub: 0.4 } },
          );
        });
        el.querySelectorAll<HTMLElement>('[data-floor]').forEach((floor) => {
          gsap.fromTo(
            floor,
            { rotateX: 82 },
            { rotateX: 64, ease: 'none', scrollTrigger: { trigger: floor, start: 'top bottom', end: 'bottom bottom', scrub: true } },
          );
        });
      }, el);
      ScrollTrigger.refresh();
    },
    unmount() {
      ctx?.revert();
      ctx = undefined;
    },
  };
};
export default fallParallax;
