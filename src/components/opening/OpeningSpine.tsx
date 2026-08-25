import { useEffect, useState } from 'react';

const MARKER_DELAYS_MS = [90, 270, 450, 630];

type OpeningSpineProps = {
  reducedMotion: boolean;
};

export function OpeningSpine({ reducedMotion }: OpeningSpineProps) {
  const [drawn, setDrawn] = useState(false);
  const visible = reducedMotion || drawn;

  useEffect(() => {
    if (reducedMotion) return undefined;
    const timeoutId = window.setTimeout(() => setDrawn(true), 20);
    return () => window.clearTimeout(timeoutId);
  }, [reducedMotion]);

  return (
    <div className="relative h-full min-h-[14rem] w-full" aria-hidden>
      <div
        className="absolute bottom-0 left-1/2 top-0 w-[2px] bg-oxigenio"
        style={{
          transform: `translateX(-50%) scaleY(${visible ? 1 : 0})`,
          transformOrigin: 'top center',
          transition: reducedMotion ? 'none' : 'transform 700ms var(--ease-out)',
        }}
      />
      <div className="relative flex h-full flex-col items-center justify-between py-1">
        {MARKER_DELAYS_MS.map((delay, index) => (
          <span
            key={index}
            className="block h-2 w-2 shrink-0 rounded-full border border-oxigenio bg-noite"
            style={{
              opacity: visible ? 1 : 0,
              transition: reducedMotion ? 'none' : `opacity 160ms var(--ease-out) ${delay}ms`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
