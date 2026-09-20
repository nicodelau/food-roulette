export interface Coordinates {
  lat: number;
  lng: number;
}

export type PriceLevel = 1 | 2 | 3;

export interface PriceTierInfo {
  level: PriceLevel;
  symbol: string;
  name: string;
  costRange: string;
}

export const PRICE_TIERS: Record<PriceLevel, PriceTierInfo> = {
  1: {
    level: 1,
    symbol: "$",
    name: "Económico",
    costRange: "Hasta $10.000 / persona",
  },
  2: {
    level: 2,
    symbol: "$$",
    name: "Medio",
    costRange: "$10.000 a $25.000 / persona",
  },
  3: {
    level: 3,
    symbol: "$$$",
    name: "Premium",
    costRange: "Más de $25.000 / persona",
  },
};

export interface PlaceRaw {
  externalId: string;
  name: string;
  location: Coordinates;
  address?: string;
  tags?: Record<string, string>;
  rating?: number;
  priceLevel?: PriceLevel;
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
  priceLevel: PriceLevel;
  rating?: number;
}

export interface RouletteFilterOptions {
  userLocation: Coordinates;
  radiusKm: number;
  selectedCuisines?: string[];
  selectedThemes?: string[];
  selectedPriceLevels?: PriceLevel[];
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
