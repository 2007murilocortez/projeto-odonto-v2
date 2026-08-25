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

export function LungGlyph({ x, y, size = 96, className }: GlyphProps) {
  return (
    <svg
      x={x - size / 2}
      y={y - size / 2}
      width={size}
      height={size}
      viewBox="0 0 96 96"
      overflow="visible"
      className={className}
      aria-hidden
    >
      <path {...stroke} d="M48 8 V28" />
      <path {...stroke} d="M44 8 V22" />
      <path {...stroke} d="M52 8 V22" />
      <path {...stroke} d="M48 28 L28 40" />
      <path {...stroke} d="M48 28 L68 40" />
      <path {...stroke} d="M28 40 L18 50 M28 40 L32 54" />
      <path {...stroke} d="M68 40 L78 50 M68 40 L64 54" />
      <path
        {...stroke}
        d="M18 38 C10 48 10 70 22 82 C32 90 42 84 44 70 C46 54 40 42 28 38 Z"
      />
      <path
        {...stroke}
        d="M78 38 C86 48 86 70 74 82 C64 90 54 84 52 70 C50 54 56 42 68 38 Z"
      />
      <path {...stroke} d="M26 56 C22 64 24 74 30 78" />
      <path {...stroke} d="M70 56 C74 64 72 74 66 78" />
    </svg>
  );
}
