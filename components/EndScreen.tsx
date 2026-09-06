"use client";

import { SceneBackdrop } from "./SceneBackdrop";

const flyerUrl = process.env.NEXT_PUBLIC_CLUB_FLYER_URL ?? "";

export function EndScreen({
  outcome,
  score,
  onRetry,
}: {
  outcome: "landed" | "crashed";
  score?: number;
  onRetry: () => void;
}) {
  if (outcome === "crashed") {
    return (
      <div className="relative flex min-h-dvh flex-col justify-end overflow-hidden bg-[var(--bg-void)] px-6 pb-16">
        <SceneBackdrop />
        <div className="relative z-10">
          <h1 className="font-display text-5xl font-extrabold text-[var(--accent-danger)]">
            Impact.
          </h1>
          <p className="mt-3 text-[var(--text-muted)]">
            Touchdown speed exceeded safe limits.
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="font-display mt-10 bg-[var(--panel)] px-6 py-3 text-lg font-semibold"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-dvh flex-col justify-end overflow-hidden bg-[var(--bg-void)] px-6 pb-16">
      <SceneBackdrop />
      <div className="relative z-10">
        <h1 className="font-display text-5xl font-extrabold">Touchdown.</h1>
        <p className="font-serif mt-6 text-7xl text-[var(--accent)]">
          {score}
        </p>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Landing precision + fuel remaining
        </p>
        <div className="mt-10 flex flex-col gap-3">
          {flyerUrl ? (
            <a
              href={flyerUrl}
              className="font-display bg-[var(--accent)] px-6 py-3 text-center text-lg font-semibold text-[var(--bg-void)]"
            >
              Join the Club
            </a>
          ) : null}
          <button
            type="button"
            onClick={onRetry}
            className="font-display bg-[var(--panel)] px-6 py-3 text-lg font-semibold"
          >
            Play Again
          </button>
        </div>
      </div>
    </div>
  );
}
