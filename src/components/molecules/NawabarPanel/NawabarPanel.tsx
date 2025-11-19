"use client";

import React, { useEffect, useState } from "react";
import styles from "./NawabarPanel.module.scss";
import PanelLayout from "@/components/molecules/PanelLayout/PanelLayout";
import { getConnects, deleteConnect, type Connect } from "@/lib/connectApi";
import { getPins, type Pin } from "@/lib/pinApi";

export default function NawabarPanel({ onClose }: { onClose?: () => void }) {
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [polygonPins, setPolygonPins] = useState<Pin[]>([]);
  const [connects, setConnects] = useState<Connect[]>([]);
  const [pins, setPins] = useState<Pin[]>([]);
  const [isPolygonComplete, setIsPolygonComplete] = useState(false);

  /*------------------------------------------
    初回読み込み
  -------------------------------------------*/
  useEffect(() => {
    const load = async () => {
      try {
        const pinsData = await getPins();
        setPins(pinsData);
        
        const connectsData = await getConnects();
        setConnects(connectsData.filter(c => c.show));

        const selectedId = localStorage.getItem("selected_pin");
        if (selectedId) {
          const found = pinsData.find((p: Pin) => p.id === selectedId);
          setSelectedPin(found || null);
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("Failed to load data:", e);
        setSelectedPin(null);
      }
    };

    load();

    const handler = () => load();
    window.addEventListener("mock_pins_updated", handler);
    window.addEventListener("pins_updated", handler);
    window.addEventListener("connects_updated", handler);

    // Panel open
    window.dispatchEvent(
      new CustomEvent("panel_open_state", { detail: { open: true } })
    );

    return () => {
      window.removeEventListener("mock_pins_updated", handler);
      window.removeEventListener("pins_updated", handler);
      window.removeEventListener("connects_updated", handler);

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
    ポリゴン完成検知
  -------------------------------------------*/
  useEffect(() => {
    const handler = () => setIsPolygonComplete(true);
    window.addEventListener("nawabar:polygonComplete", handler);
    return () => window.removeEventListener("nawabar:polygonComplete", handler);
  }, []);

  /*------------------------------------------
    編集
  -------------------------------------------*/
  const startEdit = () => {
    setIsEditMode(true);
    setIsPolygonComplete(false);
    window.dispatchEvent(new CustomEvent("editMode:on"));
  };

  const cancelEdit = () => {
    setIsEditMode(false);
    setIsPolygonComplete(false);
    window.dispatchEvent(new CustomEvent("editMode:cancel"));
    // 編集モードをオフにするイベントも発火して、線をクリア
    window.dispatchEvent(new Event("editMode:off"));
  };

  const confirmEdit = () => {
    // 要件: selectedPins = [pin1, pin2] で確定
    // editMode:confirmイベントを発火して、AreaModalを表示させる
    window.dispatchEvent(new CustomEvent("editMode:confirm"));
  };
  
  const handleDeleteConnect = async (connectId: string) => {
    if (!window.confirm("この接続を削除しますか？")) return;
    try {
      await deleteConnect(connectId);
      setConnects(connects.filter(c => c.id !== connectId));
      window.dispatchEvent(new CustomEvent("connects_updated"));
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.error("Failed to delete connect:", e);
      window.alert("削除に失敗しました");
    }
  };
  
  const getPinName = (pinId: string) => {
    const pin = pins.find(p => p.id === pinId);
    return pin?.name || pinId;
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

        {/* --- Connect一覧 --- */}
        {connects.length > 0 && (
          <div style={{ marginTop: "24px", marginBottom: "24px" }}>
            <h4 style={{ margin: "0 0 12px 0", fontSize: "1rem", color: "#000000" }}>接続一覧</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {connects.map((connect) => (
                <li
                  key={connect.id}
                  style={{
                    padding: "8px",
                    marginBottom: "8px",
                    backgroundColor: "#f5f5f5",
                    borderRadius: "4px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontSize: "0.9rem" }}>
                    <strong style={{ color: "#000000" }}>{connect.name}</strong>
                    <br />
                    <span style={{ fontSize: "0.8rem", color: "#999" }}>
                      {getPinName(connect.pin_id_1)} → {connect.pin_id_2.map(id => getPinName(id)).join(' → ')} → {getPinName(connect.pin_id_1)}
                    </span>
                  </span>
                  <button
                    onClick={() => handleDeleteConnect(connect.id)}
                    style={{
                      padding: "4px 8px",
                      fontSize: "0.8rem",
                      backgroundColor: "#f44336",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    削除
                  </button>
                </li>
              ))}
            </ul>
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
            作成
          </button>
        ) : (
          <>
            <div style={{ marginBottom: "12px", fontSize: "0.9rem", color: "#666", padding: "8px", backgroundColor: "#f5f5f5", borderRadius: "4px" }}>
              <p style={{ margin: "0 0 4px 0" }}>ナワバリ作成手順：</p>
              <ol style={{ margin: "0", paddingLeft: "20px" }}>
                <li>1クリック目: 1つ目のピンを選択（開始地点）</li>
                <li>2クリック目: 2つ目のピンを選択（一本目の線）</li>
                <li>3クリック目以降: 3つ目以降のピンを選択（前のピンから線を引く）</li>
                <li>1つ目のピンと同じところをクリック（図形を描画）</li>
                <li>登録ボタンでConnectエンドポイントを通じて登録</li>
              </ol>
            </div>
            <button
              onClick={confirmEdit}
              disabled={!isPolygonComplete}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "6px",
                background: isPolygonComplete ? "#4caf50" : "#aaa",
                color: "white",
                border: "none",
                cursor: isPolygonComplete ? "pointer" : "not-allowed",
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