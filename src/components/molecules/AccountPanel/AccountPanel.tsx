"use client";

import React from 'react';
import styles from './AccountPanel.module.scss';

interface PanelProps {
  onClose: () => void;
}

const AccountPanel: React.FC<PanelProps> = ({ onClose }) => {
  return (
    <aside className={styles.panel}>
      <div className={styles.header}>
        <h3>アカウント</h3>
        <button className={styles.closeButton} onClick={onClose}>×</button>
      </div>
      <div className={styles.content}>
        <div className={styles.item}>
          <span>ユーザー名:</span> <strong>テストユーザー</strong>
        </div>
        <div className={styles.item}>
          <button className={styles.logoutButton}>ログアウト</button>
        </div>
      </div>
    </aside>
  );
};

export default AccountPanel;
