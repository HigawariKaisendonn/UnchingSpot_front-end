import React from "react";
import { WelcomeMessage } from "@/components/molecules/WelcomeMessage/WelcomeMessage";
import { Button } from "@/components/atoms/Button/Button";
import styles from "./WelcomeSection.module.scss";

export const WelcomeSection = () => {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <WelcomeMessage />
        <Button label="はじめる" href="/home" />
      </div>
    </section>
  );
};
