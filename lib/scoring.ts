import { MAX_FUEL, SAFE_LANDING_SPEED } from "./physics";

const SCORE_MAX = 1000;
const SPEED_WEIGHT = 600;
const FUEL_WEIGHT = 400;

export function calculateScore(
  impactSpeed: number,
  fuelRemaining: number,
): number {
  const speedScore = SPEED_WEIGHT * (1 - impactSpeed / SAFE_LANDING_SPEED);
  const fuelScore = FUEL_WEIGHT * (fuelRemaining / MAX_FUEL);
  return Math.round(Math.max(0, Math.min(SCORE_MAX, speedScore + fuelScore)));
}
