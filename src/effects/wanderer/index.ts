import type { EffectEnv, EffectFactory } from '../types';
import { gsap } from '../../lib/motion';
import { gutter } from '../../lib/gutter';

/**
 * The wanderer: the butterfly pinned in the lace frame is only resting.
 *
 * Press it and it struggles, pulls free of its pin and flies off. From then on it lives on the
 * page: it settles on whatever is marked `data-perch`, opens and closes its wings now and then,
 * moves on when its perch scrolls out of sight, and takes off when the cursor (or a finger) comes
 * too close. Press the empty pin and it comes back. The frame stays empty for the rest of the visit
 * (sessionStorage), so it is still loose when you return from another page.
 *
 *   <span data-effect="wanderer" data-effect-eager data-effect-options='{"src":"…","release":"…",…}'>
 *     <img class="lace__moth"> <span class="lace__pin">
 *   </span>
 *   <h2 data-perch="end">            settles just past the end of the text
 *   <div data-perch="0.9 0.1">       settles at 90% across, 10% down the box
 *   <li data-perch="…" data-perch-min="720">   only on viewports at least this wide
 *
 * The butterfly itself is decoration (aria-hidden, no pointer events); the control is a real
 * button with a label, and the frame's caption says what happened.
 * Reduced motion: it stays pinned. Nothing is offered that would only work by moving.
 */
const KEY = 'site:butterfly-free';
const RATIO = 632 / 986; // the cut-out's height / width

type Opts = { src?: string; release?: string; recall?: string; pinned?: string; freed?: string };
type Point = { x: number; y: number };
type Perch = { el: HTMLElement; spot: string };
type State = 'pinned' | 'flying' | 'perched';

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const clamp = (v: number, a: number, b: number) => Math.min(Math.max(v, a), b);

