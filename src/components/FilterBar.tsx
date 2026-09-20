"use client";

import React from "react";
import {
  SlidersHorizontal,
  Navigation,
  EyeOff,
  Sparkles,
  UtensilsCrossed,
  ShieldCheck,
  Building2,
} from "lucide-react";
import { Coordinates, DietaryRestriction } from "@/domain/types";

export interface ZonePreset {
  name: string;
  coords: Coordinates;
}

export const PRESET_ZONES: ZonePreset[] = [
  { name: "Palermo Soho", coords: { lat: -34.5885, lng: -58.4306 } },
  { name: "San Telmo", coords: { lat: -34.6186, lng: -58.3712 } },
  { name: "Villa Crespo", coords: { lat: -34.595, lng: -58.441 } },
  { name: "Belgrano / Chinatown", coords: { lat: -34.561, lng: -58.456 } },
  { name: "Centro / Obelisco", coords: { lat: -34.6037, lng: -58.3816 } },
];

export const AVAILABLE_CUISINES = [
  "Argentina",
  "Italiana",
  "Japonesa / Sushi",
  "Mexicana",
  "Armenia / Medio Oriente",
  "Americana / Burgers",
  "Peruana",
  "Española",
  "China / Asiática",
  "Café & Pastelería",
];

export const AVAILABLE_THEMES = [
  "Bodegón",
  "Parrilla / Asador",
  "Pizzería",
  "Bar / Cervecería",
  "Romántico / De Autor",
  "Cafetería / Bakery",
];

export const AVAILABLE_DIETARIES: { id: DietaryRestriction; label: string }[] = [
  { id: "CELIAC", label: "🌾 Sin TACC / Celíacos" },
  { id: "VEGAN", label: "🌱 Vegano" },
  { id: "VEGETARIAN", label: "🥗 Vegetariano" },
  { id: "LACTOSE_FREE", label: "🥛 Sin Lactosa" },
];

interface FilterBarProps {
  currentLocation: Coordinates;
  onLocationChange: (coords: Coordinates, zoneName: string) => void;
  radiusKm: number;
  onRadiusChange: (radius: number) => void;
  excludeVisited: boolean;
  onToggleExcludeVisited: (val: boolean) => void;
  visitedCount: number;
  selectedCuisines: string[];
  onToggleCuisine: (cuisine: string) => void;
  selectedThemes: string[];
  onToggleTheme: (theme: string) => void;
  selectedDietaries: DietaryRestriction[];
  onToggleDietary: (diet: DietaryRestriction) => void;
  onResetFilters: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  onLocationChange,
  radiusKm,
  onRadiusChange,
  excludeVisited,
  onToggleExcludeVisited,
  visitedCount,
  selectedCuisines,
  onToggleCuisine,
  selectedThemes,
  onToggleTheme,
  selectedDietaries,
  onToggleDietary,
  onResetFilters,
}) => {
  const [isLocating, setIsLocating] = React.useState(false);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Tu navegador no soporta geolocalización.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        onLocationChange(
          { lat: pos.coords.latitude, lng: pos.coords.longitude },
          "Mi ubicación GPS"
        );
      },
      (err) => {
        setIsLocating(false);
        alert(`No se pudo obtener la ubicación: ${err.message}`);
      }
    );
  };

  const hasActiveFilters =
    selectedCuisines.length > 0 ||
    selectedThemes.length > 0 ||
    selectedDietaries.length > 0 ||
    excludeVisited;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-xl backdrop-blur-sm sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-orange-400" />
          <h2 className="text-sm font-semibold tracking-wide text-white uppercase">
            Filtros y Zona
          </h2>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="text-xs text-orange-400 hover:text-orange-300 underline underline-offset-2 transition"
          >
            Restablecer
          </button>
        )}
      </div>

      {/* Selector de Zonas y Geolocalización */}
      <div>
        <label className="mb-2 block text-xs font-medium text-slate-300">
          Zona Geográfica:
        </label>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={handleUseCurrentLocation}
            disabled={isLocating}
            className="flex items-center gap-1.5 rounded-lg border border-orange-500/40 bg-orange-950/30 px-3 py-1.5 text-xs font-medium text-orange-300 transition hover:bg-orange-900/40 active:scale-95 disabled:opacity-50"
          >
            <Navigation className={`h-3 w-3 ${isLocating ? "animate-spin" : ""}`} />
            {isLocating ? "Detectando..." : "GPS Actual"}
          </button>
          {PRESET_ZONES.map((zone) => (
            <button
              key={zone.name}
              onClick={() => onLocationChange(zone.coords, zone.name)}
              className="rounded-lg border border-slate-700/70 bg-slate-800/80 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition hover:border-slate-500 hover:bg-slate-700 active:scale-95"
            >
              {zone.name}
            </button>
          ))}
        </div>
      </div>

      {/* Radio en Kilómetros */}
      <div>
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-slate-300">Radio de búsqueda:</span>
          <span className="font-semibold text-orange-400">{radiusKm.toFixed(1)} km</span>
        </div>
        <input
          type="range"
          min="0.5"
          max="5"
          step="0.5"
          value={radiusKm}
          onChange={(e) => onRadiusChange(parseFloat(e.target.value))}
          className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-700 accent-orange-500"
        />
      </div>

      {/* Toggle Excluir Visitados */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400">
            <EyeOff className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-medium text-white">
              Excluir lugares ya visitados
            </div>
            <div className="text-[11px] text-slate-400">
              {visitedCount} lugares registrados en tu historial
            </div>
          </div>
        </div>
        <button
          onClick={() => onToggleExcludeVisited(!excludeVisited)}
          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            excludeVisited ? "bg-orange-500" : "bg-slate-700"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
              excludeVisited ? "translate-x-4" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* Restricciones Dietarias */}
      <div>
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-300 mb-2">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>Restricciones Dietarias:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {AVAILABLE_DIETARIES.map((diet) => {
            const isSelected = selectedDietaries.includes(diet.id);
            return (
              <button
                key={diet.id}
                onClick={() => onToggleDietary(diet.id)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition border ${
                  isSelected
                    ? "border-emerald-500 bg-emerald-950/40 text-emerald-300 shadow-sm shadow-emerald-500/20"
                    : "border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700 hover:text-slate-300"
                }`}
              >
                {diet.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Clasificación por Orígenes / Países */}
      <div>
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-300 mb-2">
          <UtensilsCrossed className="h-3.5 w-3.5 text-amber-400" />
          <span>Tipo de Comida / Origen:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {AVAILABLE_CUISINES.map((cuisine) => {
            const isSelected = selectedCuisines.includes(cuisine);
            return (
              <button
                key={cuisine}
                onClick={() => onToggleCuisine(cuisine)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition border ${
                  isSelected
                    ? "border-orange-500 bg-orange-950/40 text-orange-300 shadow-sm shadow-orange-500/20"
                    : "border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700 hover:text-slate-300"
                }`}
              >
                {cuisine}
              </button>
            );
          })}
        </div>
      </div>

      {/* Clasificación Temática */}
      <div>
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-300 mb-2">
          <Building2 className="h-3.5 w-3.5 text-purple-400" />
          <span>Temáticas & Vibras:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {AVAILABLE_THEMES.map((theme) => {
            const isSelected = selectedThemes.includes(theme);
            return (
              <button
                key={theme}
                onClick={() => onToggleTheme(theme)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition border ${
                  isSelected
                    ? "border-purple-500 bg-purple-950/40 text-purple-300 shadow-sm shadow-purple-500/20"
                    : "border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700 hover:text-slate-300"
                }`}
              >
                {theme}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
