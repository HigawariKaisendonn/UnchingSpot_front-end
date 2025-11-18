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
    // if already logged in, go to /home
    if (!loading && user) {
      router.push('/home');
      return;
    }
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
