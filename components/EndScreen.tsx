"use client";

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
      <div className="flex min-h-dvh flex-col justify-end bg-[var(--bg-void)] px-6 pb-16">
        <h1 className="text-5xl font-medium text-[var(--accent-danger)]">
          Impact.
        </h1>
        <p className="mt-3 text-[var(--text-muted)]">
          Touchdown speed exceeded safe limits.
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-10 bg-[var(--panel)] px-6 py-3 text-lg"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col justify-end bg-[var(--bg-void)] px-6 pb-16">
      <h1 className="text-5xl font-medium">Touchdown.</h1>
      <p className="font-mono-telemetry mt-6 text-7xl text-[var(--accent)]">
        {score}
      </p>
      <p className="mt-2 text-sm text-[var(--text-muted)]">
        Landing precision + fuel remaining
      </p>
      <div className="mt-10 flex flex-col gap-3">
        {flyerUrl ? (
          <a
            href={flyerUrl}
            className="bg-[var(--accent)] px-6 py-3 text-center text-lg font-medium text-[var(--bg-void)]"
          >
            Join the Club
          </a>
        ) : null}
        <button
          type="button"
          onClick={onRetry}
          className="bg-[var(--panel)] px-6 py-3 text-lg"
        >
          Play Again
        </button>
      </div>
    </div>
  );
}
