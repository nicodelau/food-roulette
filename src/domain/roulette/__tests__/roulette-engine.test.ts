import { describe, it, expect } from "vitest";
import { RouletteEngine } from "../roulette-engine";
import { ClassifiedRestaurant } from "../../types";
import { NoEligibleRestaurantsError } from "../errors";

describe("RouletteEngine - TDD", () => {
  const engine = new RouletteEngine();

  const mockRestaurants: ClassifiedRestaurant[] = [
    {
      id: "rest-1",
      externalId: "ext-1",
      name: "La Pizzería de Güerrin",
      location: { lat: -34.6042, lng: -58.3862 }, // Obelisco
      address: "Av. Corrientes 1368",
      cuisines: ["Italiana", "Argentina"],
      themes: ["Pizzería"],
      dietarySuitability: ["VEGETARIAN"],
      rating: 4.8,
    },
    {
      id: "rest-2",
      externalId: "ext-2",
      name: "Senza Glutine Ristorante",
      location: { lat: -34.605, lng: -58.387 },
      address: "Talcahuano 450",
      cuisines: ["Italiana"],
      themes: ["Romántico / De Autor"],
      dietarySuitability: ["CELIAC", "VEGETARIAN"],
      rating: 4.5,
    },
    {
      id: "rest-3",
      externalId: "ext-3",
      name: "Parrilla Los Amigos",
      location: { lat: -34.606, lng: -58.385 },
      address: "Lavalle 800",
      cuisines: ["Argentina"],
      themes: ["Parrilla / Asador", "Bodegón"],
      dietarySuitability: [],
      rating: 4.2,
    },
    {
      id: "rest-4",
      externalId: "ext-4",
      name: "Far Away Bistro",
      location: { lat: -34.75, lng: -58.55 }, // ~22 km away
      address: "Ruta 3",
      cuisines: ["Variada"],
      themes: ["Casual"],
      dietarySuitability: ["CELIAC", "VEGAN"],
      rating: 4.0,
    },
  ];

  it("should filter restaurants by radiusKm using Haversine distance", () => {
    const result = engine.spin({
      pool: mockRestaurants,
      userLocation: { lat: -34.604, lng: -58.386 },
      radiusKm: 2.0, // Within 2km: rest-1, rest-2, rest-3. rest-4 is ~22km away!
    });

    expect(result.totalEligibleCandidates).toBe(3);
    const candidateIds = result.eligibleCandidates.map((r) => r.id);
    expect(candidateIds).toContain("rest-1");
    expect(candidateIds).toContain("rest-2");
    expect(candidateIds).toContain("rest-3");
    expect(candidateIds).not.toContain("rest-4");
  });

  it("should exclude previously visited restaurants when excludeVisited is true", () => {
    const result = engine.spin({
      pool: mockRestaurants,
      userLocation: { lat: -34.604, lng: -58.386 },
      radiusKm: 2.0,
      excludeVisited: true,
      visitedIds: ["rest-1"], // rest-1 visited previously
    });

    expect(result.totalEligibleCandidates).toBe(2);
    const candidateIds = result.eligibleCandidates.map((r) => r.id);
    expect(candidateIds).not.toContain("rest-1");
    expect(candidateIds).toContain("rest-2");
    expect(candidateIds).toContain("rest-3");
  });

  it("should exclude blacklisted restaurants", () => {
    const result = engine.spin({
      pool: mockRestaurants,
      userLocation: { lat: -34.604, lng: -58.386 },
      radiusKm: 2.0,
      blacklistedIds: ["rest-3"],
    });

    expect(result.totalEligibleCandidates).toBe(2);
    const candidateIds = result.eligibleCandidates.map((r) => r.id);
    expect(candidateIds).not.toContain("rest-3");
  });

  it("should filter by dietary restrictions strictly (e.g. CELIAC)", () => {
    const result = engine.spin({
      pool: mockRestaurants,
      userLocation: { lat: -34.604, lng: -58.386 },
      radiusKm: 2.0,
      requiredDietary: ["CELIAC"],
    });

    // Only rest-2 is within 2km and has CELIAC
    expect(result.totalEligibleCandidates).toBe(1);
    expect(result.selectedRestaurant.id).toBe("rest-2");
  });

  it("should filter by selected cuisines and themes", () => {
    const result = engine.spin({
      pool: mockRestaurants,
      userLocation: { lat: -34.604, lng: -58.386 },
      radiusKm: 2.0,
      selectedCuisines: ["Argentina"],
      selectedThemes: ["Bodegón"],
    });

    expect(result.totalEligibleCandidates).toBe(1);
    expect(result.selectedRestaurant.id).toBe("rest-3");
  });

  it("should throw NoEligibleRestaurantsError when all candidates are filtered out", () => {
    expect(() =>
      engine.spin({
        pool: mockRestaurants,
        userLocation: { lat: -34.604, lng: -58.386 },
        radiusKm: 2.0,
        requiredDietary: ["CELIAC"],
        visitedIds: ["rest-2"],
        excludeVisited: true, // Only celiac restaurant is excluded because visited
      })
    ).toThrow(NoEligibleRestaurantsError);
  });
});
