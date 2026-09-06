import type { LatestScore } from "@/lib/scores";
import type { StoredScore } from "@/lib/gameTypes";

function ordinal(n: number): string {
  const v = n % 100;
  if (v >= 11 && v <= 13) return `${n}th`;
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
}

export function Leaderboard({
  top,
  latest,
}: {
  top: StoredScore[];
  latest: LatestScore | null;
}) {
  return (
    <section className="flex h-full min-h-0 flex-col justify-center px-6 py-5 lg:px-8">
      <header className="mb-3 shrink-0">
        <h1 className="font-display text-2xl font-extrabold tracking-tight md:text-4xl">
          TOUCHDOWN — Live Leaderboard
        </h1>
        <p className="mt-1 font-serif italic text-[var(--text-muted)]">
          IE Aerospace Club · Segovia
        </p>
      </header>
      <ol className="flex min-h-0 flex-1 flex-col justify-center gap-[0.4vh]">
        {top.map((row, i) => (
          <li
            key={row.id}
            className="flex items-baseline justify-between gap-4"
          >
            <span className="min-w-0 truncate text-[clamp(0.85rem,2.1vh,1.25rem)] text-[var(--text-muted)]">
              {i + 1}. {row.name}
            </span>
            <span className="shrink-0 font-serif text-[clamp(1.1rem,2.8vh,1.85rem)] text-[var(--accent)]">
              {row.score}
            </span>
          </li>
        ))}
      </ol>
      {latest ? (
        <p className="mt-4 shrink-0 truncate font-serif text-[clamp(0.95rem,2.3vh,1.4rem)] italic text-[var(--text-primary)]">
          Just landed: {latest.name} — {latest.score} — {ordinal(latest.rank)}
        </p>
      ) : null}
    </section>
  );
}
