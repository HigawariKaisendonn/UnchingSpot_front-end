"use client";

import React from "react";
import { HeaderNav } from "@/components/organisms/Header/Header";
import { FloatingActionButton } from "@/components/molecules/FloatingActionButton/FloatingActionButton";
import { MapContainer } from "@/components/organisms/MapContainer/MapContainer";

export const HomeTemplate: React.FC = () => {
  return (
    <>
      <HeaderNav />
      <MapContainer />
      <FloatingActionButton onClick={() => alert("ピン追加ボタン")} />
    </>
  );
};
