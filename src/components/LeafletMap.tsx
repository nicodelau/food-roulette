"use client";

import React, { useEffect, useRef } from "react";
import { ClassifiedRestaurant, Coordinates, PRICE_TIERS } from "@/domain/types";

interface LeafletMapProps {
  center: Coordinates;
  restaurants: ClassifiedRestaurant[];
  selectedRestaurant: ClassifiedRestaurant | null;
  onSelectRestaurant?: (restaurant: ClassifiedRestaurant) => void;
  onMapClick?: (coords: Coordinates) => void;
  isDark?: boolean;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  center,
  restaurants,
  selectedRestaurant,
  onSelectRestaurant,
  onMapClick,
  isDark = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // Update center when props change
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(
        [center.lat, center.lng],
        mapInstanceRef.current.getZoom(),
        {
          animate: true,
        },
      );
    }
  }, [center]);

  // Update tile layer when theme changes
  useEffect(() => {
    if (tileLayerRef.current) {
      const tileUrl = isDark
        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png?key=cb1_3rjk_1_7a7e649a99e1a6f596a18604"
        : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=cb1_3rjk_1_7a7e649a99e1a6f596a18604";
      tileLayerRef.current.setUrl(tileUrl);
    }
  }, [isDark]);

  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let isCancelled = false;

    import("leaflet").then((L) => {
      if (isCancelled || !mapContainerRef.current) return;

      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [center.lat, center.lng],
          zoom: 14,
          zoomControl: false,
        });

        const tileUrl = isDark
          ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png?key=cb1_3rjk_1_7a7e649a99e1a6f596a18604"
          : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=cb1_3rjk_1_7a7e649a99e1a6f596a18604";

        const tileLayer = L.tileLayer(tileUrl, {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 19,
        }).addTo(map);

        tileLayerRef.current = tileLayer;

        L.control.zoom({ position: "bottomright" }).addTo(map);

        // Click-to-center listener
        map.on("click", (e: any) => {
          if (onMapClick) {
            onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
          }
        });

        mapInstanceRef.current = map;
      }

      const map = mapInstanceRef.current;

      // Clear previous markers
      markersRef.current.forEach((marker) => map.removeLayer(marker));
      markersRef.current = [];

      // 1. User/Search Center marker (Pulsing radar beacon with precise center dot)
      const userMarkerHtml = `
        <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: crosshair;">
          <span style="
            position: absolute;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: rgba(14, 165, 233, 0.35);
            animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
          "></span>
          <span style="
            position: relative;
            width: 14px;
            height: 14px;
            border-radius: 50%;
            background: #0284c7;
            border: 2.5px solid #ffffff;
            box-shadow: 0 0 10px rgba(2, 132, 199, 0.85);
          "></span>
        </div>
      `;
      const userIcon = L.divIcon({
        html: userMarkerHtml,
        className: "custom-user-marker",
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -16],
      });
      const userMarker = L.marker([center.lat, center.lng], { icon: userIcon })
        .addTo(map)
        .bindPopup(
          "<div style='font-family:inherit;font-size:12px;padding:2px 0;'><strong>📍 Centro de búsqueda</strong><br/><span style='color:#64748b;font-size:11px;'>Haz clic en el mapa para mover el punto central</span></div>",
        );
      markersRef.current.push(userMarker);

      // 2. Candidate Restaurant markers (Precise teardrop map pins pointing needle tip to GPS coordinates)
      restaurants.forEach((r) => {
        const isWinner = selectedRestaurant?.id === r.id;

        const pinWidth = isWinner ? 36 : 28;
        const pinHeight = isWinner ? 46 : 36;
        const needleX = pinWidth / 2;
        const needleY = pinHeight;

        const pinHtml = isWinner
          ? `
            <div style="position: relative; width: 36px; height: 46px; cursor: pointer; transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);" class="hover:scale-110">
              <svg width="36" height="46" viewBox="0 0 36 46" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 4px 10px rgba(245, 158, 11, 0.7));">
                <path d="M18 0C8.059 0 0 8.059 0 18C0 31.5 18 46 18 46C18 46 36 31.5 36 18C36 8.059 27.941 0 18 0Z" fill="#f59e0b" stroke="#ffffff" stroke-width="2"/>
                <circle cx="18" cy="17" r="11" fill="#ffffff"/>
              </svg>
              <div style="position: absolute; top: 6px; left: 0; width: 36px; height: 22px; display: flex; align-items: center; justify-content: center; font-size: 14px;">
                ⭐
              </div>
            </div>
          `
          : `
            <div style="position: relative; width: 28px; height: 36px; cursor: pointer; transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);" class="hover:scale-115">
              <svg width="28" height="36" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.45));">
                <path d="M14 0C6.268 0 0 6.268 0 14C0 24.5 14 36 14 36C14 36 28 24.5 28 14C28 6.268 21.732 0 14 0Z" fill="#ea580c" stroke="#ffffff" stroke-width="1.8"/>
                <circle cx="14" cy="13.5" r="8.5" fill="#ffffff"/>
              </svg>
              <div style="position: absolute; top: 4px; left: 0; width: 28px; height: 19px; display: flex; align-items: center; justify-content: center; font-size: 11px;">
                🍴
              </div>
            </div>
          `;

        const icon = L.divIcon({
          html: pinHtml,
          className: `custom-restaurant-pin ${isWinner ? "winner-pin" : ""}`,
          iconSize: [pinWidth, pinHeight],
          iconAnchor: [needleX, needleY], // Needle tip points precisely at [lat, lng]
          popupAnchor: [0, -pinHeight],   // Popup opens cleanly above the pin needle
        });

        const priceTier = PRICE_TIERS[r.priceLevel];
        const priceBadge = priceTier
          ? `<span style="color:#d97706;background:#fef3c7;font-weight:700;font-size:11px;padding:1px 6px;border-radius:4px;">${priceTier.symbol}</span>`
          : "";

        const popupHtml = `
          <div style="font-family: inherit; font-size: 12px; line-height: 1.4; color: #1c1917; min-width: 175px; padding: 2px 0;">
            <div style="display: flex; align-items: baseline; justify-content: space-between; gap: 8px; margin-bottom: 3px;">
              <strong style="font-size: 14px; font-weight: 700; color: #0c0a09;">${r.name}</strong>
              ${priceBadge}
            </div>
            <div style="font-size: 11px; color: #78716c; margin-bottom: 4px;">
              ${r.cuisines.join(", ") || "Gastronomía"}
            </div>
            <div style="font-size: 11px; color: #57534e; display: flex; align-items: center; gap: 4px;">
              <span>📍</span>
              <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 190px;">${r.address || "Buenos Aires"}</span>
            </div>
          </div>
        `;

        const marker = L.marker([r.location.lat, r.location.lng], { icon })
          .addTo(map)
          .bindPopup(popupHtml);

        if (onSelectRestaurant) {
          marker.on("click", () => onSelectRestaurant(r));
        }

        markersRef.current.push(marker);

        if (isWinner) {
          marker.openPopup();
          map.setView([r.location.lat, r.location.lng], 15, { animate: true });
        }
      });
    });

    return () => {
      isCancelled = true;
    };
  }, [center, restaurants, selectedRestaurant, onSelectRestaurant, onMapClick]);

  return (
    <div
      style={{ isolation: "isolate" }}
      className="relative h-full w-full min-h-[360px] overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-inner z-0"
    >
      <div ref={mapContainerRef} className="h-full w-full" />
      {/* Floating help pill */}
      <div className="pointer-events-none absolute bottom-3 left-3 z-[400] rounded-full border border-slate-700/70 bg-slate-900/90 px-3 py-1 text-[11px] text-slate-300 backdrop-blur-sm shadow-md">
        👆 Haz clic en el mapa para mover el centro
      </div>
    </div>
  );
};

export default LeafletMap;
