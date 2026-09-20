"use client";

import React from "react";
import Image from "next/image";
import { Trophy, Compass, MapPin, Sparkles } from "lucide-react";
import { UserLevel } from "@/domain/gamification/gamification-service";
import { AuthUser, GoogleAuthButton } from "./GoogleAuthButton";

interface NavbarProps {
  points: number;
  level: UserLevel;
  onOpenPassport: () => void;
  zoneName: string;
  authUser: AuthUser | null;
  onLoginSuccess: (user: AuthUser) => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  points,
  level,
  onOpenPassport,
  zoneName,
  authUser,
  onLoginSuccess,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6">
        {/* Brand with Official Logo */}
        <div className="flex items-center gap-3">
          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-orange-500/30 bg-slate-900 p-0.5 shadow-md shadow-orange-500/20">
            <Image
              src="/logo.png"
              alt="Food Roulette Logo"
              width={44}
              height={44}
              className="h-full w-full object-contain"
              priority
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-extrabold tracking-tight text-white sm:text-xl">
                Food<span className="text-orange-500">Roulette</span>
              </h1>
              <span className="hidden sm:inline-flex rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                100% Free OSM
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <MapPin className="h-3 w-3 text-orange-400 shrink-0" />
              <span className="truncate max-w-[180px] sm:max-w-[280px]">
                {zoneName}
              </span>
            </div>
          </div>
        </div>

        {/* Right Action Bar: Points, Google Auth & Pasaporte */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Google Auth Button */}
          <GoogleAuthButton
            user={authUser}
            onLoginSuccess={onLoginSuccess}
            onLogout={onLogout}
          />

          {/* Level & Points Pill */}
          <button
            onClick={onOpenPassport}
            className="group flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/90 px-3 py-1.5 text-xs transition hover:border-orange-500/50 hover:bg-slate-800"
          >
            <div className="flex items-center gap-1 font-bold text-amber-400">
              <Trophy className="h-3.5 w-3.5" />
              <span>{points} pts</span>
            </div>
            <div className="hidden h-3 w-px bg-slate-700 md:block" />
            <div className="hidden items-center gap-1 text-slate-300 group-hover:text-white md:flex">
              <Sparkles className="h-3 w-3 text-orange-400" />
              <span className="font-medium text-[11px]">{level.name}</span>
            </div>
          </button>

          {/* Pasaporte Button */}
          <button
            onClick={onOpenPassport}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm shadow-orange-600/30 transition hover:brightness-110 active:scale-95"
          >
            <Compass className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Pasaporte</span>
          </button>
        </div>
      </div>
    </header>
  );
};
