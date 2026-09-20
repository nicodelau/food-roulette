"use client";

import React, { useEffect, useRef } from "react";
import { ClassifiedRestaurant, Coordinates } from "@/domain/types";

interface LeafletMapProps {
  center: Coordinates;
  restaurants: ClassifiedRestaurant[];
  selectedRestaurant: ClassifiedRestaurant | null;
  onSelectRestaurant?: (restaurant: ClassifiedRestaurant) => void;
  onMapClick?: (coords: Coordinates) => void;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  center,
  restaurants,
  selectedRestaurant,
  onSelectRestaurant,
  onMapClick,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // Update center when props change
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([center.lat, center.lng], mapInstanceRef.current.getZoom(), {
        animate: true,
      });
    }
  }, [center]);

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

        L.tileLayer(
          "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
          {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: "abcd",
            maxZoom: 19,
          }
        ).addTo(map);

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

      // 1. User/Search Center marker (Blue glowing circle with pulsing ring)
      const userMarkerHtml = `
        <div style="
          width: 20px;
          height: 20px;
          background-color: #38bdf8;
          border: 3px solid #ffffff;
          border-radius: 50%;
          box-shadow: 0 0 16px #38bdf8;
          cursor: crosshair;
        "></div>
      `;
      const userIcon = L.divIcon({
        html: userMarkerHtml,
        className: "custom-user-marker",
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });
      const userMarker = L.marker([center.lat, center.lng], { icon: userIcon })
        .addTo(map)
        .bindPopup("<b>📍 Centro de búsqueda</b><br/><small>Haz clic en cualquier punto para mover el centro</small>");
      markersRef.current.push(userMarker);

      // 2. Candidate Restaurant markers
      restaurants.forEach((r) => {
        const isWinner = selectedRestaurant?.id === r.id;

        const pinColor = isWinner ? "#f59e0b" : "#f97316";
        const pinSize = isWinner ? 32 : 24;

        const pinHtml = `
          <div style="
            width: ${pinSize}px;
            height: ${pinSize}px;
            background-color: ${pinColor};
            border: 2px solid #ffffff;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            font-size: ${isWinner ? "16px" : "12px"};
            box-shadow: 0 0 ${isWinner ? "20px #f59e0b" : "6px rgba(0,0,0,0.5)"};
            cursor: pointer;
            transition: transform 0.2s;
          ">
            ${isWinner ? "⭐" : "🍴"}
          </div>
        `;

        const icon = L.divIcon({
          html: pinHtml,
          className: `custom-restaurant-pin ${isWinner ? "winner-pin" : ""}`,
          iconSize: [pinSize, pinSize],
          iconAnchor: [pinSize / 2, pinSize / 2],
        });

        const marker = L.marker([r.location.lat, r.location.lng], { icon })
          .addTo(map)
          .bindPopup(
            `<b>${r.name}</b><br/>${r.cuisines.join(", ")}<br/><small>${r.address}</small>`
          );

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
