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
      priceLevel: 1,
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
      priceLevel: 3,
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
      priceLevel: 2,
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
      priceLevel: 1,
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

  it("should filter by selectedPriceLevels (e.g. only level 1: Económico)", () => {
    const result = engine.spin({
      pool: mockRestaurants,
      userLocation: { lat: -34.604, lng: -58.386 },
      radiusKm: 2.0,
      selectedPriceLevels: [1],
    });

    // In 2km: rest-1 (level 1), rest-2 (level 3), rest-3 (level 2). Only rest-1 matches.
    expect(result.totalEligibleCandidates).toBe(1);
    expect(result.selectedRestaurant.id).toBe("rest-1");
  });

  it("should filter by multiple selectedPriceLevels (e.g. [2, 3])", () => {
    const result = engine.spin({
      pool: mockRestaurants,
      userLocation: { lat: -34.604, lng: -58.386 },
      radiusKm: 2.0,
      selectedPriceLevels: [2, 3],
    });

    // In 2km: rest-2 (level 3) and rest-3 (level 2) match.
    expect(result.totalEligibleCandidates).toBe(2);
    const candidateIds = result.eligibleCandidates.map((r) => r.id);
    expect(candidateIds).toContain("rest-2");
    expect(candidateIds).toContain("rest-3");
    expect(candidateIds).not.toContain("rest-1");
  });

  it("should filter by multiple selectedZoneIds (e.g. Comuna 14 + Vicente López)", () => {
    const multiZonePool: ClassifiedRestaurant[] = [
      {
        id: "rest-caba-1",
        externalId: "ext-c1",
        name: "Güerrin Centro",
        location: { lat: -34.6042, lng: -58.3862 },
        address: "Av. Corrientes 1368",
        cuisines: ["Italiana"],
        themes: ["Pizzería"],
        dietarySuitability: ["VEGETARIAN"],
        priceLevel: 1,
        zoneId: "caba-1",
      },
      {
        id: "rest-caba-14",
        externalId: "ext-c14",
        name: "Don Julio Palermo",
        location: { lat: -34.5888, lng: -58.4239 },
        address: "Guatemala 4699",
        cuisines: ["Argentina"],
        themes: ["Parrilla / Asador"],
        dietarySuitability: [],
        priceLevel: 3,
        zoneId: "caba-14",
      },
      {
        id: "rest-amba-vlopez",
        externalId: "ext-nvl",
        name: "Cut Parrilla Olivos",
        location: { lat: -34.512, lng: -58.482 },
        address: "Av. Libertador 2418, Olivos",
        cuisines: ["Argentina"],
        themes: ["Parrilla / Asador"],
        dietarySuitability: ["CELIAC"],
        priceLevel: 2,
        zoneId: "amba-vicente-lopez",
      },
      {
        id: "rest-amba-moron",
        externalId: "ext-moron",
        name: "Don Battaglia Castelar",
        location: { lat: -34.653, lng: -58.62 },
        address: "Carlos Casares 948, Castelar",
        cuisines: ["Italiana"],
        themes: ["Bodegón"],
        dietarySuitability: [],
        priceLevel: 2,
        zoneId: "amba-moron-castelar",
      },
      {
        id: "rest-pba-laplata",
        externalId: "ext-laplata",
        name: "Baxar Mercado La Plata",
        location: { lat: -34.921, lng: -57.954 },
        address: "Calle 51, La Plata",
        cuisines: ["Variada"],
        themes: ["Casual"],
        dietarySuitability: ["VEGAN"],
        priceLevel: 2,
        zoneId: "pba-la-plata",
      },
    ];

    const result = engine.spin({
      pool: multiZonePool,
      userLocation: { lat: -34.5888, lng: -58.4239 },
      radiusKm: 20.0,
      selectedZoneIds: ["caba-14", "amba-vicente-lopez"],
    });

    expect(result.totalEligibleCandidates).toBe(2);
    const ids = result.eligibleCandidates.map((r) => r.id);
    expect(ids).toContain("rest-caba-14");
    expect(ids).toContain("rest-amba-vlopez");
    expect(ids).not.toContain("rest-caba-1");
    expect(ids).not.toContain("rest-amba-moron");
    expect(ids).not.toContain("rest-pba-laplata");
  });

  it("should combine selectedZoneIds with priceLevel and dietary restrictions", () => {
    const multiZonePool: ClassifiedRestaurant[] = [
      {
        id: "rest-caba-14-expensive",
        externalId: "ext-1",
        name: "Lujo Palermo",
        location: { lat: -34.5888, lng: -58.4239 },
        address: "Palermo",
        cuisines: ["Argentina"],
        themes: ["Parrilla / Asador"],
        dietarySuitability: ["CELIAC"],
        priceLevel: 3,
        zoneId: "caba-14",
      },
      {
        id: "rest-caba-14-cheap",
        externalId: "ext-2",
        name: "Panchería Palermo",
        location: { lat: -34.5888, lng: -58.4239 },
        address: "Palermo",
        cuisines: ["Americana / Burgers"],
        themes: ["Casual"],
        dietarySuitability: [],
        priceLevel: 1,
        zoneId: "caba-14",
      },
      {
        id: "rest-amba-vlopez-medium",
        externalId: "ext-3",
        name: "Bistro Olivos",
        location: { lat: -34.512, lng: -58.482 },
        address: "Olivos",
        cuisines: ["Argentina"],
        themes: ["Romántico / De Autor"],
        dietarySuitability: ["CELIAC"],
        priceLevel: 2,
        zoneId: "amba-vicente-lopez",
      },
    ];

    // Select caba-14 + amba-vicente-lopez, priceLevel: 2 or 3, dietary: CELIAC
    const result = engine.spin({
      pool: multiZonePool,
      userLocation: { lat: -34.5888, lng: -58.4239 },
      radiusKm: 20.0,
      selectedZoneIds: ["caba-14", "amba-vicente-lopez"],
      selectedPriceLevels: [2, 3],
      requiredDietary: ["CELIAC"],
    });

    expect(result.totalEligibleCandidates).toBe(2);
    const ids = result.eligibleCandidates.map((r) => r.id);
    expect(ids).toContain("rest-caba-14-expensive");
    expect(ids).toContain("rest-amba-vlopez-medium");
    expect(ids).not.toContain("rest-caba-14-cheap");
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


