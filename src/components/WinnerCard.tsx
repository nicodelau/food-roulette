"use client";

import React from "react";
import {
  MapPin,
  ExternalLink,
  RotateCcw,
  CheckCircle2,
  Ban,
  Utensils,
  Award,
} from "lucide-react";
import { ClassifiedRestaurant, Coordinates } from "@/domain/types";
import { RouletteEngine } from "@/domain/roulette/roulette-engine";

interface WinnerCardProps {
  restaurant: ClassifiedRestaurant;
  userLocation: Coordinates;
  onConfirmVisit: (restaurant: ClassifiedRestaurant) => void;
  onSpinAgain: () => void;
  onBlacklist: (restaurant: ClassifiedRestaurant) => void;
  isConfirming: boolean;
}

const engine = new RouletteEngine();

export const WinnerCard: React.FC<WinnerCardProps> = ({
  restaurant,
  userLocation,
  onConfirmVisit,
  onSpinAgain,
  onBlacklist,
  isConfirming,
}) => {
  const distanceKm = engine.calculateDistanceKm(
    userLocation,
    restaurant.location
  );
  const distanceLabel =
    distanceKm < 1
      ? `${Math.round(distanceKm * 1000)} metros`
      : `${distanceKm.toFixed(1)} km`;

  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${restaurant.location.lat},${restaurant.location.lat ? restaurant.location.lng : ""}`;

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-orange-500/50 bg-gradient-to-b from-slate-900 to-slate-950 p-5 shadow-2xl backdrop-blur-sm sm:p-6 animate-in fade-in zoom-in-95 duration-300">
      {/* Top Banner Tag */}
      <div className="absolute -right-12 top-6 rotate-45 bg-gradient-to-r from-orange-500 to-amber-500 px-12 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white shadow-md">
        ¡Destino!
      </div>

      <div className="space-y-4">
        {/* Header Title & Rating */}
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
              {restaurant.name}
            </h3>
            {restaurant.rating && (
              <span className="flex items-center gap-0.5 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-bold text-amber-400 border border-amber-500/20">
                ⭐ {restaurant.rating.toFixed(1)}
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
            <MapPin className="h-3.5 w-3.5 text-orange-400 shrink-0" />
            <span>{restaurant.address}</span>
            <span className="text-slate-600">•</span>
            <span className="font-medium text-orange-300">a {distanceLabel}</span>
          </div>
        </div>

        {/* Cuisines & Themes Badges */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {restaurant.cuisines.map((c) => (
            <span
              key={c}
              className="inline-flex items-center gap-1 rounded-md bg-orange-500/10 px-2.5 py-1 text-xs font-semibold text-orange-300 border border-orange-500/20"
            >
              <Utensils className="h-3 w-3" />
              {c}
            </span>
          ))}

          {restaurant.themes.map((t) => (
            <span
              key={t}
              className="inline-flex items-center rounded-md bg-purple-500/10 px-2.5 py-1 text-xs font-medium text-purple-300 border border-purple-500/20"
            >
              {t}
            </span>
          ))}

          {restaurant.dietarySuitability.map((d) => (
            <span
              key={d}
              className="inline-flex items-center rounded-md bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300 border border-emerald-500/20"
            >
              {d === "CELIAC" && "🌾 Sin TACC"}
              {d === "VEGAN" && "🌱 Vegano"}
              {d === "VEGETARIAN" && "🥗 Vegetariano"}
              {d === "LACTOSE_FREE" && "🥛 Sin Lactosa"}
            </span>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Confirm Visit & Earn Points */}
          <button
            onClick={() => onConfirmVisit(restaurant)}
            disabled={isConfirming}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:brightness-110 active:scale-95 disabled:opacity-50"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>
              {isConfirming
                ? "Registrando visita..."
                : "¡Elegir este lugar! (+20 pts)"}
            </span>
            <Award className="h-4 w-4 text-emerald-200" />
          </button>

          {/* Spin Again */}
          <button
            onClick={onSpinAgain}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-xs font-semibold text-slate-200 transition hover:bg-slate-700 hover:text-white active:scale-95"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Girar de nuevo</span>
          </button>

          {/* Maps Link */}
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-3 text-xs font-semibold text-slate-200 transition hover:border-slate-500 hover:text-white active:scale-95"
            title="Cómo llegar en Google Maps"
          >
            <ExternalLink className="h-4 w-4" />
            <span className="sm:hidden">Mapa</span>
          </a>

          {/* Blacklist */}
          <button
            onClick={() => onBlacklist(restaurant)}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-rose-900/40 bg-rose-950/20 px-3 py-3 text-xs font-semibold text-rose-300 transition hover:bg-rose-900/40 active:scale-95"
            title="No sugerir nunca más este restaurante"
          >
            <Ban className="h-4 w-4" />
            <span className="sm:hidden">Vetar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
