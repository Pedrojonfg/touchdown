import { PAD_Y, SHIP_BOTTOM, WORLD_HEIGHT, WORLD_WIDTH } from "./physics";

export const SHIP_X = WORLD_WIDTH / 2;

const DEEP = "#000024";
const OCEAN = "#000066";
const NAVY = "#000083";
const MARINE = "#0000A0";
const SEA = "#47BFFF";
const SKY = "#96DAFF";
const ICE = "#E5F6FF";

function hash(i: number) {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

const STARS = Array.from({ length: 90 }, (_, i) => ({
  x: hash(i) * WORLD_WIDTH,
  y: hash(i + 19) * (PAD_Y - 48),
  r: hash(i + 3) > 0.9 ? 1.5 : 0.55 + hash(i + 7) * 0.45,
  a: 0.28 + hash(i + 11) * 0.55,
}));

export function drawScene(
  ctx: CanvasRenderingContext2D,
  t: number,
  padGlow = 0,
) {
  const sky = ctx.createLinearGradient(0, 0, 0, PAD_Y);
  sky.addColorStop(0, DEEP);
  sky.addColorStop(0.72, OCEAN);
  sky.addColorStop(1, OCEAN);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

  const haze = ctx.createRadialGradient(
    SHIP_X,
    PAD_Y + 10,
    20,
    SHIP_X,
    PAD_Y,
    220,
  );
  haze.addColorStop(0, "rgba(150, 218, 255, 0.18)");
  haze.addColorStop(1, "rgba(150, 218, 255, 0)");
  ctx.fillStyle = haze;
  ctx.fillRect(0, PAD_Y - 180, WORLD_WIDTH, 200);

  for (let i = 0; i < STARS.length; i++) {
    const s = STARS[i]!;
    const twinkle = t
      ? 0.72 + 0.28 * Math.sin(t / 420 + i)
      : 1;
    ctx.globalAlpha = s.a * twinkle;
    ctx.fillStyle = ICE;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  drawEarth(ctx);
  drawMoon(ctx, padGlow);
}

function drawEarth(ctx: CanvasRenderingContext2D) {
  const x = 368;
  const y = 78;
  const r = 22;

  ctx.fillStyle = "rgba(150, 218, 255, 0.28)";
  ctx.beginPath();
  ctx.arc(x, y, r + 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = SEA;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = NAVY;
  ctx.beginPath();
  ctx.ellipse(x - 6, y - 4, 9, 6, 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + 8, y + 6, 7, 4.5, -0.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = ICE;
  ctx.beginPath();
  ctx.arc(x, y - r + 3, 7, Math.PI, 0);
  ctx.fill();
}

function moonRidge(ctx: CanvasRenderingContext2D) {
  ctx.quadraticCurveTo(20, PAD_Y + 4, 40, PAD_Y + 10);
  ctx.lineTo(58, PAD_Y + 6);
  ctx.quadraticCurveTo(72, PAD_Y - 4, 88, PAD_Y + 8);
  ctx.quadraticCurveTo(110, PAD_Y + 16, 128, PAD_Y + 7);
  ctx.lineTo(148, PAD_Y + 13);
  ctx.quadraticCurveTo(168, PAD_Y + 2, 188, PAD_Y + 8);
  ctx.lineTo(SHIP_X - 48, PAD_Y + 3);
  ctx.lineTo(SHIP_X - 40, PAD_Y);
  ctx.lineTo(SHIP_X + 40, PAD_Y);
  ctx.lineTo(SHIP_X + 52, PAD_Y + 4);
  ctx.quadraticCurveTo(286, PAD_Y + 14, 304, PAD_Y + 6);
  ctx.quadraticCurveTo(324, PAD_Y - 5, 344, PAD_Y + 9);
  ctx.lineTo(366, PAD_Y + 6);
  ctx.quadraticCurveTo(388, PAD_Y + 15, 408, PAD_Y + 8);
  ctx.quadraticCurveTo(428, PAD_Y + 11, WORLD_WIDTH, PAD_Y + 10);
}

function moonSilhouette(ctx: CanvasRenderingContext2D) {
  ctx.beginPath();
  ctx.moveTo(0, WORLD_HEIGHT);
  ctx.lineTo(0, PAD_Y + 14);
  moonRidge(ctx);
  ctx.lineTo(WORLD_WIDTH, WORLD_HEIGHT);
  ctx.closePath();
}

function drawMoon(ctx: CanvasRenderingContext2D, padGlow: number) {
  moonSilhouette(ctx);
  ctx.fillStyle = ICE;
  ctx.fill();

  ctx.save();
  moonSilhouette(ctx);
  ctx.clip();
  ctx.fillStyle = SKY;
  crater(ctx, 86, PAD_Y + 38, 32, 11);
  crater(ctx, 168, PAD_Y + 52, 22, 8);
  crater(ctx, 330, PAD_Y + 42, 36, 12);
  crater(ctx, 400, PAD_Y + 58, 18, 7);
  ctx.restore();

  ctx.beginPath();
  ctx.moveTo(0, PAD_Y + 14);
  moonRidge(ctx);
  ctx.strokeStyle = SKY;
  ctx.globalAlpha = 0.7;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.globalAlpha = 0.55;
  rim(ctx, 86, PAD_Y + 38, 32, 11);
  rim(ctx, 168, PAD_Y + 52, 22, 8);
  rim(ctx, 330, PAD_Y + 42, 36, 12);
  ctx.globalAlpha = 1;

  drawPad(ctx, padGlow);
}

function crater(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function rim(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, Math.PI, Math.PI * 2);
  ctx.stroke();
}

function drawPad(ctx: CanvasRenderingContext2D, padGlow: number) {
  const x = SHIP_X;
  const y = PAD_Y + 6;

  ctx.fillStyle = SKY;
  ctx.beginPath();
  ctx.ellipse(x, y + 3, 48, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = ICE;
  ctx.beginPath();
  ctx.ellipse(x, y, 40, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = MARINE;
  ctx.lineWidth = 1.25;
  ctx.beginPath();
  ctx.ellipse(x, y, 40, 6, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(x, y, 20, 3, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = MARINE;
  ctx.fillRect(x - 39, PAD_Y - 8, 3, 8);
  ctx.fillRect(x + 36, PAD_Y - 8, 3, 8);

  const glow = 5 + padGlow * 8;
  light(ctx, x - 37.5, PAD_Y - 9, glow);
  light(ctx, x + 37.5, PAD_Y - 9, glow);
}

function light(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, ICE);
  g.addColorStop(0.35, SEA);
  g.addColorStop(1, "rgba(71, 191, 255, 0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

export function drawRocket(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  thrusting: boolean,
  t: number,
) {
  if (thrusting) {
    const flick = 0.72 + 0.2 * Math.sin(t / 45) + ((t * 0.013) % 1) * 0.18;
    const len = 12 + 18 * flick;
    ctx.fillStyle = "rgba(71, 191, 255, 0.4)";
    ctx.beginPath();
    ctx.moveTo(x - 8, y + SHIP_BOTTOM);
    ctx.lineTo(x, y + SHIP_BOTTOM + len + 5);
    ctx.lineTo(x + 8, y + SHIP_BOTTOM);
    ctx.fill();
    ctx.fillStyle = ICE;
    ctx.beginPath();
    ctx.moveTo(x - 4, y + SHIP_BOTTOM);
    ctx.lineTo(x, y + SHIP_BOTTOM + len * 0.68);
    ctx.lineTo(x + 4, y + SHIP_BOTTOM);
    ctx.fill();
  }

  ctx.fillStyle = ICE;
  ctx.beginPath();
  ctx.moveTo(x, y - 16);
  ctx.lineTo(x + 6, y - 2);
  ctx.lineTo(x + 6, y + 12);
  ctx.lineTo(x + 12, y + 16);
  ctx.lineTo(x + 6, y + 14);
  ctx.lineTo(x + 3, y + 14);
  ctx.lineTo(x + 3, y + SHIP_BOTTOM);
  ctx.lineTo(x - 3, y + SHIP_BOTTOM);
  ctx.lineTo(x - 3, y + 14);
  ctx.lineTo(x - 6, y + 14);
  ctx.lineTo(x - 12, y + 16);
  ctx.lineTo(x - 6, y + 12);
  ctx.lineTo(x - 6, y - 2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = NAVY;
  ctx.lineWidth = 1.1;
  ctx.stroke();
}
