"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function SignUpForm() {
  const { signup } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    // 🔽 AuthContext.signup()（内部で POST /auth/signup を実行）
    const res = await signup({ email, password, name });
    setLoading(false);
      if (res.ok) {
        router.push('/home');
      } else {
      setError(res.error?.body?.message || String(res.error));
    }
  };

  return (
    <form onSubmit={onSubmit} style={{ display: 'grid', gap: 8, width: 320 }}>
      <input placeholder="名前 (任意)" value={name} onChange={(e) => setName(e.target.value)} />
      <input placeholder="メールアドレス" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input placeholder="パスワード" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button type="submit" disabled={loading}>{loading ? '登録中...' : '登録'}</button>
      {error && <div style={{ color: 'var(--danger, #c53030)' }}>{error}</div>}
    </form>
  );
}
