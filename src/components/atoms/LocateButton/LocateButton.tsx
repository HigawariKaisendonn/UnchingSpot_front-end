"use client";

import React from "react";
import styles from "./LocateButton.module.scss";

type Props = {
  onClick: () => void;
  children?: React.ReactNode;
};

const LocateButton: React.FC<Props> = ({ onClick, children }) => {
  return (
    <div className={styles.root}>
      <button type="button" className={styles.button} onClick={onClick}>
        {children ?? "Locate me"}
      </button>
    </div>
  );
};

export default LocateButton;
