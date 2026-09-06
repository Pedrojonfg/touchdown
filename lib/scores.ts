import type { SupabaseClient } from "@supabase/supabase-js";
import type { ScoreRow, StoredScore } from "./gameTypes";

export function buildScoreRow(input: {
  name: string;
  score: number;
  fuelRemaining: number;
  impactSpeed: number;
  outcome: ScoreRow["outcome"];
}): ScoreRow {
  return {
    name: input.name.trim(),
    score: input.score,
    fuel_remaining: input.fuelRemaining,
    impact_speed: input.impactSpeed,
    outcome: input.outcome,
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
    row.fuel_remaining <= 100 &&
    (row.outcome === "landed" || row.outcome === "crashed")
  );
}

export type LatestScore = StoredScore & { rank: number };

function nameKey(name: string): string {
  return name.trim().toLowerCase();
}

export function isCrashRow(row: Pick<StoredScore, "outcome">): boolean {
  return row.outcome === "crashed";
}

/** Rows must already be ordered by score desc (then created_at asc). */
export function uniqueBestByName(rows: StoredScore[]): StoredScore[] {
  const seen = new Set<string>();
  const bests: StoredScore[] = [];
  for (const row of rows) {
    const key = nameKey(row.name);
    if (seen.has(key)) continue;
    seen.add(key);
    bests.push(row);
  }
  return bests;
}

export function rankOfName(name: string, bests: StoredScore[]): number {
  const key = nameKey(name);
  const index = bests.findIndex((row) => nameKey(row.name) === key);
  return index === -1 ? bests.length + 1 : index + 1;
}

export function boardFromRows(rows: StoredScore[]): {
  top: StoredScore[];
  latest: LatestScore | null;
} {
  const landings = rows.filter((row) => !isCrashRow(row));
  const bests = uniqueBestByName(landings);
  const latest = rows.reduce<StoredScore | null>((acc, row) => {
    if (!acc || row.created_at > acc.created_at) return row;
    return acc;
  }, null);
  return {
    top: bests.slice(0, 10),
    latest: latest
      ? {
          ...latest,
          rank: isCrashRow(latest) ? 0 : rankOfName(latest.name, bests),
        }
      : null,
  };
}

export async function fetchLeaderboard(client: SupabaseClient): Promise<{
  top: StoredScore[];
  latest: LatestScore | null;
}> {
  // ponytail: booth-scale unique in JS — DISTINCT ON view if this table grows
  const { data, error } = await client
    .from("scores")
    .select("*")
    .order("score", { ascending: false })
    .order("created_at", { ascending: true })
    .limit(1000);
  if (error) throw error;
  return boardFromRows((data ?? []) as StoredScore[]);
}

export async function insertScore(
  client: SupabaseClient,
  row: ScoreRow,
): Promise<void> {
  if (!isValidScoreRow(row)) throw new Error("Invalid score row");
  const { error } = await client.from("scores").insert(row);
  if (error) throw error;
}
