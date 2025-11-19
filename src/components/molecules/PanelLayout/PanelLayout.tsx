"use client";

import React from "react";
import styles from "./PanelLayout.module.scss";

interface PanelLayoutProps {
  title: string;
  onClose?: () => void;
  children: React.ReactNode;
}

export default function PanelLayout({ title, onClose, children }: PanelLayoutProps) {
  return (
    <aside className={styles.panel}>
      <div className={styles.header}>
        <h3>{title}</h3>
        <button className={styles.close} onClick={onClose}>閉じる</button>
      </div>

      <div className={styles.content}>
        {children}
      </div>
    </aside>
  );
}
