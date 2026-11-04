import type { EffectFactory } from '../types';
import { gsap, ScrollTrigger } from '../../lib/motion';

/**
 * Passages between the personal page's chapters, all driven by the scroll (so they run backwards
 * when you scroll back up). A small marker inside a section carries the effect and works on the
 * section around it:
 *
 *   iris   the hero closes into a shrinking circle as it leaves, like an old film's iris-out
 *   peel   Wonderland arrives with its top corner folded back; the fold flattens as it settles
 *   burn   leaving Wonderland, the paper burns away from below: ember edge, charred rim, night beneath
 *   bleed  blood runs down from the top of Tea at midnight, drip by drip; full drips let a drop go
 *
 *   <span class="passage" data-effect="passage" data-effect-options='{"type":"iris"}'></span>
 *
 * Without JS, and under reduced motion, every passage is simply in its finished, still state.
 */
type Type = 'iris' | 'peel' | 'burn' | 'bleed';

const passage: EffectFactory = () => {
  let ctx: gsap.Context | undefined;
  let section: HTMLElement | null = null;

  const still = (type: Type, s: HTMLElement) => {
    s.style.removeProperty('--iris');
    s.style.removeProperty('--iris-y');
    s.style.removeProperty('--peel');
    if (type === 'bleed') s.classList.add('is-bled');
    if (type === 'burn') s.querySelector<HTMLElement>('.burn__fire')?.style.setProperty('transform', 'translateY(62%)');
  };

  return {
    name: 'passage',
    mount(el, opts) {
      const type = String(opts.type) as Type;
      section = el.closest('section');
      if (!section) return;
      const s = section;
      ctx = gsap.context(() => {
        if (type === 'iris') {
          ScrollTrigger.create({
            trigger: s,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
            onUpdate: (self) => {
              // the circle stays centred on the screen (not on the hero, which is scrolling away)
              const r = s.getBoundingClientRect();
              const cy = ((window.innerHeight * 0.5 - r.top) / r.height) * 100;
              s.style.setProperty('--iris-y', `${cy.toFixed(1)}%`);
              s.style.setProperty('--iris', `${Math.max(0, 125 - 210 * self.progress).toFixed(1)}%`);
            },
          });
        } else if (type === 'peel') {
          const fold = Math.max(240, window.innerWidth * 0.36);
          gsap.fromTo(
            s,
            { '--peel': `${fold}px` },
            { '--peel': '0px', ease: 'power2.out', scrollTrigger: { trigger: s, start: 'top bottom', end: 'top 15%', scrub: 0.4 } },
          );
        } else if (type === 'burn') {
          const fire = s.querySelector('.burn__fire');
          const next = s.nextElementSibling ?? s;
          if (fire)
            gsap.fromTo(fire, { y: 0, yPercent: 100 }, { y: 0, yPercent: 0, ease: 'none', scrollTrigger: { trigger: next, start: 'top bottom', end: 'top 30%', scrub: 0.5 } });
        } else if (type === 'bleed') {
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: s,
              start: 'top 92%',
              end: 'top 10%',
              scrub: 0.6,
              onLeave: () => s.classList.add('is-bled'),
              onEnterBack: () => s.classList.remove('is-bled'),
            },
          });
          s.querySelectorAll<SVGGElement>('.bleed__drip').forEach((d) => {
            const len = Number(d.dataset.len);
            const r = Number(d.dataset.r);
            const at = Number(d.dataset.at);
            const dur = Number(d.dataset.dur);
            const col = d.querySelector('rect');
            const drop = d.querySelector('circle');
            if (col) tl.fromTo(col, { attr: { height: 0 } }, { attr: { height: len }, ease: 'power1.in', duration: dur }, at);
            if (drop) tl.fromTo(drop, { attr: { cy: 0, r: r * 0.5 } }, { attr: { cy: len, r }, ease: 'power1.in', duration: dur }, at);
          });
        }
      }, el);
    },
    unmount() {
      ctx?.revert();
      ctx = undefined;
      section?.style.removeProperty('--iris');
      section?.style.removeProperty('--iris-y');
      section?.style.removeProperty('--peel');
      section = null;
    },
    reducedMotion(el, opts) {
      const s = el.closest('section');
      if (s) still(String(opts.type) as Type, s);
    },
  };
};
export default passage;