const wanderer: EffectFactory = () => {
  let host: HTMLElement | undefined;
  let moth: HTMLElement | null = null;
  let caption: HTMLElement | null = null;
  let btn: HTMLButtonElement | undefined;
  let label: HTMLElement | undefined;
  let fly: HTMLElement | undefined;
  let wings: HTMLElement | undefined;
  let opts: Opts = {};
  let state: State = 'pinned';
  let perch: Perch | undefined;
  let W = 60;
  const pos = { x: 0, y: 0, r: 0, s: 1, o: 1 };
  let flight: gsap.core.Tween | undefined;
  let beat: gsap.core.Tween | undefined;
  let idle: gsap.core.Tween | undefined;
  let busyUntil = 0;
  let scrollTimer = 0;
  let watch = 0;
  let ro: ResizeObserver | undefined;

  const render = () => {
    if (!fly) return;
    fly.style.transform = `translate3d(${(pos.x - W / 2).toFixed(1)}px, ${(pos.y - (W * RATIO) / 2).toFixed(1)}px, 0) rotate(${pos.r.toFixed(1)}deg) scale(${pos.s.toFixed(3)})`;
    fly.style.opacity = pos.o.toFixed(2);
  };

  /* ---------- where things are (document coordinates) ---------- */
  const docW = () => document.documentElement.clientWidth;
  const docH = () => document.documentElement.scrollHeight;
  const keepIn = (p: Point): Point => ({ x: clamp(p.x, W * 0.7, docW() - W * 0.7), y: clamp(p.y, W, docH() - W) });
  const shown = (el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return false;
    try {
      return el.checkVisibility({ visibilityProperty: true, opacityProperty: true });
    } catch {
      return getComputedStyle(el).visibility !== 'hidden';
    }
  };
  const spotOf = (p: Perch): Point => {
    let x: number;
    let y: number;
    if (p.spot === 'end') {
      // just past the last line of the element's own text
      const text = [...p.el.childNodes].filter((n) => n.nodeType === Node.TEXT_NODE && n.textContent?.trim()).pop();
      const range = document.createRange();
      range.selectNodeContents(text ?? p.el);
      const rects = range.getClientRects();
      const last = rects[rects.length - 1] ?? p.el.getBoundingClientRect();
      x = last.right + W * 0.45;
      y = last.top + last.height * 0.28;
    } else {
      const [fx = 0.9, fy = 0.1] = p.spot.split(/\s+/).map(Number);
      const r = p.el.getBoundingClientRect();
      x = r.left + r.width * fx;
      y = r.top + r.height * fy;
    }
    return keepIn({ x: x + window.scrollX, y: y + window.scrollY });
  };
  const inView = (p: Point, pad = 0) => {
    const y = p.y - window.scrollY;
    return y > 84 - pad && y < window.innerHeight - 48 + pad;
  };
  const perches = (): Perch[] =>
    [...document.querySelectorAll<HTMLElement>('[data-perch]')]
      .filter((el) => window.innerWidth >= Number(el.dataset.perchMin ?? 0) && shown(el))
      .map((el) => ({ el, spot: el.dataset.perch || '0.9 0.1' }));
  const home = (): Point => {
    const r = (moth ?? host!).getBoundingClientRect();
    return { x: r.left + r.width / 2 + window.scrollX, y: r.top + r.height / 2 + window.scrollY };
  };
  /** How big the pinned butterfly is drawn, as a scale of the loose one. */
  const homeScale = () => (moth ? moth.getBoundingClientRect().width / W : 1) || 1;

  /* ---------- wings ---------- */
  const stopWings = () => {
    beat?.kill();
    idle?.kill();
    beat = idle = undefined;
  };
  const beatFast = () => {
    stopWings();
    if (wings) beat = gsap.fromTo(wings, { scaleX: 1 }, { scaleX: 0.16, duration: 0.085, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  };
  /** At rest: every few seconds the wings close and open again, slowly. */
  const breathe = () => {
    stopWings();
    if (!wings) return;
    gsap.set(wings, { scaleX: 1 });
    const again = () => {
      if (!wings || state !== 'perched') return;
      idle = gsap.to(wings, { scaleX: rand(0.3, 0.6), duration: rand(0.35, 0.6), ease: 'sine.inOut', yoyo: true, repeat: Math.random() < 0.35 ? 3 : 1, delay: rand(2.2, 6.5), onComplete: again });
    };
    again();
  };

  /* ---------- flight ---------- */
  type FlightOpts = { from?: Point; fromScale?: number; toScale?: number; fade?: 'in' | 'out'; rest?: number; onLand?: () => void };
  const flyTo = (to: Point, o: FlightOpts = {}) => {
    if (!fly) return;
    flight?.kill();
    state = 'flying';
    fly.classList.add('is-out', 'is-flying');
    const a = o.from ?? { x: pos.x, y: pos.y };
    const dx = to.x - a.x;
    const dy = to.y - a.y;
    const dist = Math.hypot(dx, dy) || 1;
    // a loose S-curve: two control points pushed off the straight line, and a little lift
    const nx = -dy / dist;
    const ny = dx / dist;
    const side = Math.random() < 0.5 ? -1 : 1;
    const bow = clamp(dist * rand(0.22, 0.4), 40, 240) * side;
    const lift = clamp(dist * 0.18, 30, 120);
    const c1 = { x: a.x + dx * 0.3 + nx * bow, y: a.y + dy * 0.3 + ny * bow - lift };
    const c2 = { x: a.x + dx * 0.72 - nx * bow * 0.55, y: a.y + dy * 0.72 - ny * bow * 0.55 - lift * 0.6 };
    const s0 = o.fromScale ?? pos.s;
    const s1 = o.toScale ?? 1;
    const rest = o.rest ?? rand(-16, 16);
    const flutters = Math.max(3, Math.round(dist / 90));
    const drive = { t: 0 };
    let heading = pos.r;
    beatFast();
    flight = gsap.to(drive, {
      t: 1,
      duration: clamp(dist / 430, 0.75, 2.4),
      ease: 'sine.inOut',
      onUpdate: () => {
        const t = drive.t;
        const u = 1 - t;
        // cubic Bézier, and its tangent for the heading
        const bx = u * u * u * a.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t * t * t * to.x;
        const by = u * u * u * a.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * to.y;
        const tx = 3 * u * u * (c1.x - a.x) + 6 * u * t * (c2.x - c1.x) + 3 * t * t * (to.x - c2.x);
        const ty = 3 * u * u * (c1.y - a.y) + 6 * u * t * (c2.y - c1.y) + 3 * t * t * (to.y - c2.y);
        // butterflies do not fly straight: a small bob across the path, dying away at both ends
        const bob = Math.sin(t * Math.PI * flutters) * 7 * Math.sin(t * Math.PI);
        pos.x = bx + nx * bob;
        pos.y = by + ny * bob;
        let want = (Math.atan2(ty, tx) * 180) / Math.PI + 90;
        // never fly upside down: lean into the turn instead
        want = clamp(((want + 540) % 360) - 180, -75, 75);
        const settle = t > 0.8 ? (t - 0.8) / 0.2 : 0;
        want = want * (1 - settle) + rest * settle;
        heading += (want - heading) * 0.2;
        pos.r = heading;
        const height = Math.sin(t * Math.PI); // 0 on the ground, 1 mid-air
        pos.s = (s0 + (s1 - s0) * t) * (1 + 0.22 * height);
        pos.o = o.fade === 'in' ? clamp(t / 0.25, 0, 1) : o.fade === 'out' ? clamp((1 - t) / 0.25, 0, 1) : 1;
        fly!.style.setProperty('--lift', height.toFixed(2));
        render();
      },
      onComplete: () => {
        flight = undefined;
        fly?.classList.remove('is-flying');
        fly?.style.setProperty('--lift', '0');
        pos.r = rest;
        pos.s = s1;
        render();
        o.onLand?.();
      },
    });
  };

  const settleOn = (p: Perch) => {
    perch = p;
    state = 'perched';
    busyUntil = performance.now() + 900;
    // landed: two slower beats, then still
    stopWings();
    if (wings) beat = gsap.fromTo(wings, { scaleX: 1 }, { scaleX: 0.4, duration: 0.2, ease: 'sine.inOut', yoyo: true, repeat: 3, onComplete: breathe });
  };

  /** Pick somewhere to go: a perch on screen, not the one it is on, not right under the pointer. */
  const choose = (avoid?: Point, allowOffscreen = false, leaving = false): Perch | undefined => {
    // when it first pulls free it wants out of the frame; later the frame is as good a perch as any
    const frame = host?.closest('figure');
    const all = perches().filter((p) => p.el !== perch?.el && !(leaving && frame?.contains(p.el)));
    const scored = all.map((p) => ({ p, at: spotOf(p) }));
    const near = scored.filter(({ at }) => inView(at) && (!avoid || Math.hypot(at.x - avoid.x, at.y - avoid.y) > 220));
    if (near.length) return near[Math.floor(Math.random() * near.length)]!.p;
    if (!allowOffscreen || !scored.length) return undefined;
    // nothing on screen: the nearest one anywhere on the page
    const mid = window.scrollY + window.innerHeight / 2;
    return scored.sort((m, n) => Math.abs(m.at.y - mid) - Math.abs(n.at.y - mid))[0]!.p;
  };

  /** Something came too close. */
  const startle = (from?: Point) => {
    if (state !== 'perched' || performance.now() < busyUntil) return;
    const next = choose(from);
    if (next) return flyTo(spotOf(next), { onLand: () => settleOn(next) });
    // nowhere else to go: up off its perch, a turn in the air, and back down where it was
    const here = perch;
    if (!here) return;
    const up = keepIn({ x: pos.x + rand(-170, 170), y: pos.y - rand(120, 180) });
    flyTo(up, { rest: pos.r, onLand: () => flyTo(spotOf(here), { onLand: () => settleOn(here) }) });
  };

  /** Its perch has scrolled away (or vanished): turn up somewhere the visitor can see. */
  const follow = () => {
    if (state !== 'perched' || !perch) return;
    const gone = !shown(perch.el);
    if (!gone && inView({ x: pos.x, y: pos.y }, 60)) return;
    const next = choose();
    if (!next) return;
    const to = spotOf(next);
    // it comes in from the edge of the screen it was last seen beyond
    const above = pos.y < window.scrollY + window.innerHeight / 2;
    const from = keepIn({ x: clamp(to.x + rand(-260, 260), 40, docW() - 40), y: above ? window.scrollY + 40 : window.scrollY + window.innerHeight - 40 });
    flyTo(to, { from, fade: 'in', fromScale: 0.6, onLand: () => settleOn(next) });
  };

  /* ---------- the frame ---------- */
  const setFrame = (empty: boolean) => {
    host?.classList.toggle('is-empty', empty);
    if (label) label.textContent = (empty ? opts.recall : opts.release) ?? '';
    if (caption) caption.textContent = (empty ? opts.freed : opts.pinned) ?? caption.textContent;
    try {
      if (empty) sessionStorage.setItem(KEY, '1');
      else sessionStorage.removeItem(KEY);
    } catch {
      /* private mode: it just won't remember */
    }
  };

  const release = () => {
    if (!fly || !moth || state !== 'pinned') return;
    state = 'flying';
    const at = home();
    const s0 = homeScale();
    // it struggles against the pin first
    gsap
      .timeline({
        onComplete: () => {
          gsap.set(moth, { clearProps: 'all' });
          Object.assign(pos, { x: at.x, y: at.y, r: 0, s: s0, o: 1 });
          render();
          setFrame(true);
          gutter();
          const next = choose(undefined, true, true);
          const to = next ? spotOf(next) : keepIn({ x: at.x + 220, y: at.y - 260 });
          flyTo(to, { fromScale: s0, onLand: () => (next ? settleOn(next) : (state = 'perched')) });
        },
      })
      .to(moth, { scaleX: 0.7, duration: 0.07, yoyo: true, repeat: 5, ease: 'sine.inOut' }, 0)
      .to(moth, { x: 3, rotate: 3, duration: 0.06, yoyo: true, repeat: 5, ease: 'sine.inOut' }, 0.05)
      .to(moth, { scaleX: 0.3, y: -6, duration: 0.12, ease: 'power2.in' }, 0.5);
  };

  const recall = () => {
    if (!fly || state === 'pinned') return;
    const at = home();
    const onScreen = inView({ x: pos.x, y: pos.y }, 80) && state !== 'flying';
    const from = onScreen ? undefined : keepIn({ x: at.x + rand(-300, 300), y: window.scrollY + 40 });
    perch = undefined;
    flyTo(at, {
      from,
      fade: onScreen ? undefined : 'in',
      toScale: homeScale(),
      rest: 0,
      onLand: () => {
        stopWings();
        fly?.classList.remove('is-out');
        setFrame(false);
        state = 'pinned';
      },
    });
  };

  /* ---------- listeners ---------- */
  const near = (e: PointerEvent, radius: number) => Math.hypot(e.clientX + window.scrollX - pos.x, e.clientY + window.scrollY - pos.y) < radius;
  const onMove = (e: PointerEvent) => {
    if (state === 'perched' && e.pointerType === 'mouse' && near(e, 92)) startle({ x: e.clientX + window.scrollX, y: e.clientY + window.scrollY });
  };
  const onDown = (e: PointerEvent) => {
    if (state === 'perched' && near(e, 64)) startle({ x: e.clientX + window.scrollX, y: e.clientY + window.scrollY });
  };
  const onScroll = () => {
    window.clearTimeout(scrollTimer);
    scrollTimer = window.setTimeout(follow, 650);
  };
  /** Layout moves under it (images arriving, a card turning, the letter opening): stay on the perch. */
  const hold = () => {
    if (state !== 'perched' || !perch) return;
    if (!shown(perch.el)) return follow();
    const at = spotOf(perch);
    if (Math.abs(at.x - pos.x) + Math.abs(at.y - pos.y) < 1) return;
    pos.x = at.x;
    pos.y = at.y;
    render();
  };
  const measure = () => {
    W = window.innerWidth < 720 ? 46 : 60;
    fly?.style.setProperty('--w', `${W}px`);
    hold();
  };

  return {
    name: 'wanderer',
    mount(el, options, _env: EffectEnv) {
      host = el;
      opts = options as Opts;
      moth = el.querySelector<HTMLElement>('.lace__moth');
      caption = el.closest('figure')?.querySelector<HTMLElement>('.lace__caption') ?? null;
      if (!moth || !opts.src) return;
      el.style.setProperty('--moth', `url("${opts.src}")`);
      caption?.setAttribute('aria-live', 'polite');

      btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'lace__release';
      label = document.createElement('span');
      label.className = 'visually-hidden';
      btn.append(label);
      btn.addEventListener('click', () => (state === 'pinned' ? release() : recall()));
      el.append(btn);

      fly = document.createElement('div');
      fly.className = 'wanderer';
      fly.setAttribute('aria-hidden', 'true');
      const img = new Image();
      img.src = opts.src;
      img.alt = '';
      img.decoding = 'async';
      img.width = 986; // the cut-out's own proportions, so the browser can reserve its box
      img.height = 632;
      img.className = 'wanderer__wings';
      wings = img;
      fly.append(img);
      document.body.append(fly);
      measure();

      let free = false;
      try {
        free = sessionStorage.getItem(KEY) === '1';
      } catch {
        /* ignore */
      }
      setFrame(free);
      if (free) {
        // already loose from earlier in this visit: find it somewhere sensible
        const p = choose(undefined, true);
        if (p) {
          const at = spotOf(p);
          Object.assign(pos, { x: at.x, y: at.y, r: rand(-16, 16), s: 1, o: 1 });
          fly.classList.add('is-out');
          render();
          perch = p;
          state = 'perched';
          breathe();
        } else {
          setFrame(false);
        }
      }

      window.addEventListener('pointermove', onMove, { passive: true });
      window.addEventListener('pointerdown', onDown, { passive: true });
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', measure, { passive: true });
      ro = new ResizeObserver(hold);
      ro.observe(document.body);
      watch = window.setInterval(hold, 1200);
    },
    // Reduced motion: it stays pinned, and no button is offered.
    reducedMotion() {},
    unmount() {
      flight?.kill();
      stopWings();
      if (moth) gsap.killTweensOf(moth);
      window.clearTimeout(scrollTimer);
      window.clearInterval(watch);
      ro?.disconnect();
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', measure);
      fly?.remove();
      btn?.remove();
      host?.classList.remove('is-empty');
      if (caption && opts.pinned) caption.textContent = opts.pinned;
      host = fly = wings = btn = label = perch = ro = undefined;
      moth = caption = null;
      state = 'pinned';
    },
  };
};
export default wanderer;
