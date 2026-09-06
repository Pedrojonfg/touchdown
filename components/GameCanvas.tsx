"use client";

import { useEffect, useRef, useState } from "react";
import { FuelGauge } from "./FuelGauge";
import {
  initialFlight,
  MAX_FUEL,
  PAD_Y,
  stepPhysics,
  WORLD_HEIGHT,
  WORLD_WIDTH,
} from "../lib/physics";
import type { Contact, PhysicsState } from "../lib/gameTypes";

const SHIP_X = WORLD_WIDTH / 2;

type Particle = { x: number; y: number; vx: number; vy: number; life: number };

export function GameCanvas({
  name,
  attemptCount,
  onLanded,
  onCrashed,
}: {
  name: string;
  attemptCount: number;
  onLanded: (impactSpeed: number, fuelRemaining: number) => void;
  onCrashed: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const thrusting = useRef(false);
  const onLandedRef = useRef(onLanded);
  const onCrashedRef = useRef(onCrashed);
  onLandedRef.current = onLanded;
  onCrashedRef.current = onCrashed;
  const [fuel, setFuel] = useState(MAX_FUEL);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let state: PhysicsState = initialFlight();
    let ended = false;
    thrusting.current = false;
    setFuel(state.fuel);

    let flash = 0;
    let shake = 0;
    let particles: Particle[] = [];
    let last = performance.now();
    let lastFuelUi = 0;
    let raf = 0;
    let settleTimer: number | undefined;

    const setThrust = (v: boolean) => {
      thrusting.current = v;
    };

    const onPointerDown = (e: PointerEvent) => {
      e.preventDefault();
      setThrust(true);
    };
    const onPointerUp = () => setThrust(false);
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== "Space" || e.repeat) return;
      e.preventDefault();
      setThrust(true);
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      e.preventDefault();
      setThrust(false);
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    const burst = () => {
      for (let i = 0; i < 18; i++) {
        const a = (Math.PI * 2 * i) / 18;
        particles.push({
          x: SHIP_X,
          y: PAD_Y - 12,
          vx: Math.cos(a) * 80,
          vy: Math.sin(a) * 40 - 40,
          life: 1,
        });
      }
    };

    const finish = (contact: Contact) => {
      if (ended) return;
      ended = true;
      setFuel(contact.fuelRemaining);
      if (contact.outcome === "landed") {
        flash = 1;
        burst();
      } else {
        shake = 1;
      }
      settleTimer = window.setTimeout(() => {
        if (contact.outcome === "landed") {
          onLandedRef.current(contact.impactSpeed, contact.fuelRemaining);
        } else {
          onCrashedRef.current();
        }
      }, 380);
    };

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = WORLD_WIDTH * dpr;
      canvas.height = WORLD_HEIGHT * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const ox = shake > 0 ? (Math.random() - 0.5) * 10 * shake : 0;
      const oy = shake > 0 ? (Math.random() - 0.5) * 10 * shake : 0;
      ctx.save();
      ctx.translate(ox, oy);
      ctx.fillStyle = "#000024";
      ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

      ctx.strokeStyle = "#000083";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(40, PAD_Y);
      ctx.lineTo(WORLD_WIDTH - 40, PAD_Y);
      ctx.stroke();
      ctx.fillStyle = "#0000A0";
      ctx.fillRect(SHIP_X - 36, PAD_Y, 72, 8);

      if (thrusting.current && state.fuel > 0 && !ended) {
        ctx.fillStyle = "#47BFFF";
        ctx.beginPath();
        ctx.moveTo(SHIP_X - 5, state.y + 10);
        ctx.lineTo(SHIP_X, state.y + 26);
        ctx.lineTo(SHIP_X + 5, state.y + 10);
        ctx.fill();
      }

      ctx.fillStyle = "#E5F6FF";
      ctx.beginPath();
      ctx.moveTo(SHIP_X, state.y - 14);
      ctx.lineTo(SHIP_X + 9, state.y + 10);
      ctx.lineTo(SHIP_X - 9, state.y + 10);
      ctx.closePath();
      ctx.fill();

      for (const p of particles) {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = "#47BFFF";
        ctx.fillRect(p.x, p.y, 2, 2);
      }
      ctx.globalAlpha = 1;

      if (flash > 0) {
        ctx.fillStyle = `rgba(229, 246, 255, ${0.35 * flash})`;
        ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
      }
      ctx.restore();
    };

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      if (!ended) {
        const stepped = stepPhysics(state, thrusting.current, dt);
        state = stepped.state;
        if (now - lastFuelUi > 80) {
          lastFuelUi = now;
          setFuel(state.fuel);
        }
        if (stepped.contact) finish(stepped.contact);
      } else {
        flash = Math.max(0, flash - dt * 2.4);
        shake = Math.max(0, shake - dt * 3);
        particles = particles
          .map((p) => ({
            ...p,
            x: p.x + p.vx * dt,
            y: p.y + p.vy * dt,
            life: p.life - dt * 2,
          }))
          .filter((p) => p.life > 0);
      }

      draw();
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(settleTimer);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      canvas.removeEventListener("pointerdown", onPointerDown);
    };
    // ponytail: remount via key={attemptCount}; callbacks read from refs
  }, []);

  return (
    <div className="relative h-dvh w-full touch-none overflow-hidden bg-[var(--bg-void)]">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        style={{ touchAction: "none" }}
      />
      <div className="pointer-events-none absolute left-3 top-24">
        <FuelGauge fuel={fuel} />
      </div>
      <div className="pointer-events-none absolute right-4 top-4 text-right">
        <p className="font-display text-sm font-semibold text-[var(--text-muted)]">{name}</p>
        <p className="font-serif text-xs text-[var(--text-muted)]">
          {attemptCount}
        </p>
      </div>
      {attemptCount === 1 ? (
        <p className="pointer-events-none absolute bottom-8 left-0 right-0 text-center font-serif text-sm italic text-[var(--text-muted)]">
          Hold to thrust. Release to fall. Land gently.
        </p>
      ) : null}
    </div>
  );
}
