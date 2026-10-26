import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import useApi from '../hooks/useApi.js';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import LineChart from '../components/LineChart.jsx';
import TradeModal from '../components/TradeModal.jsx';
import { Spinner, ErrorState, DataSourceBadge, Trend } from '../components/ui.jsx';
import { fmtCurrency, fmtCompact } from '../utils/format.js';
import { IconStar, IconTrash } from '../components/icons.jsx';

const RANGES = ['1M', '3M', '6M', '1Y'];

export default function StockDetail() {
  const { symbol } = useParams();
  const { user, token } = useAuth();
  const [range, setRange] = useState('3M');
  const [modal, setModal] = useState(null); // 'buy' | 'sell' | null
  const [wlBusy, setWlBusy] = useState(false);
  const [wlMsg, setWlMsg] = useState(null);

  const detail = useApi(`/stocks/${symbol.toUpperCase()}`);
  const history = useApi(`/stocks/${symbol.toUpperCase()}/history?range=${range}`);
  const portfolio = useApi(token ? '/portfolio' : null, { skip: !token });

  const stock = detail.data?.data;
  const quote = stock?.quote;
  const points = useMemo(() => history.data?.data?.points || [], [history.data]);
  const owned = (portfolio.data?.data?.holdings || []).find((h) => h.stock.symbol === stock?.symbol);
  const cashBalance = portfolio.data?.data?.cashBalance;

  if (detail.loading) return <Spinner />;
  if (detail.error) return <ErrorState error={detail.error} onRetry={detail.reload} />;

  const toggleWatchlist = async () => {
    setWlBusy(true);
    setWlMsg(null);
    try {
      if (stock.inWatchlist) {
        const wl = await api.get('/watchlist');
        const entry = wl.data.find((w) => w.stock.symbol === stock.symbol);
        if (entry) await api.del(`/watchlist/${entry.stock._id}`);
        setWlMsg(`${stock.symbol} removed from watchlist.`);
      } else {
        await api.post('/watchlist', { symbol: stock.symbol });
        setWlMsg(`${stock.symbol} added to watchlist.`);
      }
      detail.reload();
    } catch (err) {
      setWlMsg(err.message);
    } finally {
      setWlBusy(false);
    }
  };

  return (
    <div className="page-fade">
      <div className="page-head">
        <div>
          <Link to="/markets" style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>← Back to markets</Link>
          <h1 style={{ marginTop: 6 }}>
            {stock.companyName} <span style={{ color: 'var(--muted)', fontFamily: 'var(--mono)' }}>{stock.symbol}</span>
          </h1>
          <p style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <span className="badge badge-blue">{stock.exchange}</span>
            <span className="badge">{stock.industry}</span>
            <span className="badge badge-teal">{stock.market}</span>
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.9rem', fontWeight: 700, fontFamily: 'var(--mono)' }}>{fmtCurrency(quote.price)}</div>
          <Trend value={quote.changePercent} />
          <div style={{ marginTop: 6 }}>
            <DataSourceBadge source={quote.source} asOf={quote.asOf} />
          </div>
        </div>
      </div>

      {user && (
        <div className="filter-bar">
          <button className="btn btn-gold btn-sm" onClick={toggleWatchlist} disabled={wlBusy}>
            {stock.inWatchlist ? <><IconTrash size={15} /> Remove from watchlist</> : <><IconStar size={15} /> Add to watchlist</>}
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setModal('buy')}>Buy (paper)</button>
          <button className="btn btn-blue btn-sm" onClick={() => setModal('sell')} disabled={!owned}>
            {owned ? `Sell (owned: ${owned.quantity})` : 'Sell'}
          </button>
          {wlMsg && <span style={{ fontSize: '0.82rem', color: 'var(--text-2)' }}>{wlMsg}</span>}
        </div>
      )}

      <section className="card">
        <div className="ranges-row">
          <h3>Price history</h3>
          <div className="chart-tabs" role="tablist" aria-label="Chart range">
            {RANGES.map((r) => (
              <button
                key={r}
                role="tab"
                aria-selected={range === r}
                className={`chart-tab ${range === r ? 'active' : ''}`}
                onClick={() => setRange(r)}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        {history.loading ? (
          <Spinner />
        ) : history.error ? (
          <ErrorState error={history.error} onRetry={history.reload} />
        ) : (
          <LineChart points={points} />
        )}
        <div className="data-meta" style={{ marginTop: 10 }}>
          <span className="badge badge-demo">◍ Demonstration data</span>
          <span>Generated locally by REDSTOCKS · not real or live market data</span>
        </div>
      </section>

      <section className="card section-gap">
        <h3 style={{ marginBottom: 12 }}>Key statistics</h3>
        <div className="stats-grid">
          <div className="mini-stat"><div className="ms-label">Previous close</div><div className="ms-value">{fmtCurrency(quote.previousClose)}</div></div>
          <div className="mini-stat"><div className="ms-label">Open</div><div className="ms-value">{fmtCurrency(quote.open)}</div></div>
          <div className="mini-stat"><div className="ms-label">Day range</div><div className="ms-value">{fmtCurrency(quote.dayLow)} – {fmtCurrency(quote.dayHigh)}</div></div>
          <div className="mini-stat"><div className="ms-label">52-week range</div><div className="ms-value">{fmtCurrency(quote.fiftyTwoWeekLow)} – {fmtCurrency(quote.fiftyTwoWeekHigh)}</div></div>
          <div className="mini-stat"><div className="ms-label">Volume</div><div className="ms-value">{fmtCompact(quote.volume)}</div></div>
          <div className="mini-stat"><div className="ms-label">Currency</div><div className="ms-value">{quote.currency}</div></div>
        </div>
      </section>

      <section className="card section-gap">
        <h3 style={{ marginBottom: 8 }}>About {stock.companyName}</h3>
        <p style={{ color: 'var(--text-2)', fontSize: '0.92rem' }}>
          {stock.description || 'No company description available.'}
        </p>
      </section>

      {!user && (
        <div className="alert alert-info section-gap">
          <Link to="/login" style={{ color: 'var(--gold)', fontWeight: 700 }}>Sign in</Link> to add {stock.symbol} to
          your watchlist or place a simulated trade with virtual money.
        </div>
      )}

      {modal && (
        <TradeModal
          mode={modal}
          stock={{ _id: stock._id, symbol: stock.symbol, companyName: stock.companyName }}
          quote={{ price: quote.price }}
          maxQuantity={owned?.quantity ?? 0}
          cashBalance={cashBalance}
          onClose={() => setModal(null)}
          onDone={() => {
            setModal(null);
            portfolio.reload();
            detail.reload();
          }}
        />
      )}
    </div>
  );
}
