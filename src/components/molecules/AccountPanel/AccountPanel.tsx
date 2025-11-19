"use client";

import React, { useState } from "react";
import PanelLayout from "@/components/molecules/PanelLayout/PanelLayout";
import { useAuth } from "@/context/AuthContext";

interface PanelProps {
  onClose: () => void;
}

const AccountPanel: React.FC<PanelProps> = ({ onClose }) => {
  const { user, logout, loading } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    if (window.confirm("ログアウトしますか？")) {
      try {
        setIsLoggingOut(true);
        await logout();
        onClose(); // パネルを閉じる
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("ログアウトエラー:", error);
        window.alert("ログアウトに失敗しました");
      } finally {
        setIsLoggingOut(false);
      }
    }
  };

  return (
    <PanelLayout title="アカウント" onClose={onClose}>
      <div style={{ padding: "16px" }}>
        {loading ? (
          <div style={{ marginBottom: "16px" }}>読み込み中...</div>
        ) : user ? (
          <>
            {/* --- ユーザー情報表示 --- */}
            <div style={{ marginBottom: "16px" }}>
              <div style={{ marginBottom: "8px" }}>
                <span style={{ color: "#000000" }}>ユーザー名：</span>
                <strong style={{ color: "#000000" }}>{user.name || "未設定"}</strong>
              </div>
              <div style={{ marginBottom: "8px", fontSize: "0.9rem", color: "#666" }}>
                <span>メールアドレス：</span>
                <span>{user.email}</span>
              </div>
              {user.id && (
                <div style={{ fontSize: "0.85rem", color: "#999" }}>
                  <span>ID：</span>
                  <span>{user.id}</span>
                </div>
              )}
            </div>

            {/* --- ログアウトボタン --- */}
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              style={{
                padding: "10px",
                width: "100%",
                backgroundColor: isLoggingOut ? "#ccc" : "#e53935",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: isLoggingOut ? "not-allowed" : "pointer",
                fontSize: "16px",
                fontWeight: "bold",
              }}
            >
              {isLoggingOut ? "ログアウト中..." : "ログアウト"}
            </button>
          </>
        ) : (
          <div style={{ marginBottom: "16px" }}>
            <p>ログインしていません</p>
            <p style={{ fontSize: "0.9rem", color: "#666" }}>
              ログインが必要です
            </p>
          </div>
        )}
      </div>
    </PanelLayout>
  );
};

export default AccountPanel;
