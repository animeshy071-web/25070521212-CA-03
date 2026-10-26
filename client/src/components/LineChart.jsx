import { useId } from 'react';

/**
 * Dependency-free responsive SVG line chart.
 * points: [{ date: 'YYYY-MM-DD', close: number }]
 */
export default function LineChart({ points, height = 260 }) {
  const gid = useId();

  if (!points || points.length < 2) {
    return (
      <div className="center-state">
        <p>No historical data available for this range.</p>
      </div>
    );
  }

  const W = 640;
  const H = height;
  const pad = { t: 18, r: 14, b: 26, l: 14 };
  const closes = points.map((p) => p.close);
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const span = max - min || 1;

  const x = (i) => pad.l + (i / (points.length - 1)) * (W - pad.l - pad.r);
  const y = (v) => pad.t + (1 - (v - min) / span) * (H - pad.t - pad.b);

  const line = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.close).toFixed(1)}`).join(' ');
  const area = `${line} L${x(points.length - 1).toFixed(1)},${H - pad.b} L${x(0).toFixed(1)},${H - pad.b} Z`;

  const up = closes[closes.length - 1] >= closes[0];
  const color = up ? 'var(--positive)' : 'var(--negative)';
  const lastX = x(points.length - 1).toFixed(1);
  const lastY = y(closes[closes.length - 1]).toFixed(1);

  const gridY = [0.25, 0.5, 0.75].map((f) => pad.t + f * (H - pad.t - pad.b));

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: '100%', height: 'auto' }}
      role="img"
      aria-label={`Price chart from ${points[0].date} to ${points[points.length - 1].date}`}
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.26" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {gridY.map((gy) => (
        <line key={gy} x1={pad.l} x2={W - pad.r} y1={gy} y2={gy} stroke="var(--border)" strokeWidth="1" strokeDasharray="3 6" opacity="0.6" />
      ))}
      <path d={area} fill={`url(#${gid})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={lastX} cy={lastY} r="4" fill={color} />
      <text x={pad.l} y={H - 8} fill="var(--muted)" fontSize="11">{points[0].date}</text>
      <text x={W - pad.r} y={H - 8} fill="var(--muted)" fontSize="11" textAnchor="end">{points[points.length - 1].date}</text>
      <text x={pad.l} y={pad.t - 4} fill="var(--muted)" fontSize="11">high {max.toFixed(2)}</text>
      <text x={W - pad.r} y={pad.t - 4} fill="var(--muted)" fontSize="11" textAnchor="end">low {min.toFixed(2)}</text>
    </svg>
  );
}
