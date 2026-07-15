import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi } from '../api/services';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('jb_token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { user } = await authApi.me();
      setUser(user);
    } catch {
      localStorage.removeItem('jb_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (credentials) => {
    const { token, user } = await authApi.login(credentials);
    localStorage.setItem('jb_token', token);
    setUser(user);
    return user;
  };

  const register = async (payload) => {
    const { token, user } = await authApi.register(payload);
    localStorage.setItem('jb_token', token);
    setUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('jb_token');
    setUser(null);
  };

  const refreshUser = async () => {
    const { user } = await authApi.me();
    setUser(user);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
