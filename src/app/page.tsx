"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import { Navbar } from "@/components/Navbar";
import { FilterBar, PRESET_ZONES } from "@/components/FilterBar";
import { RouletteWheel } from "@/components/RouletteWheel";
import { WinnerCard } from "@/components/WinnerCard";
import { PassportModal, StoredVisit } from "@/components/PassportModal";
import { RecommendationsSection } from "@/components/RecommendationsSection";
import { AuthUser } from "@/components/GoogleAuthButton";
import {
  ClassifiedRestaurant,
  Coordinates,
  DietaryRestriction,
  PriceLevel,
} from "@/domain/types";
import {
  Badge,
  GamificationService,
  UserLevel,
} from "@/domain/gamification/gamification-service";
import { RecommendationEngine } from "@/domain/recommendations/recommendation-engine";
import { Sparkles, AlertCircle, RefreshCw } from "lucide-react";

// Dynamic import for Leaflet map to prevent SSR issues
const LeafletMap = dynamic(() => import("@/components/LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[360px] w-full items-center justify-center rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-900 text-stone-500 text-xs">
      <RefreshCw className="mr-2 h-4 w-4 animate-spin text-orange-600 dark:text-orange-400" />
      Cargando mapa interactivo...
    </div>
  ),
});

const gamificationService = new GamificationService();
const recommendationEngine = new RecommendationEngine();

