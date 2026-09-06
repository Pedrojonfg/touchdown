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
import { drawRocket, drawScene, SHIP_X } from "../lib/scene";
import type { Contact, PhysicsState } from "../lib/gameTypes";

const TUTORIAL_KEY = "touchdown-tutorial";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
  color: string;
};
type TutorialStep = "hold" | "release" | "play";

function tutorialPending(): boolean {
  try {
    return localStorage.getItem(TUTORIAL_KEY) !== "1";
  } catch {
    return true;
  }
}

function markTutorialDone() {
  try {
    localStorage.setItem(TUTORIAL_KEY, "1");
  } catch {
    // ponytail: private mode — skip persist
  }
}

export function GameCanvas({
  name,
  attemptCount,
  onLanded,
  onCrashed,
}: {
  name: string;
  attemptCount: number;
  onLanded: (impactSpeed: number, fuelRemaining: number) => void;
  onCrashed: (impactSpeed: number, fuelRemaining: number) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const thrusting = useRef(false);
  const onLandedRef = useRef(onLanded);
  const onCrashedRef = useRef(onCrashed);
  onLandedRef.current = onLanded;
  onCrashedRef.current = onCrashed;
  const [fuel, setFuel] = useState(MAX_FUEL);
  const [hint, setHint] = useState<string | null>(() =>
    tutorialPending()
      ? "Hold to thrust."
      : attemptCount === 1
        ? "Land gently."
        : null,
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let state: PhysicsState = initialFlight();
    let ended = false;
    let outcome: Contact["outcome"] | null = null;
    let tutorial: TutorialStep = tutorialPending() ? "hold" : "play";
    thrusting.current = false;
    setFuel(state.fuel);
    setHint(
      tutorial === "hold"
        ? "Hold to thrust."
        : attemptCount === 1
          ? "Land gently."
          : null,
    );

    let flash = 0;
    let shake = 0;
    let particles: Particle[] = [];
    let last = performance.now();
    let lastFuelUi = 0;
    let raf = 0;
    let settleTimer: number | undefined;
    // Launch tap / iOS ghost click would otherwise finish the tutorial in one frame
    let ignoreUntil = performance.now() + 500;
    let holdStarted = 0;

    const setThrust = (v: boolean) => {
      if (performance.now() < ignoreUntil) return;
      thrusting.current = v;
      if (v && tutorial === "hold") {
        tutorial = "release";
        holdStarted = performance.now();
        setHint("Release to fall.");
      } else if (!v && tutorial === "release") {
        if (performance.now() - holdStarted < 200) {
          tutorial = "hold";
          setHint("Hold to thrust.");
          return;
        }
        tutorial = "play";
        markTutorialDone();
        state = initialFlight();
        setFuel(state.fuel);
        setHint("Land gently.");
      }
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

    const spawn = (
      n: number,
      spread: number,
      speed: number,
      size: number,
      color: string,
      life: number,
    ) => {
      for (let i = 0; i < n; i++) {
        particles.push({
          x: SHIP_X + (Math.random() - 0.5) * spread,
          y: PAD_Y - 8,
          vx: (Math.random() - 0.5) * speed,
          vy: -20 - Math.random() * speed,
          life,
          size,
          color,
        });
      }
    };

    const finish = (contact: Contact) => {
      if (ended) return;
      ended = true;
      outcome = contact.outcome;
      setFuel(contact.fuelRemaining);
      if (contact.outcome === "landed") {
        flash = 1;
        spawn(12, 50, 70, 2, "#96DAFF", 0.75);
      } else {
        shake = 1;
        spawn(10, 24, 160, 2, "#96DAFF", 0.7);
        spawn(16, 10, 260, 5, "#E5F6FF", 1.15);
        spawn(8, 8, 220, 3, "#47BFFF", 1);
      }
      settleTimer = window.setTimeout(
        () => {
          if (contact.outcome === "landed") {
            onLandedRef.current(contact.impactSpeed, contact.fuelRemaining);
          } else {
            onCrashedRef.current(contact.impactSpeed, contact.fuelRemaining);
          }
        },
        contact.outcome === "landed" ? 380 : 560,
      );
    };

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = Math.max(1, w) * dpr;
      canvas.height = Math.max(1, h) * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const worldFit = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const scale = Math.min(w / WORLD_WIDTH, h / WORLD_HEIGHT);
      return {
        scale,
        ox: (w - WORLD_WIDTH * scale) / 2,
        oy: (h - WORLD_HEIGHT * scale) / 2,
      };
    };

    const draw = (now: number) => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.fillStyle = "#000024";
      ctx.fillRect(0, 0, w, h);

      const { scale, ox, oy } = worldFit();
      const sx = shake > 0 ? (Math.random() - 0.5) * 14 * shake : 0;
      const sy = shake > 0 ? (Math.random() - 0.5) * 14 * shake : 0;
      ctx.save();
      ctx.translate(ox + sx, oy + sy);
      ctx.scale(scale, scale);
      drawScene(ctx, now, flash);

      const showFlame =
        thrusting.current &&
        (tutorial !== "play" || (state.fuel > 0 && !ended));
      if (outcome !== "crashed") {
        drawRocket(ctx, SHIP_X, state.y, showFlame, now);
      }

      for (const p of particles) {
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }
      ctx.globalAlpha = 1;

      if (flash > 0) {
        const g = ctx.createRadialGradient(
          SHIP_X,
          PAD_Y,
          8,
          SHIP_X,
          PAD_Y,
          140,
        );
        g.addColorStop(0, `rgba(229, 246, 255, ${0.4 * flash})`);
        g.addColorStop(1, "rgba(229, 246, 255, 0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, PAD_Y - 160, WORLD_WIDTH, 200);
      }
      ctx.restore();
    };

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      if (!ended && tutorial === "play") {
        const stepped = stepPhysics(state, thrusting.current, dt);
        state = stepped.state;
        if (now - lastFuelUi > 80) {
          lastFuelUi = now;
          setFuel(state.fuel);
        }
        const nearPad = state.y > PAD_Y - 150;
        const flaming =
          thrusting.current && state.fuel > 0 && nearPad && particles.length < 80;
        if (flaming) {
          const close = 1 - (PAD_Y - state.y) / 150;
          spawn(1, 18 + close * 24, 50 + close * 40, 1 + close, "#96DAFF", 0.4);
        }
        if (stepped.contact) finish(stepped.contact);
      } else {
        flash = Math.max(0, flash - dt * 2.4);
        shake = Math.max(0, shake - dt * 2.2);
      }

      particles = particles
        .map((p) => ({
          ...p,
          x: p.x + p.vx * dt,
          y: p.y + p.vy * dt,
          vy: p.vy + 220 * dt,
          life: p.life - dt * 1.6,
        }))
        .filter((p) => p.life > 0);

      draw(now);
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
      {hint ? (
        <p className="pointer-events-none absolute bottom-28 left-0 right-0 text-center font-serif text-sm italic text-[var(--text-muted)]">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
