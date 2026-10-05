import { IPlacesProvider, SearchNearbyParams } from "./types";
import { PlaceRaw, PriceLevel } from "../types";
import { InvalidCoordinatesError } from "./errors";
import baDataJson from "../../data/ba_data_gastronomia.json";

export class BaDataPlacesProvider implements IPlacesProvider {
  private places: PlaceRaw[];

  constructor(customPlaces?: PlaceRaw[]) {
    if (customPlaces) {
      this.places = customPlaces;
    } else {
      this.places = (baDataJson as any[]).map((item) => ({
        externalId: String(item.externalId),
        name: String(item.name),
        location: {
          lat: Number(item.location.lat),
          lng: Number(item.location.lng),
        },
        address: item.address ? String(item.address) : undefined,
        tags: item.tags ? (item.tags as Record<string, string>) : undefined,
        rating: item.rating ? Number(item.rating) : undefined,
        priceLevel: (item.priceLevel ?? 2) as PriceLevel,
        zoneId: item.zoneId ? String(item.zoneId) : undefined,
      }));
    }
  }

  async loadAllPlaces(): Promise<PlaceRaw[]> {
    return [...this.places];
  }

  async getNotableBars(): Promise<PlaceRaw[]> {
    return this.places.filter((p) => p.tags?.heritage === "bar_notable");
  }

  async searchByZones(zoneIds: string[]): Promise<PlaceRaw[]> {
    if (!zoneIds || zoneIds.length === 0) {
      return this.places.slice(0, 40);
    }
    const zoneSet = new Set(zoneIds);
    return this.places.filter((p) => p.zoneId && zoneSet.has(p.zoneId));
  }

  private calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  async searchNearby(params: SearchNearbyParams): Promise<PlaceRaw[]> {
    const { lat, lng, radiusKm } = params;

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      throw new InvalidCoordinatesError(`Coordinates (${lat}, ${lng}) out of range`);
    }
    if (radiusKm <= 0) {
      throw new InvalidCoordinatesError(`Radius must be positive`);
    }

    const placesWithDistance = this.places.map((p) => ({
      place: p,
      dist: this.calculateDistanceKm(lat, lng, p.location.lat, p.location.lng),
    }));

    placesWithDistance.sort((a, b) => a.dist - b.dist);

    const withinRadius = placesWithDistance
      .filter((item) => item.dist <= radiusKm)
      .map((item) => item.place);

    if (withinRadius.length >= 6) {
      return withinRadius.slice(0, 40);
    }

    return placesWithDistance
      .slice(0, Math.min(25, this.places.length))
      .map((item) => item.place);
  }
}
