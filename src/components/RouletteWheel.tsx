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
        {/* Outer Glow Ring in Logo Gradient Colors */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-orange-500/25 via-amber-400/25 to-lime-400/25 blur-2xl" />

        {/* Outer Circular Arrow Ring */}
        <div
          className="absolute inset-0 rounded-full p-1.5"
          style={{
            background:
              "conic-gradient(from 45deg, #f97316, #f59e0b, #84cc16, #0284c7, #ec4899, #f97316)",
          }}
        >
          <div className="h-full w-full rounded-full bg-slate-950/80 backdrop-blur-sm" />
        </div>

        {/* Inner Spinning Multi-colored Wheel Sectors (Matching the Logo) */}
        <div
          style={{
            transform: `rotate(${rotationAngle}deg)`,
            transition: isSpinning
              ? "transform 3.5s cubic-bezier(0.12, 0.8, 0.2, 1)"
              : "none",
            background:
              "conic-gradient(from 0deg, #f97316 0deg 45deg, #84cc16 45deg 90deg, #0284c7 90deg 135deg, #f59e0b 135deg 180deg, #f43f5e 180deg 225deg, #22c55e 225deg 270deg, #ec4899 270deg 315deg, #a855f7 315deg 360deg)",
          }}
          className="relative flex h-[88%] w-[88%] items-center justify-center rounded-full border-4 border-slate-900 shadow-2xl overflow-hidden"
        >
          {/* Subtle Sector Dividers */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <div
              key={deg}
              style={{ transform: `rotate(${deg}deg)` }}
              className="absolute h-full w-0.5 bg-slate-950/50"
            />
          ))}

          {/* Icon markers around sectors */}
          <span className="absolute top-2 text-sm select-none">🍕</span>
          <span className="absolute right-3 text-sm select-none">🍔</span>
          <span className="absolute bottom-2 text-sm select-none">🍣</span>
          <span className="absolute left-3 text-sm select-none">🌮</span>
        </div>

        {/* Pointer at the top */}
        <div className="absolute -top-3 z-30 flex flex-col items-center">
          <div className="h-0 w-0 border-x-8 border-x-transparent border-t-[18px] border-t-orange-500 drop-shadow-[0_4px_6px_rgba(249,115,22,0.9)]" />
        </div>

        {/* Center Hub Display */}
        <div className="absolute z-20 flex h-36 w-36 flex-col items-center justify-center rounded-full border-4 border-slate-900 bg-slate-950/95 p-3 text-center shadow-2xl backdrop-blur-md">
          {isSpinning ? (
            <div className="space-y-1">
              <RefreshCw className="mx-auto h-6 w-6 animate-spin text-orange-400" />
              <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest animate-pulse">
                Girando...
              </p>
              <p className="truncate max-w-[110px] text-xs font-semibold text-slate-100">
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
              <p className="line-clamp-2 text-[11px] font-extrabold text-white leading-tight">
                {currentDisplayPlace.name}
              </p>
              <p className="text-[9px] font-bold text-amber-400">
                {currentDisplayPlace.cuisines[0] || "Gastronomía"}
              </p>
            </div>
          ) : (
            <div className="space-y-1 text-slate-400">
              <div className="relative mx-auto h-8 w-8 opacity-80">
                <Image
                  src="/logo.png"
                  alt="Logo Icon"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <p className="text-[11px] font-semibold text-slate-300">
                ¡Lista para girar!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Spin CTA Button Matching Logo Colors */}
      <div className="mt-6 flex flex-col items-center gap-2">
        <button
          onClick={handleSpinClick}
          disabled={isSpinning || candidates.length === 0}
          className="group relative flex items-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-lime-500 px-8 py-4 text-sm font-extrabold tracking-wide text-slate-950 shadow-xl shadow-orange-500/25 transition duration-200 hover:brightness-110 hover:shadow-orange-500/40 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Dices
            className={`h-5 w-5 text-slate-950 ${
              isSpinning ? "animate-spin" : "group-hover:rotate-12 transition-transform"
            }`}
          />
          <span>
            {isSpinning
              ? "Girando Ruleta..."
              : `¡Girar Ruleta! (${candidates.length} disponibles)`}
          </span>
          <Sparkles className="h-4 w-4 text-slate-950" />
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
