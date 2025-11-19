"use client";

import React from "react";
import PanelLayout from "@/components/molecules/PanelLayout/PanelLayout";

interface PanelProps {
  onClose: () => void;
}

const AccountPanel: React.FC<PanelProps> = ({ onClose }) => {
  return (
    <PanelLayout title="アカウント" onClose={onClose}>
      <div style={{ padding: "16px" }}>
        <div style={{ marginBottom: "16px" }}>
          <span>ユーザー名：</span>
          <strong>テストユーザー</strong>
        </div>

        <button
          style={{
            padding: "10px",
            width: "100%",
            backgroundColor: "#e53935",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          ログアウト
        </button>
      </div>
    </PanelLayout>
  );
};

export default AccountPanel;
