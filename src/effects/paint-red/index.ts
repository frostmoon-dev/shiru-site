import type { EffectFactory } from '../types';
import { gsap } from '../../lib/motion';

/**
 * "Painting the roses red": a red copy of the roses is wiped on over the white ones as the
 * chapter scrolls by, and wiped off again if you scroll back up.
 *
 *   <div data-effect="paint-red"> <img> <img class="…--red"> </div>
 *
 * Reduced motion: the roses are simply red.
 */
const paintRed: EffectFactory = () => {
  let ctx: gsap.Context | undefined;
  return {
    name: 'paint-red',
    mount(el) {
      const red = el.querySelector<HTMLElement>('[class*="--red"]');
      if (!red) return;
      ctx = gsap.context(() => {
        gsap.fromTo(
          red,
          { clipPath: 'inset(0% 100% 0% 0%)' },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            ease: 'none',
            scrollTrigger: { trigger: el.closest('section') ?? el, start: 'top 75%', end: 'center 45%', scrub: 0.6 },
          },
        );
      }, el);
    },
    unmount() {
      ctx?.revert();
      ctx = undefined;
    },
    reducedMotion(el) {
      el.querySelector<HTMLElement>('[class*="--red"]')?.style.setProperty('clip-path', 'none');
    },
  };
};
export default paintRed;
