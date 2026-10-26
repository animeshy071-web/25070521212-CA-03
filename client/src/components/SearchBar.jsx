import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import { IconSearch } from './icons.jsx';

/** Debounced stock search with dropdown results. */
export default function SearchBar({ placeholder = 'Search stocks, e.g. AAPL' }) {
  const [term, setTerm] = useState('');
  const [results, setResults] = useState(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const boxRef = useRef(null);

  useEffect(() => {
    const q = term.trim();
    if (q.length < 1) {
      setResults(null);
      setOpen(false);
      return;
    }
    let active = true;
    setBusy(true);
    const t = setTimeout(async () => {
      try {
        const d = await api.get(`/stocks/search?q=${encodeURIComponent(q)}`);
        if (!active) return;
        setResults(d.data);
        setOpen(true);
      } catch {
        if (active) setResults([]);
      } finally {
        if (active) setBusy(false);
      }
    }, 250);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [term]);

  useEffect(() => {
    const onDoc = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const go = (symbol) => {
    setOpen(false);
    setTerm('');
    navigate(`/stocks/${symbol}`);
  };

  return (
    <div className="search-wrap" ref={boxRef} role="search">
      <IconSearch size={17} />
      <input
        className="input"
        value={term}
        placeholder={placeholder}
        onChange={(e) => setTerm(e.target.value)}
        onFocus={() => results && setOpen(true)}
        onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
        aria-label="Search stocks"
      />
      {open && (
        <div className="search-pop">
          {busy && results === null && <div className="pop-empty">Searching…</div>}
          {!busy && results && results.length === 0 && <div className="pop-empty">No stocks match “{term}”.</div>}
          {results &&
            results.map((s) => (
              <button key={s.symbol} className="pop-item" onClick={() => go(s.symbol)}>
                <span>
                  <span className="pi-sym">{s.symbol}</span>
                  <div className="pi-name">{s.companyName}</div>
                </span>
                <span className="pi-exc">{s.exchange}</span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
