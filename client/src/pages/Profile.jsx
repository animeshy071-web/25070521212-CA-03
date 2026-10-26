import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import { Card } from '../components/ui.jsx';
import { initials } from '../utils/format.js';

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const [name, setName] = useState(user.name);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const d = await api.patch('/users/me', { name });
      updateUser(d.data.user);
      setMsg({ ok: true, text: 'Profile updated.' });
    } catch (err) {
      setMsg({ ok: false, text: err.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page-fade">
      <div className="page-head">
        <div>
          <h1>Profile</h1>
          <p>Your REDSTOCKS account details.</p>
        </div>
      </div>

      <div className="grid-2">
        <Card title="Account">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
            <span className="avatar" style={{ width: 52, height: 52, fontSize: '1.1rem' }}>{initials(user.name)}</span>
            <div>
              <div style={{ fontWeight: 700 }}>{user.name}</div>
              <div style={{ color: 'var(--text-2)', fontSize: '0.88rem' }}>{user.email}</div>
            </div>
          </div>
          <div className="stats-grid">
            <div className="mini-stat"><div className="ms-label">Role</div><div className="ms-value">{user.role}</div></div>
            <div className="mini-stat"><div className="ms-label">Member since</div><div className="ms-value">{new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</div></div>
          </div>
          <div style={{ marginTop: 18 }}>
            <button className="btn btn-ghost" onClick={logout}>Sign out</button>
          </div>
        </Card>

        <Card title="Edit profile">
          <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="field">
              <label htmlFor="pf-name">Display name</label>
              <input id="pf-name" className="input" value={name} minLength={2} maxLength={80} onChange={(e) => setName(e.target.value)} />
            </div>
            {msg && <div className={`alert ${msg.ok ? 'alert-success' : 'alert-error'}`}>{msg.text}</div>}
            <div>
              <button className="btn btn-primary" disabled={busy || name.trim().length < 2}>
                {busy ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
