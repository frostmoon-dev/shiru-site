import type { EffectEnv, EffectFactory } from '../types';

/**
 * Lumos: the cursor carries a small light. A bright tip sits exactly on the pointer, a soft halo
 * trails it, and a few pale motes drift off as it moves. A click flares the light ("Lumos Maxima").
 * In the hero, the same light uncovers what's hidden in the dark (see lantern-reveal).
 *
 * Mouse/trackpad only. The system cursor stays visible: people who enlarge it still need it.
 * Reduced motion: the light follows the pointer exactly, with no motes and no flare.
 */
type Mote = { x: number; y: number; vx: number; vy: number; life: number; max: number; r: number };

const lumos: EffectFactory = () => {
  let host: HTMLElement | undefined;
  let core: HTMLElement | undefined;
  let halo: HTMLElement | undefined;
  let canvas: HTMLCanvasElement | undefined;
  let ctx: CanvasRenderingContext2D | null = null;
  let raf = 0;
  let last = 0;
  let calm = false;
  let motesOn = true;
  const motes: Mote[] = [];
  const p = { x: -999, y: -999 };
  const h = { x: -999, y: -999 };

  const place = (el: HTMLElement, x: number, y: number) => (el.style.transform = `translate3d(${x}px, ${y}px, 0)`);

  const resize = () => {
    if (!canvas) return;
    canvas.width = document.documentElement.clientWidth;
    canvas.height = document.documentElement.clientHeight;
  };
  const loop = (now: number) => {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    h.x += (p.x - h.x) * (calm ? 1 : 0.22);
    h.y += (p.y - h.y) * (calm ? 1 : 0.22);
    if (halo) place(halo, h.x, h.y);
    let busy = Math.abs(p.x - h.x) + Math.abs(p.y - h.y) > 0.3;
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = motes.length - 1; i >= 0; i--) {
        const m = motes[i]!;
        m.life += dt;
        if (m.life >= m.max) {
          motes.splice(i, 1);
          continue;
        }
        m.x += m.vx * dt;
        m.y += m.vy * dt;
        const k = 1 - m.life / m.max;
        ctx.fillStyle = `rgba(243, 234, 214, ${(0.7 * k).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r * (0.5 + k * 0.5), 0, Math.PI * 2);
        ctx.fill();
      }
      busy ||= motes.length > 0;
    }
    raf = busy ? requestAnimationFrame(loop) : 0;
  };
  const wake = () => {
    if (!raf) {
      last = performance.now();
      raf = requestAnimationFrame(loop);
    }
  };
  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse' || !host) return;
    host.classList.add('is-lit');
    p.x = e.clientX;
    p.y = e.clientY;
    if (h.x < -900) {
      h.x = p.x;
      h.y = p.y;
    }
    if (core) place(core, p.x, p.y);
    if (motesOn && Math.random() < 0.35 && motes.length < 40) {
      motes.push({
        x: p.x,
        y: p.y,
        vx: (Math.random() - 0.5) * 30,
        vy: -10 - Math.random() * 25,
        life: 0,
        max: 0.5 + Math.random() * 0.7,
        r: 0.6 + Math.random() * 1.2,
      });
    }
    wake();
  };
  const onLeave = () => host?.classList.remove('is-lit');
  const onDown = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse' || calm || !halo) return;
    halo.classList.remove('is-flaring');
    void halo.offsetWidth;
    halo.classList.add('is-flaring');
  };

  const build = (el: HTMLElement, env: EffectEnv, reduced: boolean) => {
    if (env.coarsePointer) return;
    host = el;
    calm = reduced;
    motesOn = !reduced && !env.lowPower;
    el.classList.add('lumos');
    halo = document.createElement('div');
    halo.className = 'lumos__halo';
    core = document.createElement('div');
    core.className = 'lumos__core';
    el.append(halo, core);
    if (motesOn) {
      canvas = document.createElement('canvas');
      canvas.className = 'lumos__motes';
      el.prepend(canvas);
      ctx = canvas.getContext('2d');
      resize();
      window.addEventListener('resize', resize, { passive: true });
    }
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeave);
  };

  return {
    name: 'lumos',
    mount(el, _opts, env) {
      build(el, env, false);
    },
    reducedMotion(el, _opts, env) {
      build(el, env, true);
    },
    unmount() {
      cancelAnimationFrame(raf);
      raf = 0;
      motes.length = 0;
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      canvas?.remove();
      core?.remove();
      halo?.remove();
      host?.classList.remove('lumos', 'is-lit');
      canvas = core = halo = host = undefined;
      ctx = null;
    },
  };
};
export default lumos;
