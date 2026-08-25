type GlyphProps = {
  x: number;
  y: number;
  size?: number;
  className?: string;
};

const stroke = {
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  vectorEffect: 'non-scaling-stroke' as const,
};

export function ToothGlyph({ x, y, size = 88, className }: GlyphProps) {
  const width = size;
  const height = size * (96 / 72);
  return (
    <svg
      x={x - width / 2}
      y={y - height / 2}
      width={width}
      height={height}
      viewBox="0 0 72 96"
      overflow="visible"
      className={className}
      aria-hidden
    >
      <path
        {...stroke}
        d="M20 40 C20 22 28 12 36 12 C44 12 52 22 52 40 L50 48 H22 Z"
      />
      <path {...stroke} d="M28 22 C32 30 40 30 44 22" />
      <path {...stroke} d="M30 18 C33 24 39 24 42 18" />
      <path {...stroke} d="M14 50 C24 44 48 44 58 50" />
      <path {...stroke} d="M16 55 C26 50 46 50 56 55" />
      <path {...stroke} d="M26 48 L22 86 C22 91 27 93 31 88 L34 48" />
      <path {...stroke} d="M38 48 L42 88 C46 93 50 91 50 86 L46 48" />
    </svg>
  );
}
