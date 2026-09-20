import { IPlacesProvider, SearchNearbyParams } from "./types";
import { PlaceRaw } from "../types";
import { InvalidCoordinatesError } from "./errors";

export class MockPlacesProvider implements IPlacesProvider {
  private places: PlaceRaw[] = [
    // Comuna 1: San Telmo / Montserrat / Centro
    {
      externalId: "mock-1",
      name: "La Brigada Parrilla",
      location: { lat: -34.6186, lng: -58.3712 },
      address: "Estados Unidos 465, San Telmo",
      tags: {
        cuisine: "argentinian;parrilla;steakhouse",
        amenity: "restaurant",
        "diet:gluten_free": "yes",
      },
      rating: 4.6,
    },
    {
      externalId: "mock-8",
      name: "El Obrero Bodegón",
      location: { lat: -34.6341, lng: -58.3615 },
      address: "Agustín R. Caffarena 64, La Boca",
      tags: {
        cuisine: "argentinian;bodegon",
        amenity: "restaurant",
      },
      rating: 4.5,
    },
    {
      externalId: "mock-9",
      name: "Pizzería Güerrin",
      location: { lat: -34.6042, lng: -58.3862 },
      address: "Av. Corrientes 1368, Centro",
      tags: {
        cuisine: "italian;pizza",
        amenity: "restaurant",
        "diet:vegetarian": "yes",
      },
      rating: 4.8,
    },
    // Comuna 2: Recoleta
    {
      externalId: "mock-10",
      name: "Fervor Brasas",
      location: { lat: -34.5891, lng: -58.3892 },
      address: "Posadas 1519, Recoleta",
      tags: {
        cuisine: "argentinian;parrilla;steakhouse",
        amenity: "restaurant",
      },
      rating: 4.7,
    },
    // Comuna 5: Almagro / Boedo
    {
      externalId: "mock-11",
      name: "Las Violetas Confitería",
      location: { lat: -34.6184, lng: -58.4214 },
      address: "Av. Rivadavia 3899, Almagro",
      tags: {
        cuisine: "cafe;bakery;pasteleria",
        amenity: "cafe",
        "diet:vegetarian": "yes",
      },
      rating: 4.6,
    },
    // Comuna 6: Caballito
    {
      externalId: "mock-12",
      name: "El Boliche de Darío",
      location: { lat: -34.6212, lng: -58.4451 },
      address: "Av. Coronel Díaz y Caballito",
      tags: {
        cuisine: "argentinian;parrilla;bodegon",
        amenity: "restaurant",
      },
      rating: 4.4,
    },
    // Comuna 13: Belgrano / Colegiales
    {
      externalId: "mock-13",
      name: "Hong Kong Style",
      location: { lat: -34.5582, lng: -58.4553 },
      address: "Montañeses 2149, Barrio Chino",
      tags: {
        cuisine: "chinese;asian;dim_sum",
        amenity: "restaurant",
        "diet:vegan": "yes",
      },
      rating: 4.5,
    },
    // Comuna 14: Palermo
    {
      externalId: "mock-3",
      name: "Cucina Paradiso Senza Glutine",
      location: { lat: -34.5772, lng: -58.4377 },
      address: "Arévalo 1538, Palermo",
      tags: {
        cuisine: "italian;pasta;pizza",
        amenity: "restaurant",
        "diet:gluten_free": "only",
        "diet:celiac": "yes",
      },
      rating: 4.7,
    },
    {
      externalId: "mock-4",
      name: "Osaka Nikkei",
      location: { lat: -34.5841, lng: -58.4239 },
      address: "Soler 5608, Palermo Hollywood",
      tags: {
        cuisine: "japanese;peruvian;sushi;fusion",
        amenity: "restaurant",
      },
      rating: 4.9,
    },
    {
      externalId: "mock-5",
      name: "El Preferido de Palermo",
      location: { lat: -34.5885, lng: -58.4306 },
      address: "Jorge Luis Borges 2108, Palermo Soho",
      tags: {
        cuisine: "argentinian;bodegon;traditional",
        amenity: "restaurant",
      },
      rating: 4.7,
    },
    {
      externalId: "mock-6",
      name: "Taco Box",
      location: { lat: -34.5823, lng: -58.4351 },
      address: "Soler 5598, Palermo",
      tags: {
        cuisine: "mexican;tex-mex;tacos",
        amenity: "restaurant",
        "diet:vegetarian": "yes",
      },
      rating: 4.2,
    },
    {
      externalId: "mock-7",
      name: "Antares Craft Beer & Burgers",
      location: { lat: -34.5898, lng: -58.4291 },
      address: "Armenia 1447, Palermo",
      tags: {
        cuisine: "burger;bar_food",
        amenity: "pub",
        brewery: "yes",
      },
      rating: 4.3,
    },
    // Comuna 15: Villa Crespo / Chacarita
    {
      externalId: "mock-2",
      name: "Sarkis Cocina Armenia",
      location: { lat: -34.5905, lng: -58.4382 },
      address: "Thames 1101, Villa Crespo",
      tags: {
        cuisine: "armenian;middle_eastern",
        amenity: "restaurant",
        "diet:vegetarian": "yes",
        "diet:vegan": "yes",
      },
      rating: 4.8,
    },
    {
      externalId: "mock-14",
      name: "Donnet Hongos & Plant Based",
      location: { lat: -34.5861, lng: -58.4472 },
      address: "Av. Jorge Newbery 4081, Chacarita",
      tags: {
        cuisine: "vegan;organic;healthy",
        amenity: "restaurant",
        "diet:vegan": "only",
        "diet:vegetarian": "yes",
      },
      rating: 4.6,
    },
  ];

  async searchNearby(params: SearchNearbyParams): Promise<PlaceRaw[]> {
    if (params.lat < -90 || params.lat > 90 || params.lng < -180 || params.lng > 180) {
      throw new InvalidCoordinatesError(
        `Coordinates (${params.lat}, ${params.lng}) are out of range`
      );
    }
    if (params.radiusKm <= 0) {
      throw new InvalidCoordinatesError(
        `Radius must be positive, got ${params.radiusKm}`
      );
    }

    // Return places, sorting closest first
    const toRad = (d: number) => (d * Math.PI) / 180;
    const sorted = [...this.places].sort((a, b) => {
      const distA =
        Math.hypot(a.location.lat - params.lat, a.location.lng - params.lng);
      const distB =
        Math.hypot(b.location.lat - params.lat, b.location.lng - params.lng);
      return distA - distB;
    });

    return sorted;
  }
}
