"use client";

import React, { useState } from "react";
import {
  SlidersHorizontal,
  Navigation,
  EyeOff,
  UtensilsCrossed,
  ShieldCheck,
  Building2,
  ChevronDown,
  Banknote,
  MapPin,
  Check,
  X,
} from "lucide-react";
import {
  Coordinates,
  DietaryRestriction,
  PriceLevel,
  PRICE_TIERS,
} from "@/domain/types";
import {
  ALL_GASTRONOMIC_ZONES,
  REGIONS_METADATA,
  GastronomicZone,
  ZoneRegion,
  getZoneById,
  getZonesByRegion,
} from "@/domain/zones/gastronomic-zones";

export interface ZonePreset {
  name: string;
  zoneId?: string;
  coords: Coordinates;
}

export const PRESET_ZONES: ZonePreset[] = [
  { name: "Palermo", zoneId: "caba-14", coords: { lat: -34.5885, lng: -58.4306 } },
  { name: "San Telmo", zoneId: "caba-1", coords: { lat: -34.6186, lng: -58.3712 } },
  { name: "Villa Crespo", zoneId: "caba-15", coords: { lat: -34.595, lng: -58.441 } },
  { name: "Belgrano", zoneId: "caba-13", coords: { lat: -34.561, lng: -58.456 } },
  { name: "Vicente López", zoneId: "amba-vicente-lopez", coords: { lat: -34.5262, lng: -58.4815 } },
  { name: "San Isidro", zoneId: "amba-san-isidro", coords: { lat: -34.4717, lng: -58.5284 } },
  { name: "Las Lomitas", zoneId: "amba-lomas-de-zamora", coords: { lat: -34.7618, lng: -58.4011 } },
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
  selectedZoneIds: string[];
  onToggleZone: (zoneId: string) => void;
  onSelectAllCaba: () => void;
  onClearZones: () => void;
  radiusKm: number;
  onRadiusChange: (radius: number) => void;
  excludeVisited: boolean;
  onToggleExcludeVisited: (val: boolean) => void;
  visitedCount: number;
  selectedPriceLevels: PriceLevel[];
  onTogglePriceLevel: (level: PriceLevel) => void;
  selectedCuisines: string[];
  onToggleCuisine: (cuisine: string) => void;
  selectedThemes: string[];
  onToggleTheme: (theme: string) => void;
  selectedDietaries: DietaryRestriction[];
  onToggleDietary: (diet: DietaryRestriction) => void;
  onResetFilters: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  currentLocation,
  onLocationChange,
  selectedZoneIds,
  onToggleZone,
  onSelectAllCaba,
  onClearZones,
  radiusKm,
  onRadiusChange,
  excludeVisited,
  onToggleExcludeVisited,
  visitedCount,
  selectedPriceLevels,
  onTogglePriceLevel,
  selectedCuisines,
  onToggleCuisine,
  selectedThemes,
  onToggleTheme,
  selectedDietaries,
  onToggleDietary,
  onResetFilters,
}) => {
  const [isLocating, setIsLocating] = useState(false);
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [activeRegion, setActiveRegion] = useState<ZoneRegion>("CABA");

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Tu navegador no soporta geolocalización.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        onClearZones();
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

  const handlePresetZoneClick = (preset: ZonePreset) => {
    if (preset.zoneId) {
      onClearZones();
      onToggleZone(preset.zoneId);
    }
    onLocationChange(preset.coords, preset.name);
  };

  const hasActiveFilters =
    selectedZoneIds.length > 0 ||
    selectedPriceLevels.length > 0 ||
    selectedCuisines.length > 0 ||
    selectedThemes.length > 0 ||
    selectedDietaries.length > 0 ||
    excludeVisited;

  const currentRegionZones = getZonesByRegion(activeRegion);

  return (
    <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white/95 dark:bg-[#181615]/95 p-4 sm:p-5 shadow-sm space-y-5 transition-colors duration-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-150 dark:border-stone-800/80 pb-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-orange-600 dark:text-orange-500" />
          <h2 className="text-xs font-bold tracking-wider text-stone-900 dark:text-stone-100 uppercase font-sans">
            Filtros & Ubicación
          </h2>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="text-xs font-medium text-orange-600 dark:text-orange-400 hover:underline transition"
          >
            Restablecer
          </button>
        )}
      </div>

      {/* Selector de Comunas (Multi-Select) & AMBA/PBA */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-1.5 text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
            <MapPin className="h-3.5 w-3.5 text-orange-600 dark:text-orange-500" />
            <span>Comunas & Partidos (CABA & AMBA):</span>
          </label>
          <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400">
            {selectedZoneIds.length === 0
              ? "Modo libre (GPS)"
              : `${selectedZoneIds.length} zona(s) activa(s)`}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={handleUseCurrentLocation}
            disabled={isLocating}
            className="flex items-center gap-1.5 rounded-lg border border-orange-500/40 bg-orange-50 dark:bg-orange-950/30 px-2.5 py-1.5 text-xs font-semibold text-orange-700 dark:text-orange-300 transition hover:bg-orange-100 dark:hover:bg-orange-900/40 active:scale-95 disabled:opacity-50"
          >
            <Navigation className={`h-3 w-3 ${isLocating ? "animate-spin" : ""}`} />
            {isLocating ? "GPS..." : "GPS Actual"}
          </button>

          {/* Botón principal para abrir selector multi-zona */}
          <button
            onClick={() => setShowZoneModal(true)}
            className="flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-50 dark:bg-amber-950/30 px-3 py-1.5 text-xs font-bold text-amber-800 dark:text-amber-300 transition hover:bg-amber-100 dark:hover:bg-amber-900/40 active:scale-95 shadow-sm"
          >
            <Building2 className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            <span>
              {selectedZoneIds.length === 0
                ? "Elegir Comunas & AMBA..."
                : selectedZoneIds.length === 1
                ? (getZoneById(selectedZoneIds[0])?.numberLabel || "1 Zona")
                : `${selectedZoneIds.length} Zonas elegidas`}
            </span>
            <ChevronDown className="h-3 w-3 opacity-70" />
          </button>

          {/* Accesos rápidos a zonas comunes */}
          {PRESET_ZONES.slice(0, 4).map((zone) => (
            <button
              key={zone.name}
              onClick={() => handlePresetZoneClick(zone)}
              className="rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-100/70 dark:bg-stone-800/80 px-2.5 py-1.5 text-xs font-medium text-stone-700 dark:text-stone-300 transition hover:border-stone-400 dark:hover:border-stone-500 hover:bg-stone-200/60 dark:hover:bg-stone-700 active:scale-95"
            >
              {zone.name}
            </button>
          ))}
        </div>

        {/* Chips de Zonas Seleccionadas con botón X */}
        {selectedZoneIds.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] text-stone-400 font-semibold mr-1">
              Filtro activo:
            </span>
            {selectedZoneIds.map((zId) => {
              const zone = getZoneById(zId);
              return (
                <span
                  key={zId}
                  className="inline-flex items-center gap-1 rounded-md border border-amber-400/50 bg-amber-50/80 dark:bg-amber-950/40 px-2 py-0.5 text-[11px] font-semibold text-amber-900 dark:text-amber-200"
                >
                  <span>{zone?.numberLabel || zone?.name || zId}</span>
                  <button
                    type="button"
                    onClick={() => onToggleZone(zId)}
                    className="hover:text-amber-600 dark:hover:text-amber-400 p-0.5"
                    title="Remover zona"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              );
            })}
            <button
              type="button"
              onClick={onClearZones}
              className="text-[11px] font-medium text-stone-500 hover:text-stone-800 dark:hover:text-stone-300 underline ml-1"
            >
              Limpiar zonas
            </button>
          </div>
        )}
      </div>

      {/* Modal / Panel de Selección Multi-Zona */}
      {showZoneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#1a1816] shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 p-4 sm:p-5">
              <div>
                <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-orange-600 dark:text-orange-500" />
                  Seleccionar Comunas & Partidos Gastronómicos
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  Puedes seleccionar múltiples comunas de CABA y partidos de AMBA a la vez
                </p>
              </div>
              <button
                onClick={() => setShowZoneModal(false)}
                className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-700 dark:hover:text-stone-200 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick action bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 bg-stone-50 dark:bg-stone-900/60 px-4 py-2.5 border-b border-stone-200 dark:border-stone-800 text-xs">
              <div className="font-semibold text-stone-600 dark:text-stone-300">
                {selectedZoneIds.length} seleccionada(s) en total
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onSelectAllCaba}
                  className="rounded-md bg-stone-200 dark:bg-stone-800 px-2.5 py-1 text-xs font-semibold text-stone-800 dark:text-stone-200 hover:bg-orange-600 hover:text-white dark:hover:bg-orange-600 transition"
                >
                  Seleccionar todas de CABA
                </button>
                {selectedZoneIds.length > 0 && (
                  <button
                    type="button"
                    onClick={onClearZones}
                    className="rounded-md border border-stone-300 dark:border-stone-700 px-2.5 py-1 text-xs text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition"
                  >
                    Deseleccionar todas
                  </button>
                )}
              </div>
            </div>

            {/* Region Tabs */}
            <div className="flex overflow-x-auto border-b border-stone-200 dark:border-stone-800 bg-stone-100/60 dark:bg-stone-900/40 p-1.5 gap-1 text-xs">
              {REGIONS_METADATA.map((reg) => {
                const countInRegion = ALL_GASTRONOMIC_ZONES.filter(
                  (z) => z.region === reg.id && selectedZoneIds.includes(z.id)
                ).length;
                const isActive = activeRegion === reg.id;
                return (
                  <button
                    key={reg.id}
                    onClick={() => setActiveRegion(reg.id)}
                    className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 font-bold transition ${
                      isActive
                        ? "bg-white dark:bg-stone-800 text-orange-600 dark:text-orange-400 shadow-sm"
                        : "text-stone-600 dark:text-stone-400 hover:bg-white/50 dark:hover:bg-stone-800/50"
                    }`}
                  >
                    <span>{reg.label}</span>
                    {countInRegion > 0 && (
                      <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-600 text-white text-[10px] px-1 font-mono">
                        {countInRegion}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Zones Grid */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {currentRegionZones.map((zone: GastronomicZone) => {
                  const isSelected = selectedZoneIds.includes(zone.id);
                  return (
                    <button
                      key={zone.id}
                      type="button"
                      onClick={() => onToggleZone(zone.id)}
                      className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition ${
                        isSelected
                          ? "border-orange-500 bg-orange-50 dark:bg-orange-950/30 text-stone-900 dark:text-stone-100 shadow-sm ring-1 ring-orange-500/50"
                          : "border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/30 text-stone-700 dark:text-stone-300 hover:border-stone-300 dark:hover:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800/50"
                      }`}
                    >
                      <div
                        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition ${
                          isSelected
                            ? "border-orange-600 bg-orange-600 text-white"
                            : "border-stone-400 dark:border-stone-600 bg-white dark:bg-stone-800"
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold leading-snug">
                          {zone.name}
                        </div>
                        <div className="text-[10px] text-stone-500 dark:text-stone-400 line-clamp-1 mt-0.5">
                          {zone.barrios.join(", ")}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-stone-200 dark:border-stone-800 p-4 bg-stone-50 dark:bg-stone-900/80">
              <div className="text-xs text-stone-600 dark:text-stone-400">
                {selectedZoneIds.length === 0 ? (
                  <span>Búsqueda por GPS/Ubicación libre</span>
                ) : (
                  <span>
                    <strong className="text-orange-600 dark:text-orange-400">{selectedZoneIds.length}</strong> zona(s) activa(s)
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowZoneModal(false)}
                className="rounded-xl bg-orange-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-orange-700 active:scale-95 transition"
              >
                Aplicar Selección
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rango de Precios ($ / $$ / $$$) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
            <Banknote className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            <span>Rango de Precios:</span>
          </div>
          <span className="text-[11px] text-stone-500 dark:text-stone-400">
            {selectedPriceLevels.length === 0
              ? "Todos los rangos"
              : `${selectedPriceLevels.length} seleccionado(s)`}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {([1, 2, 3] as PriceLevel[]).map((lvl) => {
            const tier = PRICE_TIERS[lvl];
            const isSelected = selectedPriceLevels.includes(lvl);
            return (
              <button
                key={lvl}
                type="button"
                onClick={() => onTogglePriceLevel(lvl)}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition ${
                  isSelected
                    ? "border-amber-600 bg-amber-50 dark:bg-amber-950/40 text-amber-950 dark:text-amber-200 shadow-sm"
                    : "border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-900/40 text-stone-600 dark:text-stone-400 hover:border-stone-300 dark:hover:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800/60"
                }`}
              >
                <span className="text-base font-black text-amber-600 dark:text-amber-400 font-mono">
                  {tier.symbol}
                </span>
                <span className="text-xs font-bold mt-0.5 text-stone-800 dark:text-stone-200">
                  {tier.name}
                </span>
                <span className="text-[10px] text-stone-500 dark:text-stone-400 leading-tight mt-1 line-clamp-1">
                  {tier.costRange}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Radio en Kilómetros (Hasta 20 km) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
            Radio de búsqueda:
          </span>
          <span className="font-bold text-orange-600 dark:text-orange-400 font-mono">
            {radiusKm.toFixed(1)} km
          </span>
        </div>
        <input
          type="range"
          min="0.5"
          max="20"
          step="0.5"
          value={radiusKm}
          onChange={(e) => onRadiusChange(parseFloat(e.target.value))}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-stone-200 dark:bg-stone-700 accent-orange-600"
        />
        <div className="flex justify-between text-[10px] text-stone-500 dark:text-stone-400">
          <span>0.5 km (a pie)</span>
          <span>5 km</span>
          <span>20 km (área metro)</span>
        </div>
      </div>

      {/* Toggle Excluir Visitados */}
      <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/50 p-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <EyeOff className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-stone-800 dark:text-stone-200">
              Excluir lugares ya visitados
            </div>
            <div className="text-[11px] text-stone-500 dark:text-stone-400">
              {visitedCount} lugares en historial
            </div>
          </div>
        </div>
        <button
          onClick={() => onToggleExcludeVisited(!excludeVisited)}
          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            excludeVisited ? "bg-orange-600" : "bg-stone-300 dark:bg-stone-700"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
              excludeVisited ? "translate-x-4" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* Restricciones Dietarias */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
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
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 shadow-sm"
                    : "border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/40 text-stone-600 dark:text-stone-400 hover:border-stone-300 dark:hover:border-stone-700 hover:text-stone-900 dark:hover:text-stone-200"
                }`}
              >
                {diet.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Clasificación por Orígenes / Países */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
          <UtensilsCrossed className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
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
                    ? "border-orange-500 bg-orange-50 dark:bg-orange-950/40 text-orange-900 dark:text-orange-200 shadow-sm"
                    : "border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/40 text-stone-600 dark:text-stone-400 hover:border-stone-300 dark:hover:border-stone-700 hover:text-stone-900 dark:hover:text-stone-200"
                }`}
              >
                {cuisine}
              </button>
            );
          })}
        </div>
      </div>

      {/* Clasificación Temática */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
          <Building2 className="h-3.5 w-3.5 text-stone-600 dark:text-stone-400" />
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
                    ? "border-stone-600 bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-semibold shadow-sm"
                    : "border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/40 text-stone-600 dark:text-stone-400 hover:border-stone-300 dark:hover:border-stone-700 hover:text-stone-900 dark:hover:text-stone-200"
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
