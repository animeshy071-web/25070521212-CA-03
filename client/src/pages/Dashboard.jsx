import { Link } from 'react-router-dom';
import useApi from '../hooks/useApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Card, StatCard, Trend, MoverRow, Spinner, ErrorState, EmptyState, DataSourceBadge } from '../components/ui.jsx';
import { fmtCurrency, fmtPct, fmtDate, trendClass } from '../utils/format.js';

export default function Dashboard() {
  const { user, token } = useAuth();
  const overview = useApi('/market/overview');
  const portfolio = useApi(token ? '/portfolio' : null, { skip: !token });
  const watchlist = useApi(token ? '/watchlist' : null, { skip: !token });
  const trades = useApi(token ? '/trades?limit=5' : null, { skip: !token });

  if (overview.loading) return <Spinner />;
  if (overview.error) return <ErrorState error={overview.error} onRetry={overview.reload} />;

  const ov = overview.data?.data;
  const pf = portfolio.data?.data;
  const wl = watchlist.data?.data || [];
  const recent = trades.data?.data || [];

  return (
    <div className="page-fade">
      <div className="page-head">
        <div>
          <h1>{user ? `Welcome back, ${user.name.split(' ')[0]}` : 'Market dashboard'}</h1>
          <p>Your overview of the REDSTOCKS demo market.</p>
        </div>
        <DataSourceBadge source={ov?.source} generatedAt={ov?.generatedAt} />
      </div>

      <div className="stat-row">
        <StatCard
          label={ov?.composite?.name || 'Composite'}
          value={fmtCurrency(ov?.composite?.level)}
          sub={<Trend value={ov?.composite?.changePercent ?? 0} />}
        />
        <StatCard
          label="Market breadth"
          value={`${ov?.breadth?.advancers ?? 0} ▲ / ${ov?.breadth?.decliners ?? 0} ▼`}
          sub={`of ${ov?.breadth?.total ?? 0} tracked stocks`}
        />
        {token && pf ? (
          <StatCard
            label="Portfolio value"
            value={fmtCurrency(pf.totalValue)}
            sub={<Trend value={pf.totalReturnPercent} />}
          />
        ) : (
          <StatCard label="Portfolio value" value="—">
            <div className="stat-sub">
              <Link to="/login" className="btn btn-gold btn-sm">Sign in to track</Link>
            </div>
          </StatCard>
        )}
        {token && pf ? (
          <StatCard label="Virtual cash" value={fmtCurrency(pf.cashBalance)} sub="available to trade" />
        ) : (
          <StatCard label="Virtual cash" value="$100,000" sub="when you create an account" />
        )}
      </div>

      <div className="grid-2 section-gap">
        <Card title="Top gainers (demo)">
          <div className="mover-list">
            {(ov?.gainers || []).map((q) => (
              <MoverRow key={q.symbol} stock={{ symbol: q.symbol, companyName: q.companyName || q.symbol }} quote={q} />
            ))}
          </div>
        </Card>
        <Card title="Top losers (demo)">
          <div className="mover-list">
            {(ov?.losers || []).map((q) => (
              <MoverRow key={q.symbol} stock={{ symbol: q.symbol, companyName: q.companyName || q.symbol }} quote={q} />
            ))}
          </div>
        </Card>
      </div>

      <div className="grid-2 section-gap">
        <Card
          title="Your watchlist"
          action={wl.length > 0 ? <Link to="/watchlist">View all</Link> : null}
        >
          {!token ? (
            <EmptyState
              title="Sign in to follow stocks"
              message="Create a free account to build a watchlist that persists in MongoDB."
              action={<Link to="/register" className="btn btn-gold btn-sm">Create account</Link>}
            />
          ) : wl.length === 0 ? (
            <EmptyState
              title="Nothing on your watchlist yet"
              message="Add stocks from the markets page to see them here."
              action={<Link to="/markets" className="btn btn-gold btn-sm">Explore markets</Link>}
            />
          ) : (
            <div className="mover-list">
              {wl.slice(0, 5).map((item) => (
                <MoverRow key={item.stock.symbol} stock={item.stock} quote={item.quote} />
              ))}
            </div>
          )}
        </Card>

        <Card title="Recent activity" action={token ? <Link to="/transactions">View all</Link> : null}>
          {!token ? (
            <EmptyState
              title="No trades yet"
              message="Sign in to place your first simulated trade with $100,000 in virtual cash."
              action={<Link to="/login" className="btn btn-gold btn-sm">Sign in</Link>}
            />
          ) : recent.length === 0 ? (
            <EmptyState
              title="No trades yet"
              message="Your executed paper trades will appear here."
              action={<Link to="/markets" className="btn btn-gold btn-sm">Make a trade</Link>}
            />
          ) : (
            <div className="mover-list">
              {recent.map((t) => (
                <Link key={t._id} to="/transactions" className="mover-row">
                  <span className={`type-badge ${t.type}`}>{t.type.toUpperCase()}</span>
                  <span className="m-name">
                    {t.stock?.symbol} · {t.quantity} @ {fmtCurrency(t.executionPrice)}
                  </span>
                  <span className="m-price">{fmtCurrency(t.transactionValue)}</span>
                  <span className="m-name">{fmtDate(t.createdAt)}</span>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
