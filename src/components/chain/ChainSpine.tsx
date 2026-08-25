type ChainSpineProps = {
  filled: boolean;
  reducedMotion: boolean;
};

export function ChainSpine({ filled, reducedMotion }: ChainSpineProps) {
  return (
    <svg
      className="pointer-events-none absolute bottom-4 left-2 top-4 w-2"
      viewBox="0 0 8 400"
      preserveAspectRatio="none"
      aria-hidden
    >
      <line x1="4" y1="0" x2="4" y2="400" stroke="var(--line)" strokeWidth="2" />
      <line
        x1="4"
        y1="0"
        x2="4"
        y2="400"
        stroke="var(--oxigenio)"
        strokeWidth="2"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={filled ? 0 : 1}
        style={{
          transition: reducedMotion ? 'none' : 'stroke-dashoffset 700ms var(--ease-out)',
        }}
      />
    </svg>
  );
}
