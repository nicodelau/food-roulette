export interface Coordinates {
  lat: number;
  lng: number;
}

export interface PlaceRaw {
  externalId: string;
  name: string;
  location: Coordinates;
  address?: string;
  tags?: Record<string, string>;
  rating?: number;
}

export type DietaryRestriction =
  | "CELIAC"
  | "VEGAN"
  | "VEGETARIAN"
  | "KOSHER"
  | "HALAL"
  | "LACTOSE_FREE";

export interface ClassifiedRestaurant {
  id: string;
  externalId: string;
  name: string;
  location: Coordinates;
  address: string;
  cuisines: string[];
  themes: string[];
  dietarySuitability: DietaryRestriction[];
  rating?: number;
}

export interface RouletteFilterOptions {
  userLocation: Coordinates;
  radiusKm: number;
  selectedCuisines?: string[];
  selectedThemes?: string[];
  requiredDietary?: DietaryRestriction[];
  excludeVisited?: boolean;
  visitedIds?: string[];
  blacklistedIds?: string[];
}

export interface RouletteResult {
  selectedRestaurant: ClassifiedRestaurant;
  totalEligibleCandidates: number;
  eligibleCandidates: ClassifiedRestaurant[];
}
