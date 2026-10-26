import { useState } from 'react';
import useApi from '../hooks/useApi.js';
import { Spinner, ErrorState, EmptyState, DataSourceBadge } from '../components/ui.jsx';
import { fmtCurrency, fmtDate } from '../utils/format.js';

export default function Transactions() {
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);
  const { data, loading, error, reload } = useApi(`/trades?page=${page}&limit=15${type ? `&type=${type}` : ''}`);

  if (loading && !data) return <Spinner />;
  if (error) return <ErrorState error={error} onRetry={reload} />;

  const rows = data?.data || [];
  const pagination = data?.meta?.pagination;

  return (
    <div className="page-fade">
      <div className="page-head">
        <div>
          <h1>Transactions</h1>
          <p>Every simulated trade you have executed. All fills used demo market data.</p>
        </div>
        <DataSourceBadge source="demo" />
      </div>

      <div className="filter-bar">
        <select
          className="select"
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            setPage(1);
          }}
          aria-label="Filter by type"
        >
          <option value="">All transactions</option>
          <option value="buy">Buys only</option>
          <option value="sell">Sells only</option>
        </select>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="No transactions yet"
          message="When you buy or sell a stock, the executed paper trade is recorded here."
        />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Stock</th>
                <th className="num">Quantity</th>
                <th className="num">Execution price</th>
                <th className="num">Value</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => (
                <tr key={t._id}>
                  <td>{fmtDate(t.createdAt, { withTime: true })}</td>
                  <td><span className={`type-badge ${t.type}`}>{t.type.toUpperCase()}</span></td>
                  <td>
                    <div className="sym-cell">
                      <span className="s">{t.stock?.symbol}</span>
                      <span className="n">{t.stock?.companyName}</span>
                    </div>
                  </td>
                  <td className="num">{t.quantity}</td>
                  <td className="num">{fmtCurrency(t.executionPrice)}</td>
                  <td className="num">{fmtCurrency(t.transactionValue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination && pagination.pages > 1 && (
        <div className="pagination">
          <span>Page {pagination.page} of {pagination.pages} · {pagination.total} transactions</span>
          <span style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>← Prev</button>
            <button className="btn btn-ghost btn-sm" disabled={page >= pagination.pages} onClick={() => setPage((p) => p + 1)}>Next →</button>
          </span>
        </div>
      )}
    </div>
  );
}
