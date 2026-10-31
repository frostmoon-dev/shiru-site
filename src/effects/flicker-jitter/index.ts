import type { EffectFactory } from '../types';

/**
 * AHS bad-bulb flicker and the occasional 1–2 frame skew glitch.
 * Photosensitivity: a flicker run has at most 2 dips spread over ≥ 700 ms, and runs are
 * seconds apart, so it never exceeds 3 flashes per second. Dips are partial (to 45%), not black.
 * Options: { flicker?: boolean, jitter?: boolean, every?: [minSeconds, maxSeconds] }
 */
const flickerJitter: EffectFactory = () => {
  let timer = 0;
  let el: HTMLElement | undefined;
  let running: Animation[] = [];
  let range: [number, number] = [4, 12];
  let doFlicker = true;
  let doJitter = true;

  const schedule = () => {
    const [a, b] = range;
    timer = window.setTimeout(fire, (a + Math.random() * (b - a)) * 1000);
  };
  const fire = () => {
    if (!el) return;
    const roll = Math.random();
    if (doFlicker && (roll < 0.6 || !doJitter)) {
      const low = 0.45 + Math.random() * 0.2;
      running.push(
        el.animate(
          [
            { filter: 'brightness(1)' },
            { filter: `brightness(${low})`, offset: 0.12 },
            { filter: 'brightness(1)', offset: 0.3 },
            { filter: 'brightness(1)', offset: 0.62 },
            { filter: `brightness(${low + 0.15})`, offset: 0.72 },
            { filter: 'brightness(1)' },
          ],
          { duration: 760 + Math.random() * 300, easing: 'steps(1, end)' },
        ),
      );
    } else if (doJitter) {
      const sk = (Math.random() - 0.5) * 8;
      const tx = (Math.random() - 0.5) * 10;
      running.push(
        el.animate(
          [
            { transform: `translate(${tx}px, ${-tx * 0.3}px) skewX(${sk}deg)` },
            { transform: `translate(${-tx * 0.4}px, 0) skewX(${-sk * 0.5}deg)`, offset: 0.5 },
            { transform: 'none' },
          ],
          { duration: 50, easing: 'steps(1, end)', composite: 'add' },
        ),
      );
    }
    running = running.filter((a) => a.playState !== 'finished');
    schedule();
  };

  return {
    name: 'flicker-jitter',
    mount(target, opts) {
      el = target;
      doFlicker = opts.flicker !== false;
      doJitter = opts.jitter !== false;
      if (Array.isArray(opts.every) && opts.every.length === 2) range = opts.every as [number, number];
      timer = window.setTimeout(fire, 1500 + Math.random() * 3000);
    },
    unmount() {
      window.clearTimeout(timer);
      running.forEach((a) => a.cancel());
      running = [];
      el = undefined;
    },
    pause() {
      window.clearTimeout(timer);
    },
    resume() {
      schedule();
    },
  };
};
export default flickerJitter;
