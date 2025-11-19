"use client";

import React, { useEffect, useState } from 'react';
import styles from './RecordsPanel.module.scss';
import PinEditModal from './PinEditModal';
import { normalizeLatitude, normalizeLongitude } from '@/lib/geo';
import PanelLayout from "@/components/molecules/PanelLayout/PanelLayout";
import { getPins, deletePin, updatePin, type Pin } from '@/lib/pinApi';

export default function RecordsPanel({ onClose }: { onClose?: () => void }) {
  const [pins, setPins] = useState<Pin[]>([]);
  const [editing, setEditing] = useState<Pin | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const arr = await getPins();
      setPins(arr);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to load pins:', e);
      setPins([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const handler = () => load();
    window.addEventListener('mock_pins_updated', handler);
    window.addEventListener('pins_updated', handler);
    // notify map to hide map controls while panel is open
    window.dispatchEvent(new CustomEvent('records_panel_open', { detail: { open: true } }));
    return () => {
      window.removeEventListener('mock_pins_updated', handler);
      window.removeEventListener('pins_updated', handler);
    };
  }, []);

  useEffect(() => {
    return () => {
      // notify map that panel closed on unmount
      window.dispatchEvent(new CustomEvent('records_panel_open', { detail: { open: false } }));
    };
  }, []);

  const removePin = async (id: string) => {
    try {
      await deletePin(id);
      setPins(pins.filter(p => p.id !== id));
      window.dispatchEvent(new CustomEvent('pins_updated'));
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.error('Failed to delete pin:', e);
      const errorMessage = e?.message || 'ピンの削除に失敗しました';
      window.alert(errorMessage);
    }
  };

  const savePin = async (updated: Pin) => {
    try {
      const norm = { 
        ...updated, 
        latitude: normalizeLatitude(updated.latitude), 
        longitude: normalizeLongitude(updated.longitude) 
      };
      const savedPin = await updatePin(updated.id, {
        name: norm.name,
        latitude: norm.latitude,
        longitude: norm.longitude,
      });
      setPins(pins.map((p) => p.id === updated.id ? savedPin : p));
      setEditing(null);
      window.dispatchEvent(new CustomEvent('pins_updated'));
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.error('Failed to update pin:', e);
      const errorMessage = e?.message || 'ピンの更新に失敗しました';
      window.alert(errorMessage);
    }
  };

  return (
  <PanelLayout title="記録一覧" onClose={onClose}>
    {loading ? (
      <div>読み込み中...</div>
    ) : pins.length === 0 ? (
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

    {editing && (
      <PinEditModal
        pin={editing}
        onCancel={() => setEditing(null)}
        onSave={savePin}
      />
    )}
  </PanelLayout>
);
}
