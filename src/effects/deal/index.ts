import type { EffectFactory } from '../types';
import { gsap, ScrollTrigger } from '../../lib/motion';

/**
 * The Queen deals the deck. When the cards come into view they start as one stack in the middle
 * of the table, each at a careless angle, then fly out to their places one by one and land with
 * a small snap. Phones (where the cards sit in a swipe row) get a simpler fan-in.
 *
 *   <ul data-effect="deal"> <li class="tarot">… </ul>
 *
 * Reduced motion / no JS: the cards are simply where they belong.
 */
const deal: EffectFactory = () => {
  let ctx: gsap.Context | undefined;
  return {
    name: 'deal',
    mount(el, _opts, env) {
      const cards = [...el.querySelectorAll<HTMLElement>('.tarot')];
      if (!cards.length) return;
      ctx = gsap.context(() => {
        if (env.small) {
          gsap.from(cards, {
            xPercent: 40,
            rotate: 8,
            opacity: 0,
            duration: 0.7,
            stagger: 0.08,
            ease: 'power3.out',
            clearProps: 'transform,opacity',
            scrollTrigger: { trigger: el, start: 'top 85%', once: true },
          });
          return;
        }
        // every card's distance to the middle of the table
        const box = el.getBoundingClientRect();
        const cx = box.left + box.width / 2;
        const cy = box.top + Math.min(box.height, window.innerHeight) / 2;
        const offsets = cards.map((c, i) => {
          const r = c.getBoundingClientRect();
          return { x: cx - (r.left + r.width / 2), y: cy - (r.top + r.height / 2), r: gsap.utils.random(-28, 28), z: cards.length - i };
        });
        cards.forEach((c, i) => gsap.set(c, { x: offsets[i]!.x, y: offsets[i]!.y, rotate: offsets[i]!.r, scale: 0.92, zIndex: offsets[i]!.z }));
        const play = () =>
          gsap.to(cards, {
            x: 0,
            y: 0,
            rotate: 0,
            scale: 1,
            duration: 0.85,
            ease: 'back.out(1.25)',
            stagger: { each: 0.09, from: 'start' },
            clearProps: 'transform,zIndex',
          });
        const st = ScrollTrigger.create({ trigger: el, start: 'top 75%', once: true, onEnter: play });
        // arrived from below (a deep link, or scrolled past before this loaded): deal now
        if (st.progress > 0 || el.getBoundingClientRect().bottom < window.innerHeight) {
          st.kill();
          play();
        }
      }, el);
    },
    unmount() {
      ctx?.revert();
      ctx = undefined;
    },
  };
};
export default deal;
