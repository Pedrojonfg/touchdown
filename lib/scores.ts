import type { SupabaseClient } from "@supabase/supabase-js";
import type { ScoreRow, StoredScore } from "./gameTypes";

export function buildScoreRow(input: {
  name: string;
  score: number;
  fuelRemaining: number;
  impactSpeed: number;
}): ScoreRow {
  return {
    name: input.name.trim(),
    score: input.score,
    fuel_remaining: input.fuelRemaining,
    impact_speed: input.impactSpeed,
  };
}

export function isValidScoreRow(row: ScoreRow): boolean {
  const nameLen = row.name.trim().length;
  return (
    nameLen >= 1 &&
    nameLen <= 20 &&
    row.score >= 0 &&
    row.score <= 1000 &&
    row.fuel_remaining >= 0 &&
    row.fuel_remaining <= 100
  );
}

export async function fetchTopScores(
  client: SupabaseClient,
): Promise<StoredScore[]> {
  const { data, error } = await client
    .from("scores")
    .select("*")
    .order("score", { ascending: false })
    .limit(10);
  if (error) throw error;
  return (data ?? []) as StoredScore[];
}

export async function fetchLatestScore(
  client: SupabaseClient,
): Promise<StoredScore | null> {
  const { data, error } = await client
    .from("scores")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return (data as StoredScore | null) ?? null;
}

export async function insertScore(
  client: SupabaseClient,
  row: ScoreRow,
): Promise<void> {
  if (!isValidScoreRow(row)) throw new Error("Invalid score row");
  const { error } = await client.from("scores").insert(row);
  if (error) throw error;
}
