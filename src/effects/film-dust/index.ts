import type { EffectEnv, EffectFactory } from '../types';

/**
 * Old-film dust over a dark scene: specks, a stray hair, a vertical scratch that comes and goes,
 * redrawn ~12 times a second like a worn print going through a projector.
 * Mounted on a <canvas>; drawn with screen blending (only light marks show).
 * Reduced motion: one still frame of faint dust. Low power: fewer marks, 8 fps.
 */
type Hair = { x: number; y: number; life: number; pts: number[] };

const filmDust: EffectFactory = () => {
  let canvas: HTMLCanvasElement | undefined;
  let ctx: CanvasRenderingContext2D | null = null;
  let raf = 0;
  let last = 0;
  let fpsMs = 83;
  let specks = 60;
  let scratch = { x: 0.3, life: 0 };
  let hairs: Hair[] = [];
  let ro: ResizeObserver | undefined;

  const size = () => {
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(canvas.clientWidth * dpr);
    canvas.height = Math.round(canvas.clientHeight * dpr);
    ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const frame = (still = false) => {
    if (!ctx || !canvas) return;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);
    // specks: tiny irregular light flecks
    const n = still ? specks * 0.5 : specks * (0.6 + Math.random() * 0.8);
    for (let i = 0; i < n; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const r = Math.random() < 0.92 ? 0.4 + Math.random() * 1.1 : 1.5 + Math.random() * 2.5;
      ctx.fillStyle = `rgba(217, 210, 189, ${(0.05 + Math.random() * (still ? 0.12 : 0.22)).toFixed(3)})`;
      ctx.beginPath();
      ctx.ellipse(x, y, r, r * (0.5 + Math.random()), Math.random() * 3, 0, Math.PI * 2);
      ctx.fill();
    }
    if (still) return;
    // a scratch that lingers a few frames, then jumps elsewhere
    if (--scratch.life <= 0 && Math.random() < 0.3) scratch = { x: Math.random(), life: 4 + Math.floor(Math.random() * 14) };
    if (scratch.life > 0) {
      const x = scratch.x * w + (Math.random() - 0.5) * 3;
      ctx.strokeStyle = `rgba(217, 210, 189, ${(0.06 + Math.random() * 0.1).toFixed(3)})`;
      ctx.lineWidth = 0.6 + Math.random();
      ctx.beginPath();
      ctx.moveTo(x, Math.random() * h * 0.2);
      ctx.lineTo(x + (Math.random() - 0.5) * 6, h * (0.6 + Math.random() * 0.4));
      ctx.stroke();
    }
    // the odd hair caught in the gate
    if (Math.random() < 0.04 && hairs.length < 2) {
      const pts: number[] = [];
      let a = Math.random() * Math.PI * 2;
      for (let i = 0; i < 6; i++) {
        a += (Math.random() - 0.5) * 1.6;
        pts.push(Math.cos(a) * (8 + Math.random() * 14), Math.sin(a) * (8 + Math.random() * 14));
      }
      hairs.push({ x: Math.random() * w, y: Math.random() * h, life: 3 + Math.floor(Math.random() * 6), pts });
    }
    hairs = hairs.filter((hr) => hr.life-- > 0);
    for (const hr of hairs) {
      ctx.strokeStyle = 'rgba(217, 210, 189, 0.22)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      let x = hr.x;
      let y = hr.y;
      ctx.moveTo(x, y);
      for (let i = 0; i < hr.pts.length; i += 2) {
        const nx = x + hr.pts[i]!;
        const ny = y + hr.pts[i + 1]!;
        ctx.quadraticCurveTo(x + hr.pts[i]! * 0.5 + 4, y + hr.pts[i + 1]! * 0.5 - 3, nx, ny);
        x = nx;
        y = ny;
      }
      ctx.stroke();
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
      hairs = [];
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
