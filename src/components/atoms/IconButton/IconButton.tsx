"use client";

import React from "react";
import styles from "./IconButton.module.scss";

type IconButtonProps = {
  icon: React.ReactNode;
  onClick?: () => void;
  ariaLabel?: string;
};

export const IconButton: React.FC<IconButtonProps> = ({ icon, onClick, ariaLabel }) => {
  return (
    <button
      className={styles.iconButton}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {icon}
    </button>
  );
};

