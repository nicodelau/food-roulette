"use client";

import React from "react";
import { Sparkles, Trophy, Compass, MapPin } from "lucide-react";
import { UserLevel } from "@/domain/gamification/gamification-service";

interface NavbarProps {
  points: number;
  level: UserLevel;
  onOpenPassport: () => void;
  zoneName: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  points,
  level,
  onOpenPassport,
  zoneName,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 shadow-md shadow-orange-500/20">
            <span className="text-xl select-none">🎡</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white sm:text-xl">
                Food<span className="text-orange-500">Roulette</span>
              </h1>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                100% Free OSM
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <MapPin className="h-3 w-3 text-orange-400" />
              <span>Zona: {zoneName}</span>
            </div>
          </div>
        </div>

        {/* Gamification Status & Passport CTA */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Level & Points Pill */}
          <button
            onClick={onOpenPassport}
            className="group flex items-center gap-2.5 rounded-full border border-slate-700/80 bg-slate-900/90 px-3 py-1.5 text-xs transition hover:border-orange-500/50 hover:bg-slate-850"
          >
            <div className="flex items-center gap-1 font-semibold text-amber-400">
              <Trophy className="h-3.5 w-3.5" />
              <span>{points} pts</span>
            </div>
            <div className="hidden h-3 w-px bg-slate-700 sm:block" />
            <div className="flex items-center gap-1 text-slate-300 group-hover:text-white">
              <Sparkles className="h-3 w-3 text-orange-400" />
              <span className="font-medium text-[11px] sm:text-xs">
                {level.name}
              </span>
            </div>
          </button>

          {/* Pasaporte Button */}
          <button
            onClick={onOpenPassport}
            className="flex items-center gap-1.5 rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-orange-600/30 transition hover:bg-orange-500 active:scale-95"
          >
            <Compass className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Mi Pasaporte</span>
          </button>
        </div>
      </div>
    </header>
  );
};
