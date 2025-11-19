"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import apiFetch from '@/lib/api';
import { useRouter } from 'next/navigation';

type User = { id: string; name?: string; email: string } | null;

type AuthContextValue = {
  user: User;
  loading: boolean;
  signup: (payload: { email: string; password: string; name?: string }) => Promise<{ ok: boolean; error?: any }>;
  login: (payload: { email: string; password: string }) => Promise<{ ok: boolean; error?: any }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  const refreshUser = async () => {
    setLoading(true);
    const MOCK = process.env.NEXT_PUBLIC_MOCK_AUTH === 'true';

    if (MOCK) {
      try {
        const raw = localStorage.getItem('mock_current_user');
        const u = raw ? JSON.parse(raw) : null;
        setUser(u);
      } catch (e) {
        setUser(null);
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      const data = await apiFetch('/api/auth/me', { method: 'GET' });
      setUser(data?.user ?? null);
    } catch (e) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signup = async (payload: { email: string; password: string; name?: string }) => {
    const MOCK = process.env.NEXT_PUBLIC_MOCK_AUTH === 'true';

    if (MOCK) {
      try {
        const usersRaw = localStorage.getItem('mock_users');
        const users = usersRaw ? JSON.parse(usersRaw) : [];
        // prevent duplicate
        if (users.find((u: any) => u.email === payload.email)) {
          return { ok: false, error: { message: 'メールアドレスは既に登録されています' } };
        }
        const id = `mock-${Date.now()}`;
        const user = { id, email: payload.email, name: payload.name };
        users.push({ ...user, password: payload.password });
        localStorage.setItem('mock_users', JSON.stringify(users));
        localStorage.setItem('mock_current_user', JSON.stringify(user));
        setUser(user);
        return { ok: true };
      } catch (e) {
        return { ok: false, error: e };
      }
    }

    try {
      const data = await apiFetch('/api/auth/signup', { method: 'POST', body: JSON.stringify(payload) });
      setUser(data?.user ?? null);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err };
    }
  };

  const login = async (payload: { email: string; password: string }) => {
    const MOCK = process.env.NEXT_PUBLIC_MOCK_AUTH === 'true';

    if (MOCK) {
      try {
        const usersRaw = localStorage.getItem('mock_users');
        const users = usersRaw ? JSON.parse(usersRaw) : [];
        const found = users.find((u: any) => u.email === payload.email && u.password === payload.password);
        if (!found) return { ok: false, error: { message: '認証に失敗しました' } };
        const user = { id: found.id, email: found.email, name: found.name };
        localStorage.setItem('mock_current_user', JSON.stringify(user));
        setUser(user);
        return { ok: true };
      } catch (e) {
        return { ok: false, error: e };
      }
    }

    try {
      const data = await apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify(payload) });
      setUser(data?.user ?? null);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err };
    }
  };

  const logout = async () => {
    const MOCK = process.env.NEXT_PUBLIC_MOCK_AUTH === 'true';

    if (MOCK) {
      localStorage.removeItem('mock_current_user');
      setUser(null);
      try { router.push('/'); } catch (e) {}
      return;
    }

    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      // ignore
    }
    setUser(null);
    // navigate to root after logout
    try { router.push('/'); } catch (e) { /* ignore */ }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
