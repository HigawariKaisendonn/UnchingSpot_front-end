"use client";

import React, { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import Map from "@/components/atoms/Map/Map";
import styles from "./LeafletMap.module.scss";
import LocateButton from "@/components/atoms/LocateButton/LocateButton";
import { IconButton } from "@/components/atoms/IconButton/IconButton";
import { Plus, Check, X } from "lucide-react";
import pinImg from "@/assets/images/sdesign_00247.png";

type Props = {
  floatingActionButton?: React.ReactNode;
};

const LeafletMap: React.FC<Props> = ({ floatingActionButton }) => {
  const mapRef = useRef<any>(null);
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<any>(null);
  const pinIconRef = useRef<any>(null);
  const [Llib, setLlib] = useState<any>(null);
  const [placingPin, setPlacingPin] = useState<boolean>(false);
  const tempMarkerRef = useRef<any>(null);

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
        // create an icon using the imported image (next/image import may return an object)
        try {
          const pinUrl = (pinImg as any)?.src ?? pinImg;
          pinIconRef.current = L.icon({
            iconUrl: pinUrl,
            iconSize: [48, 48],
            iconAnchor: [24, 48],
            popupAnchor: [0, -48],
          });
        } catch (e) {
          // eslint-disable-next-line no-console
          console.warn('Failed to create pin icon from asset:', e);
          pinIconRef.current = null;
        }
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
            markerRef.current = L.marker([latitude, longitude], {
              icon: pinIconRef.current ?? undefined,
            }).addTo(mapRef.current).bindPopup("現在地");
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

  // start placing a temporary draggable pin
  const startPinPlacement = () => {
    try {
      const L = Llib;
      const map = mapRef.current;
      if (!L || !map) return;

      // if already placing, do nothing
      if (placingPin) return;

      const center = map.getCenter();
      const marker = L.marker([center.lat, center.lng], { draggable: true, icon: pinIconRef.current ?? undefined }).addTo(map);
      tempMarkerRef.current = marker;
      setPlacingPin(true);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("startPinPlacement error:", e);
    }
  };

  const cancelPinPlacement = () => {
    try {
      if (tempMarkerRef.current) {
        tempMarkerRef.current.remove();
        tempMarkerRef.current = null;
      }
      setPlacingPin(false);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("cancelPinPlacement error:", e);
    }
  };

  const confirmPinPlacement = async () => {
    try {
      if (!tempMarkerRef.current) return;
      const latlng = tempMarkerRef.current.getLatLng();

      // convert to simple object
      const payload = { latitude: latlng.lat, longitude: latlng.lng };

      // send to backend (replace URL with real endpoint)
      try {
        const res = await fetch('/api/pins', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          // eslint-disable-next-line no-console
          console.error('Failed to send pin:', await res.text());
        } else {
          // eslint-disable-next-line no-console
          console.log('Pin saved:', await res.json());
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Network error sending pin:', e);
      }

      // make the marker permanent (not draggable)
      try {
        tempMarkerRef.current.dragging?.disable?.();
      } catch (e) {
        // ignore
      }
      tempMarkerRef.current = null;
      setPlacingPin(false);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("confirmPinPlacement error:", e);
    }
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
        <div className={styles.topControls}>
          <div className={styles.zoom}>
            <button aria-label="Zoom in" className={styles.zoomButton} onClick={zoomIn}>+</button>
            <button aria-label="Zoom out" className={styles.zoomButton} onClick={zoomOut}>−</button>
          </div>
          <div className={styles.locateWrapper}>
            <LocateButton onClick={locate}>現在地</LocateButton>
          </div>
        </div>

        <div className={styles.pinArea}>
          {placingPin ? (
            <div className={styles.pinToolbar}>
              <button className={styles.confirmButton} onClick={confirmPinPlacement} aria-label="Confirm pin">
                <Check size={16} />
              </button>
              <button className={styles.cancelButton} onClick={cancelPinPlacement} aria-label="Cancel pin">
                <X size={16} />
              </button>
            </div>
          ) : (
            // pin add button (uses passed floatingActionButton if provided, otherwise default)
            (floatingActionButton ? (
              <div className={styles.pinButton}>{floatingActionButton}</div>
            ) : (
              <div className={styles.pinButton}>
                <IconButton icon={<Plus />} onClick={startPinPlacement} ariaLabel="ピンを追加" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default LeafletMap;
