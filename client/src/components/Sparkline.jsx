/** Tiny sparkline for tables and cards. */
export default function Sparkline({ points = [], width = 110, height = 34 }) {
  if (points.length < 2) return null;
  const closes = points.map((p) => p.close);
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const span = max - min || 1;
  const x = (i) => (i / (points.length - 1)) * width;
  const y = (v) => 3 + (1 - (v - min) / span) * (height - 6);
  const d = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.close).toFixed(1)}`).join(' ');
  const up = closes[closes.length - 1] >= closes[0];
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <path d={d} fill="none" stroke={up ? 'var(--positive)' : 'var(--negative)'} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
