/** Donut allocation chart. segments: [{ label, value, percent }] */
const COLORS = ['#E63946', '#1769AA', '#E7B85C', '#38B7A5', '#7C5CBF', '#2E9E5B', '#C2703D', '#4A6FA5', '#B84A62', '#5E8C61'];

export default function Donut({ segments }) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  if (!segments.length || total <= 0) return null;

  const R = 54;
  const C = 2 * Math.PI * R;
  let offset = 0;
  const shown = segments.slice(0, 10);

  return (
    <div className="donut-wrap">
      <svg width="150" height="150" viewBox="0 0 150 150" role="img" aria-label="Portfolio allocation">
        <g transform="translate(75,75) rotate(-90)">
          <circle r={R} fill="none" stroke="var(--bg-2)" strokeWidth="16" />
          {shown.map((seg, i) => {
            const frac = seg.value / total;
            const dash = `${(frac * C).toFixed(2)} ${(C - frac * C).toFixed(2)}`;
            const el = (
              <circle
                key={seg.label}
                r={R}
                fill="none"
                stroke={COLORS[i % COLORS.length]}
                strokeWidth="16"
                strokeDasharray={dash}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
              />
            );
            offset += frac * C;
            return el;
          })}
        </g>
        <text x="75" y="71" textAnchor="middle" fill="var(--muted)" fontSize="10">ALLOCATION</text>
        <text x="75" y="88" textAnchor="middle" fill="var(--text)" fontSize="13" fontWeight="700">
          {segments.length} {segments.length === 1 ? 'position' : 'positions'}
        </text>
      </svg>
      <div className="donut-legend">
        {shown.map((seg, i) => (
          <div className="dl-row" key={seg.label}>
            <span className="dl-dot" style={{ background: COLORS[i % COLORS.length] }} />
            <span className="dl-name">{seg.symbol || seg.label}</span>
            <span className="dl-val">{seg.percent?.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
