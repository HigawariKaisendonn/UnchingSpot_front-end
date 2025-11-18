"use client";

import React, { useEffect, useState } from 'react';
import styles from './RecordsPanel.module.scss';
import PinEditModal from './PinEditModal';
import { normalizeLatitude, normalizeLongitude } from '@/lib/geo';

export default function RecordsPanel({ onClose }: { onClose?: () => void }) {
  const [pins, setPins] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);

  const load = () => {
    try {
      const raw = localStorage.getItem('mock_pins');
      const arr = raw ? JSON.parse(raw) : [];
      setPins(arr);
    } catch (e) {
      setPins([]);
    }
  };

  useEffect(() => {
    load();
    const handler = () => load();
    window.addEventListener('mock_pins_updated', handler);
    // notify map to hide map controls while panel is open
    window.dispatchEvent(new CustomEvent('records_panel_open', { detail: { open: true } }));
    return () => window.removeEventListener('mock_pins_updated', handler);
  }, []);

  useEffect(() => {
    return () => {
      // notify map that panel closed on unmount
      window.dispatchEvent(new CustomEvent('records_panel_open', { detail: { open: false } }));
    };
  }, []);

  const removePin = (id: string) => {
    const arr = pins.filter(p => p.id !== id);
    setPins(arr);
    localStorage.setItem('mock_pins', JSON.stringify(arr));
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
    <aside className={styles.panel}>
      <div className={styles.header}>
        <h3>記録一覧</h3>
        <button className={styles.close} onClick={() => onClose?.()}>閉じる</button>
      </div>
      <div className={styles.content}>
        {pins.length === 0 ? (
          <div className={styles.empty}>保存されたピンがありません</div>
        ) : (
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
        )}
      </div>
      {editing && <PinEditModal pin={editing} onCancel={() => setEditing(null)} onSave={savePin} />}
    </aside>
  );
}
