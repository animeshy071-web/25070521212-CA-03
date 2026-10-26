import useApi from '../hooks/useApi.js';
import { Spinner, ErrorState, EmptyState } from '../components/ui.jsx';

export default function News() {
  const { data, loading, error, reload } = useApi('/news');

  if (loading) return <Spinner />;
  if (error) return <ErrorState error={error} onRetry={reload} />;

  const meta = data?.meta || {};

  return (
    <div className="page-fade">
      <div className="page-head">
        <div>
          <h1>News</h1>
          <p>Market news relevant to your watchlist.</p>
        </div>
      </div>
      <EmptyState
        title="News is not configured yet"
        message={meta.message || 'No news provider is configured, so no headlines are shown. REDSTOCKS never fabricates news.'}
      />
    </div>
  );
}
