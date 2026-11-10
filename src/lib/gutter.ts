import { prefersReducedMotion } from './env';

/**
 * The light gutters: the whole page dims twice, very slightly, the way a bulb does when something
 * else in the house draws power. Used as punctuation (something just happened that shouldn't have),
 * never at random. It only ever darkens, by a few percent, for well under a second: no flash.
 * Reduced motion: nothing.
 */
export function gutter() {
  if (prefersReducedMotion()) return;
  const air = document.querySelector<HTMLElement>('.atmosphere');
  if (!air) return;
  air.classList.remove('is-guttering');
  void air.offsetWidth; // restart the animation if it is already running
  air.classList.add('is-guttering');
  air.addEventListener('animationend', () => air.classList.remove('is-guttering'), { once: true });
}
