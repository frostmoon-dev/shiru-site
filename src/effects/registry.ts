import type { EffectLoader } from './types';

/**
 * Effects register themselves by folder name: `src/effects/<name>/index.ts` is available as
 * `data-effect="<name>"`. Vite turns each glob entry into a lazy `import()`, so an effect's
 * code is only downloaded when an element using it comes near the viewport.
 *
 * Folders starting with `_` (shared helpers) are ignored.
 */
const discovered = import.meta.glob<{ default: import('./types').EffectFactory }>([
  './*/index.ts',
  '!./_*/index.ts',
]);

const loaders = new Map<string, EffectLoader>();

for (const [path, loader] of Object.entries(discovered)) {
  const name = path.split('/')[1];
  if (name) loaders.set(name, loader);
}

/** Register an effect from somewhere other than this folder (e.g. a third-party package). */
export function registerEffect(name: string, loader: EffectLoader): void {
  loaders.set(name, loader);
}

export function getEffectLoader(name: string): EffectLoader | undefined {
  return loaders.get(name);
}

export function listEffects(): string[] {
  return [...loaders.keys()].sort();
}
