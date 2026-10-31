/**
 * Shared geometry for the 3D grimoire and the DOM pages laid over it. The open spread lies
 * flat in the z = 0 plane facing a perspective camera, so it projects to screen without
 * distortion and the DOM text lines up with the paper exactly.
 */
export const PAGE_W = 1;
export const PAGE_H = 1.38;
export const FOV = 30;

export function fit(aspect: number) {
  const visibleH = Math.max(PAGE_H / 0.86, (2 * PAGE_W) / 0.94 / aspect);
  const distance = visibleH / (2 * Math.tan(((FOV / 2) * Math.PI) / 180));
  const pageWPct = (PAGE_W / (visibleH * aspect)) * 100;
  const pageHPct = (PAGE_H / visibleH) * 100;
  return { distance, pageWPct, pageHPct };
}
