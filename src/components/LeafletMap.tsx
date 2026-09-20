"use client";

import React, { useEffect, useRef } from "react";
import { ClassifiedRestaurant, Coordinates } from "@/domain/types";

interface LeafletMapProps {
  center: Coordinates;
  restaurants: ClassifiedRestaurant[];
  selectedRestaurant: ClassifiedRestaurant | null;
  onSelectRestaurant?: (restaurant: ClassifiedRestaurant) => void;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  center,
  restaurants,
  selectedRestaurant,
  onSelectRestaurant,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    // Only run in browser
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let isCancelled = false;

    import("leaflet").then((L) => {
      if (isCancelled || !mapContainerRef.current) return;

      // Initialize map instance if not existing
      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [center.lat, center.lng],
          zoom: 14,
          zoomControl: false,
        });

        // Add free OpenStreetMap tile layer
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

        mapInstanceRef.current = map;
      }

      const map = mapInstanceRef.current;

      // Clear previous markers
      markersRef.current.forEach((marker) => map.removeLayer(marker));
      markersRef.current = [];

      // 1. User location marker (Blue glowing circle)
      const userMarkerHtml = `
        <div style="
          width: 18px;
          height: 18px;
          background-color: #38bdf8;
          border: 3px solid #ffffff;
          border-radius: 50%;
          box-shadow: 0 0 12px #38bdf8;
        "></div>
      `;
      const userIcon = L.divIcon({
        html: userMarkerHtml,
        className: "custom-user-marker",
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });
      const userMarker = L.marker([center.lat, center.lng], { icon: userIcon })
        .addTo(map)
        .bindPopup("<b>Tu ubicación</b>");
      markersRef.current.push(userMarker);

      // 2. Candidate Restaurant markers
      restaurants.forEach((r) => {
        const isWinner = selectedRestaurant?.id === r.id;

        const pinColor = isWinner ? "#f59e0b" : "#f97316";
        const pinSize = isWinner ? 30 : 22;

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
            box-shadow: 0 0 ${isWinner ? "16px #f59e0b" : "6px rgba(0,0,0,0.5)"};
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
  }, [center, restaurants, selectedRestaurant, onSelectRestaurant]);

  return (
    <div className="relative h-full w-full min-h-[300px] overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-inner">
      <div ref={mapContainerRef} className="h-full w-full" />
    </div>
  );
};

export default LeafletMap;
