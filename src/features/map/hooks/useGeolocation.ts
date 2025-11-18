"use client";

import { useEffect, useState } from "react";

type Position = {
  latitude: number;
  longitude: number;
};

export const useGeolocation = () => {
  const [position, setPosition] = useState<Position | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      (err) => console.error(err)
    );
  }, []);

  return { position };
};
