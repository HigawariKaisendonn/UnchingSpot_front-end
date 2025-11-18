"use client";

import React from "react";
import { HeaderNav } from "@/components/organisms/Header/Header";
// FloatingActionButton is rendered inside the map controls; do not pass an external one here.
import { MapContainer } from "@/components/organisms/MapContainer/MapContainer";

export const HomeTemplate: React.FC = () => {
  return (
    <>
      <HeaderNav />
      <MapContainer />
    </>
  );
};
