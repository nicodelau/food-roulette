"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
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
    const extraDegrees = 1800 + Math.floor(Math.random() * 360);
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
      <div className="relative flex h-72 w-72 items-center justify-center sm:h-80 sm:w-80">
        {/* Outer Warm Shadow / Rim */}
        <div className="absolute inset-0 rounded-full border-2 border-stone-300 dark:border-stone-700 bg-stone-100/50 dark:bg-stone-900/40 shadow-inner" />

        {/* Outer Circular Ring */}
        <div
          className="absolute inset-0 rounded-full p-2"
          style={{
            background:
              "conic-gradient(from 0deg, #c2410c, #d97706, #15803d, #b45309, #9f1239, #f59e0b, #4d7c0f, #c2410c)",
          }}
        >
          <div className="h-full w-full rounded-full bg-white dark:bg-[#141312] transition-colors" />
        </div>

        {/* Inner Spinning Multi-colored Wheel Sectors (Gourmet Palette) */}
        <div
          style={{
            transform: `rotate(${rotationAngle}deg)`,
            transition: isSpinning
              ? "transform 3.5s cubic-bezier(0.12, 0.8, 0.2, 1)"
              : "none",
            background:
              "conic-gradient(from 0deg, #c2410c 0deg 45deg, #d97706 45deg 90deg, #15803d 90deg 135deg, #b45309 135deg 180deg, #9f1239 180deg 225deg, #f59e0b 225deg 270deg, #4d7c0f 270deg 315deg, #9a3412 315deg 360deg)",
          }}
          className="relative flex h-[88%] w-[88%] items-center justify-center rounded-full border-4 border-stone-200 dark:border-stone-800 shadow-xl overflow-hidden"
        >
          {/* Subtle Sector Dividers */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <div
              key={deg}
              style={{ transform: `rotate(${deg}deg)` }}
              className="absolute h-full w-0.5 bg-black/25"
            />
          ))}

          {/* Icon markers around sectors */}
          <span className="absolute top-2 text-sm select-none">🍕</span>
          <span className="absolute right-3 text-sm select-none">🥩</span>
          <span className="absolute bottom-2 text-sm select-none">🍣</span>
          <span className="absolute left-3 text-sm select-none">🌮</span>
        </div>

        {/* Pointer at the top */}
        <div className="absolute -top-3.5 z-30 flex flex-col items-center">
          <div className="h-0 w-0 border-x-8 border-x-transparent border-t-[18px] border-t-orange-600 drop-shadow-md" />
        </div>

        {/* Center Hub Display */}
        <div className="absolute z-20 flex h-36 w-36 flex-col items-center justify-center rounded-full border-4 border-stone-200 dark:border-stone-800 bg-white/95 dark:bg-[#181615]/95 p-3 text-center shadow-xl transition-colors">
          {isSpinning ? (
            <div className="space-y-1">
              <RefreshCw className="mx-auto h-6 w-6 animate-spin text-orange-600 dark:text-orange-400" />
              <p className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest animate-pulse">
                Girando...
              </p>
              <p className="truncate max-w-[110px] text-xs font-bold text-stone-900 dark:text-stone-100">
                {currentDisplayPlace?.name ?? "..."}
              </p>
            </div>
          ) : currentDisplayPlace ? (
            <div className="space-y-1">
              <div className="relative mx-auto h-7 w-7">
                <Image
                  src="/logo.png"
                  alt="Logo Icon"
                  width={28}
                  height={28}
                  className="object-contain"
                />
              </div>
              <p className="line-clamp-2 text-[11px] font-serif font-extrabold text-stone-900 dark:text-stone-100 leading-tight">
                {currentDisplayPlace.name}
              </p>
              <p className="text-[9px] font-bold text-amber-700 dark:text-amber-400">
                {currentDisplayPlace.cuisines[0] || "Gastronomía"}
              </p>
            </div>
          ) : (
            <div className="space-y-1 text-stone-400 dark:text-stone-500">
              <div className="relative mx-auto h-8 w-8 opacity-90">
                <Image
                  src="/logo.png"
                  alt="Logo Icon"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <p className="text-[11px] font-semibold text-stone-600 dark:text-stone-300">
                ¡Lista para girar!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Spin CTA Button */}
      <div className="mt-6 flex flex-col items-center gap-2">
        <button
          onClick={handleSpinClick}
          disabled={isSpinning || candidates.length === 0}
          className="group relative flex items-center gap-2.5 overflow-hidden rounded-xl bg-orange-600 hover:bg-orange-500 px-8 py-3.5 text-sm font-bold tracking-wide text-white shadow-md shadow-orange-600/25 transition duration-150 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Dices
            className={`h-5 w-5 text-white ${
              isSpinning ? "animate-spin" : "group-hover:rotate-12 transition-transform"
            }`}
          />
          <span>
            {isSpinning
              ? "Girando Ruleta..."
              : `¡Girar Ruleta! (${candidates.length} disponibles)`}
          </span>
          <Sparkles className="h-4 w-4 text-white" />
        </button>

        {candidates.length === 0 && !isSpinning && (
          <p className="text-xs text-rose-600 dark:text-rose-400">
            No hay restaurantes con los filtros actuales. Ajusta la zona o relaja las opciones.
          </p>
        )}
      </div>
    </div>
  );
};
