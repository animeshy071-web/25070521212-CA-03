import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Spinner } from './ui.jsx';

/** Redirects unauthenticated visitors to /login, preserving the destination. */
export default function ProtectedRoute({ children }) {
  const { token, initializing } = useAuth();
  const location = useLocation();

  if (initializing) return <Spinner />;
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}
