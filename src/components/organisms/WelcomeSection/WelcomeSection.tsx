"use client";

import React, { useState } from "react";
import { WelcomeMessage } from "@/components/molecules/WelcomeMessage/WelcomeMessage";
import styles from "./WelcomeSection.module.scss";
import AuthModal from "@/components/molecules/Auth/AuthModal";
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export const WelcomeSection = () => {
  const [showModal, setShowModal] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();

  const onStart = () => {
    // ---------------------------------------------
    // フロー説明
    //
    // はじめるボタン押下 → すでにログイン済みなら /home へ遷移
    // 未ログインなら AuthModal を表示し、ログインまたは新規登録を行う
    //
    // AuthModal 内で使うAPI（Goバックエンド）
    // ---------------------------------------------
    //
    //  アカウント登録（POST /api/auth/signup）
    //  body = { email, password, name }
    //
    //  ログイン（POST /api/auth/login）
    //  body = { email, password }
    //
    //  ログイン後のユーザー確認（GET /api/auth/me）
    //
    // これらは AuthContext 内で fetch を使って実行する
    // ---------------------------------------------
    if (!loading && user) {
      router.push('/home');
      return;
    }
    // 未ログイン → 認証モーダルを表示
    setShowModal(true);
  };

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <WelcomeMessage />
        <button className={styles.startButton} onClick={onStart}>はじめる</button>
      </div>
      {showModal && <AuthModal onClose={() => setShowModal(false)} />}
    </section>
  );
};
