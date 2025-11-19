import React from 'react';
import LoginForm from '@/components/molecules/Auth/LoginForm';
import { AuthProvider } from '@/context/AuthContext';

export default function LoginPage() {
  return (
    <AuthProvider>
      <div style={{ padding: 24 }}>
        <h1>ログイン</h1>
        <LoginForm />
      </div>
    </AuthProvider>
  );
}
