import { CanvasTexture, SRGBColorSpace, RepeatWrapping } from 'three';

// The cover emblem: a keyhole (circle + flared slot), with a thin bone ring around it.
function keyholePath(cx: number, cy: number, r: number) {
  const p = new Path2D();
  p.arc(cx, cy, r, 0, Math.PI * 2);
  p.moveTo(cx - r * 0.42, cy + r * 0.6);
  p.lineTo(cx - r * 0.95, cy + r * 3.1);
  p.lineTo(cx + r * 0.95, cy + r * 3.1);
  p.lineTo(cx + r * 0.42, cy + r * 0.6);
  p.closePath();
  return p;
}

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

function drawEmblem(ctx: CanvasRenderingContext2D, fill: string, stroke: string) {
  // ring
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(256, 340, 112, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(256, 340, 122, 0, Math.PI * 2);
  ctx.stroke();
  // keyhole
  ctx.fillStyle = fill;
  ctx.fill(keyholePath(256, 308, 30)); // optically centred in the ring
  // a hairline rule above and below, like a title page
  ctx.fillStyle = stroke;
  ctx.fillRect(176, 140, 160, 1.5);
  ctx.fillRect(176, 540, 160, 1.5);
  ctx.beginPath();
  ctx.arc(256, 140.75, 3, 0, Math.PI * 2);
  ctx.moveTo(259, 540.75);
  ctx.arc(256, 540.75, 3, 0, Math.PI * 2);
  ctx.fill();
}

export function leatherTexture() {
  const [c, ctx] = canvas(512, 704);
  // black book cloth, worn at the edges
  ctx.fillStyle = '#0d0b0c';
  ctx.fillRect(0, 0, 512, 704);
  for (let i = 0; i < 40; i++) {
    ctx.fillStyle = `rgba(${Math.random() < 0.5 ? '38,34,36' : '0,0,0'},${(Math.random() * 0.3).toFixed(2)})`;
    ctx.beginPath();
    ctx.ellipse(Math.random() * 512, Math.random() * 704, 30 + Math.random() * 90, 20 + Math.random() * 60, Math.random() * 3, 0, Math.PI * 2);
    ctx.fill();
  }
  const edge = ctx.createRadialGradient(256, 352, 220, 256, 352, 470);
  edge.addColorStop(0, 'rgba(0,0,0,0)');
  edge.addColorStop(1, 'rgba(60,54,50,.35)');
  ctx.fillStyle = edge;
  ctx.fillRect(0, 0, 512, 704);
  speckle(ctx, 512, 704, 9000, '#000', 0.4);
  speckle(ctx, 512, 704, 2500, '#5a524a', 0.18);
  // bone-foil double frame + keyhole emblem (foil worn thin in places)
  ctx.strokeStyle = 'rgba(232,220,194,.7)';
  ctx.lineWidth = 2;
  ctx.strokeRect(34, 34, 444, 636);
  ctx.lineWidth = 1;
  ctx.strokeRect(44, 44, 424, 616);
  drawEmblem(ctx, 'rgba(232,220,194,.82)', 'rgba(232,220,194,.6)');
  speckle(ctx, 512, 704, 1800, '#0d0b0c', 0.6);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

export function embossTexture() {
  const [c, ctx] = canvas(512, 704);
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, 512, 704);
  ctx.filter = 'blur(2px)';
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 3;
  ctx.strokeRect(34, 34, 444, 636);
  drawEmblem(ctx, '#fff', '#fff');
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
  ctx.strokeStyle = 'rgba(42,26,18,.07)';
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
