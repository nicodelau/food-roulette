import { Coordinates, PlaceRaw } from "../types";

export interface SearchNearbyParams {
  lat: number;
  lng: number;
  radiusKm: number;
}

export interface IPlacesProvider {
  searchNearby(params: SearchNearbyParams): Promise<PlaceRaw[]>;
}
