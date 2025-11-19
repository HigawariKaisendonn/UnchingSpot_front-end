"use client";

import React, { useEffect, useState } from "react";
import styles from "./NawabarPanel.module.scss";
import PanelLayout from "@/components/molecules/PanelLayout/PanelLayout";

type Pin = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
};

export default function NawabarPanel({ onClose }: { onClose?: () => void }) {
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [polygonPins, setPolygonPins] = useState<Pin[]>([]);

  /*------------------------------------------
    初回読み込み
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

    const handler = () => load();
    window.addEventListener("mock_pins_updated", handler);

    // Panel open
    window.dispatchEvent(
      new CustomEvent("panel_open_state", { detail: { open: true } })
    );

    return () => {
      window.removeEventListener("mock_pins_updated", handler);

      // Panel close
      window.dispatchEvent(
        new CustomEvent("panel_open_state", { detail: { open: false } })
      );
    };
  }, []);

  /*------------------------------------------
    地図側からピン選択
  -------------------------------------------*/
  useEffect(() => {
    const handler = (e: any) => setSelectedPin(e.detail.pin);
    window.addEventListener("pin:selected", handler);
    return () => window.removeEventListener("pin:selected", handler);
  }, []);

  /*------------------------------------------
    囲み中のピン（地図 → パネル）
  -------------------------------------------*/
  useEffect(() => {
    const handler = (e: any) => setPolygonPins(e.detail.pins);
    window.addEventListener("nawabar:updatePolygon", handler);
    return () => window.removeEventListener("nawabar:updatePolygon", handler);
  }, []);

  /*------------------------------------------
    編集
  -------------------------------------------*/
  const startEdit = () => {
    setIsEditMode(true);
    window.dispatchEvent(new CustomEvent("editMode:on"));
  };

  const cancelEdit = () => {
    setIsEditMode(false);
    window.dispatchEvent(new CustomEvent("editMode:cancel"));
  };

  const confirmEdit = () => {
    if (polygonPins.length < 3) return;
    setIsEditMode(false);
    window.dispatchEvent(new CustomEvent("editMode:confirm"));
  };

  return (
    <PanelLayout title="ナワバリ編集" onClose={onClose}>
      <div style={{ padding: "16px" }}>

        {/* --- ピン情報 --- */}
        {!selectedPin ? (
          <p style={{ color: "#666", textAlign: "center", marginTop: "32px" }}>
            ピンが選択されていません
          </p>
        ) : (
          <div style={{ marginBottom: "24px" }}>
            <h4 style={{ margin: 0 }}>{selectedPin.name}</h4>
            <p style={{ margin: 0, color: "#444" }}>
              {selectedPin.latitude.toFixed(6)}, {selectedPin.longitude.toFixed(6)}
            </p>
          </div>
        )}

        {/* --- 編集フッター --- */}
        {!isEditMode ? (
          <button
            onClick={startEdit}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              background: "#1976d2",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            編集
          </button>
        ) : (
          <>
            <button
              onClick={confirmEdit}
              disabled={polygonPins.length < 3}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "6px",
                background: polygonPins.length < 3 ? "#aaa" : "#4caf50",
                color: "white",
                border: "none",
                cursor: polygonPins.length < 3 ? "not-allowed" : "pointer",
                marginBottom: "8px",
              }}
            >
              決定
            </button>

            <button
              onClick={cancelEdit}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "6px",
                background: "#ccc",
                border: "none",
                cursor: "pointer",
              }}
            >
              キャンセル
            </button>
          </>
        )}
      </div>
    </PanelLayout>
  );
}