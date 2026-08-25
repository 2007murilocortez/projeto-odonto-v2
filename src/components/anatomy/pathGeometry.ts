export type Point = { x: number; y: number };

function cubicAt(t: number, p0: Point, p1: Point, p2: Point, p3: Point): Point {
  const u = 1 - t;
  const uu = u * u;
  const tt = t * t;
  return {
    x: uu * u * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + tt * t * p3.x,
    y: uu * u * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + tt * t * p3.y,
  };
}

function controls(from: Point, to: Point, bow: number): [Point, Point, Point, Point] {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  const nx = (-dy / len) * bow;
  const ny = (dx / len) * bow;
  return [
    from,
    { x: from.x + dx * 0.35 + nx, y: from.y + dy * 0.35 + ny },
    { x: from.x + dx * 0.65 + nx, y: from.y + dy * 0.65 + ny },
    to,
  ];
}

export function curvePath(from: Point, to: Point, bow: number): string {
  const [, p1, p2, p3] = controls(from, to, bow);
  return `M ${from.x} ${from.y} C ${p1.x} ${p1.y} ${p2.x} ${p2.y} ${p3.x} ${p3.y}`;
}

export function sampleCurve(from: Point, to: Point, bow: number, steps = 32): Point[] {
  const [p0, p1, p2, p3] = controls(from, to, bow);
  const points: Point[] = [];
  for (let i = 0; i <= steps; i += 1) {
    points.push(cubicAt(i / steps, p0, p1, p2, p3));
  }
  return points;
}
