export function FuelGauge({ fuel, max = 100 }: { fuel: number; max?: number }) {
  const ratio = Math.max(0, Math.min(1, fuel / max));
  const low = ratio <= 0.2;

  return (
    <div className="flex h-48 flex-col items-center gap-2">
      <div className="relative h-full w-1.5 overflow-hidden bg-[var(--panel)]">
        <div
          className="absolute bottom-0 w-full"
          style={{
            height: `${ratio * 100}%`,
            background: low ? "var(--accent-danger)" : "var(--accent-amber)",
          }}
        />
      </div>
      <span
        className="font-mono-telemetry text-[10px] tracking-wide text-[var(--text-muted)]"
        style={{ color: low ? "var(--accent-danger)" : undefined }}
      >
        FUEL
      </span>
    </div>
  );
}
