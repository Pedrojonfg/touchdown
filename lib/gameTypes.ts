export type GamePhase = "entering-name" | "flying" | "landed" | "crashed";

export type PhysicsState = {
  y: number;
  vy: number;
  fuel: number;
};

export type Contact = {
  outcome: "landed" | "crashed";
  impactSpeed: number;
  fuelRemaining: number;
};

export type ScoreRow = {
  name: string;
  score: number;
  fuel_remaining: number;
  impact_speed: number;
};

export type StoredScore = ScoreRow & {
  id: string;
  created_at: string;
};
