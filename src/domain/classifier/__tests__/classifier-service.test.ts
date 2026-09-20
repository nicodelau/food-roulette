import { describe, it, expect } from "vitest";
import { ClassifierService } from "../classifier-service";
import { PlaceRaw } from "../../types";

describe("ClassifierService - TDD", () => {
  const classifier = new ClassifierService();

  it("should classify cuisines and themes from OSM tags", () => {
    const rawPlace: PlaceRaw = {
      externalId: "test-1",
      name: "Trattoria La Nonna",
      location: { lat: -34.58, lng: -58.42 },
      tags: {
        amenity: "restaurant",
        cuisine: "italian;pizza;pasta",
      },
    };

    const classified = classifier.classify(rawPlace);

    expect(classified.cuisines).toContain("Italiana");
    expect(classified.themes).toContain("Pizzería");
    expect(classified.id).toBe("test-1");
  });

  it("should detect Argentinian parrilla and bodegón from tags and name keywords", () => {
    const rawPlace: PlaceRaw = {
      externalId: "test-2",
      name: "El Viejo Bodegón Parrilla",
      location: { lat: -34.6, lng: -58.4 },
      tags: {
        amenity: "restaurant",
        cuisine: "parrilla;steak_house",
      },
    };

    const classified = classifier.classify(rawPlace);

    expect(classified.cuisines).toContain("Argentina");
    expect(classified.themes).toContain("Parrilla / Asador");
    expect(classified.themes).toContain("Bodegón");
  });

  it("should detect dietary suitability (celiac/sin TACC, vegan, vegetarian)", () => {
    const rawPlace: PlaceRaw = {
      externalId: "test-3",
      name: "Green Garden Plant Based",
      location: { lat: -34.58, lng: -58.43 },
      tags: {
        amenity: "restaurant",
        cuisine: "vegan;healthy",
        "diet:vegan": "yes",
        "diet:vegetarian": "yes",
        "diet:gluten_free": "yes",
      },
    };

    const classified = classifier.classify(rawPlace);

    expect(classified.dietarySuitability).toContain("VEGAN");
    expect(classified.dietarySuitability).toContain("VEGETARIAN");
    expect(classified.dietarySuitability).toContain("CELIAC");
  });

  it("should infer cuisine and theme from restaurant name when tags are minimal", () => {
    const rawPlace: PlaceRaw = {
      externalId: "test-4",
      name: "Sarkis Cocina Armenia",
      location: { lat: -34.59, lng: -58.43 },
      tags: {
        amenity: "restaurant",
      },
    };

    const classified = classifier.classify(rawPlace);

    expect(classified.cuisines).toContain("Armenia / Medio Oriente");
  });

  it("should provide default 'Variada' and 'Casual' when no category matches", () => {
    const rawPlace: PlaceRaw = {
      externalId: "test-5",
      name: "El Rinconcito Desconocido",
      location: { lat: -34.59, lng: -58.43 },
      tags: {
        amenity: "restaurant",
      },
    };

    const classified = classifier.classify(rawPlace);

    expect(classified.cuisines).toContain("Variada");
    expect(classified.themes).toContain("Casual");
    expect(classified.dietarySuitability).toEqual([]);
    expect(classified.priceLevel).toBe(2);
  });

  it("should infer priceLevel 1 for economic / fast food / street food places", () => {
    const rawPlace: PlaceRaw = {
      externalId: "test-eco",
      name: "Burgers & Empanadas Al Paso",
      location: { lat: -34.59, lng: -58.43 },
      tags: {
        amenity: "fast_food",
        cuisine: "burger",
      },
    };

    const classified = classifier.classify(rawPlace);
    expect(classified.priceLevel).toBe(1);
  });

  it("should infer priceLevel 3 for gourmet / fine dining / omakase places", () => {
    const rawPlace: PlaceRaw = {
      externalId: "test-gourmet",
      name: "Aramburu Restaurante de Autor",
      location: { lat: -34.61, lng: -58.38 },
      tags: {
        amenity: "restaurant",
        cuisine: "fine_dining",
      },
    };

    const classified = classifier.classify(rawPlace);
    expect(classified.priceLevel).toBe(3);
  });

  it("should preserve explicit priceLevel if provided on PlaceRaw", () => {
    const rawPlace: PlaceRaw = {
      externalId: "test-explicit",
      name: "Bodegón Don Carlos",
      location: { lat: -34.61, lng: -58.38 },
      priceLevel: 1,
    };

    const classified = classifier.classify(rawPlace);
    expect(classified.priceLevel).toBe(1);
  });
});

