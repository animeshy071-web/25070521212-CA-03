import { Link } from 'react-router-dom';
import { Wordmark, Trend } from '../components/ui.jsx';
import Reveal from '../components/Reveal.jsx';
import useApi from '../hooks/useApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import { fmtCurrency } from '../utils/format.js';
import { IconArrow, IconMarkets, IconStar, IconPortfolio, IconTrade } from '../components/icons.jsx';

const DEMO_TREND = Array.from({ length: 60 }, (_, i) => ({
  date: `d${i}`,
  close: 100 + Math.sin(i / 7) * 6 + i * 0.55 + (i % 5) * 0.8,
}));

const FEATURES = [
  { Icon: IconMarkets, variant: 'v1', title: 'Market research', text: 'Browse a curated stock universe, search by company or symbol, and open rich detail pages with historical charts.' },
  { Icon: IconStar, variant: 'v2', title: 'Persistent watchlist', text: 'Track the companies you care about. Your watchlist is saved to MongoDB and follows you across sessions.' },
  { Icon: IconTrade, variant: 'v3', title: 'Simulated trading', text: 'Buy and sell with virtual cash. The server validates every order - prices, balances and fills are never trusted from the client.' },
  { Icon: IconPortfolio, variant: 'v4', title: 'Portfolio analytics', text: 'Holdings, average cost, realized and unrealized P/L, allocation breakdown and a full transaction history.' },
];

/** Scrolling strip of demo quotes across the whole stock universe. */
function MarketTicker() {
  const { data } = useApi('/stocks?limit=100');
  const rows = data?.data || [];
  if (!rows.length) return null;

  const renderGroup = (dup) => (
    <div className="ticker-group" aria-hidden={dup || undefined}>
      {rows.map((s) => (
        <Link
          key={`${dup ? 'b' : 'a'}-${s.symbol}`}
          to={`/stocks/${s.symbol}`}
          className="tape-item"
          tabIndex={dup ? -1 : undefined}
        >
          <span className="t-sym">{s.symbol}</span>
          <span className="t-price">{fmtCurrency(s.quote.price)}</span>
          <Trend value={s.quote.changePercent} />
        </Link>
      ))}
    </div>
  );

  return (
    <div className="ticker" aria-label="Demo market ticker">
      <div className="ticker-track">
        {renderGroup(false)}
        {renderGroup(true)}
      </div>
    </div>
  );
}

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="landing">
      <header className="landing-nav">
        <Wordmark />
        <nav className="ln-links">
          <Link to="/markets" className="btn btn-ghost btn-sm">Markets</Link>
          {user ? (
            <Link to="/dashboard" className="btn btn-primary btn-sm">Open dashboard</Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Sign in</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get started</Link>
            </>
          )}
        </nav>
      </header>

      <MarketTicker />

      <section className="hero">
        <div className="hero-bg" aria-hidden="true">
          <span className="orb orb-red" />
          <span className="orb orb-blue" />
          <span className="orb orb-gold" />
        </div>

        <span className="hero-kicker">
          <span className="pulse-dot" aria-hidden="true" /> 100% virtual · paper trading
        </span>
        <h1>
          Learn the market. <span className="hl">Risk nothing.</span>
        </h1>
        <p className="hero-sub">
          REDSTOCKS is a stock-market research and paper-trading workspace. Explore stocks, build a
          watchlist, and practice buying and selling with virtual money - every trade is simulated.
        </p>
        <div className="hero-cta">
          <Link to={user ? '/dashboard' : '/register'} className="btn btn-primary btn-lg">
            {user ? 'Go to dashboard' : 'Start paper trading'} <IconArrow size={17} />
          </Link>
          <Link to="/markets" className="btn btn-ghost btn-lg">Browse markets</Link>
        </div>

        <div className="hero-chart">
          <svg viewBox="0 0 640 160" style={{ width: '100%', height: 'auto' }} aria-hidden="true">
            <defs>
              <linearGradient id="heroFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#E63946" stopOpacity="0.3" />
                <stop offset="1" stopColor="#E63946" stopOpacity="0" />
              </linearGradient>
            </defs>
            {(() => {
              const pts = DEMO_TREND;
              const min = Math.min(...pts.map((p) => p.close));
              const max = Math.max(...pts.map((p) => p.close));
              const x = (i) => (i / (pts.length - 1)) * 640;
              const y = (v) => 10 + (1 - (v - min) / (max - min)) * 130;
              const line = pts.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.close).toFixed(1)}`).join(' ');
              const yLast = y(pts[pts.length - 1].close).toFixed(1);
              return (
                <>
                  <path className="chart-area" d={`${line} L640,160 L0,160 Z`} fill="url(#heroFill)" />
                  <path
                    className="chart-line"
                    d={line}
                    fill="none"
                    stroke="#E63946"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    pathLength="1"
                  />
                  <circle className="chart-pulse" cx="640" cy={yLast} r="7" fill="#E63946" opacity="0.35" />
                  <circle className="chart-dot" cx="640" cy={yLast} r="4" fill="#E7B85C" />
                </>
              );
            })()}
          </svg>
        </div>
      </section>

      <section className="landing-section">
        <Reveal>
          <h2>Everything a paper trader needs</h2>
        </Reveal>
        <Reveal delay={90}>
          <p className="ls-sub">A Quadency-style trading workspace with a Groww-simple approach to investing.</p>
        </Reveal>
        <div className="feature-grid">
          {FEATURES.map(({ Icon, variant, title, text }, i) => (
            <Reveal key={title} delay={i * 90}>
              <div className={`feature-card ${variant}`}>
                <div className="fc-icon"><Icon /></div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <Reveal>
        <p className="landing-disclaimer">
          REDSTOCKS is an educational simulation. All quotes are demonstration data generated by the app,
          trades are simulated with virtual money, and no real orders are ever placed. This is not investment advice.
        </p>
      </Reveal>

      <div className="footer-wordmark" aria-hidden="true">REDSTOCKS</div>
    </div>
  );
}
