import type { EffectFactory } from '../types';
import { gsap } from '../../lib/motion';

/**
 * Transitions between chapters. One effect, one grammar, four flavours:
 *   tear      paper lips pull apart as the boundary scrolls past (scrubbed)
 *   burn      a single film-burn bloom when the boundary reaches mid-screen (plays once)
 *   pinstripe Burton stripes draw across (scrubbed)
 *   ink-rise  ink climbs up from the footer (scrubbed)
 * Each variant's static look is already in the markup; reduced motion keeps it.
 */
const sectionWipe: EffectFactory = () => {
  let ctx: gsap.Context | undefined;
  return {
    name: 'section-wipe',
    mount(el, opts) {
      const variant = String(opts.variant ?? 'tear');
      ctx = gsap.context(() => {
        const st = { trigger: el, start: 'top bottom', end: 'top 30%', scrub: 0.5 };
        if (variant === 'tear') {
          gsap.fromTo(el.querySelector('.torn__lip'), { y: -6, rotate: 0 }, { y: 4, rotate: -0.6, ease: 'none', scrollTrigger: st });
          gsap.fromTo(el.querySelector('.torn__under'), { y: -14 }, { y: 6, ease: 'none', scrollTrigger: st });
        } else if (variant === 'burn') {
          const bloom = el.querySelector<HTMLElement>('.burn__bloom');
          if (!bloom) return;
          gsap.set(bloom, { scale: 0.1, opacity: 0 });
          // One soft bloom, ~700 ms, never brighter than brass: no strobe.
          gsap
            .timeline({ scrollTrigger: { trigger: el, start: 'top 60%', once: true } })
            .to(bloom, { opacity: 0.85, scale: 1, duration: 0.35, ease: 'power2.out' })
            .to(bloom, { opacity: 0, scale: 1.6, duration: 0.6, ease: 'power1.in' });
        } else if (variant === 'pinstripe') {
          gsap.fromTo(el, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', ease: 'none', scrollTrigger: { ...st, end: 'top 55%' } });
        } else if (variant === 'ink-rise') {
          gsap.fromTo(el, { scaleY: 0.3, transformOrigin: '50% 100%' }, { scaleY: 1, ease: 'none', scrollTrigger: st });
        }
      }, el);
    },
    unmount() {
      ctx?.revert();
      ctx = undefined;
    },
  };
};
export default sectionWipe;
