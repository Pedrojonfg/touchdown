import type { Contact, PhysicsState } from "./gameTypes";

export const GRAVITY = 220;
export const THRUST = 480;
export const MAX_FUEL = 100;
export const FUEL_BURN_RATE = 22;
export const SAFE_LANDING_SPEED = 90;
export const PAD_Y = 720;
export const SHIP_START_Y = 80;
export const WORLD_WIDTH = 450;
export const WORLD_HEIGHT = 800;

export function initialFlight(): PhysicsState {
  return { y: SHIP_START_Y, vy: 0, fuel: MAX_FUEL };
}

export function stepPhysics(
  state: PhysicsState,
  thrusting: boolean,
  dt: number,
): { state: PhysicsState; contact: Contact | null } {
  const next: PhysicsState = { ...state };

  if (thrusting && next.fuel > 0) {
    next.vy -= (THRUST - GRAVITY) * dt;
    next.fuel = Math.max(0, next.fuel - FUEL_BURN_RATE * dt);
  } else {
    next.vy += GRAVITY * dt;
  }

  next.y += next.vy * dt;

  if (next.y >= PAD_Y) {
    next.y = PAD_Y;
    return {
      state: next,
      contact: {
        outcome: next.vy <= SAFE_LANDING_SPEED ? "landed" : "crashed",
        impactSpeed: next.vy,
        fuelRemaining: next.fuel,
      },
    };
  }

  return { state: next, contact: null };
}
