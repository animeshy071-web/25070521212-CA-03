import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useApi from '../hooks/useApi.js';
import { api } from '../services/api.js';
import { Spinner, ErrorState, EmptyState, Trend, DataSourceBadge } from '../components/ui.jsx';
import { fmtCurrency } from '../utils/format.js';
import { IconTrash } from '../components/icons.jsx';

export default function Watchlist() {
  const { data, loading, error, reload } = useApi('/watchlist');
  const [removing, setRemoving] = useState(null);
  const navigate = useNavigate();

  if (loading) return <Spinner />;
  if (error) return <ErrorState error={error} onRetry={reload} />;

  const items = data?.data || [];

  const remove = async (stockId, symbol) => {
    setRemoving(stockId);
    try {
      await api.del(`/watchlist/${stockId}`);
      reload();
    } catch (err) {
      alert(err.message);
    } finally {
      setRemoving(null);
    }
  };

  return (
    <div className="page-fade">
      <div className="page-head">
        <div>
          <h1>Watchlist</h1>
          <p>Stocks you follow. Saved to your account in MongoDB.</p>
        </div>
        <DataSourceBadge source={data?.meta?.source} />
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="Your watchlist is empty"
          message="Explore the markets and add stocks you want to track."
          action={<Link to="/markets" className="btn btn-primary">Explore markets</Link>}
        />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Stock</th>
                <th>Added</th>
                <th className="num">Price</th>
                <th className="num">Change</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.stock._id} className="rowlink" onClick={() => navigate(`/stocks/${item.stock.symbol}`)}>
                  <td>
                    <div className="sym-cell">
                      <span className="s">{item.stock.symbol}</span>
                      <span className="n">{item.stock.companyName}</span>
                    </div>
                  </td>
                  <td>{new Date(item.addedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                  <td className="num">{fmtCurrency(item.quote.price)}</td>
                  <td className="num"><Trend value={item.quote.changePercent} /></td>
                  <td className="num">
                    <button
                      className="icon-btn danger"
                      aria-label={`Remove ${item.stock.symbol} from watchlist`}
                      disabled={removing === item.stock._id}
                      onClick={(e) => {
                        e.stopPropagation();
                        remove(item.stock._id, item.stock.symbol);
                      }}
                    >
                      <IconTrash size={17} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
