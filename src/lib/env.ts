import type { EffectEnv } from '../effects/types';

type NavigatorExtras = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
};

const queries = {
  reducedMotion: '(prefers-reduced-motion: reduce)',
  reducedData: '(prefers-reduced-data: reduce)',
  coarse: '(hover: none), (pointer: coarse)',
  small: '(max-width: 719px)',
} as const;

function mq(q: string): boolean {
  return typeof window !== 'undefined' && window.matchMedia(q).matches;
}

export function getEnv(): EffectEnv {
  const nav = navigator as NavigatorExtras;
  const saveData = mq(queries.reducedData) || nav.connection?.saveData === true;
  const cores = nav.hardwareConcurrency ?? 8;
  const memory = nav.deviceMemory ?? 8;
  return {
    reducedMotion: mq(queries.reducedMotion),
    saveData,
    lowPower: saveData || cores <= 4 || memory <= 4,
    coarsePointer: mq(queries.coarse),
    small: mq(queries.small),
  };
}

/** Fires when the user flips reduced-motion or the pointer type changes (e.g. tablet + keyboard). */
export function onEnvChange(cb: () => void): () => void {
  const lists = [queries.reducedMotion, queries.coarse].map((q) => window.matchMedia(q));
  lists.forEach((l) => l.addEventListener('change', cb));
  return () => lists.forEach((l) => l.removeEventListener('change', cb));
}

export function prefersReducedMotion(): boolean {
  return mq(queries.reducedMotion);
}
