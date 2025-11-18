"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await login({ email, password });
    setLoading(false);
    if (res.ok) {
      router.push('/home');
    } else {
      setError(res.error?.body?.message || String(res.error));
    }
  };

  return (
    <form onSubmit={onSubmit} style={{ display: 'grid', gap: 8, width: 320 }}>
      <input placeholder="メールアドレス" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input placeholder="パスワード" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button type="submit" disabled={loading}>{loading ? 'ログイン中...' : 'ログイン'}</button>
      {error && <div style={{ color: 'var(--danger, #c53030)' }}>{error}</div>}
    </form>
  );
}
