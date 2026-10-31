import type { EffectFactory } from '../types';

/**
 * Ghost title: the heading is uncovered rather than shown. The first time it scrolls into
 * view, it surfaces out of the grain (a soft sweep, blur to sharp). After that, every so often
 * a faint double exposure slips out of register for a frame or two, then it's gone.
 *
 * A title already on screen when the effect starts is never hidden: it only gets the ghosts.
 * Options: { every?: [min, max] seconds between ghosts }
 */
const ghostTitle: EffectFactory = () => {
  let el: HTMLElement | undefined;
  let echo: HTMLElement | undefined;
  let io: IntersectionObserver | undefined;
  let timer = 0;
  let anim: Animation | undefined;
  let range: [number, number] = [8, 18];

  const schedule = () => {
    timer = window.setTimeout(ghost, (range[0] + Math.random() * (range[1] - range[0])) * 1000);
  };
  const ghost = () => {
    if (!el || !echo) return;
    const x = (Math.random() < 0.5 ? -1 : 1) * (2 + Math.random() * 4);
    const y = (Math.random() - 0.5) * 3;
    echo.animate(
      [
        { opacity: 0.32, transform: `translate(${x}px, ${y}px)` },
        { opacity: 0.18, transform: `translate(${-x * 0.5}px, ${y}px)`, offset: 0.5 },
        { opacity: 0, transform: 'none' },
      ],
      { duration: 90, easing: 'steps(1, end)' },
    );
    schedule();
  };
  const reveal = (target: HTMLElement) => {
    target.classList.remove('is-veiled');
    anim = target.animate(
      [
        { opacity: 0, filter: 'blur(10px)', clipPath: 'inset(0 100% 0 0)' },
        { opacity: 0.6, filter: 'blur(3px)', clipPath: 'inset(0 35% 0 0)', offset: 0.55 },
        { opacity: 1, filter: 'blur(0)', clipPath: 'inset(0 0 0 0)' },
      ],
      { duration: 1800, easing: 'cubic-bezier(.65,0,.35,1)' },
    );
  };

  return {
    name: 'ghost-title',
    mount(target, opts) {
      el = target;
      if (Array.isArray(opts.every)) range = opts.every as [number, number];
      echo = document.createElement('span');
      echo.className = 'ghost-title__echo';
      echo.setAttribute('aria-hidden', 'true');
      echo.textContent = target.textContent?.trim() ?? '';
      target.appendChild(echo);

      const r = target.getBoundingClientRect();
      const onScreen = r.top < window.innerHeight && r.bottom > 0;
      if (!onScreen) {
        target.classList.add('is-veiled');
        io = new IntersectionObserver(
          ([e]) => {
            if (!e?.isIntersecting) return;
            io?.disconnect();
            reveal(target);
          },
          { threshold: 0.5 },
        );
        io.observe(target);
      }
      timer = window.setTimeout(ghost, 2500 + Math.random() * 5000);
    },
    unmount() {
      window.clearTimeout(timer);
      io?.disconnect();
      anim?.cancel();
      echo?.remove();
      el?.classList.remove('is-veiled');
      el = echo = undefined;
    },
    pause() {
      window.clearTimeout(timer);
    },
    resume() {
      schedule();
    },
  };
};
export default ghostTitle;