export default function HomePage() {
  // 1. Location & Zone State
  const [currentLocation, setCurrentLocation] = useState<Coordinates>(
    PRESET_ZONES[0].coords
  );
  const [zoneName, setZoneName] = useState<string>(PRESET_ZONES[0].name);

  // 2. Filter States (Radio hasta 20km & Rango de Precios)
  const [radiusKm, setRadiusKm] = useState<number>(2.5);
  const [excludeVisited, setExcludeVisited] = useState<boolean>(true);
  const [selectedPriceLevels, setSelectedPriceLevels] = useState<PriceLevel[]>([]);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [selectedDietaries, setSelectedDietaries] = useState<
    DietaryRestriction[]
  >([]);

  // 3. Places Pool & Winner State
  const [allPlaces, setAllPlaces] = useState<ClassifiedRestaurant[]>([]);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState<boolean>(false);
  const [placesError, setPlacesError] = useState<string | null>(null);

  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [selectedWinner, setSelectedWinner] =
    useState<ClassifiedRestaurant | null>(null);

  // 4. Gamification, Profile, Theme & Auth State
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [points, setPoints] = useState<number>(0);
  const [level, setLevel] = useState<UserLevel>(
    gamificationService.calculateLevel(0)
  );
  const [badges, setBadges] = useState<Badge[]>([]);
  const [visits, setVisits] = useState<StoredVisit[]>([]);
  const [blacklist, setBlacklist] = useState<ClassifiedRestaurant[]>([]);
  const [isPassportOpen, setIsPassportOpen] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Load profile data and theme from localStorage
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("fr_theme");
      if (savedTheme === "dark" || savedTheme === "light") {
        setTheme(savedTheme);
        document.documentElement.classList.toggle("dark", savedTheme === "dark");
      } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        setTheme("dark");
        document.documentElement.classList.add("dark");
      } else {
        setTheme("light");
        document.documentElement.classList.remove("dark");
      }

      const savedUser = localStorage.getItem("fr_auth_user");
      const savedPoints = localStorage.getItem("fr_points");
      const savedVisits = localStorage.getItem("fr_visits");
      const savedBlacklist = localStorage.getItem("fr_blacklist");
      const savedBadges = localStorage.getItem("fr_badges");

      if (savedUser) setAuthUser(JSON.parse(savedUser));
      if (savedPoints) {
        const pts = parseInt(savedPoints, 10) || 0;
        setPoints(pts);
        setLevel(gamificationService.calculateLevel(pts));
      }
      if (savedVisits) setVisits(JSON.parse(savedVisits));
      if (savedBlacklist) setBlacklist(JSON.parse(savedBlacklist));
      if (savedBadges) setBadges(JSON.parse(savedBadges));
    } catch {
      // Ignore storage errors
    }
  }, []);

  const saveUserData = (
    newPts: number,
    newVisits: StoredVisit[],
    newBadges: Badge[],
    newBlacklist: ClassifiedRestaurant[]
  ) => {
    try {
      localStorage.setItem("fr_points", newPts.toString());
      localStorage.setItem("fr_visits", JSON.stringify(newVisits));
      localStorage.setItem("fr_badges", JSON.stringify(newBadges));
      localStorage.setItem("fr_blacklist", JSON.stringify(newBlacklist));
    } catch {
      // Ignore storage errors
    }
  };

  const handleLoginSuccess = (user: AuthUser) => {
    setAuthUser(user);
    try {
      localStorage.setItem("fr_auth_user", JSON.stringify(user));
    } catch {
      // Ignore
    }
    setNotification(`¡Bienvenido/a ${user.name}! Tu perfil ha sido sincronizado.`);
    setTimeout(() => setNotification(null), 5000);
  };

  const handleLogout = () => {
    setAuthUser(null);
    try {
      localStorage.removeItem("fr_auth_user");
    } catch {
      // Ignore
    }
    setNotification("Has cerrado sesión.");
    setTimeout(() => setNotification(null), 3000);
  };

  const handleToggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    try {
      localStorage.setItem("fr_theme", nextTheme);
    } catch {
      // Ignore
    }
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
  };

  const handleTogglePriceLevel = (level: PriceLevel) => {
    setSelectedPriceLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    );
    setSelectedWinner(null);
  };

  // Fetch places from API when location or radius changes
  const fetchPlaces = useCallback(async () => {
    setIsLoadingPlaces(true);
    setPlacesError(null);
    try {
      const res = await fetch(
        `/api/places?lat=${currentLocation.lat}&lng=${currentLocation.lng}&radiusKm=${radiusKm}`
      );
      const data = await res.json();
      if (data.success) {
        setAllPlaces(data.places);
      } else {
        setPlacesError(data.error || "No se pudieron cargar los restaurantes.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error de red";
      setPlacesError(`Error de conexión con el proveedor de mapas: ${msg}`);
    } finally {
      setIsLoadingPlaces(false);
    }
  }, [currentLocation, radiusKm]);

  useEffect(() => {
    fetchPlaces();
  }, [fetchPlaces]);

  // Click on map to select search center
  const handleMapClick = (coords: Coordinates) => {
    setCurrentLocation(coords);
    setZoneName(`Punto en mapa (${coords.lat.toFixed(3)}, ${coords.lng.toFixed(3)})`);
    setSelectedWinner(null);
  };

  // Filter eligible candidates for the roulette wheel based on active filters
  const eligibleCandidates = useMemo(() => {
    const visitedIds = new Set(visits.map((v) => v.restaurant.id));
    const blacklistIds = new Set(blacklist.map((b) => b.id));

    return allPlaces.filter((place) => {
      // Blacklist filter
      if (blacklistIds.has(place.id) || blacklistIds.has(place.externalId)) {
        return false;
      }

      // Visited filter
      if (
        excludeVisited &&
        (visitedIds.has(place.id) || visitedIds.has(place.externalId))
      ) {
        return false;
      }

      // Price level filter
      if (selectedPriceLevels.length > 0) {
        if (!selectedPriceLevels.includes(place.priceLevel)) {
          return false;
        }
      }

      // Dietary restrictions (must meet all required)
      if (selectedDietaries.length > 0) {
        const matchesAll = selectedDietaries.every((diet) =>
          place.dietarySuitability.includes(diet)
        );
        if (!matchesAll) return false;
      }

      // Cuisines filter
      if (selectedCuisines.length > 0) {
        const matchesCuisine = selectedCuisines.some((c) =>
          place.cuisines.includes(c)
        );
        if (!matchesCuisine) return false;
      }

      // Themes filter
      if (selectedThemes.length > 0) {
        const matchesTheme = selectedThemes.some((t) =>
          place.themes.includes(t)
        );
        if (!matchesTheme) return false;
      }

      return true;
    });
  }, [
    allPlaces,
    visits,
    blacklist,
    excludeVisited,
    selectedPriceLevels,
    selectedDietaries,
    selectedCuisines,
    selectedThemes,
  ]);

  // Recommendations based on user history and affinity
  const recommendations = useMemo(() => {
    const visitedCuisinesCount: Record<string, number> = {};
    for (const v of visits) {
      for (const c of v.restaurant.cuisines) {
        visitedCuisinesCount[c] = (visitedCuisinesCount[c] || 0) + 1;
      }
    }

    const visitedIds = new Set(visits.map((v) => v.restaurant.id));

    return recommendationEngine.getRecommendations({
      pool: allPlaces,
      visitedCuisinesCount,
      visitedRestaurantIds: visitedIds,
      requiredDietary: selectedDietaries,
      userLocation: currentLocation,
      limit: 3,
    });
  }, [allPlaces, visits, selectedDietaries, currentLocation]);

  // Spin Roulette Handler
  const handleSpinRoulette = async () => {
    if (eligibleCandidates.length === 0 || isSpinning) return;

    setIsSpinning(true);
    setSelectedWinner(null);

    try {
      const res = await fetch("/api/roulette/spin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pool: allPlaces,
          userLocation: currentLocation,
          radiusKm,
          selectedCuisines,
          selectedThemes,
          selectedPriceLevels,
          requiredDietary: selectedDietaries,
          excludeVisited,
          visitedIds: visits.map((v) => v.restaurant.id),
          blacklistedIds: blacklist.map((b) => b.id),
        }),
      });

      const data = await res.json();

      setTimeout(() => {
        setIsSpinning(false);
        if (data.success && data.result.selectedRestaurant) {
          setSelectedWinner(data.result.selectedRestaurant);
        } else {
          const fallback =
            eligibleCandidates[
              Math.floor(Math.random() * eligibleCandidates.length)
            ];
          setSelectedWinner(fallback);
        }
      }, 3500);
    } catch {
      setTimeout(() => {
        setIsSpinning(false);
        const fallback =
          eligibleCandidates[
            Math.floor(Math.random() * eligibleCandidates.length)
          ];
        setSelectedWinner(fallback);
      }, 3500);
    }
  };

  // Confirm visit check-in & award points
  const handleConfirmVisit = async (restaurant: ClassifiedRestaurant) => {
    try {
      const res = await fetch("/api/visits/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurant,
          currentPoints: points,
          previousVisits: visits.map((v) => ({
            restaurantId: v.restaurant.id,
            cuisines: v.restaurant.cuisines,
            visitedAt: v.visitedAt,
          })),
        }),
      });

      const data = await res.json();

      if (data.success) {
        const { pointsEarned, newTotalPoints, unlockedBadges, newLevel } =
          data.data;

        const newVisit: StoredVisit = {
          restaurant,
          visitedAt: new Date().toISOString(),
          pointsEarned,
        };

        const updatedVisits = [newVisit, ...visits];
        const updatedBadges = [...badges];

        for (const b of unlockedBadges) {
          if (!updatedBadges.some((existing) => existing.id === b.id)) {
            updatedBadges.push(b);
          }
        }

        setPoints(newTotalPoints);
        setLevel(newLevel);
        setVisits(updatedVisits);
        setBadges(updatedBadges);
        saveUserData(newTotalPoints, updatedVisits, updatedBadges, blacklist);

        let msg = `¡Excelente elección! Ganaste +${pointsEarned} puntos.`;
        if (unlockedBadges.length > 0) {
          msg += ` 🎉 ¡Desbloqueaste la medalla: ${unlockedBadges[0].name}!`;
        }
        setNotification(msg);
        setTimeout(() => setNotification(null), 6000);
      } else {
        alert(data.error || "No se pudo registrar la visita.");
      }
    } catch {
      alert("Error de conexión al registrar visita.");
    }
  };

  // Blacklist restaurant handler
  const handleBlacklist = (restaurant: ClassifiedRestaurant) => {
    if (confirm(`¿Vetar '${restaurant.name}' para no volver a sugerirlo?`)) {
      const updated = [...blacklist, restaurant];
      setBlacklist(updated);
      saveUserData(points, visits, badges, updated);
      setSelectedWinner(null);
      setNotification(`'${restaurant.name}' fue añadido a tu lista negra.`);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfbf9] dark:bg-[#141312] text-stone-900 dark:text-stone-100 flex flex-col transition-colors duration-200">
      {/* Top Navigation with Logo, Theme Toggle & Google Auth */}
      <Navbar
        points={points}
        level={level}
        onOpenPassport={() => setIsPassportOpen(true)}
        zoneName={zoneName}
        authUser={authUser}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Notification Banner */}
      {notification && (
        <div className="sticky top-[61px] z-30 flex items-center justify-center gap-2 bg-orange-600 py-2.5 px-4 text-xs font-bold text-white shadow-md animate-in slide-in-from-top duration-300">
          <Sparkles className="h-4 w-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Content Layout */}
      <main className="mx-auto flex-1 w-full max-w-7xl px-4 py-6 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Filters & Controls */}
          <div className="lg:col-span-4 space-y-4">
            <FilterBar
              currentLocation={currentLocation}
              onLocationChange={(coords, name) => {
                setCurrentLocation(coords);
                setZoneName(name);
                setSelectedWinner(null);
              }}
              radiusKm={radiusKm}
              onRadiusChange={(r) => {
                setRadiusKm(r);
                setSelectedWinner(null);
              }}
              excludeVisited={excludeVisited}
              onToggleExcludeVisited={(val) => {
                setExcludeVisited(val);
                setSelectedWinner(null);
              }}
              visitedCount={visits.length}
              selectedPriceLevels={selectedPriceLevels}
              onTogglePriceLevel={handleTogglePriceLevel}
              selectedCuisines={selectedCuisines}
              onToggleCuisine={(c) => {
                setSelectedCuisines((prev) =>
                  prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
                );
                setSelectedWinner(null);
              }}
              selectedThemes={selectedThemes}
              onToggleTheme={(t) => {
                setSelectedThemes((prev) =>
                  prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
                );
                setSelectedWinner(null);
              }}
              selectedDietaries={selectedDietaries}
              onToggleDietary={(d) => {
                setSelectedDietaries((prev) =>
                  prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
                );
                setSelectedWinner(null);
              }}
              onResetFilters={() => {
                setSelectedPriceLevels([]);
                setSelectedCuisines([]);
                setSelectedThemes([]);
                setSelectedDietaries([]);
                setExcludeVisited(false);
                setSelectedWinner(null);
              }}
            />
          </div>

          {/* Center / Right Column: Roulette, Recommendations & Visual Map */}
          <div className="lg:col-span-8 space-y-6">
            {/* Loading / Error States for Places */}
            {isLoadingPlaces && (
              <div className="flex items-center gap-2 rounded-xl border border-orange-200 dark:border-orange-900/40 bg-orange-50 dark:bg-orange-950/20 p-3 text-xs text-orange-800 dark:text-orange-300">
                <RefreshCw className="h-4 w-4 animate-spin shrink-0 text-orange-600 dark:text-orange-400" />
                <span>
                  Explorando restaurantes en {zoneName} con OpenStreetMap...
                </span>
              </div>
            )}

            {placesError && (
              <div className="flex items-center gap-2 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/20 p-3 text-xs text-rose-800 dark:text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
                <span>{placesError}</span>
              </div>
            )}

            {/* Roulette Spinning Area */}
            <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white/90 dark:bg-[#181615]/90 p-6 shadow-sm transition-colors">
              <RouletteWheel
                candidates={eligibleCandidates}
                onSpin={handleSpinRoulette}
                isSpinning={isSpinning}
                selectedWinner={selectedWinner}
              />
            </div>

            {/* Selected Winner Destination Card */}
            {selectedWinner && !isSpinning && (
              <WinnerCard
                restaurant={selectedWinner}
                userLocation={currentLocation}
                onConfirmVisit={handleConfirmVisit}
                onSpinAgain={handleSpinRoulette}
                onBlacklist={handleBlacklist}
                isConfirming={false}
              />
            )}

            {/* Recommendations Section */}
            {recommendations.length > 0 && (
              <RecommendationsSection
                recommendations={recommendations}
                userLocation={currentLocation}
                onSelect={(restaurant) => setSelectedWinner(restaurant)}
              />
            )}

            {/* Interactive OpenStreetMap (Leaflet with click-to-center & theme-synced tiles) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 font-sans">
                  Mapa Interactivo ({eligibleCandidates.length} opciones en zona)
                </h3>
                <span className="text-[11px] text-orange-600 dark:text-orange-400 font-medium">
                  💡 Haz clic en el mapa para mover el centro
                </span>
              </div>
              <div className="h-[400px] w-full rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-sm">
                <LeafletMap
                  center={currentLocation}
                  restaurants={eligibleCandidates}
                  selectedRestaurant={selectedWinner}
                  onSelectRestaurant={(r) => setSelectedWinner(r)}
                  onMapClick={handleMapClick}
                  isDark={theme === "dark"}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Culinary Passport Modal */}
      <PassportModal
        isOpen={isPassportOpen}
        onClose={() => setIsPassportOpen(false)}
        points={points}
        level={level}
        badges={badges}
        visits={visits}
        blacklist={blacklist}
        onRemoveBlacklist={(id) => {
          const updated = blacklist.filter((b) => b.id !== id);
          setBlacklist(updated);
          saveUserData(points, visits, badges, updated);
        }}
        onClearVisits={() => {
          if (confirm("¿Seguro que deseas reiniciar tu historial de visitas?")) {
            setVisits([]);
            saveUserData(points, [], badges, blacklist);
          }
        }}
        authUser={authUser}
      />
    </div>
  );
}
