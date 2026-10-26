import { useEffect, useState } from 'react';
import { api } from '../services/api.js';

/**
 * Fetch hook with loading/error state and manual reload.
 * Re-fetches whenever `path` changes; pass skip=true to wait.
 */
export default function useApi(path, { skip = false } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(!skip);
  const [error, setError] = useState(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (skip || !path) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }
    let active = true;
    setLoading(true);
    setError(null);
    api
      .get(path)
      .then((d) => active && (setData(d), setLoading(false)))
      .catch((e) => active && (setError(e), setLoading(false)));
    return () => {
      active = false;
    };
  }, [path, skip, tick]);

  return { data, loading, error, reload: () => setTick((t) => t + 1) };
}
