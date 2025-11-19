"use client";

import React from "react";
import PanelLayout from "@/components/molecules/PanelLayout/PanelLayout";

interface PanelProps {
  onClose: () => void;
}

const SettingsPanel: React.FC<PanelProps> = ({ onClose }) => {
  return (
    <PanelLayout title="設定" onClose={onClose}>
      <div style={{ padding: "16px" }}>

        {/* --- テーマ選択 --- */}
        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              fontWeight: "bold",
              marginBottom: "6px",
            }}
          >
            テーマ
          </label>
          <select
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "6px",
              border: "1px solid #ccc",
            }}
          >
            <option value="light">ライト</option>
            <option value="dark">ダーク</option>
          </select>
        </div>

        {/* --- 通知設定 --- */}
        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              fontWeight: "bold",
              marginBottom: "6px",
            }}
          >
            通知
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <input type="checkbox" />
            有効
          </label>
        </div>

      </div>
    </PanelLayout>
  );
};

export default SettingsPanel;
