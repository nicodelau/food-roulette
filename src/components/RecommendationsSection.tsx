"use client";

import React from "react";
import { Sparkles, MapPin, Star, ArrowRight } from "lucide-react";
import { ClassifiedRestaurant, Coordinates } from "@/domain/types";
import { RouletteEngine } from "@/domain/roulette/roulette-engine";

interface RecommendationsSectionProps {
  recommendations: ClassifiedRestaurant[];
  userLocation: Coordinates;
  onSelect: (restaurant: ClassifiedRestaurant) => void;
}

const engine = new RouletteEngine();

export const RecommendationsSection: React.FC<RecommendationsSectionProps> = ({
  recommendations,
  userLocation,
  onSelect,
}) => {
  if (recommendations.length === 0) return null;

  return (
    <div className="rounded-3xl border border-slate-800/80 bg-slate-900/40 p-5 shadow-xl backdrop-blur-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-wide text-white uppercase">
              Recomendados según tus preferencias
            </h3>
            <p className="text-[11px] text-slate-400">
              Basado en tus cocinas favoritas y mejores valoraciones de la zona
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {recommendations.map((restaurant) => {
          const distKm = engine.calculateDistanceKm(userLocation, restaurant.location);
          const distLabel =
            distKm < 1 ? `${Math.round(distKm * 1000)}m` : `${distKm.toFixed(1)}km`;

          return (
            <div
              key={restaurant.id}
              className="group relative flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-950/70 p-4 transition duration-200 hover:border-orange-500/40 hover:bg-slate-900"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-bold text-white text-sm line-clamp-1 group-hover:text-orange-400 transition">
                    {restaurant.name}
                  </h4>
                  {restaurant.rating && (
                    <span className="flex items-center gap-0.5 text-[11px] font-bold text-amber-400 shrink-0">
                      <Star className="h-3 w-3 fill-amber-400" />
                      {restaurant.rating.toFixed(1)}
                    </span>
                  )}
                </div>

                <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
                  <MapPin className="h-3 w-3 text-orange-400 shrink-0" />
                  <span className="truncate">{restaurant.address}</span>
                  <span className="text-slate-600">•</span>
                  <span className="font-medium text-orange-300 shrink-0">{distLabel}</span>
                </div>

                <div className="mt-2.5 flex flex-wrap gap-1">
                  {restaurant.cuisines.map((c) => (
                    <span
                      key={c}
                      className="rounded-md bg-orange-500/10 px-1.5 py-0.5 text-[10px] font-medium text-orange-300"
                    >
                      {c}
                    </span>
                  ))}
                  {restaurant.dietarySuitability.map((d) => (
                    <span
                      key={d}
                      className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-300"
                    >
                      {d === "CELIAC" ? "Sin TACC" : d}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-2 border-t border-slate-800/60">
                <button
                  onClick={() => onSelect(restaurant)}
                  className="flex w-full items-center justify-between rounded-lg bg-slate-800/60 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-orange-600 hover:text-white group-hover:bg-orange-600 group-hover:text-white"
                >
                  <span>Ver destino</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
