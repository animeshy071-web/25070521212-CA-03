import { createContext, useContext, useEffect, useState } from 'react';
import { api, tokenStore } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => tokenStore.get());
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(Boolean(tokenStore.get()));

  useEffect(() => {
    let active = true;
    if (!token) {
      setUser(null);
      setInitializing(false);
      return;
    }
    api
      .get('/auth/me')
      .then((d) => active && setUser(d.data.user))
      .catch(() => {
        if (!active) return;
        tokenStore.set(null);
        setToken(null);
        setUser(null);
      })
      .finally(() => active && setInitializing(false));
    return () => {
      active = false;
    };
  }, [token]);

  const applySession = (payload) => {
    tokenStore.set(payload.token);
    setToken(payload.token);
    setUser(payload.user);
  };

  const login = async (email, password) => {
    const d = await api.post('/auth/login', { email, password });
    applySession(d.data);
  };

  const register = async (name, email, password) => {
    const d = await api.post('/auth/register', { name, email, password });
    applySession(d.data);
  };

  const logout = () => {
    api.post('/auth/logout').catch(() => {});
    tokenStore.set(null);
    setToken(null);
    setUser(null);
  };

  const updateUser = (u) => setUser(u);

  return (
    <AuthContext.Provider value={{ user, token, initializing, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
