"use client";

import React from "react";
import styles from "./Header.module.scss";
import { HamburgerMenu } from "@/components/molecules/HamburgerMenu/HamburgerMenu";

export const HeaderNav: React.FC = () => {
  return (
    <header className={styles.header}>
      <h1 className={styles.logo}>うんちんぐすぽっと
      </h1>
      <div className={styles.hamburgerWrapper}>
        <HamburgerMenu />
      </div>
    </header>
  );
};

