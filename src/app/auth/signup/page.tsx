import React from 'react';
import SignUpForm from '@/components/molecules/Auth/SignUpForm';
import { AuthProvider } from '@/context/AuthContext';

export default function SignUpPage() {
  return (
    <AuthProvider>
      <div style={{ padding: 24 }}>
        <h1>サインアップ</h1>
        <SignUpForm />
      </div>
    </AuthProvider>
  );
}
