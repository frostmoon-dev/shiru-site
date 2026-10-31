import type { EffectEnv, EffectFactory, EffectOptions } from '../types';
import { gsap } from '../../lib/motion';

/**
 * Bleeding title. Drips grow from the bottom of the actual glyph ink, sag, release a drop and
 * retract, each on its own random clock. An SVG goo filter (#shiru-goo) fuses drips and letters.
 *
 * Markup: <h1 data-effect="bleed-title"><span class="bleed__text">SHIRU</span></h1>
 * Options: { color?: string, density?: number, startEvent?: string }
 *   startEvent: wait for this window event before the first bleed (e.g. the intro finishing).
 */
type Drip = { x: number; y: number; w: number; max: number };

function measureDrips(textEl: HTMLElement, host: HTMLElement, density: number): Drip[] {
  const hostBox = host.getBoundingClientRect();
  const cs = getComputedStyle(textEl);
  const fontSize = parseFloat(cs.fontSize);
  const range = document.createRange();
  const node = textEl.firstChild;
  if (!node || node.nodeType !== Node.TEXT_NODE) return [];
  const text = node.textContent ?? '';
  const canvas = document.createElement('canvas');
  const scale = 1;
  canvas.width = Math.ceil(hostBox.width * scale);
  canvas.height = Math.ceil(hostBox.height * scale + fontSize * 0.3);
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return [];
  ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
  ctx.fillStyle = '#000';
  ctx.textBaseline = 'alphabetic';
  const m = ctx.measureText('H');
  const asc = m.fontBoundingBoxAscent || fontSize * 0.8;
  const desc = m.fontBoundingBoxDescent || fontSize * 0.2;
  const baselines: number[] = [];

  const upper = cs.textTransform === 'uppercase';
  for (let i = 0; i < text.length; i++) {
    const ch = upper ? text[i]!.toUpperCase() : text[i]!;
    if (!ch.trim()) continue;
    range.setStart(node, i);
    range.setEnd(node, i + 1);
    const r = range.getBoundingClientRect();
    if (!r.width) continue;
    const baseline = r.top - hostBox.top + (r.height - (asc + desc)) / 2 + asc;
    baselines.push(baseline);
    ctx.fillText(ch, (r.left - hostBox.left) * scale, baseline * scale);
  }
  if (!baselines.length) return [];

  // Scan each column for its lowest inked pixel; stems and bowls that sit on a baseline
  // become candidate drip origins.
  const { width, height } = canvas;
  const data = ctx.getImageData(0, 0, width, height).data;
  const bottoms = new Float32Array(width).fill(-1);
  for (let x = 0; x < width; x++) {
    for (let y = height - 1; y >= 0; y--) {
      if (data[(y * width + x) * 4 + 3]! > 140) {
        bottoms[x] = y;
        break;
      }
    }
  }
  const nearBase = (y: number) => baselines.some((b) => Math.abs(y - b) < fontSize * 0.07);
  const runs: { start: number; end: number; y: number }[] = [];
  let cur: { start: number; end: number; y: number } | null = null;
  for (let x = 0; x < width; x++) {
    const y = bottoms[x]!;
    if (y >= 0 && nearBase(y)) {
      if (cur && x === cur.end + 1) {
        cur.end = x;
        cur.y = Math.max(cur.y, y);
      } else {
        cur = { start: x, end: x, y };
        runs.push(cur);
      }
    } else cur = null;
  }
  const drips: Drip[] = [];
  const maxW = Math.max(3, fontSize * 0.06);
  for (const run of runs) {
    const len = run.end - run.start;
    if (len < 2) continue;
    const count = len > fontSize * 0.35 ? 2 : 1;
    for (let k = 0; k < count; k++) {
      if (Math.random() > density) continue;
      const t = count === 1 ? 0.5 : 0.25 + k * 0.5;
      drips.push({
        x: (run.start + len * t + (Math.random() - 0.5) * len * 0.2) / scale,
        y: run.y / scale,
        w: Math.min(maxW, Math.max(2.5, len * 0.35)) * (0.6 + Math.random() * 0.5),
        max: fontSize * (0.18 + Math.random() * 0.42),
      });
    }
  }
  return drips;
}

function build(el: HTMLElement, opts: EffectOptions, env: EffectEnv) {
  const textEl = el.querySelector<HTMLElement>('.bleed__text') ?? el;
  const density = typeof opts.density === 'number' ? opts.density : env.small ? 0.6 : 0.9;
  const layer = document.createElement('span');
  layer.className = 'bleed__drips';
  layer.setAttribute('aria-hidden', 'true');
  Object.assign(layer.style, { position: 'absolute', inset: '0', pointerEvents: 'none', overflow: 'visible' });
  if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
  el.appendChild(layer);
  const color = typeof opts.color === 'string' ? opts.color : 'currentColor';
  const drips = measureDrips(textEl, el, density).map((d) => {
    const stem = document.createElement('span');
    const bead = document.createElement('span');
    const wrap = document.createElement('span');
    Object.assign(wrap.style, { position: 'absolute', left: `${d.x - d.w / 2}px`, top: `${d.y - d.w * 0.9}px`, width: `${d.w}px` });
    Object.assign(stem.style, {
      position: 'absolute',
      left: '0',
      top: '0',
      width: '100%',
      height: `${d.max}px`,
      background: color,
      borderRadius: `${d.w}px`,
      transformOrigin: '50% 0',
      transform: 'scaleY(0)',
    });
    const bw = d.w * 1.7;
    Object.assign(bead.style, {
      position: 'absolute',
      left: `${(d.w - bw) / 2}px`,
      top: '0',
      width: `${bw}px`,
      height: `${bw}px`,
      borderRadius: '50%',
      background: color,
      transform: 'translateY(0) scale(0)',
    });
    wrap.append(stem, bead);
    layer.appendChild(wrap);
    return { ...d, wrap, stem, bead };
  });
  el.style.filter = 'url(#shiru-goo)';
  return { layer, drips };
}

