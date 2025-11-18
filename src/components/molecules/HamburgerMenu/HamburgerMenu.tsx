"use client";

import React, { useEffect, useRef, useState } from "react";
import { IconButton } from "@/components/atoms/IconButton/IconButton";
import { Menu, X } from "lucide-react";
import styles from "./HamburgerMenu.module.scss";
import RecordsPanel from '@/components/molecules/Pin/RecordsPanel';

export const HamburgerMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isRecordsOpen, setIsRecordsOpen] = useState(false);
  const toggleMenu = () => setIsOpen((prev) => !prev);

  // メニュー外クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    else document.removeEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className={styles.hamburgerContainer} ref={menuRef}>
      <IconButton
        icon={isOpen ? <X size={24} /> : <Menu size={24} />}
        onClick={toggleMenu}
        ariaLabel="メニューを開く"
      />
      <nav className={`${styles.menu} ${isOpen ? styles.open : ""}`}>
        <ul>
          <li><a href="/home">ホーム</a></li>
          <li><a href="/register">地点編集</a></li>
          <li><button onClick={() => setIsRecordsOpen(true)}>記録一覧</button></li>
          <li><a href="/settings">設定</a></li>
          <li><a href="/account">アカウント</a></li>
        </ul>
      </nav>

      {isRecordsOpen && (
        <RecordsPanel onClose={() => setIsRecordsOpen(false)} />
      )}
    </div>
  );
};
