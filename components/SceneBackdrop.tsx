"use client";

import { useEffect, useRef } from "react";
import { WORLD_HEIGHT, WORLD_WIDTH } from "../lib/physics";
import { drawScene } from "../lib/scene";

export function SceneBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const paint = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.clientWidth || window.innerWidth;
      const h = canvas.clientHeight || window.innerHeight;
      canvas.width = Math.max(1, w) * dpr;
      canvas.height = Math.max(1, h) * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "#000024";
      ctx.fillRect(0, 0, w, h);
      // ponytail: cover + pin to the bottom so the moon sits behind the form
      const scale = Math.max(w / WORLD_WIDTH, h / WORLD_HEIGHT);
      ctx.save();
      ctx.translate((w - WORLD_WIDTH * scale) / 2, h - WORLD_HEIGHT * scale);
      ctx.scale(scale, scale);
      drawScene(ctx, 0);
      ctx.restore();
    };
    paint();
    const raf = requestAnimationFrame(paint);
    window.addEventListener("resize", paint);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", paint);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 h-full w-full"
    />
  );
}
