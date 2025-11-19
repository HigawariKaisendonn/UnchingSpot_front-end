"use client";

import React, { useState } from 'react';
import styles from './PinEditModal.module.scss';

export default function PinEditModal({ pin, onCancel, onSave }: { pin: any; onCancel: () => void; onSave: (updated: any) => void }) {
  const [name, setName] = useState(pin?.name ?? '');
  const [lat, setLat] = useState(String(pin?.latitude ?? ''));
  const [lng, setLng] = useState(String(pin?.longitude ?? ''));

  return (
    <div className={styles.backdrop} role="dialog">
      <div className={styles.modal}>
        <h3>ピン編集</h3>
        <label>名前</label>
        <input value={name} onChange={(e) => setName(e.target.value)} />
        <label>緯度</label>
        <input value={lat} onChange={(e) => setLat(e.target.value)} />
        <label>経度</label>
        <input value={lng} onChange={(e) => setLng(e.target.value)} />
        <div className={styles.actions}>
          <button className={styles.cancel} onClick={onCancel}>キャンセル</button>
          <button className={styles.save} onClick={() => onSave({ ...pin, name, latitude: parseFloat(lat || '0'), longitude: parseFloat(lng || '0') })}>保存</button>
        </div>
      </div>
    </div>
  );
}
