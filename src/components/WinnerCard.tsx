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
  Banknote,
} from "lucide-react";
import { ClassifiedRestaurant, Coordinates, PRICE_TIERS } from "@/domain/types";
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

  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${restaurant.location.lat},${restaurant.location.lng}`;
  const priceTier = PRICE_TIERS[restaurant.priceLevel] || PRICE_TIERS[2];

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-orange-500/80 dark:border-orange-500/70 bg-white dark:bg-[#181615] p-5 shadow-xl sm:p-6 animate-in fade-in zoom-in-95 duration-300 transition-colors">
      {/* Top Banner Tag */}
      <div className="absolute -right-12 top-6 rotate-45 bg-orange-600 px-12 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-md">
        ¡Destino!
      </div>

      <div className="space-y-4">
        {/* Header Title & Rating */}
        <div>
          <div className="flex flex-wrap items-center gap-2 pr-12">
            <h3 className="font-serif text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100 sm:text-3xl">
              {restaurant.name}
            </h3>
            {restaurant.rating && (
              <span className="flex items-center gap-0.5 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-400 border border-amber-500/20">
                ⭐ {restaurant.rating.toFixed(1)}
              </span>
            )}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
            <MapPin className="h-3.5 w-3.5 text-orange-600 dark:text-orange-500 shrink-0" />
            <span>{restaurant.address}</span>
            <span className="text-stone-300 dark:text-stone-600">•</span>
            <span className="font-medium text-orange-600 dark:text-orange-400">a {distanceLabel}</span>
          </div>
        </div>

        {/* Badges: Price Level, Cuisines, Themes, Diet */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {/* Price Range Badge */}
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-800 dark:text-amber-400 border border-amber-500/25">
            <Banknote className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            <span className="font-mono font-black">{priceTier.symbol}</span>
            <span>{priceTier.name} ({priceTier.costRange})</span>
          </span>

          {restaurant.cuisines.map((c) => (
            <span
              key={c}
              className="inline-flex items-center gap-1 rounded-md bg-orange-500/10 px-2.5 py-1 text-xs font-semibold text-orange-800 dark:text-orange-300 border border-orange-500/20"
            >
              <Utensils className="h-3 w-3" />
              {c}
            </span>
          ))}

          {restaurant.themes.map((t) => (
            <span
              key={t}
              className="inline-flex items-center rounded-md bg-stone-100 dark:bg-stone-800 px-2.5 py-1 text-xs font-medium text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-700"
            >
              {t}
            </span>
          ))}

          {restaurant.dietarySuitability.map((d) => (
            <span
              key={d}
              className="inline-flex items-center rounded-md bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-800 dark:text-emerald-300 border border-emerald-500/20"
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
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 px-4 py-3 text-xs font-bold text-white shadow-sm transition active:scale-95 disabled:opacity-50"
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
            className="flex items-center justify-center gap-1.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-100 dark:bg-stone-800/90 px-4 py-3 text-xs font-semibold text-stone-800 dark:text-stone-200 transition hover:bg-stone-200 dark:hover:bg-stone-700 active:scale-95"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Girar de nuevo</span>
          </button>

          {/* Maps Link */}
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-100 dark:bg-stone-800/90 px-3 py-3 text-xs font-semibold text-stone-800 dark:text-stone-200 transition hover:border-stone-400 hover:text-stone-900 dark:hover:text-white active:scale-95"
            title="Cómo llegar en Google Maps"
          >
            <ExternalLink className="h-4 w-4" />
            <span className="sm:hidden">Mapa</span>
          </a>

          {/* Blacklist */}
          <button
            onClick={() => onBlacklist(restaurant)}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-rose-300 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/20 px-3 py-3 text-xs font-semibold text-rose-700 dark:text-rose-300 transition hover:bg-rose-100 dark:hover:bg-rose-900/40 active:scale-95"
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
