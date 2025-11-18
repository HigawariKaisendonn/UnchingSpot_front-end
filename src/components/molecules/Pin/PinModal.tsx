"use client";

import React, { useState } from 'react';
import styles from './PinModal.module.scss';

export default function PinModal({ defaultName = '', onCancel, onSave }: { defaultName?: string; onCancel: () => void; onSave: (name: string) => void }) {
  const [name, setName] = useState(defaultName);

  return (
    <div className={styles.backdrop} role="dialog">
      <div className={styles.modal}>
        <h3>ピンを保存</h3>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="ピンの名前（例: トイレ）" />
        <div className={styles.actions}>
          <button className={styles.cancel} onClick={onCancel}>キャンセル</button>
          <button className={styles.save} onClick={() => onSave(name || '無題のピン')}>保存</button>
        </div>
      </div>
    </div>
  );
}
