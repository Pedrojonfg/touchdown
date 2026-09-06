"use client";

import { useEffect, useState } from "react";
import { Leaderboard } from "@/components/Leaderboard";
import { QRCodeBlock } from "@/components/QRCodeBlock";
import type { StoredScore } from "@/lib/gameTypes";
import { fetchLatestScore, fetchTopScores } from "@/lib/scores";
import { getSupabase } from "@/lib/supabaseClient";

function playUrl() {
  if (process.env.NEXT_PUBLIC_GAME_URL) return process.env.NEXT_PUBLIC_GAME_URL;
  if (typeof window !== "undefined") return `${window.location.origin}/play`;
  return "/play";
}

export default function LeaderboardPage() {
  const [top, setTop] = useState<StoredScore[]>([]);
  const [latest, setLatest] = useState<StoredScore | null>(null);
  const [qrUrl, setQrUrl] = useState(process.env.NEXT_PUBLIC_GAME_URL ?? "/play");

  useEffect(() => {
    setQrUrl(playUrl());
    const client = getSupabase();
    if (!client) return;

    const refetch = async () => {
      try {
        const [nextTop, nextLatest] = await Promise.all([
          fetchTopScores(client),
          fetchLatestScore(client),
        ]);
        setTop(nextTop);
        setLatest(nextLatest);
      } catch (err) {
        console.error(err);
      }
    };

    void refetch();

    const channel = client
      .channel("scores-feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "scores" },
        () => {
          void refetch();
        },
      )
      .subscribe();

    return () => {
      void client.removeChannel(channel);
    };
  }, []);

  return (
    <main className="grid min-h-dvh grid-cols-1 bg-[var(--bg-void)] lg:grid-cols-[minmax(280px,2fr)_3fr]">
      <div className="flex flex-col items-center justify-center gap-6 border-b border-[var(--panel)] px-8 py-10 lg:border-b-0 lg:border-r">
        <QRCodeBlock url={qrUrl} />
      </div>
      <Leaderboard top={top} latest={latest} />
    </main>
  );
}
