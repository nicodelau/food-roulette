"use client";

import React from "react";
import Image from "next/image";
import { Trophy, Compass, MapPin, Sparkles, Sun, Moon } from "lucide-react";
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
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  points,
  level,
  onOpenPassport,
  zoneName,
  authUser,
  onLoginSuccess,
  onLogout,
  theme,
  onToggleTheme,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-200/90 dark:border-stone-800/80 bg-[#fcfbf9]/95 dark:bg-[#141312]/95 backdrop-blur-md transition-colors duration-200">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6">
        {/* Brand with Logo */}
        <div className="flex items-center gap-3">
          <div className="relative h-11 w-11 shrink-0">
            <Image
              src="/logo.png"
              alt="Food Roulette Logo"
              width={44}
              height={44}
              className="h-full w-full object-contain drop-shadow-sm"
              priority
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight text-stone-900 dark:text-stone-100 sm:text-xl font-serif">
                Food<span className="text-orange-600 dark:text-orange-500 font-sans font-black">Roulette</span>
              </h1>
              <span className="hidden sm:inline-flex rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                100% Free OSM
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400">
              <MapPin className="h-3 w-3 text-orange-600 dark:text-orange-500 shrink-0" />
              <span className="truncate max-w-[180px] sm:max-w-[280px]">
                {zoneName}
              </span>
            </div>
          </div>
        </div>

        {/* Right Action Bar: Theme Toggle, Google Auth & Pasaporte */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-stone-300 dark:border-stone-700/80 bg-stone-100/90 dark:bg-stone-800/80 text-stone-700 dark:text-stone-300 shadow-sm transition hover:bg-stone-200 dark:hover:bg-stone-700 active:scale-95"
            title={theme === "dark" ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-stone-700" />
            )}
          </button>

          {/* Google Auth Button */}
          <GoogleAuthButton
            user={authUser}
            onLoginSuccess={onLoginSuccess}
            onLogout={onLogout}
          />

          {/* Level & Points Pill */}
          <button
            onClick={onOpenPassport}
            className="group flex items-center gap-2 rounded-xl border border-stone-300/90 dark:border-stone-700/80 bg-stone-100/90 dark:bg-stone-800/90 px-3 py-1.5 text-xs transition hover:border-orange-500/50 hover:bg-stone-200/80 dark:hover:bg-stone-700/80"
          >
            <div className="flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400">
              <Trophy className="h-3.5 w-3.5" />
              <span>{points} pts</span>
            </div>
            <div className="hidden h-3 w-px bg-stone-300 dark:bg-stone-700 md:block" />
            <div className="hidden items-center gap-1 text-stone-600 dark:text-stone-300 group-hover:text-stone-900 dark:group-hover:text-white md:flex">
              <Sparkles className="h-3 w-3 text-orange-600 dark:text-orange-400" />
              <span className="font-medium text-[11px]">{level.name}</span>
            </div>
          </button>

          {/* Pasaporte Button */}
          <button
            onClick={onOpenPassport}
            className="flex items-center gap-1.5 rounded-xl bg-orange-600 dark:bg-orange-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm shadow-orange-600/30 transition hover:bg-orange-500 active:scale-95"
          >
            <Compass className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Pasaporte</span>
          </button>
        </div>
      </div>
    </header>
  );
};

