import { getEffectLoader } from './registry';
import type { Effect, EffectOptions } from './types';
import { getEnv, onEnvChange } from '../lib/env';
import { whenIdle } from './_shared/idle';

// Decorative effects start once the page is idle, so they never compete with first paint.
let idle: Promise<void> | undefined;

/**
 * Finds every `[data-effect]` element, lazy-loads its effect when it nears the viewport,
 * and unmounts it again when it is far away (to free GPU memory and CPU).
 *
 *   data-effect="name"               which effect (folder name in src/effects)
 *   data-effect-options='{"a":1}'    JSON passed to mount()
 *   data-effect-eager                mount without waiting to be near the viewport; never unmount
 *   data-effect-priority="high"      don't wait for the page to go idle first (e.g. the intro)
 *
 * The runtime writes `data-effect-state` = loading | mounted | static | error | idle.
 */
type State = 'idle' | 'loading' | 'mounted' | 'static' | 'error';
type Instance = {
  el: HTMLElement;
  name: string;
  options: EffectOptions;
  eager: boolean;
  effect?: Effect;
  state: State;
  token: number;
};

const instances = new Map<HTMLElement, Instance>();
let nearIO: IntersectionObserver | undefined;
let farIO: IntersectionObserver | undefined;
let globalsBound = false;

function setState(inst: Instance, state: State) {
  inst.state = state;
  inst.el.dataset.effectState = state;
}

function parseOptions(el: HTMLElement): EffectOptions {
  const raw = el.dataset.effectOptions;
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as EffectOptions) : {};
  } catch {
    if (import.meta.env.DEV) console.warn(`[effects] bad data-effect-options on`, el);
    return {};
  }
}

async function activate(inst: Instance) {
  if (inst.state !== 'idle') return;
  const loader = getEffectLoader(inst.name);
  if (!loader) {
    if (import.meta.env.DEV) console.warn(`[effects] unknown effect "${inst.name}"`);
    setState(inst, 'error');
    return;
  }
  const token = ++inst.token;
  setState(inst, 'loading');
  if (inst.el.dataset.effectPriority !== 'high') {
    idle ??= whenIdle(1500);
    await idle;
    if (token !== inst.token) return;
  }
  const env = getEnv();
  let effect: Effect;
  try {
    effect = (await loader()).default();
  } catch {
    if (token === inst.token) setState(inst, 'error');
    return;
  }
  if (token !== inst.token) return; // deactivated while loading
  inst.effect = effect;

  if (env.reducedMotion) {
    effect.reducedMotion?.(inst.el, inst.options, env);
    setState(inst, 'static');
    return;
  }
  try {
    await effect.mount(inst.el, inst.options, env);
    if (token !== inst.token) {
      effect.unmount();
      return;
    }
    setState(inst, 'mounted');
  } catch (err) {
    if (import.meta.env.DEV) console.warn(`[effects] "${inst.name}" fell back to static`, err);
    try {
      effect.unmount();
    } catch {
      /* already torn down */
    }
    effect.reducedMotion?.(inst.el, inst.options, env);
    setState(inst, 'error');
  }
}

function deactivate(inst: Instance) {
  inst.token++;
  try {
    inst.effect?.unmount();
  } catch (err) {
    if (import.meta.env.DEV) console.warn(`[effects] unmount failed for "${inst.name}"`, err);
  }
  inst.effect = undefined;
  setState(inst, 'idle');
}

function ensureObservers() {
  if (nearIO) return;
  nearIO = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const inst = instances.get(e.target as HTMLElement);
        if (inst && e.isIntersecting) void activate(inst);
      }
    },
    { rootMargin: '60% 0px 60% 0px' },
  );
  farIO = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const inst = instances.get(e.target as HTMLElement);
        if (inst && !e.isIntersecting && !inst.eager && inst.state === 'mounted') deactivate(inst);
      }
    },
    { rootMargin: '160% 0px 160% 0px' },
  );
}

function bindGlobals() {
  if (globalsBound) return;
  globalsBound = true;
  document.addEventListener('visibilitychange', () => {
    for (const inst of instances.values()) {
      if (inst.state !== 'mounted') continue;
      if (document.hidden) inst.effect?.pause?.();
      else inst.effect?.resume?.();
    }
  });
  // Reduced-motion flipped while the page is open: remount everything in the new mode.
  onEnvChange(() => remountAll());
}

/** Register and observe every `[data-effect]` under root. Safe to call repeatedly. */
export function startEffects(root: ParentNode = document) {
  ensureObservers();
  bindGlobals();
  root.querySelectorAll<HTMLElement>('[data-effect]').forEach((el) => {
    if (instances.has(el)) return;
    const name = el.dataset.effect?.trim();
    if (!name) return;
    const inst: Instance = {
      el,
      name,
      options: parseOptions(el),
      eager: el.hasAttribute('data-effect-eager'),
      state: 'idle',
      token: 0,
    };
    instances.set(el, inst);
    el.dataset.effectState = 'idle';
    if (inst.eager) void activate(inst);
    else {
      nearIO!.observe(el);
      farIO!.observe(el);
    }
  });
}

/** Unmount and forget every effect (before a page swap). */
export function stopEffects() {
  for (const inst of instances.values()) {
    nearIO?.unobserve(inst.el);
    farIO?.unobserve(inst.el);
    if (inst.state !== 'idle') deactivate(inst);
  }
  instances.clear();
}

export function remountAll() {
  for (const inst of instances.values()) {
    if (inst.state === 'idle') continue;
    deactivate(inst);
    void activate(inst);
  }
}
