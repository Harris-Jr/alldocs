'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { API_BASE } from './apiClient';

interface User {
  id: string;
  email: string;
  tier: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const TOKEN_KEY = 'alldocs_token';
const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount.
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
    if (!saved) {
      setLoading(false);
      return;
    }
    setToken(saved);
    fetch(`${API_BASE}/auth/me`, { headers: { Authorization: `Bearer ${saved}` } })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((u) => setUser(u))
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const handle = useCallback(async (path: string, email: string, password: string) => {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const body = await res.json();
    if (!res.ok) {
      throw new Error(Array.isArray(body.message) ? body.message[0] : body.message);
    }
    localStorage.setItem(TOKEN_KEY, body.token);
    setToken(body.token);
    setUser(body.user);
  }, []);

  const login = useCallback((e: string, p: string) => handle('/auth/login', e, p), [handle]);
  const signup = useCallback((e: string, p: string) => handle('/auth/signup', e, p), [handle]);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  return (
    <Ctx.Provider value={{ user, token, loading, login, signup, logout }}>{children}</Ctx.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function getToken(): string | null {
  return typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
}
