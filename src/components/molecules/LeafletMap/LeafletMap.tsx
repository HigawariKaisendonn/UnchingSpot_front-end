"use client";

import React, { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import Map from "@/components/atoms/Map/Map";
import styles from "./LeafletMap.module.scss";
import LocateButton from "@/components/atoms/LocateButton/LocateButton";

type Props = {
  floatingActionButton?: React.ReactNode;
};

const LeafletMap: React.FC<Props> = ({ floatingActionButton }) => {
  const mapRef = useRef<any>(null);
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<any>(null);
  const [Llib, setLlib] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    let createdMap: any = null;

    (async () => {
      try {
        const L = await import("leaflet");
        if (!mounted || !mapElementRef.current) return;

        // disable default zoom control; we'll provide custom controls
        createdMap = L.map(mapElementRef.current, { zoomControl: false }).setView([35.6812, 139.7671], 13);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
        }).addTo(createdMap);

          mapRef.current = createdMap;
        setLlib(L);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Leaflet minimal load error:", err);
      }
    })();

    return () => {
      mounted = false;
      try {
        createdMap?.remove();
        // Remove any leftover Leaflet zoom controls from DOM
        if (mapElementRef.current) {
          const zoomControls = mapElementRef.current.querySelectorAll('.leaflet-control-zoom');
          zoomControls.forEach((el) => el.remove());
        }
      } catch (e) {
        // ignore
      }
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  // request browser geolocation and show marker
  const locate = () => {
    if (!navigator.geolocation) {
      // eslint-disable-next-line no-console
      console.warn("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const L = Llib;
          if (!L || !mapRef.current) return;

          mapRef.current.setView([latitude, longitude], 15);

          if (markerRef.current) {
            markerRef.current.setLatLng([latitude, longitude]);
          } else {
            markerRef.current = L.marker([latitude, longitude]).addTo(mapRef.current).bindPopup("現在地");
            markerRef.current.openPopup();
          }
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error("Error placing marker:", e);
        }
      },
      (err) => {
        // eslint-disable-next-line no-console
        console.error("Geolocation error:", err);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const zoomIn = () => {
    try {
      mapRef.current?.zoomIn();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("zoomIn error:", e);
    }
  };

  const zoomOut = () => {
    try {
      mapRef.current?.zoomOut();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("zoomOut error:", e);
    }
  };

  return (
    <div className={styles.root} style={{ position: "relative" }}>
      <Map ref={mapElementRef} />

      <div className={styles.controls}>
        <div className={styles.zoom}>
          <button aria-label="Zoom in" className={styles.zoomButton} onClick={zoomIn}>+</button>
          <button aria-label="Zoom out" className={styles.zoomButton} onClick={zoomOut}>−</button>
        </div>
        <div>
          <LocateButton onClick={locate}>現在地</LocateButton>
        </div>
        {floatingActionButton && (
          <div className={styles.pinButton}>{floatingActionButton}</div>
        )}
      </div>
    </div>
  );
};

export default LeafletMap;
