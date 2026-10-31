import type { EffectFactory } from '../types';
import { gsap, ScrollTrigger } from '../../lib/motion';

/**
 * Entrance animations, played once when the element scrolls into view.
 *   data-effect="reveal" data-effect-options='{"type":"rise","targets":".x","stagger":0.1,"delay":0}'
 * Types:
 *   rise    fade up a little
 *   settle  fade up and rotate into place (cards, frames)
 *   pin     drop from above and swing to its resting angle (polaroids; keeps CSS rotation)
 *   pop     scale up from small with a little overshoot
 *   unfurl  open from the centre outwards (the scroll)
 *   paint   wipe on left to right (brush strokes)
 *   slide   come in from the side (bands)
 * Reduced motion: nothing moves; everything is simply there.
 */
const VARS: Record<string, gsap.TweenVars> = {
  rise: { y: 28, opacity: 0, duration: 1, ease: 'power3.out' },
  settle: { y: 40, rotate: -4, opacity: 0, duration: 1.2, ease: 'power3.out' },
  // targets are wrappers: the resting angle lives on the inner card, so this just swings in
  pin: { y: -80, opacity: 0, rotate: () => gsap.utils.random(-16, 16), duration: 0.9, ease: 'back.out(1.6)' },
  pop: { scale: 0.6, opacity: 0, duration: 0.8, ease: 'back.out(2)' },
  unfurl: { clipPath: 'inset(0 48% 0 48%)', duration: 1.3, ease: 'power3.inOut' },
  paint: { clipPath: 'inset(0 100% 0 0)', duration: 1.1, ease: 'power2.inOut' },
  slide: { xPercent: -6, opacity: 0, duration: 1.2, ease: 'power3.out' },
};

const reveal: EffectFactory = () => {
  let ctx: gsap.Context | undefined;
  return {
    name: 'reveal',
    mount(el, opts) {
      const type = String(opts.type ?? 'rise');
      const base = VARS[type] ?? VARS.rise!;
      ctx = gsap.context(() => {
        const targets = typeof opts.targets === 'string' ? gsap.utils.toArray<HTMLElement>(opts.targets, el) : [el];
        if (!targets.length) return;
        const vars: gsap.TweenVars = {
          ...base,
          delay: typeof opts.delay === 'number' ? opts.delay : 0,
          stagger: typeof opts.stagger === 'number' ? opts.stagger : 0.12,
          // only what we animated: the elements keep their own inline custom properties (--lace etc.)
          clearProps: 'transform,opacity,clipPath,translate,rotate,scale',
          scrollTrigger: { trigger: el, start: String(opts.start ?? 'top 82%'), once: true },
        };
        gsap.from(targets, vars);
      }, el);
      ScrollTrigger.refresh();
    },
    unmount() {
      ctx?.revert();
      ctx = undefined;
    },
  };
};
export default reveal;
