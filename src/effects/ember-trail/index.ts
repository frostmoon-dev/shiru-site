import type { EffectFactory } from '../types';

/** Faint embers trailing the cursor. Mouse/trackpad only; the loop sleeps when no embers live. */
type Ember = { x: number; y: number; vx: number; vy: number; life: number; max: number; r: number };

const emberTrail: EffectFactory = () => {
  let canvas: HTMLCanvasElement | undefined;
  let ctx: CanvasRenderingContext2D | null = null;
  let raf = 0;
  let last = 0;
  const embers: Ember[] = [];

  const resize = () => {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse' || embers.length > 70) return;
    const n = Math.random() < 0.5 ? 1 : 2;
    for (let i = 0; i < n; i++) {
      embers.push({
        x: e.clientX + (Math.random() - 0.5) * 6,
        y: e.clientY + (Math.random() - 0.5) * 6,
        vx: (Math.random() - 0.5) * 18,
        vy: -12 - Math.random() * 26,
        life: 0,
        max: 0.6 + Math.random() * 0.7,
        r: 0.7 + Math.random() * 1.5,
      });
    }
    if (!raf) {
      last = performance.now();
      raf = requestAnimationFrame(tick);
    }
  };
  const tick = (now: number) => {
    if (!ctx || !canvas) return;
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'lighter';
    for (let i = embers.length - 1; i >= 0; i--) {
      const p = embers[i]!;
      p.life += dt;
      if (p.life >= p.max) {
        embers.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt + Math.sin((p.life + i) * 9) * 0.25;
      p.y += p.vy * dt;
      const k = 1 - p.life / p.max;
      // brass core cooling to blood
      const g = Math.round(100 + 62 * k);
      ctx.fillStyle = `rgba(${Math.round(201 + 20 * k)}, ${g}, ${Math.round(60 * k)}, ${(0.55 * k).toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * (0.6 + k * 0.6), 0, Math.PI * 2);
      ctx.fill();
    }
    raf = embers.length ? requestAnimationFrame(tick) : 0;
    if (!raf) ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return {
    name: 'ember-trail',
    mount(el, _opts, env) {
      if (env.coarsePointer || env.lowPower) return;
      canvas = document.createElement('canvas');
      Object.assign(canvas.style, { position: 'absolute', inset: '0', width: '100%', height: '100%' });
      el.appendChild(canvas);
      ctx = canvas.getContext('2d');
      resize();
      window.addEventListener('resize', resize, { passive: true });
      window.addEventListener('pointermove', onMove, { passive: true });
    },
    unmount() {
      cancelAnimationFrame(raf);
      raf = 0;
      embers.length = 0;
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      canvas?.remove();
      canvas = undefined;
      ctx = null;
    },
  };
};
export default emberTrail;
