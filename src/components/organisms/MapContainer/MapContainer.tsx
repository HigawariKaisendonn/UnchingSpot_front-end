"use client";

import React, { useEffect, useRef, useState } from "react";
import { useGeolocation } from "@/features/map/hooks/useGeolocation";
import styles from "./MapContainer.module.scss";
import "leaflet/dist/leaflet.css";

export const MapContainer: React.FC = () => {
  const mapRef = useRef<any>(null);
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const { position } = useGeolocation();
  const [leaflet, setLeaflet] = useState<any>(null);

  // ⭐ Leaflet をクライアント側でのみ読み込む
  useEffect(() => {
    (async () => {
      const L = await import("leaflet");
      setLeaflet(L);
    })();
  }, []);

  // ⭐ Leaflet & DOM が揃ったらマップを初期化
  useEffect(() => {
    if (!leaflet || !mapElementRef.current || mapRef.current) return;

    const L = leaflet;

    mapRef.current = L.map(mapElementRef.current).setView([35.6812, 139.7671], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(mapRef.current);

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [leaflet]);

  // ⭐ 現在地取得後の処理
  useEffect(() => {
    if (!position || !leaflet || !mapRef.current) return;

    const L = leaflet;
    const { latitude, longitude } = position;

    mapRef.current.setView([latitude, longitude], 15);

    L.marker([latitude, longitude])
      .addTo(mapRef.current)
      .bindPopup("現在地")
      .openPopup();
  }, [position, leaflet]);

  return <div ref={mapElementRef} className={styles.map}></div>;
};
