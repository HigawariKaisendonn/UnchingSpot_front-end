"use client";

import React from 'react';
import styles from './SettingsPanel.module.scss';

interface PanelProps {
  onClose: () => void;
}

const SettingsPanel: React.FC<PanelProps> = ({ onClose }) => {
  return (
    <aside className={styles.panel}>
      <div className={styles.header}>
        <h3>設定</h3>
        <button className={styles.closeButton} onClick={onClose}>×</button>
      </div>
      <div className={styles.content}>
        <div className={styles.item}>
          <label>テーマ</label>
          <select>
            <option value="light">ライト</option>
            <option value="dark">ダーク</option>
          </select>
        </div>
        <div className={styles.item}>
          <label>通知</label>
          <input type="checkbox" /> 有効
        </div>
      </div>
    </aside>
  );
};

export default SettingsPanel;
