import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

gsap.registerPlugin(ScrollTrigger);

let lenis: Lenis | undefined;

/**
 * Smooth scroll, driven by GSAP's ticker so ScrollTrigger and Lenis share one clock
 * (the setup Lenis documents for GSAP). Lenis itself disables smoothing when the user
 * prefers reduced motion (respectReducedMotion defaults to true).
 */
export function startSmoothScroll(): Lenis {
  if (lenis) return lenis;
  lenis = new Lenis({ autoRaf: false });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis?.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

export function getLenis(): Lenis | undefined {
  return lenis;
}

export function lockScroll(locked: boolean) {
  if (locked) lenis?.stop();
  else lenis?.start();
  document.documentElement.classList.toggle('is-scroll-locked', locked);
}

export { gsap, ScrollTrigger };
