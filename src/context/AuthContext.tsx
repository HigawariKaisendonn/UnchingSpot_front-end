"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import apiFetch, { setToken, getToken } from '@/lib/api';
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
      const token = getToken();
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      const data = await apiFetch('/api/auth/me', { method: 'GET' });
      setUser(data ?? null);
    } catch (e) {
      setUser(null);
      // トークンが無効な場合は削除
      setToken(null);
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
      // サインアップ
      const signupData = await apiFetch('/api/auth/signup', { 
        method: 'POST', 
        body: JSON.stringify(payload),
        skipAuth: true 
      });
      
      // サインアップ後、自動的にログイン処理を行う
      try {
        const loginData = await apiFetch('/api/auth/login', { 
          method: 'POST', 
          body: JSON.stringify({ email: payload.email, password: payload.password }),
          skipAuth: true 
        });
        
        // トークンを保存
        if (loginData?.token) {
          setToken(loginData.token);
          setUser(loginData.user ?? signupData ?? null);
        } else {
          setUser(signupData ?? null);
        }
        return { ok: true };
      } catch (loginErr) {
        // ログインに失敗した場合でも、サインアップは成功しているのでユーザー情報を保存
        setUser(signupData ?? null);
        return { ok: true };
      }
    } catch (err: any) {
      // エラーメッセージを適切に処理
      const errorMessage = err?.body?.error?.message || err?.message || '登録に失敗しました';
      return { ok: false, error: { message: errorMessage, code: err?.body?.error?.code } };
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
      const data = await apiFetch('/api/auth/login', { 
        method: 'POST', 
        body: JSON.stringify(payload),
        skipAuth: true 
      });
      
      // トークンを保存
      if (data?.token) {
        setToken(data.token);
        setUser(data.user ?? null);
      } else {
        setUser(data ?? null);
      }
      return { ok: true };
    } catch (err: any) {
      // エラーメッセージを適切に処理
      const errorMessage = err?.body?.error?.message || err?.message || 'ログインに失敗しました';
      return { ok: false, error: { message: errorMessage, code: err?.body?.error?.code } };
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
    // トークンを削除
    setToken(null);
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
