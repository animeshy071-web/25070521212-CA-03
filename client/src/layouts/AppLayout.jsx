import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Wordmark, Spinner } from '../components/ui.jsx';
import SearchBar from '../components/SearchBar.jsx';
import { IconDashboard, IconMarkets, IconStar, IconPortfolio, IconTrade, IconList, IconNews, IconUser, IconMenu, IconClose, IconLogout } from '../components/icons.jsx';
import { initials } from '../utils/format.js';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', Icon: IconDashboard },
  { to: '/markets', label: 'Markets', Icon: IconMarkets },
  { to: '/watchlist', label: 'Watchlist', Icon: IconStar },
  { to: '/portfolio', label: 'Portfolio', Icon: IconPortfolio },
  { to: '/transactions', label: 'Transactions', Icon: IconList },
  { to: '/news', label: 'News', Icon: IconNews },
];

export default function AppLayout() {
  const { user, token, initializing, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  if (initializing) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <Spinner />
      </div>
    );
  }

  const doLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
        <Wordmark />
        <nav className="side-nav" aria-label="Main navigation">
          {NAV.map(({ to, label, Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`}>
              <Icon size={19} />
              {label}
            </NavLink>
          ))}
          {user && (
            <NavLink to="/profile" className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`}>
              <IconUser size={19} />
              Profile
            </NavLink>
          )}
        </nav>
        <div className="sidebar-foot">
          <span className="badge badge-demo" style={{ alignSelf: 'flex-start' }}>◍ Demonstration data</span>
          <span>All prices are simulated for learning. Not real market data.</span>
          {user && (
            <button className="btn btn-ghost btn-sm" onClick={doLogout} style={{ alignSelf: 'flex-start' }}>
              <IconLogout size={15} /> Sign out
            </button>
          )}
        </div>
      </aside>

      {menuOpen && <div className="sidebar-scrim" onClick={() => setMenuOpen(false)} />}

      <div className="main-col">
        <header className="topbar">
          <button className="menu-btn" onClick={() => setMenuOpen((v) => !v)} aria-label="Toggle menu">
            {menuOpen ? <IconClose /> : <IconMenu />}
          </button>
          <Wordmark className="topbar-wordmark" />
          <div className="topbar-search">
            <SearchBar />
          </div>
          <div className="topbar-right">
            {user ? (
              <NavLink to="/profile" className="user-chip" title={user.email}>
                <span className="avatar">{initials(user.name)}</span>
                <span>{user.name}</span>
              </NavLink>
            ) : (
              <>
                <NavLink to="/login" className="btn btn-ghost btn-sm">Sign in</NavLink>
                <NavLink to="/register" className="btn btn-primary btn-sm">Create account</NavLink>
              </>
            )}
          </div>
        </header>
        <main className="page page-fade">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
