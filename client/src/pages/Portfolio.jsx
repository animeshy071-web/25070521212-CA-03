import { Link, useNavigate } from 'react-router-dom';
import useApi from '../hooks/useApi.js';
import Donut from '../components/Donut.jsx';
import { Card, StatCard, Spinner, ErrorState, EmptyState, Trend, DataSourceBadge } from '../components/ui.jsx';
import { fmtCurrency, fmtPct, trendClass } from '../utils/format.js';

export default function Portfolio() {
  const { data, loading, error, reload } = useApi('/portfolio');
  const navigate = useNavigate();

  if (loading) return <Spinner />;
  if (error) return <ErrorState error={error} onRetry={reload} />;

  const pf = data?.data;

  if (!pf.holdings.length && pf.cashBalance === pf.startingBalance) {
    return (
      <div className="page-fade">
        <div className="page-head"><div><h1>Portfolio</h1></div></div>
        <EmptyState
          title="Your portfolio is untouched"
          message={`You have ${fmtCurrency(pf.cashBalance)} in virtual cash. Make your first simulated trade to see holdings, allocation and P/L here.`}
          action={<Link to="/markets" className="btn btn-primary">Make your first trade</Link>}
        />
      </div>
    );
  }

  return (
    <div className="page-fade">
      <div className="page-head">
        <div>
          <h1>Portfolio</h1>
          <p>Virtual account summary. All values computed by the REDSTOCKS API.</p>
        </div>
        <DataSourceBadge source={data?.meta?.source} generatedAt={pf.updatedAt} />
      </div>

      <div className="stat-row">
        <StatCard label="Total value" value={fmtCurrency(pf.totalValue)} sub={<Trend value={pf.totalReturnPercent} />} />
        <StatCard label="Virtual cash" value={fmtCurrency(pf.cashBalance)} sub="available to trade" />
        <StatCard label="Holdings value" value={fmtCurrency(pf.holdingsValue)} sub={`cost basis ${fmtCurrency(pf.investedCost)}`} />
        <StatCard
          label="Unrealized P/L"
          value={
            <span className={`trend ${trendClass(pf.unrealizedPL)}`} style={{ fontSize: '1.25rem' }}>
              {fmtCurrency(pf.unrealizedPL)}
            </span>
          }
          sub="open positions"
        />
        <StatCard
          label="Realized P/L"
          value={
            <span className={`trend ${trendClass(pf.realizedPL)}`} style={{ fontSize: '1.25rem' }}>
              {fmtCurrency(pf.realizedPL)}
            </span>
          }
          sub="closed positions"
        />
        <StatCard
          label="Total return"
          value={
            <span className={`trend ${trendClass(pf.totalPL)}`} style={{ fontSize: '1.25rem' }}>
              {fmtCurrency(pf.totalPL)}
            </span>
          }
          sub={`vs ${fmtCurrency(pf.startingBalance)} start`}
        />
      </div>

      <div className="grid-2 section-gap">
        <Card title="Allocation">
          <Donut segments={pf.allocation.map((a) => ({ label: a.companyName, symbol: a.symbol, value: a.value, percent: a.percent }))} />
        </Card>

        <Card title="Holdings" action={<Link to="/transactions">Transactions</Link>}>
          {pf.holdings.length === 0 ? (
            <EmptyState title="No open positions" message="Sell or buy from any stock page to build positions." />
          ) : (
            <div className="table-wrap" style={{ border: 'none' }}>
              <table className="table" style={{ minWidth: 520 }}>
                <thead>
                  <tr>
                    <th>Stock</th>
                    <th className="num">Qty</th>
                    <th className="num">Avg cost</th>
                    <th className="num">Price</th>
                    <th className="num">P/L</th>
                  </tr>
                </thead>
                <tbody>
                  {pf.holdings.map((h) => (
                    <tr key={h.stock.symbol} className="rowlink" onClick={() => navigate(`/stocks/${h.stock.symbol}`)}>
                      <td>
                        <div className="sym-cell">
                          <span className="s">{h.stock.symbol}</span>
                          <span className="n">{h.stock.companyName}</span>
                        </div>
                      </td>
                      <td className="num">{h.quantity}</td>
                      <td className="num">{fmtCurrency(h.averageCost)}</td>
                      <td className="num">{fmtCurrency(h.currentPrice)}</td>
                      <td className="num">
                        <span className={`trend ${trendClass(h.unrealizedPL)}`}>
                          {fmtCurrency(h.unrealizedPL)} ({fmtPct(h.unrealizedPLPercent)})
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
