import type { StoredScore } from "@/lib/gameTypes";

export function Leaderboard({
  top,
  latest,
}: {
  top: StoredScore[];
  latest: StoredScore | null;
}) {
  return (
    <section className="flex h-full min-h-0 flex-col justify-center px-8">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-extrabold tracking-tight md:text-5xl">
          TOUCHDOWN — Live Leaderboard
        </h1>
        <p className="mt-2 font-serif italic text-[var(--text-muted)]">
          IE Aerospace Club · Segovia
        </p>
      </header>
      <ol className="space-y-3">
        {top.map((row, i) => (
          <li
            key={row.id}
            className="flex items-baseline justify-between gap-6"
          >
            <span className="text-2xl text-[var(--text-muted)] md:text-4xl">
              {i + 1}. {row.name}
            </span>
            <span className="font-serif text-3xl text-[var(--accent)] md:text-5xl">
              {row.score}
            </span>
          </li>
        ))}
      </ol>
      {latest ? (
        <p className="mt-10 font-serif text-xl italic text-[var(--text-primary)] md:text-3xl">
          Just landed: {latest.name} — {latest.score}
        </p>
      ) : null}
    </section>
  );
}
