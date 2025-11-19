"use client";

import React, { useState } from 'react';
import LoginForm from './LoginForm';
import SignUpForm from './SignUpForm';
import styles from './AuthModal.module.scss';

export default function AuthModal({ onClose }: { onClose?: () => void }) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  return (
    <div className={styles.backdrop} role="dialog">
      <div className={styles.modal}>
        <div className={styles.header}>
          <button onClick={() => setMode('login')} className={mode === 'login' ? styles.active : ''}>ログイン</button>
          <button onClick={() => setMode('signup')} className={mode === 'signup' ? styles.active : ''}>サインアップ</button>
          <button className={styles.close} onClick={() => onClose?.()}>×</button>
        </div>
        <div className={styles.body}>
          {mode === 'login' ? <LoginForm /> : <SignUpForm />}
        </div>
      </div>
    </div>
  );
}