const bleedTitle: EffectFactory = () => {
  let built: ReturnType<typeof build> | undefined;
  let tweens: gsap.core.Animation[] = [];
  let timer = 0;
  let el: HTMLElement | undefined;
  let ro: ResizeObserver | undefined;
  let startListener: { evt: string; fn: () => void } | undefined;
  let lastWidth = 0;

  const kill = () => {
    tweens.forEach((t) => t.kill());
    tweens = [];
    window.clearTimeout(timer);
    built?.layer.remove();
    built = undefined;
  };

  const drip = (d: NonNullable<typeof built>['drips'][number], slow: boolean) => {
    const len = d.max * (slow ? 0.7 + Math.random() * 0.3 : 0.45 + Math.random() * 0.55);
    const ratio = len / d.max;
    const tl = gsap.timeline();
    tl.to(d.stem, { scaleY: ratio, duration: slow ? 3.2 + Math.random() * 2.5 : 1.6 + Math.random() * 2, ease: 'sine.inOut' }, 0)
      .to(d.bead, { y: len - d.w * 0.6, scale: 1, duration: slow ? 3.2 : 1.8, ease: 'sine.inOut' }, 0)
      // sag
      .to(d.stem, { scaleY: ratio * 1.08, scaleX: 0.85, duration: 0.7, ease: 'sine.in' })
      .to(d.bead, { y: `+=${len * 0.08}`, scale: 1.18, duration: 0.7, ease: 'sine.in' }, '<')
      // release a drop
      .add(() => {
        const drop = d.bead.cloneNode() as HTMLElement;
        d.wrap.appendChild(drop);
        gsap.fromTo(
          drop,
          { y: gsap.getProperty(d.bead, 'y') as number, scale: 1 },
          { y: `+=${60 + Math.random() * 90}`, scale: 0.4, opacity: 0, duration: 0.9, ease: 'power2.in', onComplete: () => drop.remove() },
        );
      })
      .to(d.bead, { scale: 0.6, y: len * 0.5, duration: 0.5, ease: 'power2.out' })
      .to(d.stem, { scaleY: ratio * 0.5, scaleX: 1, duration: 0.5, ease: 'power2.out' }, '<')
      // retract back into the letter
      .to(d.stem, { scaleY: 0, duration: 2.4 + Math.random() * 1.5, ease: 'sine.inOut' })
      .to(d.bead, { y: 0, scale: 0, duration: 2.4, ease: 'sine.inOut' }, '<');
    tweens.push(tl);
    tl.eventCallback('onComplete', () => {
      tweens = tweens.filter((t) => t !== tl);
    });
  };

  const occasionally = () => {
    if (!built?.drips.length) return;
    const d = built.drips[Math.floor(Math.random() * built.drips.length)]!;
    drip(d, false);
    timer = window.setTimeout(occasionally, 2200 + Math.random() * 5200);
  };

  const start = (env: EffectEnv, opts: EffectOptions) => {
    if (!el) return;
    kill();
    built = build(el, opts, env);
    // First bleed: every drip, slowly, staggered.
    built.drips.forEach((d, i) => {
      tweens.push(gsap.delayedCall((i * 140 + Math.random() * 600) / 1000, () => drip(d, true)));
    });
    timer = window.setTimeout(occasionally, 9000);
  };

  return {
    name: 'bleed-title',
    async mount(target, opts, env) {
      el = target;
      await document.fonts.ready;
      const begin = () => start(env, opts);
      const evt = typeof opts.startEvent === 'string' ? opts.startEvent : undefined;
      if (evt && document.documentElement.classList.contains('intro-pending')) {
        startListener = { evt, fn: begin };
        window.addEventListener(evt, begin, { once: true });
      } else begin();
      lastWidth = target.offsetWidth;
      ro = new ResizeObserver(() => {
        if (Math.abs(target.offsetWidth - lastWidth) < 4 || !built) return;
        lastWidth = target.offsetWidth;
        start(env, opts);
      });
      ro.observe(target);
    },
    unmount() {
      kill();
      ro?.disconnect();
      if (startListener) window.removeEventListener(startListener.evt, startListener.fn);
      startListener = undefined;
      if (el) el.style.filter = '';
      el = undefined;
    },
    pause() {
      tweens.forEach((t) => t.pause());
      window.clearTimeout(timer);
    },
    resume() {
      tweens.forEach((t) => t.resume());
      timer = window.setTimeout(occasionally, 3000);
    },
    reducedMotion(target, opts, env) {
      // Static: drips frozen mid-run, no drops, no timers.
      void document.fonts.ready.then(() => {
        const b = build(target, opts, env);
        b.drips.forEach((d) => {
          const len = d.max * (0.35 + Math.random() * 0.5);
          d.stem.style.transform = `scaleY(${len / d.max})`;
          d.bead.style.transform = `translateY(${len - d.w * 0.6}px) scale(1)`;
        });
      });
    },
  };
};

export default bleedTitle;
