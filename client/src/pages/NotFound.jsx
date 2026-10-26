import { Link } from 'react-router-dom';
import { Wordmark } from '../components/ui.jsx';

export default function NotFound() {
  return (
    <div className="auth-page">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}><Wordmark /></div>
        <h1 style={{ fontSize: '3.4rem', margin: '18px 0 4px', color: 'var(--brand)' }}>404</h1>
        <p>This page sailed off the map. It does not exist or has moved.</p>
        <div style={{ marginTop: 20, display: 'flex', gap: 10, justifyContent: 'center' }}>
          <Link to="/" className="btn btn-ghost">Home</Link>
          <Link to="/dashboard" className="btn btn-primary">Dashboard</Link>
        </div>
      </div>
    </div>
  );
}
