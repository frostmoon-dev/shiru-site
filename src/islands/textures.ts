import { CanvasTexture, SRGBColorSpace, RepeatWrapping } from 'three';

// A wide-brimmed hat silhouette (brim + crown), embossed into the grimoire's cover.
const HAT_BRIM =
  'M6 116c6-6 14-8 22-6 22-9 52-13 82-13s62 4 84 13c8-2 16 0 21 6-4 1-9 2-13 4-21 12-55 19-92 19s-70-7-91-19c-4-2-9-3-13-4z';
const HAT_CROWN =
  'M64 111c4-21 11-42 21-61 9-17 20-31 34-40 11-7 24-9 36-6-12 3-22 9-29 18-7 10-9 21-7 33 3 19 15 36 26 56-26 6-56 6-81 0z';

function canvas(w: number, h: number) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d')!] as const;
}

function speckle(ctx: CanvasRenderingContext2D, w: number, h: number, n: number, color: string, max: number) {
  ctx.fillStyle = color;
  for (let i = 0; i < n; i++) {
    ctx.globalAlpha = Math.random() * max;
    ctx.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 2, 1 + Math.random() * 2);
  }
  ctx.globalAlpha = 1;
}

function drawHat(ctx: CanvasRenderingContext2D, cx: number, cy: number, scale: number) {
  ctx.save();
  ctx.translate(cx - 110 * scale, cy - 85 * scale);
  ctx.scale(scale, scale);
  ctx.fill(new Path2D(HAT_BRIM));
  ctx.fill(new Path2D(HAT_CROWN));
  ctx.restore();
}

export function leatherTexture() {
  const [c, ctx] = canvas(512, 704);
  ctx.fillStyle = '#2b1215';
  ctx.fillRect(0, 0, 512, 704);
  for (let i = 0; i < 40; i++) {
    ctx.fillStyle = `rgba(${Math.random() < 0.5 ? '92,14,18' : '15,6,8'},${(Math.random() * 0.25).toFixed(2)})`;
    ctx.beginPath();
    ctx.ellipse(Math.random() * 512, Math.random() * 704, 30 + Math.random() * 90, 20 + Math.random() * 60, Math.random() * 3, 0, Math.PI * 2);
    ctx.fill();
  }
  speckle(ctx, 512, 704, 9000, '#000', 0.35);
  speckle(ctx, 512, 704, 3000, '#7a3a30', 0.25);
  // brass-foil frame + hat
  ctx.strokeStyle = 'rgba(201,162,74,.75)';
  ctx.lineWidth = 3;
  ctx.strokeRect(34, 34, 444, 636);
  ctx.lineWidth = 1;
  ctx.strokeRect(46, 46, 420, 612);
  ctx.fillStyle = 'rgba(201,162,74,.22)';
  drawHat(ctx, 256, 330, 1.7);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

export function embossTexture() {
  const [c, ctx] = canvas(512, 704);
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, 512, 704);
  ctx.filter = 'blur(3px)';
  ctx.fillStyle = '#fff';
  drawHat(ctx, 256, 330, 1.7);
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 4;
  ctx.strokeRect(34, 34, 444, 636);
  ctx.filter = 'none';
  speckle(ctx, 512, 704, 6000, '#777', 0.4);
  return new CanvasTexture(c);
}

export function paperTexture() {
  const [c, ctx] = canvas(512, 704);
  const g = ctx.createRadialGradient(256, 352, 80, 256, 352, 460);
  g.addColorStop(0, '#ece1c9');
  g.addColorStop(1, '#bfa77a');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 704);
  speckle(ctx, 512, 704, 4000, '#5a4632', 0.12);
  ctx.strokeStyle = 'rgba(92,14,18,.08)';
  for (let y = 120; y < 640; y += 28) {
    ctx.beginPath();
    ctx.moveTo(60, y);
    ctx.lineTo(452, y);
    ctx.stroke();
  }
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.wrapS = RepeatWrapping;
  return t;
}
