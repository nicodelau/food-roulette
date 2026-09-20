"use client";

import React, { useState } from "react";
import {
  SlidersHorizontal,
  Navigation,
  EyeOff,
  UtensilsCrossed,
  ShieldCheck,
  Building2,
  MapPin,
  ChevronDown,
} from "lucide-react";
import { Coordinates, DietaryRestriction } from "@/domain/types";
import { CABA_COMUNAS, ComunaCaba } from "@/domain/caba/comunas";

export interface ZonePreset {
  name: string;
  coords: Coordinates;
}

export const PRESET_ZONES: ZonePreset[] = [
  { name: "Palermo Soho", coords: { lat: -34.5885, lng: -58.4306 } },
  { name: "San Telmo", coords: { lat: -34.6186, lng: -58.3712 } },
  { name: "Villa Crespo", coords: { lat: -34.595, lng: -58.441 } },
  { name: "Belgrano", coords: { lat: -34.561, lng: -58.456 } },
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
  const [isLocating, setIsLocating] = useState(false);
  const [showComunas, setShowComunas] = useState(false);
  const [selectedComunaId, setSelectedComunaId] = useState<number | null>(null);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Tu navegador no soporta geolocalización.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        setSelectedComunaId(null);
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

  const handleSelectComuna = (comuna: ComunaCaba) => {
    setSelectedComunaId(comuna.id);
    onLocationChange(comuna.location, `${comuna.numberLabel}: ${comuna.name}`);
    setShowComunas(false);
  };

  const hasActiveFilters =
    selectedCuisines.length > 0 ||
    selectedThemes.length > 0 ||
    selectedDietaries.length > 0 ||
    excludeVisited;

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/75 p-4 shadow-xl backdrop-blur-sm sm:p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-orange-400" />
          <h2 className="text-xs font-bold tracking-wide text-white uppercase">
            Filtros & Ubicación
          </h2>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="text-xs font-medium text-orange-400 hover:text-orange-300 underline underline-offset-2 transition"
          >
            Restablecer
          </button>
        )}
      </div>

      {/* Selector de Zonas, GPS y Comunas de CABA */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-300">
          Zona o Comuna (CABA):
        </label>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={handleUseCurrentLocation}
            disabled={isLocating}
            className="flex items-center gap-1.5 rounded-lg border border-orange-500/40 bg-orange-950/30 px-2.5 py-1.5 text-xs font-medium text-orange-300 transition hover:bg-orange-900/40 active:scale-95 disabled:opacity-50"
          >
            <Navigation className={`h-3 w-3 ${isLocating ? "animate-spin" : ""}`} />
            {isLocating ? "GPS..." : "GPS Actual"}
          </button>

          {/* Desplegable de Comunas de CABA */}
          <div className="relative">
            <button
              onClick={() => setShowComunas(!showComunas)}
              className="flex items-center gap-1 rounded-lg border border-amber-500/40 bg-amber-950/20 px-2.5 py-1.5 text-xs font-medium text-amber-300 transition hover:bg-amber-900/30"
            >
              <Building2 className="h-3 w-3" />
              <span>
                {selectedComunaId
                  ? `Comuna ${selectedComunaId}`
                  : "Elegir Comuna CABA"}
              </span>
              <ChevronDown className="h-3 w-3" />
            </button>

            {showComunas && (
              <div className="absolute left-0 top-full mt-1.5 z-30 max-h-60 w-64 overflow-y-auto rounded-xl border border-slate-700 bg-slate-900 p-1.5 shadow-2xl">
                <div className="p-1 text-[10px] font-bold uppercase text-slate-400">
                  15 Comunas de Capital Federal
                </div>
                {CABA_COMUNAS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleSelectComuna(c)}
                    className={`flex w-full flex-col rounded-lg px-2.5 py-1.5 text-left text-xs transition ${
                      selectedComunaId === c.id
                        ? "bg-orange-600 text-white font-semibold"
                        : "text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    <span className="font-bold">{c.numberLabel}</span>
                    <span className="text-[10px] text-slate-400 line-clamp-1">
                      {c.barrios.join(", ")}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {PRESET_ZONES.map((zone) => (
            <button
              key={zone.name}
              onClick={() => {
                setSelectedComunaId(null);
                onLocationChange(zone.coords, zone.name);
              }}
              className="rounded-lg border border-slate-700/70 bg-slate-800/80 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition hover:border-slate-500 hover:bg-slate-700 active:scale-95"
            >
              {zone.name}
            </button>
          ))}
        </div>
      </div>

      {/* Radio en Kilómetros (Hasta 20 km) */}
      <div>
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-slate-300">Radio de búsqueda:</span>
          <span className="font-bold text-orange-400">{radiusKm.toFixed(1)} km</span>
        </div>
        <input
          type="range"
          min="0.5"
          max="20"
          step="0.5"
          value={radiusKm}
          onChange={(e) => onRadiusChange(parseFloat(e.target.value))}
          className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-700 accent-orange-500"
        />
        <div className="flex justify-between text-[10px] text-slate-500 mt-1">
          <span>0.5 km (a pie)</span>
          <span>5 km</span>
          <span>20 km (área metropolitana)</span>
        </div>
      </div>

      {/* Toggle Excluir Visitados */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400">
            <EyeOff className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-medium text-white">
              Excluir lugares ya visitados
            </div>
            <div className="text-[11px] text-slate-400">
              {visitedCount} lugares registrados en historial
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
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-2">
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
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-2">
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
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-2">
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
