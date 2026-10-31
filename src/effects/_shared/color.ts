/** Read a hex design token as raw sRGB 0–1 floats (shaders here write sRGB directly). */
export function tokenRGB(name: string, fallback: string): [number, number, number] {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
  const hex = /^#([0-9a-f]{6})$/i.test(raw) ? raw : fallback;
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255) as [number, number, number];
}
