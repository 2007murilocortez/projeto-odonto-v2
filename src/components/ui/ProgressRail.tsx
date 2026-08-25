type ProgressRailProps = {
  current: number;
  phase: 1 | 2;
  connection: 1 | 2;
};

export function ProgressRail({ current, phase, connection }: ProgressRailProps) {
  return (
    <div className="flex items-center justify-between gap-2 md:gap-4">
      <p className="font-mono text-caption uppercase text-ink-muted">
        Fase {phase} · Conexão {connection} de 2
      </p>
      <div className="flex gap-1" aria-hidden>
        {[0, 1, 2, 3].map((index) => (
          <span
            key={index}
            className="h-1 w-5 rounded-full md:w-8"
            style={{
              backgroundColor:
                index < current
                  ? 'var(--oxigenio-dim)'
                  : index === current
                    ? 'var(--oxigenio)'
                    : 'var(--line)',
            }}
          />
        ))}
      </div>
    </div>
  );
}
