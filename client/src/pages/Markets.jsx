import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useApi from '../hooks/useApi.js';
import { Trend, Spinner, ErrorState, EmptyState, DataSourceBadge } from '../components/ui.jsx';
import { fmtCurrency } from '../utils/format.js';

export default function Markets() {
  const [q, setQ] = useState('');
  const [industry, setIndustry] = useState('');
  const [sort, setSort] = useState('symbol');
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const query = useMemo(() => {
    const p = new URLSearchParams({ page: String(page), limit: '25', sort });
    if (q.trim()) p.set('q', q.trim());
    if (industry) p.set('industry', industry);
    return p.toString();
  }, [q, industry, sort, page]);

  const { data, loading, error, reload } = useApi(`/stocks?${query}`);
  const rows = data?.data || [];
  const meta = data?.meta;
  const pagination = meta?.pagination;

  const onFilter = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  return (
    <div className="page-fade">
      <div className="page-head">
        <div>
          <h1>Markets</h1>
          <p>Browse the REDSTOCKS stock universe. Click a row for details and charts.</p>
        </div>
        <DataSourceBadge source={meta?.source} />
      </div>

      <div className="filter-bar">
        <input
          className="input"
          placeholder="Filter by symbol or company…"
          value={q}
          onChange={onFilter(setQ)}
          aria-label="Filter stocks"
        />
        <select className="select" value={industry} onChange={onFilter(setIndustry)} aria-label="Filter by industry">
          <option value="">All industries</option>
          {(meta?.industries || []).map((i) => (
            <option key={i} value={i}>{i}</option>
          ))}
        </select>
        <select className="select" value={sort} onChange={onFilter(setSort)} aria-label="Sort stocks">
          <option value="symbol">Sort: Symbol</option>
          <option value="name">Sort: Company</option>
          <option value="change">Sort: Top change</option>
          <option value="price">Sort: Price</option>
        </select>
        <div className="spacer" />
      </div>

      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : rows.length === 0 ? (
        <EmptyState title="No stocks match your filters" message="Try a different search term or clear the industry filter." />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Stock</th>
                <th>Industry</th>
                <th>Exchange</th>
                <th className="num">Price</th>
                <th className="num">Change</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.symbol} className="rowlink" onClick={() => navigate(`/stocks/${s.symbol}`)}>
                  <td>
                    <div className="sym-cell">
                      <span className="s">{s.symbol}</span>
                      <span className="n">{s.companyName}</span>
                    </div>
                  </td>
                  <td>{s.industry}</td>
                  <td>{s.exchange}</td>
                  <td className="num">{fmtCurrency(s.quote.price)}</td>
                  <td className="num"><Trend value={s.quote.changePercent} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination && (
        <div className="pagination">
          <span>
            Showing {rows.length} of {pagination.total} stocks · demo data
          </span>
          <span style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost btn-sm" disabled={pagination.page <= 1} onClick={() => setPage((p) => p - 1)}>
              ← Prev
            </button>
            <span style={{ alignSelf: 'center' }}>
              Page {pagination.page} / {pagination.pages}
            </span>
            <button className="btn btn-ghost btn-sm" disabled={pagination.page >= pagination.pages} onClick={() => setPage((p) => p + 1)}>
              Next →
            </button>
          </span>
        </div>
      )}
    </div>
  );
}
