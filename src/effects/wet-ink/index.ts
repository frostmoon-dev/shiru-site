import type { EffectFactory } from '../types';

/**
 * Wet ink: every so often the text swells and smears a little, like ink soaking into paper,
 * then dries. The SVG filter is only attached during a soak, so idle text costs nothing.
 * Options: { every?: [min, max] seconds, strength?: number }
 */
let uid = 0;
const NS = 'http://www.w3.org/2000/svg';

const wetInk: EffectFactory = () => {
  let el: HTMLElement | undefined;
  let svg: SVGSVGElement | undefined;
  let timer = 0;
  let raf = 0;
  let range: [number, number] = [6, 14];
  let strength = 2.4;

  const soak = () => {
    if (!el || !svg) return;
    const disp = svg.querySelector('feDisplacementMap')!;
    const morph = svg.querySelector('feMorphology')!;
    const turb = svg.querySelector('feTurbulence')!;
    turb.setAttribute('seed', String(Math.floor(Math.random() * 100)));
    el.style.filter = `url(#${svg.dataset.id})`;
    const start = performance.now();
    const dur = 2600;
    const step = (now: number) => {
      const t = Math.min((now - start) / dur, 1);
      const k = Math.sin(t * Math.PI); // swell then dry
      disp.setAttribute('scale', (k * strength).toFixed(2));
      morph.setAttribute('radius', (k * 0.45).toFixed(2));
      if (t < 1) raf = requestAnimationFrame(step);
      else {
        if (el) el.style.filter = '';
        schedule();
      }
    };
    raf = requestAnimationFrame(step);
  };
  const schedule = () => {
    timer = window.setTimeout(soak, (range[0] + Math.random() * (range[1] - range[0])) * 1000);
  };

  return {
    name: 'wet-ink',
    mount(target, opts, env) {
      if (env.lowPower) return;
      el = target;
      if (Array.isArray(opts.every)) range = opts.every as [number, number];
      if (typeof opts.strength === 'number') strength = opts.strength;
      const id = `wet-ink-${++uid}`;
      svg = document.createElementNS(NS, 'svg');
      svg.dataset.id = id;
      svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('width', '0');
      svg.setAttribute('height', '0');
      svg.style.position = 'absolute';
      svg.innerHTML = `<filter id="${id}" x="-5%" y="-20%" width="110%" height="140%"><feMorphology operator="dilate" radius="0" in="SourceGraphic" result="m"/><feTurbulence type="fractalNoise" baseFrequency="0.035 0.09" numOctaves="2" seed="1" result="n"/><feDisplacementMap in="m" in2="n" scale="0" xChannelSelector="R" yChannelSelector="G"/></filter>`;
      document.body.appendChild(svg);
      timer = window.setTimeout(soak, 1500 + Math.random() * 4000);
    },
    unmount() {
      window.clearTimeout(timer);
      cancelAnimationFrame(raf);
      if (el) el.style.filter = '';
      svg?.remove();
      svg = undefined;
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
export default wetInk;
