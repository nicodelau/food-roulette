import { describe, it, expect } from "vitest";
import { BaDataPlacesProvider } from "../badata-places-provider";
import { ClassifierService } from "../../classifier/classifier-service";

describe("BaDataPlacesProvider (Buenos Aires Open Data) - TDD", () => {
  const provider = new BaDataPlacesProvider();
  const classifier = new ClassifierService();

  it("should load hundreds of real verified establishments across all 15 CABA comunas", async () => {
    const places = await provider.loadAllPlaces();
    expect(places.length).toBeGreaterThan(200);

    // Verify all 15 CABA comunas have coverage
    const comunasFound = new Set(places.map((p) => p.zoneId));
    for (let c = 1; c <= 15; c++) {
      expect(comunasFound.has(`caba-${c}`)).toBe(true);
    }
  });

  it("should have valid coordinates within CABA boundaries for every loaded place", async () => {
    const places = await provider.loadAllPlaces();
    for (const place of places) {
      expect(place.location.lat).toBeLessThan(-34.5);
      expect(place.location.lat).toBeGreaterThan(-34.75);
      expect(place.location.lng).toBeLessThan(-58.35);
      expect(place.location.lng).toBeGreaterThan(-58.55);
      expect(place.name.trim().length).toBeGreaterThan(0);
      expect(place.address).toBeDefined();
    }
  });

  it("should identify official Bares Notables and assign heritage tag", async () => {
    const notables = await provider.getNotableBars();
    expect(notables.length).toBeGreaterThanOrEqual(50);

    const notableNames = notables.map((n) => n.name.toUpperCase());
    expect(
      notableNames.some((n) => n.includes("36 BILLARES") || n.includes("BILLARES"))
    ).toBe(true);
    expect(
      notableNames.some((n) => n.includes("FEDERAL") || n.includes("BRITANICO"))
    ).toBe(true);

    for (const notable of notables) {
      expect(notable.tags?.heritage).toBe("bar_notable");
    }
  });

  it("should filter places by specific CABA comunas using searchByZones", async () => {
    const places = await provider.searchByZones(["caba-1", "caba-14"]);
    expect(places.length).toBeGreaterThan(0);

    for (const place of places) {
      expect(["caba-1", "caba-14"]).toContain(place.zoneId);
    }

    const comuna1Count = places.filter((p) => p.zoneId === "caba-1").length;
    const comuna14Count = places.filter((p) => p.zoneId === "caba-14").length;
    expect(comuna1Count).toBeGreaterThan(0);
    expect(comuna14Count).toBeGreaterThan(0);
  });

  it("should support proximity search with searchNearby", async () => {
    // Search near Obelisco / Centro
    const places = await provider.searchNearby({
      lat: -34.6042,
      lng: -58.3862,
      radiusKm: 1.5,
    });

    expect(places.length).toBeGreaterThan(0);
    expect(places.length).toBeLessThanOrEqual(40);
  });

  it("should classify BaData places into valid ClassifiedRestaurants with price levels and themes", async () => {
    const notables = await provider.getNotableBars();
    const sample = notables[0];

    const classified = classifier.classify(sample);
    expect(classified.id).toBeTruthy();
    expect(classified.priceLevel).toBeGreaterThanOrEqual(1);
    expect(classified.priceLevel).toBeLessThanOrEqual(3);
    expect(classified.cuisines.length).toBeGreaterThan(0);
    expect(classified.themes.length).toBeGreaterThan(0);
  });
});
