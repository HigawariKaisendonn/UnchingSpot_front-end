import React from "react";
import styles from "./Button.module.scss";

interface ButtonProps {
  label: string;
  onClick?: () => void;
  href?: string;
}

export const Button: React.FC<ButtonProps> = ({ label, onClick, href }) => {
  if (href) {
    return (
      <a href={href} className={styles.button}>
        {label}
      </a>
    );
  }
  return (
    <button className={styles.button} onClick={onClick}>
      {label}
    </button>
  );
};