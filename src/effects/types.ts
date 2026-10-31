/**
 * The contract every effect implements. See EFFECTS.md.
 *
 * An effect module default-exports a factory. The runtime calls the factory once per element,
 * so each instance can keep its own state and `unmount()` needs no arguments.
 */
export type EffectOptions = Record<string, unknown>;

export interface EffectEnv {
  /** User asked for less motion. The runtime calls `reducedMotion()` instead of `mount()`. */
  reducedMotion: boolean;
  /** Low-end device, battery saver or save-data: use fewer particles, lower DPR. */
  lowPower: boolean;
  /** No precise pointer (touch). Hover-only toys should stay off. */
  coarsePointer: boolean;
  /** prefers-reduced-data or navigator.connection.saveData. */
  saveData: boolean;
  /** Narrow viewport (< 720px). */
  small: boolean;
}

export interface Effect {
  name: string;
  /** Start the effect. Throwing or rejecting makes the runtime fall back to `reducedMotion`. */
  mount(el: HTMLElement, options: EffectOptions, env: EffectEnv): void | Promise<void>;
  /** Stop everything, remove listeners, free GPU memory. Must be safe to call twice. */
  unmount(): void;
  /** Static fallback: no motion, no flicker. Must leave the element looking finished. */
  reducedMotion?: (el: HTMLElement, options: EffectOptions, env: EffectEnv) => void;
  /** Optional: called when the tab is hidden / shown again. */
  pause?(): void;
  resume?(): void;
}

export type EffectFactory = () => Effect;
export type EffectModule = { default: EffectFactory };
export type EffectLoader = () => Promise<EffectModule>;
