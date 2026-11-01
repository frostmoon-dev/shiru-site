import type { EffectFactory } from '../types';

/**
 * Types the element's text letter by letter when it scrolls into view. Line breaks are kept
 * (each block child is a line). Optionally one letter is typed wrong, hangs there a beat too long,
 * and is corrected. Screen readers get the full text at once (a visually hidden copy); the typed
 * copy is aria-hidden.
 *
 * Options: { typo?: { at, wrong }, speed?: ms per letter, waitForIntro?: boolean, delay?: ms before typing }
 * Markup:  add data-type-early to keep the text hidden (with JS) until typing starts.
 */
const typewriter: EffectFactory = () => {
  let io: IntersectionObserver | undefined;
  let timer = 0;
  let el: HTMLElement | undefined;
  let originalHTML = '';
  let onIntro: (() => void) | undefined;

  const reveal = (t: HTMLElement) => t.removeAttribute('data-type-early');

  return {
    name: 'typewriter',
    mount(target, opts) {
      el = target;
      originalHTML = target.innerHTML;
      // read from the markup, not innerText: the element may still be hidden (data-type-early)
      const lines = [...target.children].filter((c) => getComputedStyle(c).display === 'block');
      const original = (lines.length ? lines.map((l) => l.textContent?.trim() ?? '').join('\n') : target.textContent ?? '')
        .replace(/\s*\n\s*/g, '\n')
        .trim();
      const typo = opts.typo as { at: number; wrong: string } | undefined;
      const speed = typeof opts.speed === 'number' ? opts.speed : 90;

      const sr = document.createElement('span');
      sr.className = 'visually-hidden';
      sr.textContent = original;
      const out = document.createElement('span');
      out.setAttribute('aria-hidden', 'true');
      out.style.whiteSpace = 'pre-line';
      const caret = document.createElement('span');
      caret.className = 'typewriter__caret';
      caret.setAttribute('aria-hidden', 'true');
      caret.textContent = '▌';
      // lock the current height so nothing below moves while the text types itself back in
      const locked = target.getBoundingClientRect().height;
      target.replaceChildren(sr, out, caret);
      target.style.minHeight = `${Math.max(locked, 1)}px`;

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
        const last = out.textContent!.slice(-1);
        const pause = last === '\n' ? 420 : last === ' ' ? 120 : Math.random() * 70;
        timer = window.setTimeout(() => run(i + 1), speed + pause);
      };
      const start = () => {
        reveal(target);
        io = new IntersectionObserver(
          ([e]) => {
            if (e?.isIntersecting) {
              io?.disconnect();
              timer = window.setTimeout(() => run(0), typeof opts.delay === 'number' ? opts.delay : 0);
            }
          },
          { threshold: 0.6 },
        );
        io.observe(target);
      };
      if (opts.waitForIntro && document.documentElement.classList.contains('intro-pending')) {
        onIntro = start;
        window.addEventListener('site:intro-done', start, { once: true });
      } else start();
    },
    unmount() {
      io?.disconnect();
      window.clearTimeout(timer);
      if (onIntro) window.removeEventListener('site:intro-done', onIntro);
      onIntro = undefined;
      if (el) {
        el.innerHTML = originalHTML;
        el.style.minHeight = '';
        reveal(el);
      }
      el = undefined;
    },
    reducedMotion(target) {
      reveal(target);
    },
  };
};
export default typewriter;
