import type { EffectEnv, EffectFactory } from '../types';

/**
 * Dust motes in greenhouse light: soft gold flecks drifting slowly up and sideways across the
 * page, glinting now and then. Mounted on a <canvas>, multiplied onto the parchment.
 * Reduced motion: one still frame of faint dust. Low power: fewer marks, 8 fps.
 */
const filmDust: EffectFactory = () => {
  let canvas: HTMLCanvasElement | undefined;
  let ctx: CanvasRenderingContext2D | null = null;
  let raf = 0;
  let last = 0;
  let fpsMs = 33;
  let specks = 60;
  let ro: ResizeObserver | undefined;

  const size = () => {
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(canvas.clientWidth * dpr);
    canvas.height = Math.round(canvas.clientHeight * dpr);
    ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  // dust motes in greenhouse light: persistent flecks that drift slowly upward and sideways
  type Mote = { x: number; y: number; r: number; vx: number; vy: number; a: number; tw: number };
  let motes: Mote[] = [];
  const seed = (w: number, h: number) => {
    motes = Array.from({ length: Math.round(specks * 0.6) }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 0.6 + Math.random() * 1.8,
      vx: (Math.random() - 0.5) * 0.18,
      vy: -(0.05 + Math.random() * 0.22),
      a: 0.12 + Math.random() * 0.28,
      tw: Math.random() * Math.PI * 2,
    }));
  };
  const frame = (still = false) => {
    if (!ctx || !canvas) return;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!motes.length) seed(w, h);
    ctx.clearRect(0, 0, w, h);
    for (const m of motes) {
      if (!still) {
        m.tw += 0.05;
        m.x += m.vx + Math.sin(m.tw) * 0.08;
        m.y += m.vy;
        if (m.y < -4) {
          m.y = h + 4;
          m.x = Math.random() * w;
        }
        if (m.x < -4) m.x = w + 4;
        if (m.x > w + 4) m.x = -4;
      }
      const glint = still ? 1 : 0.75 + Math.sin(m.tw * 1.7) * 0.25;
      ctx.fillStyle = `rgba(168, 138, 74, ${(m.a * glint).toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const loop = (now: number) => {
    raf = requestAnimationFrame(loop);
    if (now - last < fpsMs) return;
    last = now;
    frame();
  };

  const setup = (el: HTMLElement, env: EffectEnv) => {
    if (!(el instanceof HTMLCanvasElement)) return false;
    canvas = el;
    ctx = el.getContext('2d');
    if (env.lowPower || env.small) {
      fpsMs = 125;
      specks = 30;
    }
    size();
    ro = new ResizeObserver(() => size());
    ro.observe(el);
    return true;
  };

  return {
    name: 'film-dust',
    mount(el, _opts, env) {
      if (!setup(el, env)) return;
      raf = requestAnimationFrame(loop);
    },
    reducedMotion(el, _opts, env) {
      if (setup(el, env)) frame(true);
    },
    unmount() {
      cancelAnimationFrame(raf);
      raf = 0;
      ro?.disconnect();
      ctx?.clearRect(0, 0, canvas?.width ?? 0, canvas?.height ?? 0);
      canvas = undefined;
      ctx = null;
      motes = [];
    },
    pause() {
      cancelAnimationFrame(raf);
      raf = 0;
    },
    resume() {
      if (!raf && canvas) raf = requestAnimationFrame(loop);
    },
  };
};
export default filmDust;
