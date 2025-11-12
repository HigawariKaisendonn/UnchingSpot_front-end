import React from "react";
import styles from "./Text.module.scss";

interface TextProps {
  children: React.ReactNode;
  variant?: "title" | "subtitle" | "body";
}

export const Text: React.FC<TextProps> = ({ children, variant = "body" }) => {
  return <p className={styles[variant]}>{children}</p>;
};
