import { IPlacesProvider, SearchNearbyParams } from "./types";
import { PlaceRaw } from "../types";
import { InvalidCoordinatesError } from "./errors";

export class MockPlacesProvider implements IPlacesProvider {
  private places: PlaceRaw[] = [
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
  ];

  async searchNearby(params: SearchNearbyParams): Promise<PlaceRaw[]> {
    if (params.lat < -90 || params.lat > 90 || params.lng < -180 || params.lng > 180) {
      throw new InvalidCoordinatesError(`Coordinates (${params.lat}, ${params.lng}) are out of range`);
    }
    if (params.radiusKm <= 0) {
      throw new InvalidCoordinatesError(`Radius must be positive, got ${params.radiusKm}`);
    }

    return [...this.places];
  }
}
