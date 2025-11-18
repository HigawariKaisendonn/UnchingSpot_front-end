"use client";

import React from "react";
import styles from "./Map.module.scss";

type Props = {
  className?: string;
};

const Map = React.forwardRef<HTMLDivElement, Props>(({ className }, ref) => {
  return <div ref={ref} className={`${styles.map} ${className ?? ""}`} />;
});

Map.displayName = "Map";

export default Map;
