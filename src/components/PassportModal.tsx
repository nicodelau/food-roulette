"use client";

import React, { useState } from "react";
import {
  X,
  Trophy,
  Compass,
  History,
  Ban,
  Calendar,
  Sparkles,
  Trash2,
  User as UserIcon,
} from "lucide-react";
import { Badge, UserLevel } from "@/domain/gamification/gamification-service";
import { ClassifiedRestaurant } from "@/domain/types";
import { AuthUser } from "./GoogleAuthButton";

export interface StoredVisit {
  restaurant: ClassifiedRestaurant;
  visitedAt: string;
  pointsEarned: number;
}

interface PassportModalProps {
  isOpen: boolean;
  onClose: () => void;
  points: number;
  level: UserLevel;
  badges: Badge[];
  visits: StoredVisit[];
  blacklist: ClassifiedRestaurant[];
  onRemoveBlacklist: (id: string) => void;
  onClearVisits: () => void;
  authUser?: AuthUser | null;
}

export const PassportModal: React.FC<PassportModalProps> = ({
  isOpen,
  onClose,
  points,
  level,
  badges,
  visits,
  blacklist,
  onRemoveBlacklist,
  onClearVisits,
  authUser,
}) => {
  const [activeTab, setActiveTab] = useState<"passport" | "history" | "blacklist">(
    "passport"
  );

  if (!isOpen) return null;

  // Level progress percentage
  const nextTarget =
    level.maxPoints === Infinity ? level.minPoints * 2 : level.maxPoints;
  const currentInTier = points - level.minPoints;
  const tierSpan = nextTarget - level.minPoints;
  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round((currentInTier / (tierSpan || 1)) * 100))
  );

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-3xl border border-stone-200 dark:border-stone-800 bg-[#fdfbf7] dark:bg-[#181615] text-stone-900 dark:text-stone-100 shadow-2xl overflow-hidden transition-colors">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 px-6 py-4 bg-white/70 dark:bg-[#141211]/70">
          <div className="flex items-center gap-3">
            {authUser?.picture ? (
              <img
                src={authUser.picture}
                alt={authUser.name}
                className="h-10 w-10 rounded-full border border-orange-500/50 object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                <Compass className="h-5 w-5" />
              </div>
            )}
            <div>
              <h2 className="text-base font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <span>Pasaporte Gastronómico</span>
                {authUser && (
                  <span className="text-xs font-sans font-normal text-stone-500 dark:text-stone-400">
                    de {authUser.name}
                  </span>
                )}
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {authUser?.email || "Tus estadísticas, medallas y salidas registradas"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-200 dark:hover:bg-stone-800 dark:text-stone-400 dark:hover:text-stone-100 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-stone-200 dark:border-stone-800 bg-stone-100/60 dark:bg-[#141211]/90 px-6 text-xs font-bold">
          <button
            onClick={() => setActiveTab("passport")}
            className={`flex items-center gap-1.5 border-b-2 py-3 px-3 transition ${
              activeTab === "passport"
                ? "border-orange-600 text-orange-600 dark:text-orange-400"
                : "border-transparent text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200"
            }`}
          >
            <Trophy className="h-3.5 w-3.5" />
            <span>Nivel & Medallas</span>
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-1.5 border-b-2 py-3 px-3 transition ${
              activeTab === "history"
                ? "border-orange-600 text-orange-600 dark:text-orange-400"
                : "border-transparent text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200"
            }`}
          >
            <History className="h-3.5 w-3.5" />
            <span>Historial ({visits.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("blacklist")}
            className={`flex items-center gap-1.5 border-b-2 py-3 px-3 transition ${
              activeTab === "blacklist"
                ? "border-orange-600 text-orange-600 dark:text-orange-400"
                : "border-transparent text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200"
            }`}
          >
            <Ban className="h-3.5 w-3.5" />
            <span>Excluidos ({blacklist.length})</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === "passport" && (
            <div className="space-y-6">
              {/* Level Progress Card */}
              <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/60 p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
                      Rango Actual
                    </span>
                    <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                      {level.name}
                      <Sparkles className="h-4 w-4 text-amber-500" />
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
                      {points}
                    </span>
                    <span className="text-xs text-stone-500 dark:text-stone-400 block">puntos totales</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-stone-500 dark:text-stone-400 mb-1.5 font-medium">
                    <span>Nivel {level.level}</span>
                    <span>
                      {level.maxPoints === Infinity
                        ? "Nivel Máximo alcanzado 🎉"
                        : `${progressPercent}% hacia el siguiente nivel`}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800">
                    <div
                      style={{ width: `${progressPercent}%` }}
                      className="h-full rounded-full bg-orange-600 transition-all duration-500"
                    />
                  </div>
                </div>
              </div>

              {/* Medallas Desbloqueadas */}
              <div>
                <h4 className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-3">
                  Insignias & Logros ({badges.length})
                </h4>
                {badges.length === 0 ? (
                  <p className="text-xs text-stone-500 italic">
                    Aún no has desbloqueado insignias. ¡Gira la ruleta y visita tu primer restaurante para ganar la primera!
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {badges.map((badge) => (
                      <div
                        key={badge.id}
                        className="flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20 p-3"
                      >
                        <span className="text-2xl">{badge.icon}</span>
                        <div>
                          <h5 className="text-xs font-bold text-stone-900 dark:text-stone-100">
                            {badge.name}
                          </h5>
                          <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-tight">
                            {badge.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "history" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Lugares visitados confirmados con Food Roulette.
                </p>
                {visits.length > 0 && (
                  <button
                    onClick={onClearVisits}
                    className="flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400 hover:underline transition"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Limpiar historial</span>
                  </button>
                )}
              </div>

              {visits.length === 0 ? (
                <div className="py-8 text-center text-stone-500 text-xs">
                  Aún no has registrado salidas gastronómicas.
                </div>
              ) : (
                <div className="space-y-2">
                  {visits.map((v, i) => (
                    <div
                      key={`${v.restaurant.id}-${i}`}
                      className="flex items-center justify-between rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/60 p-3 text-xs"
                    >
                      <div>
                        <p className="font-serif font-bold text-stone-900 dark:text-stone-100">{v.restaurant.name}</p>
                        <div className="flex items-center gap-2 text-[11px] text-stone-500 dark:text-stone-400">
                          <span className="text-orange-600 dark:text-orange-400 font-medium">
                            {v.restaurant.cuisines.join(", ")}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(v.visitedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                        +{v.pointsEarned} pts
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "blacklist" && (
            <div className="space-y-4">
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Lugares vetados que la ruleta nunca te recomendará.
              </p>
              {blacklist.length === 0 ? (
                <div className="py-8 text-center text-stone-500 text-xs">
                  No tienes restaurantes vetados en tu lista negra.
                </div>
              ) : (
                <div className="space-y-2">
                  {blacklist.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between rounded-xl border border-rose-200 dark:border-rose-950/50 bg-rose-50/50 dark:bg-rose-950/10 p-3 text-xs"
                    >
                      <div>
                        <p className="font-serif font-bold text-stone-900 dark:text-stone-100">{r.name}</p>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400">{r.address}</p>
                      </div>
                      <button
                        onClick={() => onRemoveBlacklist(r.id)}
                        className="rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 px-2.5 py-1 text-[11px] font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 transition"
                      >
                        Desbloquear
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
