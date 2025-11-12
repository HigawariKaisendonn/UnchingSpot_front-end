import React from "react";
import { Text } from "@/components/atoms/Text/Text";

export const WelcomeMessage = () => {
  return (
    <div>
      <Text variant="title">うんちんぐすぽっと</Text>
      <Text variant="subtitle">うんちした場所を記録してマーキングしよう！</Text>
      <Text>
        訪れた場所をマップに記録して、自分だけの「スポット」を作成できます。
      </Text>
    </div>
  );
};
