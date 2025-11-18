"use client";

import React, { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import Map from "@/components/atoms/Map/Map";
import styles from "./LeafletMap.module.scss";
import LocateButton from "@/components/atoms/LocateButton/LocateButton";
import { IconButton } from "@/components/atoms/IconButton/IconButton";
import { Plus, Check, X } from "lucide-react";
import pinImg from "@/assets/images/sdesign_00247.png";
import PinModal from '@/components/molecules/Pin/PinModal';
import { normalizeLatitude, normalizeLongitude } from '@/lib/geo';
import { useAuth } from '@/context/AuthContext';

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
  const storedMarkersRef = useRef<any[]>([]);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pendingLatLng, setPendingLatLng] = useState<{ lat: number; lng: number } | null>(null);
  const { user } = useAuth();
  const [hideControls, setHideControls] = useState(false);

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
        // load local pins (mock) from localStorage and render (normalize coords)
        try {
          const raw = localStorage.getItem('mock_pins');
          const pins = raw ? JSON.parse(raw) : [];
          pins.forEach((p: any) => {
            try {
              const lat = normalizeLatitude(p.latitude ?? 0);
              const lng = normalizeLongitude(p.longitude ?? 0);
              const m = L.marker([lat, lng], { icon: pinIconRef.current ?? undefined }).addTo(createdMap).bindPopup(p.name || 'ピン');
              storedMarkersRef.current.push(m);
            } catch (e) {
              // ignore per-pin errors
            }
          });
        } catch (e) {
          // ignore
        }
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

  // listen for external pin updates (from records page)
  useEffect(() => {
    if (!Llib || !mapRef.current) return;

    const loadPins = () => {
      try {
        // remove existing stored markers
        storedMarkersRef.current.forEach((m) => { try { m.remove(); } catch (e) {} });
        storedMarkersRef.current = [];
        const raw = localStorage.getItem('mock_pins');
        const pins = raw ? JSON.parse(raw) : [];
        pins.forEach((p: any) => {
          try {
            const m = Llib.marker([p.latitude, p.longitude], { icon: pinIconRef.current ?? undefined }).addTo(mapRef.current).bindPopup(p.name || 'ピン');
            storedMarkersRef.current.push(m);
          } catch (e) {
            // ignore
          }
        });
      } catch (e) {
        // ignore
      }
    };

    // initial load
    loadPins();

    const handler = () => loadPins();
    window.addEventListener('mock_pins_updated', handler);
    // listen for records panel open/close to hide controls
    const recHandler = (e: any) => {
      try {
        const open = e?.detail?.open;
        setHideControls(Boolean(open));
      } catch (err) {
        // ignore
      }
    };
    window.addEventListener('records_panel_open', recHandler as EventListener);
    return () => window.removeEventListener('mock_pins_updated', handler);
    // remove recHandler as well
    // (can't easily remove here because handler is in closure; add cleanup below)
  }, [Llib]);

  // separate effect to cleanly register/unregister records_panel_open globally
  useEffect(() => {
    const recHandler = (e: any) => {
      try {
        const open = e?.detail?.open;
        setHideControls(Boolean(open));
      } catch (err) {
        // ignore
      }
    };
    window.addEventListener('records_panel_open', recHandler as EventListener);
    return () => window.removeEventListener('records_panel_open', recHandler as EventListener);
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

          // normalize to standard geographic ranges
          const nLat = normalizeLatitude(latitude);
          const nLng = normalizeLongitude(longitude);

          mapRef.current.setView([nLat, nLng], 15);

          if (markerRef.current) {
            markerRef.current.setLatLng([nLat, nLng]);
          } else {
            markerRef.current = L.marker([nLat, nLng], {
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
      const cLat = normalizeLatitude(center.lat);
      const cLng = normalizeLongitude(center.lng);
      const marker = L.marker([cLat, cLng], { draggable: true, icon: pinIconRef.current ?? undefined }).addTo(map);
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
      setShowPinModal(false);
      setPendingLatLng(null);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("cancelPinPlacement error:", e);
    }
  };

  const confirmPinPlacement = async () => {
    try {
      if (!tempMarkerRef.current) return;
      const latlng = tempMarkerRef.current.getLatLng();
      setPendingLatLng({ lat: latlng.lat, lng: latlng.lng });
      setShowPinModal(true);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("confirmPinPlacement error:", e);
    }
  };

  const savePinLocally = (name: string) => {
    try {
      if (!pendingLatLng) return;
      const userId = user?.id ?? 'anonymous';
      const id = `local-${Date.now()}`;
      const pin = {
        id,
        user_id: userId,
        name,
        latitude: normalizeLatitude(pendingLatLng.lat),
        longitude: normalizeLongitude(pendingLatLng.lng),
        created_at: new Date().toISOString(),
      };
      const raw = localStorage.getItem('mock_pins');
      const pins = raw ? JSON.parse(raw) : [];
      pins.push(pin);
      localStorage.setItem('mock_pins', JSON.stringify(pins));

      // finalize temp marker
      try {
        tempMarkerRef.current?.dragging?.disable?.();
        tempMarkerRef.current?.bindPopup(name ?? 'ピン');
        storedMarkersRef.current.push(tempMarkerRef.current);
      } catch (e) {
        // ignore
      }
      tempMarkerRef.current = null;
      setPlacingPin(false);
      setShowPinModal(false);
      setPendingLatLng(null);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('savePinLocally error:', e);
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
      {showPinModal && <PinModal onCancel={() => setShowPinModal(false)} onSave={savePinLocally} />}

      <div className={styles.controls} style={hideControls ? { display: 'none' } : undefined}>
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
