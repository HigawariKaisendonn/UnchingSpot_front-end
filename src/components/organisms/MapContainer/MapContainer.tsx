"use client";

import React from "react";
import styles from "./MapContainer.module.scss";
import LeafletMap from "@/components/molecules/LeafletMap/LeafletMap";

type Props = {
  floatingActionButton?: React.ReactNode;
};

export const MapContainer: React.FC<Props> = ({ floatingActionButton }) => {
  return (
    <div className={styles.wrapper}>
      <LeafletMap floatingActionButton={floatingActionButton} />
    </div>
  );
};
