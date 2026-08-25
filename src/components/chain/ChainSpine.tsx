type ChainSpineProps = {
  filled: boolean;
  reducedMotion: boolean;
  top: number;
  bottom: number;
};

export function ChainSpine({ filled, reducedMotion, top, bottom }: ChainSpineProps) {
  return (
    <div
      className="pointer-events-none absolute left-[0.625rem] w-[2px] bg-line md:left-4"
      style={{ top, bottom }}
      aria-hidden
    >
      <div
        className="h-full w-full origin-top bg-oxigenio"
        style={{
          transform: filled ? 'scaleY(1)' : 'scaleY(0)',
          transition: reducedMotion ? 'none' : 'transform 700ms var(--ease-out)',
        }}
      />
    </div>
  );
}
