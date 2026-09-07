"use client";

import { useEffect, useState } from "react";
import { Leaderboard } from "@/components/Leaderboard";
import { QRCodeBlock } from "@/components/QRCodeBlock";
import type { StoredScore } from "@/lib/gameTypes";
import { fetchLeaderboard, type LatestScore } from "@/lib/scores";
import { getSupabase } from "@/lib/supabaseClient";

const CLUB_URL = "https://ie-aerospace-club.vercel.app";

function playUrl() {
  if (process.env.NEXT_PUBLIC_GAME_URL) return process.env.NEXT_PUBLIC_GAME_URL;
  if (typeof window !== "undefined") return `${window.location.origin}/play`;
  return "/play";
}

export default function LeaderboardPage() {
  const [top, setTop] = useState<StoredScore[]>([]);
  const [latest, setLatest] = useState<LatestScore | null>(null);
  const [qrUrl, setQrUrl] = useState(process.env.NEXT_PUBLIC_GAME_URL ?? "/play");

  useEffect(() => {
    setQrUrl(playUrl());
    const client = getSupabase();
    if (!client) return;

    const refetch = async () => {
      try {
        const next = await fetchLeaderboard(client);
        setTop(next.top);
        setLatest(next.latest);
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
    <main className="grid min-h-dvh grid-cols-1 bg-[var(--bg-void)] lg:h-dvh lg:overflow-hidden lg:grid-cols-[minmax(280px,2fr)_3fr]">
      <div className="flex flex-col items-center justify-center gap-8 overflow-y-auto border-b border-[var(--panel)] px-8 py-8 lg:border-b-0 lg:border-r">
        <QRCodeBlock url={qrUrl} label="PLAY" />
        <QRCodeBlock url={CLUB_URL} label="CLUB WEBSITE" />
      </div>
      <Leaderboard top={top} latest={latest} />
    </main>
  );
}
