"use client";

import React, { useEffect, useState } from "react";
import styles from "./NawabarPanel.module.scss";
import { normalizeLatitude, normalizeLongitude } from "@/lib/geo";

type Pin = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
};

export default function NawabarPanel({ onClose }: { onClose?: () => void }) {
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [polygonPins, setPolygonPins] = useState<Pin[]>([]); // 囲み中のピン

  /*------------------------------------------
    初回読み込み：選択中のピン情報を取得
  -------------------------------------------*/
  useEffect(() => {
    const load = () => {
      try {
        const raw = localStorage.getItem("mock_pins");
        const arr = raw ? JSON.parse(raw) : [];

        const selectedId = localStorage.getItem("selected_pin");
        if (selectedId) {
          const found = arr.find((p: Pin) => p.id === selectedId);
          setSelectedPin(found || null);
        }
      } catch {
        setSelectedPin(null);
      }
    };

    load();

    // ピン更新があったら再読み込み
    const handler = () => load();
    window.addEventListener("mock_pins_updated", handler);
    
    // パネル開いたことを通知
    window.dispatchEvent(new CustomEvent("nawabarPanel:open", { detail: { open: true } }));

    return () => {
      window.removeEventListener("mock_pins_updated", handler);

      // パネル閉じたことを通知
      window.dispatchEvent(new CustomEvent("nawabarPanel:open", { detail: { open: false } }));
    };
  }, []);

  /*------------------------------------------
    地図側から選択中ピンの変更イベントを受け取る
  -------------------------------------------*/
  useEffect(() => {
    const handler = (e: any) => setSelectedPin(e.detail.pin);

    window.addEventListener("pin:selected", handler);

    return () => window.removeEventListener("pin:selected", handler);
  }, []);

  /*------------------------------------------
    囲み中のピン（地図側から送られる）
  -------------------------------------------*/
  useEffect(() => {
    const handler = (e: any) => setPolygonPins(e.detail.pins);
    window.addEventListener("nawabar:updatePolygon", handler);

    return () => window.removeEventListener("nawabar:updatePolygon", handler);
  }, []);

  /*------------------------------------------
    編集開始
  -------------------------------------------*/
  const startEdit = () => {
    setIsEditMode(true);
    window.dispatchEvent(new CustomEvent("editMode:on"));
  };

  /*------------------------------------------
    キャンセル（1つ前のピンに戻す）
  -------------------------------------------*/
  const cancelEdit = () => {
    setIsEditMode(false);
    window.dispatchEvent(new CustomEvent("editMode:cancel"));
  };

  /*------------------------------------------
    決定（地図側で保存処理）
  -------------------------------------------*/
  const confirmEdit = () => {
    if (polygonPins.length < 3) return; // 不正防止
    setIsEditMode(false);
    window.dispatchEvent(new CustomEvent("editMode:confirm"));
  };

  return (
    <aside className={styles.panel}>
      {/* ヘッダー */}
      <div className={styles.header}>
        <h3>ナワバリ編集</h3>
        <button className={styles.close} onClick={() => onClose?.()}>
          ×
        </button>
      </div>

      {/* 選択ピン情報 */}
      <div className={styles.content}>
        {!selectedPin ? (
          <div className={styles.empty}>ピンが選択されていません</div>
        ) : (
          <div className={styles.info}>
            <div className={styles.name}>{selectedPin.name}</div>
            <div className={styles.coord}>
              {selectedPin.latitude.toFixed(6)}, {selectedPin.longitude.toFixed(6)}
            </div>
          </div>
        )}
      </div>

      {/* 編集ボタン or 決定/キャンセル */}
      <div className={styles.footer}>
        {!isEditMode ? (
          <button
            className={styles.editBtn}
            onClick={startEdit}
          >
            編集
          </button>
        ) : (
          <div className={styles.editControls}>
            <button
              onClick={confirmEdit}
              disabled={polygonPins.length < 3} // 囲めてない
              className={polygonPins.length < 3 ? styles.disabled : styles.okBtn}
            >
              決定
            </button>
            <button className={styles.cancelBtn} onClick={cancelEdit}>
              キャンセル
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
