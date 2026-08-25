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

export function SleepApneaGlyph({ x, y, size = 96, className }: GlyphProps) {
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
      <path
        {...stroke}
        d="M28 18 C32 10 48 8 58 16 C66 22 68 30 64 38 L70 42 C74 40 80 44 78 50 L70 54 C72 62 68 72 58 78 C48 84 40 82 34 76 L30 84"
      />
      <path {...stroke} d="M34 76 L22 88" />
      <path {...stroke} d="M58 16 C60 12 68 14 70 20" />
      <path {...stroke} d="M64 38 L58 44 C52 42 48 46 50 52" />
      <path
        {...stroke}
        d="M70 22 C62 28 54 32 50 42 C48 50 52 58 50 66 C48 72 44 76 40 78"
      />
      <circle
        cx="52"
        cy="50"
        r="4.5"
        fill="none"
        stroke="var(--inflamacao)"
        strokeWidth="1.75"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M50 50 L54 50 M52 48 L52 52"
        stroke="var(--inflamacao)"
        strokeWidth="1.75"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
