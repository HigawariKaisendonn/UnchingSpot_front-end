"use client";
import AreaModal from '@/components/molecules/Pin/AreaModal';

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
  // --- State & Ref ---
  const [areas, setAreas] = useState<any[]>([]);
  const [showAreaModal, setShowAreaModal] = useState(false);
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
  const [editMode, setEditMode] = useState(false);
  const [selectedPins, setSelectedPins] = useState<string[]>([]); // ピンIDリスト
  const polygonRef = useRef<any>(null);
  const polylineRef = useRef<any>(null);
  const [selectionFinished, setSelectionFinished] = useState(false);
  const editModeRef = useRef<boolean>(false);
  const selectionFinishedRef = useRef<boolean>(false);

  // --- 関数 ---
  const getSelectedPinCoords = () => {
    const raw = localStorage.getItem('mock_pins');
    const pins = raw ? JSON.parse(raw) : [];
    return pins.filter((p: any) => selectedPins.includes(p.id)).map((p: any) => [normalizeLatitude(p.latitude), normalizeLongitude(p.longitude)]);
  };

  const saveAreaLocally = (name: string) => {
    try {
      if (!name || selectedPins.length < 3) return;

      const area = {
        id: `area-${Date.now()}`,
        name,
        pinIds: [...selectedPins],
        created_at: new Date().toISOString(),
      };
      const rawAreas = localStorage.getItem('mock_areas');
      const areas = rawAreas ? JSON.parse(rawAreas) : [];
      areas.push(area);
      localStorage.setItem('mock_areas', JSON.stringify(areas));

      const rawPins = localStorage.getItem('mock_pins');
      const pins = rawPins ? JSON.parse(rawPins) : [];

      selectedPins.forEach((id: string) => {
        const existing = pins.find((p: any) => p.id === id);
        if (!existing) {
          const marker =storedMarkersRef.current.find(m => m._leaflet_id === id || m.options?.id === id);
          const lat = marker?._latlng?.lat ?? 0;
          const lng = marker?._latlng?.lng ?? 0;
          pins.push({
            id,
            name: `ピン-${id}`,
            latitude: normalizeLatitude(lat),
            longitude: normalizeLongitude(lng),
            created_at: new Date().toISOString(),
          });
        }
      });

      localStorage.setItem('mock_pins', JSON.stringify(pins));

      setShowAreaModal(false);
      setSelectedPins([]); // 選択解除
      setSelectionFinished(false);
      
      window.dispatchEvent(new Event('mock_areas_updated'));
      window.dispatchEvent(new CustomEvent('mock_pins_updated'));
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('saveAreaLocally error:', e);
    }
  };

  const deleteArea = (id: string) => {
    try {
      const raw = localStorage.getItem('mock_areas');
      const areas = raw ? JSON.parse(raw) : [];
      const filtered = areas.filter((a: any) => a.id !== id);
      localStorage.setItem('mock_areas', JSON.stringify(filtered));
      setAreas(filtered);
      window.dispatchEvent(new Event('mock_areas_updated'));
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('deleteArea error:', e);
    }
  };

  // --- useEffect ---
  // エリア一覧ロード
  useEffect(() => {
    const raw = localStorage.getItem('mock_areas');
    const loaded = raw ? JSON.parse(raw) : [];
    setAreas(loaded);
    const handler = () => {
      const raw2 = localStorage.getItem('mock_areas');
      setAreas(raw2 ? JSON.parse(raw2) : []);
    };
    window.addEventListener('mock_areas_updated', handler);
    return () => window.removeEventListener('mock_areas_updated', handler);
  }, []);

  // 選択中はポリライン、選択終了時はポリゴンを描画
  useEffect(() => {
    if (!Llib || !mapRef.current) return;
    // 既存線/ポリゴン消去
    try {
      if (polylineRef.current) { polylineRef.current.remove(); polylineRef.current = null; }
      if (polygonRef.current) { polygonRef.current.remove(); polygonRef.current = null; }
    } catch (e) {}

    // マーカーIDから座標へ
    const raw = localStorage.getItem('mock_pins');
    const pins = raw ? JSON.parse(raw) : [];
    const coords = selectedPins.map((id) => {
      const p = pins.find((pp: any) => pp.id === id);
      return p ? [normalizeLatitude(p.latitude), normalizeLongitude(p.longitude)] : null;
    }).filter(Boolean as any);

    if (coords.length >= 2 && !selectionFinished) {
      polylineRef.current = Llib.polyline(coords, { color: '#1976d2', weight: 3 }).addTo(mapRef.current);
    }

    if (selectionFinished && coords.length >= 3) {
      polygonRef.current = Llib.polygon(coords, { color: '#1976d2', fillColor: '#90caf9', fillOpacity: 0.3, weight: 2 }).addTo(mapRef.current);
      if (!showAreaModal) setShowAreaModal(true);
    }
  }, [selectedPins, selectionFinished, Llib]);
  // 地点編集モードON/OFFイベント受信
  useEffect(() => {
    const onEditOn = () => setEditMode(true);
    const onEditOff = () => {
      setEditMode(false);
      setSelectedPins([]);
      setSelectionFinished(false);
    };
    window.addEventListener("editMode:on", onEditOn);
    window.addEventListener("editMode:off", onEditOff);
    return () => {
      window.removeEventListener("editMode:on", onEditOn);
      window.removeEventListener("editMode:off", onEditOff);
    };
  }, []);

  // sync refs so marker handlers (created once) see latest values
  useEffect(() => { editModeRef.current = editMode; }, [editMode]);
  useEffect(() => { selectionFinishedRef.current = selectionFinished; }, [selectionFinished]);

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
              const marker = L.marker([lat, lng], { icon: pinIconRef.current ?? undefined }).addTo(createdMap).bindPopup(p.name || 'ピン');
              // debug
              // eslint-disable-next-line no-console
              console.debug('[LeafletMap] created marker', p.id, { lat, lng });
              // 選択フロー：最初のピンを選んでから順に選択し、最初のピンを再選択で終了
              marker.on('click', () => {
                // eslint-disable-next-line no-console
                console.debug('[LeafletMap] marker clicked (createdMap)', p.id, { editMode: editModeRef.current, selectionFinished: selectionFinishedRef.current });
                if (!editModeRef.current || selectionFinishedRef.current) return;
                setSelectedPins((prev) => {
                  // eslint-disable-next-line no-console
                  console.debug('[LeafletMap] before setSelectedPins', { prev });
                  if (prev.length === 0) return [p.id];
                  if (p.id === prev[0] && prev.length >= 2) {
                    setSelectionFinished(true);
                    return prev;
                  }
                  if (prev.includes(p.id)) return prev; // 既選択ピンは無視
                  return [...prev, p.id];
                });
              });
              storedMarkersRef.current.push(marker);
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
            // debug
            // eslint-disable-next-line no-console
            console.debug('[LeafletMap] loaded marker', p.id);
            // 同様の選択フローハンドラ
            m.on('click', () => {
              // eslint-disable-next-line no-console
              console.debug('[LeafletMap] marker clicked (loadPins)', p.id, { editMode: editModeRef.current, selectionFinished: selectionFinishedRef.current });
              if (!editModeRef.current || selectionFinishedRef.current) return;
              setSelectedPins((prev) => {
                // eslint-disable-next-line no-console
                console.debug('[LeafletMap] before setSelectedPins (loadPins)', { prev });
                if (prev.length === 0) return [p.id];
                if (p.id === prev[0] && prev.length >= 2) {
                  setSelectionFinished(true);
                  return prev;
                }
                if (prev.includes(p.id)) return prev;
                return [...prev, p.id];
              });
            });
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

    // 編集モード・選択ピン変化時も再描画
    const redrawPins = () => loadPins();
    window.addEventListener('editMode:on', redrawPins);
    window.addEventListener('editMode:off', redrawPins);
    // selectedPins変化時も再描画
    // ただしselectedPinsはReact stateなので、useEffectでloadPins呼び出し

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
    window.addEventListener('nawabarPanel:open', recHandler as EventListener);
    return () => window.removeEventListener('mock_pins_updated', handler);
    // remove recHandler as well
    // (can't easily remove here because handler is in closure; add cleanup below)
  }, [Llib]);

  // separate effect to cleanly register/unregister records_panel_open globally
  useEffect(() => {
    const recHandler = (e: CustomEvent<{ open: boolean }>) => {
      setHideControls(Boolean(e.detail?.open));
    };

    // 登録
    const handler = recHandler as EventListener;
    window.addEventListener('records_panel_open', handler as EventListener);
    window.addEventListener('nawabarPanel:open', handler as EventListener);
    return () => {
      window.removeEventListener("records_panel_open", handler);
      window.removeEventListener("nawabarPanel:open", handler);
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
        // 詳細ログを残す
        // eslint-disable-next-line no-console
        console.error("Geolocation error:", err);
        try {
          const code = (err && (err as any).code) ?? null;
          const message = (err && (err as any).message) ?? '';
          if (code === 1) {
            // PERMISSION_DENIED
            window.alert('位置情報の利用が許可されていません。ブラウザの設定で位置情報の利用を許可してください。');
          } else if (code === 2) {
            // POSITION_UNAVAILABLE
            window.alert('位置情報を取得できませんでした。端末の設定や電波状況を確認してください。');
          } else if (code === 3) {
            // TIMEOUT
            window.alert('位置情報の取得がタイムアウトしました。再度お試しください。');
          } else {
            window.alert(`位置情報取得中にエラーが発生しました。${message}`);
          }
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('Geolocation error handling failed:', e);
        }
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
      {showAreaModal && <AreaModal onCancel={() => { setShowAreaModal(false); setSelectedPins([]); setSelectionFinished(false); }} onSave={saveAreaLocally} />}

      <div className={styles.controls} style={hideControls ? { display: 'none' } : undefined}>
        <div className={styles.topControls}>
          <div className={styles.zoom}>
            <button aria-label="Zoom in" className={styles.zoomButton} onClick={zoomIn}>+</button>
            <button aria-label="Zoom out" className={styles.zoomButton} onClick={zoomOut}>−</button>
          </div>
          <div className={styles.locateWrapper}>
            <LocateButton onClick={locate}>現在地</LocateButton>
          </div>

          <div className={styles.editAreaWrapper}>
            {!editMode ? (
              <button
                className={styles.editButton}
                onClick={() => window.dispatchEvent(new Event('editMode:on'))}
              >
                エリア編集開始
              </button>
            ) : (
              <button
                className={styles.editButtonActive}
                onClick={() => window.dispatchEvent(new Event('editMode:off'))}
              >
                編集終了
              </button>
            )}
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
