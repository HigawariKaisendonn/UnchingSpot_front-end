"use client";

import React, { useEffect, useState } from 'react';
import styles from './records.module.scss';
import PinEditModal from '@/components/molecules/Pin/PinEditModal';
import { normalizeLatitude, normalizeLongitude } from '@/lib/geo';

export default function RecordsPage() {
  const [pins, setPins] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('mock_pins');
      const arr = raw ? JSON.parse(raw) : [];
      setPins(arr);
    } catch (e) {
      setPins([]);
    }
  }, []);

  const removePin = (id: string) => {
    const arr = pins.filter(p => p.id !== id);
    setPins(arr);
    localStorage.setItem('mock_pins', JSON.stringify(arr));
    // dispatch event for map to update
    window.dispatchEvent(new CustomEvent('mock_pins_updated'));
  };

  const savePin = (updated: any) => {
    const norm = { ...updated, latitude: normalizeLatitude(updated.latitude), longitude: normalizeLongitude(updated.longitude) };
    const arr = pins.map((p) => p.id === updated.id ? norm : p);
    setPins(arr);
    localStorage.setItem('mock_pins', JSON.stringify(arr));
    setEditing(null);
    window.dispatchEvent(new CustomEvent('mock_pins_updated'));
  };

  return (
    <div className={styles.page}>
      <h1>記録一覧</h1>
      <ul className={styles.list}>
        {pins.map(p => (
          <li key={p.id} className={styles.item}>
            <div>
              <div className={styles.name}>{p.name}</div>
              <div className={styles.coord}>{p.latitude.toFixed(6)}, {p.longitude.toFixed(6)}</div>
            </div>
            <div className={styles.actions}>
              <button onClick={() => setEditing(p)}>編集</button>
              <button onClick={() => removePin(p.id)}>削除</button>
            </div>
          </li>
        ))}
      </ul>
      {editing && <PinEditModal pin={editing} onCancel={() => setEditing(null)} onSave={savePin} />}
    </div>
  );
}
