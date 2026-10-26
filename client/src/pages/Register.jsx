import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Wordmark } from '../components/ui.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      await register(form.name.trim(), form.email.trim(), form.password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Wordmark />
        <p>Create your account and get $100,000 in virtual cash for paper trading.</p>
        <form onSubmit={submit}>
          <div className="field">
            <label htmlFor="reg-name">Name</label>
            <input id="reg-name" className="input" required minLength={2} maxLength={80} value={form.name} onChange={set('name')} placeholder="Nami Wallet" />
          </div>
          <div className="field">
            <label htmlFor="reg-email">Email</label>
            <input id="reg-email" className="input" type="email" required autoComplete="email" value={form.email} onChange={set('email')} placeholder="you@example.com" />
          </div>
          <div className="field">
            <label htmlFor="reg-password">Password (min. 8 characters)</label>
            <input id="reg-password" className="input" type="password" required minLength={8} autoComplete="new-password" value={form.password} onChange={set('password')} placeholder="••••••••" />
          </div>
          <div className="field">
            <label htmlFor="reg-confirm">Confirm password</label>
            <input id="reg-confirm" className="input" type="password" required autoComplete="new-password" value={form.confirm} onChange={set('confirm')} placeholder="••••••••" />
          </div>
          {error && <div className="alert alert-error">{error}</div>}
          <button className="btn btn-primary btn-lg btn-block" disabled={busy}>{busy ? 'Creating account…' : 'Create account'}</button>
        </form>
        <div className="auth-alt">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
        <p style={{ fontSize: '0.74rem', color: 'var(--muted)', marginTop: 14, textAlign: 'center' }}>
          Paper trading only. Virtual money, demo market data, no real orders.
        </p>
      </div>
    </div>
  );
}
