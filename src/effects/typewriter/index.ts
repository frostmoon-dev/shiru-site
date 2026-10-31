import type { EffectFactory } from '../types';

/**
 * Types the element's text letter by letter when it scrolls into view. Safety, then
 * subversion: one letter is typed wrong, hangs there a beat too long, and is corrected.
 * Screen readers get the full text immediately (a visually hidden copy); the typed copy is aria-hidden.
 * Options: { typo?: { at: number, wrong: string }, speed?: number }
 */
const typewriter: EffectFactory = () => {
  let io: IntersectionObserver | undefined;
  let timer = 0;
  let el: HTMLElement | undefined;
  let original = '';
  let originalHTML = '';

  return {
    name: 'typewriter',
    mount(target, opts) {
      el = target;
      original = target.textContent?.trim() ?? '';
      originalHTML = target.innerHTML;
      const typo = opts.typo as { at: number; wrong: string } | undefined;
      const speed = typeof opts.speed === 'number' ? opts.speed : 90;
      const sr = document.createElement('span');
      sr.className = 'visually-hidden';
      sr.textContent = original;
      const out = document.createElement('span');
      out.setAttribute('aria-hidden', 'true');
      const caret = document.createElement('span');
      caret.className = 'typewriter__caret';
      caret.setAttribute('aria-hidden', 'true');
      caret.textContent = '▌';
      target.replaceChildren(sr, out, caret);
      // keep the line's height so nothing jumps while it types
      target.style.minHeight = '1.2em';

      const steps: (() => void)[] = [];
      for (let i = 0; i < original.length; i++) {
        if (typo && i === typo.at) {
          steps.push(() => (out.textContent += typo.wrong));
          steps.push(() => {}, () => {}, () => {}, () => {}); // the beat too long
          steps.push(() => (out.textContent = out.textContent!.slice(0, -1)));
        }
        const ch = original[i]!;
        steps.push(() => (out.textContent += ch));
      }
      const run = (i: number) => {
        if (i >= steps.length) return;
        steps[i]!();
        const ch = out.textContent!.slice(-1);
        timer = window.setTimeout(() => run(i + 1), speed + (ch === ' ' ? 120 : Math.random() * 70));
      };
      io = new IntersectionObserver(
        ([e]) => {
          if (e?.isIntersecting) {
            io?.disconnect();
            run(0);
          }
        },
        { threshold: 0.8 },
      );
      io.observe(target);
    },
    unmount() {
      io?.disconnect();
      window.clearTimeout(timer);
      if (el) {
        el.innerHTML = originalHTML;
        el.style.minHeight = '';
      }
      el = undefined;
    },
  };
};
export default typewriter;
