import { describe, it, expect } from "vitest";
import { RecommendationEngine } from "../recommendation-engine";
import { ClassifiedRestaurant } from "../../types";

describe("RecommendationEngine - TDD", () => {
  const engine = new RecommendationEngine();

  const mockCandidates: ClassifiedRestaurant[] = [
    {
      id: "it-1",
      externalId: "ext-it-1",
      name: "Trattoria Della Nonna",
      location: { lat: -34.588, lng: -58.43 },
      address: "Palermo",
      cuisines: ["Italiana"],
      themes: ["Pizzería"],
      dietarySuitability: ["VEGETARIAN"],
      rating: 4.8,
    },
    {
      id: "it-2",
      externalId: "ext-it-2",
      name: "Pasta & Basta",
      location: { lat: -34.589, lng: -58.431 },
      address: "Palermo",
      cuisines: ["Italiana"],
      themes: ["Casual"],
      dietarySuitability: ["CELIAC"],
      rating: 4.5,
    },
    {
      id: "jp-1",
      externalId: "ext-jp-1",
      name: "Sushi Lounge",
      location: { lat: -34.587, lng: -58.429 },
      address: "Palermo",
      cuisines: ["Japonesa / Sushi"],
      themes: ["Romántico / De Autor"],
      dietarySuitability: [],
      rating: 4.6,
    },
    {
      id: "ar-1",
      externalId: "ext-ar-1",
      name: "Parrilla El Asador",
      location: { lat: -34.586, lng: -58.428 },
      address: "Palermo",
      cuisines: ["Argentina"],
      themes: ["Parrilla / Asador"],
      dietarySuitability: [],
      rating: 4.2,
    },
  ];

  it("should prioritize restaurants matching the user's most visited cuisines", () => {
    // User has 5 Italian visits and 1 Japanese visit
    const visitedCuisinesCount = {
      Italiana: 5,
      "Japonesa / Sushi": 1,
    };

    const recommendations = engine.getRecommendations({
      pool: mockCandidates,
      visitedCuisinesCount,
      visitedRestaurantIds: new Set<string>(),
      userLocation: { lat: -34.588, lng: -58.43 },
      limit: 3,
    });

    expect(recommendations.length).toBe(3);
    // Italian restaurants should be at the top due to higher affinity
    expect(recommendations[0].cuisines).toContain("Italiana");
    expect(recommendations[1].cuisines).toContain("Italiana");
  });

  it("should exclude restaurants the user has already visited", () => {
    const visitedCuisinesCount = {
      Italiana: 4,
    };
    const visitedRestaurantIds = new Set(["it-1"]); // it-1 already visited

    const recommendations = engine.getRecommendations({
      pool: mockCandidates,
      visitedCuisinesCount,
      visitedRestaurantIds,
      userLocation: { lat: -34.588, lng: -58.43 },
    });

    const ids = recommendations.map((r) => r.id);
    expect(ids).not.toContain("it-1");
    expect(ids).toContain("it-2");
  });

  it("should filter recommendations strictly according to required dietary restrictions", () => {
    const recommendations = engine.getRecommendations({
      pool: mockCandidates,
      visitedCuisinesCount: { Italiana: 3 },
      visitedRestaurantIds: new Set<string>(),
      requiredDietary: ["CELIAC"],
      userLocation: { lat: -34.588, lng: -58.43 },
    });

    // Only it-2 supports CELIAC
    expect(recommendations.length).toBe(1);
    expect(recommendations[0].id).toBe("it-2");
  });

  it("should provide top-rated recommendations when user has no prior visit history", () => {
    const recommendations = engine.getRecommendations({
      pool: mockCandidates,
      visitedCuisinesCount: {},
      visitedRestaurantIds: new Set<string>(),
      userLocation: { lat: -34.588, lng: -58.43 },
      limit: 2,
    });

    expect(recommendations.length).toBe(2);
    // Best rated are it-1 (4.8) and jp-1 (4.6)
    expect(recommendations[0].id).toBe("it-1");
    expect(recommendations[1].id).toBe("jp-1");
  });
});
