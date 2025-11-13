"use client";

import React from "react";
import { IconButton } from "@/components/atoms/IconButton/IconButton";
import { Plus } from "lucide-react";
import styles from "./FloatingActionButton.module.scss";

type Props = {
  onClick?: () => void;
};

export const FloatingActionButton: React.FC<Props> = ({ onClick }) => {
  return (
    <div className={styles.container}>
      <IconButton icon={<Plus />} onClick={onClick} ariaLabel="ピンを追加" />
    </div>
  );
};
