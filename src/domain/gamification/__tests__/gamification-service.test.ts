import { describe, it, expect } from "vitest";
import { GamificationService } from "../gamification-service";
import { DuplicateVisitError } from "../errors";
import { ClassifiedRestaurant } from "../../types";

describe("GamificationService - TDD", () => {
  const service = new GamificationService();

  const mockRestaurantItalian: ClassifiedRestaurant = {
    id: "rest-it",
    externalId: "ext-it",
    name: "Trattoria Romana",
    location: { lat: -34.58, lng: -58.42 },
    address: "Palermo",
    cuisines: ["Italiana"],
    themes: ["Casual"],
    dietarySuitability: [],
  };

  const mockRestaurantJapanese: ClassifiedRestaurant = {
    id: "rest-jp",
    externalId: "ext-jp",
    name: "Sushi Master",
    location: { lat: -34.58, lng: -58.42 },
    address: "Palermo",
    cuisines: ["Japonesa / Sushi"],
    themes: ["Romántico / De Autor"],
    dietarySuitability: [],
  };

  it("should award base points (+20) on standard visit confirmation", () => {
    const previousVisits = [
      {
        restaurantId: "other-id",
        cuisines: ["Italiana"],
        visitedAt: new Date(Date.now() - 86400000), // 1 day ago
      },
    ];

    const result = service.processVisit({
      restaurant: mockRestaurantItalian,
      currentPoints: 40,
      previousVisits,
    });

    expect(result.pointsEarned).toBe(20);
    expect(result.newTotalPoints).toBe(60);
    expect(result.isNewCuisineExplored).toBe(false);
  });

  it("should award exploration bonus (+50) when discovering a new cuisine", () => {
    const previousVisits = [
      {
        restaurantId: "other-id",
        cuisines: ["Italiana"],
        visitedAt: new Date(Date.now() - 86400000),
      },
    ];

    // User visits Japanese for the first time
    const result = service.processVisit({
      restaurant: mockRestaurantJapanese,
      currentPoints: 20,
      previousVisits,
    });

    expect(result.pointsEarned).toBe(70); // 20 base + 50 bonus
    expect(result.newTotalPoints).toBe(90);
    expect(result.isNewCuisineExplored).toBe(true);
    expect(result.exploredCuisineName).toBe("Japonesa / Sushi");
  });

  it("should unlock 'Primer Giro' badge on the first visit", () => {
    const result = service.processVisit({
      restaurant: mockRestaurantItalian,
      currentPoints: 0,
      previousVisits: [],
    });

    const badgeIds = result.unlockedBadges.map((b) => b.id);
    expect(badgeIds).toContain("FIRST_BITE");
  });

  it("should calculate correct user levels based on points", () => {
    expect(service.calculateLevel(50).name).toBe("Novato Gastronómico");
    expect(service.calculateLevel(150).name).toBe("Comensal Curioso");
    expect(service.calculateLevel(300).name).toBe("Gourmet Aventurero");
    expect(service.calculateLevel(600).name).toBe("Maestro Culinario");
  });

  it("should reject duplicate check-in at the same place within 2 hours", () => {
    const recentVisit = [
      {
        restaurantId: "rest-it",
        cuisines: ["Italiana"],
        visitedAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      },
    ];

    expect(() =>
      service.processVisit({
        restaurant: mockRestaurantItalian,
        currentPoints: 50,
        previousVisits: recentVisit,
      })
    ).toThrow(DuplicateVisitError);
  });
});
