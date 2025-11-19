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
        {/* --- ユーザー名表示 --- */}
        <div style={{ marginBottom: "16px" }}>
          <span>ユーザー名：</span>
          <strong>テストユーザー</strong>
        </div>

        {/* --- ログアウトボタン --- */}
        <button
          style={{
            padding: "10px",
            width: "100%",
            backgroundColor: "#e53935",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            // 🔽 ここで logout API を実行する（AuthContext に処理を書き、ここで呼ぶ）
            // 例: onLogout();
          }}
        >
          ログアウト
        </button>
      </div>
    </PanelLayout>
  );
};

export default AccountPanel;
