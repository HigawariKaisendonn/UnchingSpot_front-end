"use client";

import React from "react";
import styles from "./MapContainer.module.scss";

export const MapContainer: React.FC = () => {
  return (
    <div className={styles.mapContainer}>
      {/* 現時点では仮の背景（今後APIで地図を描画） */}
      <div className={styles.mapPlaceholder}>Map will be here</div>
    </div>
  );
};
