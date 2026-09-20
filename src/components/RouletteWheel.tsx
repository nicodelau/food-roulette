"use client";

import React, { useState, useEffect, useRef } from "react";
import { Dices, Sparkles, RefreshCw } from "lucide-react";
import { ClassifiedRestaurant } from "@/domain/types";

interface RouletteWheelProps {
  candidates: ClassifiedRestaurant[];
  onSpin: () => void;
  isSpinning: boolean;
  selectedWinner: ClassifiedRestaurant | null;
}

export const RouletteWheel: React.FC<RouletteWheelProps> = ({
  candidates,
  onSpin,
  isSpinning,
  selectedWinner,
}) => {
  const [rotationAngle, setRotationAngle] = useState(0);
  const [displayIndex, setDisplayIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cycling through candidate names rapidly while spinning for arcade feeling
  useEffect(() => {
    if (isSpinning && candidates.length > 0) {
      intervalRef.current = setInterval(() => {
        setDisplayIndex((prev) => (prev + 1) % candidates.length);
      }, 75);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isSpinning, candidates]);

  const handleSpinClick = () => {
    if (isSpinning || candidates.length === 0) return;
    // Add multiple full turns plus random delta
    const extraDegrees = 1440 + Math.floor(Math.random() * 360);
    setRotationAngle((prev) => prev + extraDegrees);
    onSpin();
  };

  const currentDisplayPlace =
    selectedWinner && !isSpinning
      ? selectedWinner
      : candidates[displayIndex] ?? null;

  return (
    <div className="flex flex-col items-center justify-center p-4">
      {/* Visual Wheel Circle Container */}
      <div className="relative flex h-64 w-64 items-center justify-center sm:h-72 sm:w-72">
        {/* Outer Glow Ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-orange-500/20 via-amber-500/20 to-purple-500/20 blur-xl" />

        {/* Outer Border with Markers */}
        <div
          style={{
            transform: `rotate(${rotationAngle}deg)`,
            transition: isSpinning
              ? "transform 3.5s cubic-bezier(0.12, 0.8, 0.2, 1)"
              : "none",
          }}
          className="relative flex h-full w-full items-center justify-center rounded-full border-4 border-slate-700 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 shadow-2xl"
        >
          {/* Decorative spokes / ticks */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <div
              key={deg}
              style={{ transform: `rotate(${deg}deg)` }}
              className="absolute h-full w-0.5 bg-gradient-to-b from-orange-500/40 via-transparent to-orange-500/40"
            />
          ))}

          {/* Dots on edge */}
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(
            (deg) => (
              <div
                key={`dot-${deg}`}
                style={{
                  transform: `rotate(${deg}deg) translateY(-118px)`,
                }}
                className="absolute h-2 w-2 rounded-full bg-amber-400/80 shadow-sm shadow-amber-400"
              />
            )
          )}
        </div>

        {/* Pointer at the top */}
        <div className="absolute -top-3 z-20 flex flex-col items-center">
          <div className="h-0 w-0 border-x-8 border-x-transparent border-t-[16px] border-t-orange-500 drop-shadow-[0_2px_4px_rgba(249,115,22,0.8)]" />
        </div>

        {/* Center Hub Display */}
        <div className="absolute z-10 flex h-40 w-40 flex-col items-center justify-center rounded-full border-2 border-orange-500/40 bg-slate-900/95 p-3 text-center shadow-inner backdrop-blur-md">
          {isSpinning ? (
            <div className="space-y-1">
              <RefreshCw className="mx-auto h-6 w-6 animate-spin text-orange-400" />
              <p className="text-[11px] font-bold text-orange-400 animate-pulse uppercase tracking-wider">
                Eligiendo...
              </p>
              <p className="truncate max-w-[120px] text-xs font-semibold text-slate-200">
                {currentDisplayPlace?.name ?? "..."}
              </p>
            </div>
          ) : currentDisplayPlace ? (
            <div className="space-y-1">
              <span className="text-xl">✨</span>
              <p className="line-clamp-2 text-xs font-bold text-white leading-tight">
                {currentDisplayPlace.name}
              </p>
              <p className="text-[10px] font-medium text-orange-400">
                {currentDisplayPlace.cuisines[0] || "Gastronomía"}
              </p>
            </div>
          ) : (
            <div className="space-y-1 text-slate-400">
              <Dices className="mx-auto h-7 w-7 text-slate-500" />
              <p className="text-xs font-medium">Lista para girar</p>
            </div>
          )}
        </div>
      </div>

      {/* Spin CTA Button */}
      <div className="mt-6 flex flex-col items-center gap-2">
        <button
          onClick={handleSpinClick}
          disabled={isSpinning || candidates.length === 0}
          className="group relative flex items-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 px-8 py-4 text-sm font-bold tracking-wide text-white shadow-xl shadow-orange-600/30 transition duration-200 hover:brightness-110 hover:shadow-orange-600/50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Dices className={`h-5 w-5 ${isSpinning ? "animate-spin" : "group-hover:rotate-12 transition-transform"}`} />
          <span>
            {isSpinning
              ? "Girando Ruleta..."
              : `¡Girar Ruleta! (${candidates.length} disponibles)`}
          </span>
          <Sparkles className="h-4 w-4 text-amber-200" />
        </button>

        {candidates.length === 0 && !isSpinning && (
          <p className="text-xs text-rose-400">
            No hay restaurantes con los filtros actuales. Ajusta la zona o relaja las opciones.
          </p>
        )}
      </div>
    </div>
  );
};
