import React from "react";
import { WelcomeSection } from "@/components/organisms/WelcomeSection/WelcomeSection";
import styles from "./WelcomeTemplate.module.scss";

export const WelcomeTemplate = () => {
  return (
    <main className={styles.main}>
      <WelcomeSection />
    </main>
  );
};
