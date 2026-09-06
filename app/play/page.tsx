"use client";

import { useCallback, useState } from "react";
import { EndScreen } from "@/components/EndScreen";
import { GameCanvas } from "@/components/GameCanvas";
import { NameForm } from "@/components/NameForm";
import type { GamePhase } from "@/lib/gameTypes";
import { calculateScore } from "@/lib/scoring";
import { buildScoreRow, insertScore, isValidScoreRow } from "@/lib/scores";
import { getSupabase } from "@/lib/supabaseClient";

export default function PlayPage() {
  const [phase, setPhase] = useState<GamePhase>("entering-name");
  const [name, setName] = useState("");
  const [attemptCount, setAttemptCount] = useState(0);
  const [score, setScore] = useState(0);

  function launch(nextName: string) {
    setName(nextName);
    setAttemptCount(1);
    setPhase("flying");
  }

  function onRetry() {
    setAttemptCount((n) => n + 1);
    setPhase("flying");
  }

  const onLanded = useCallback(
    async (impactSpeed: number, fuelRemaining: number) => {
      const nextScore = calculateScore(impactSpeed, fuelRemaining);
      setScore(nextScore);
      setPhase("landed");
      const row = buildScoreRow({
        name,
        score: nextScore,
        fuelRemaining: Math.max(0, Math.min(100, Math.round(fuelRemaining))),
        impactSpeed,
      });
      const client = getSupabase();
      if (!client || !isValidScoreRow(row)) return;
      try {
        await insertScore(client, row);
      } catch (err) {
        console.error(err);
      }
    },
    [name],
  );

  const onCrashed = useCallback(() => {
    setPhase("crashed");
  }, []);

  if (phase === "entering-name") return <NameForm onLaunch={launch} />;

  if (phase === "landed") {
    return <EndScreen outcome="landed" score={score} onRetry={onRetry} />;
  }

  if (phase === "crashed") {
    return <EndScreen outcome="crashed" onRetry={onRetry} />;
  }

  return (
    <GameCanvas
      key={attemptCount}
      name={name}
      attemptCount={attemptCount}
      onLanded={onLanded}
      onCrashed={onCrashed}
    />
  );
}
