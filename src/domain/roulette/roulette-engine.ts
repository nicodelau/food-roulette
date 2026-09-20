import {
  ClassifiedRestaurant,
  Coordinates,
  DietaryRestriction,
  PriceLevel,
  RouletteResult,
} from "../types";
import { NoEligibleRestaurantsError } from "./errors";

export interface SpinParams {
  pool: ClassifiedRestaurant[];
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

export class RouletteEngine {
  /**
   * Calcula la distancia en kilómetros entre dos coordenadas usando la fórmula de Haversine.
   */
  calculateDistanceKm(from: Coordinates, to: Coordinates): number {
    const EARTH_RADIUS_KM = 6371;
    const toRad = (deg: number) => (deg * Math.PI) / 180;

    const dLat = toRad(to.lat - from.lat);
    const dLng = toRad(to.lng - from.lng);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(from.lat)) *
        Math.cos(toRad(to.lat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return EARTH_RADIUS_KM * c;
  }

  /**
   * Filtra el pool de restaurantes disponibles aplicando radio, exclusiones y restricciones,
   * y selecciona aleatoriamente un ganador.
   */
  spin(params: SpinParams): RouletteResult {
    const {
      pool,
      userLocation,
      radiusKm,
      selectedCuisines = [],
      selectedThemes = [],
      selectedPriceLevels = [],
      requiredDietary = [],
      excludeVisited = false,
      visitedIds = [],
      blacklistedIds = [],
    } = params;

    const visitedSet = new Set(visitedIds);
    const blacklistSet = new Set(blacklistedIds);

    const eligibleCandidates = pool.filter((restaurant) => {
      // 1. Filtro de lista negra
      if (blacklistSet.has(restaurant.id) || blacklistSet.has(restaurant.externalId)) {
        return false;
      }

      // 2. Filtro de exclusión de visitados
      if (
        excludeVisited &&
        (visitedSet.has(restaurant.id) || visitedSet.has(restaurant.externalId))
      ) {
        return false;
      }

      // 3. Filtro geográfico por radio
      const distance = this.calculateDistanceKm(userLocation, restaurant.location);
      if (distance > radiusKm) {
        return false;
      }

      // 4. Filtro de restricciones dietarias (debe cumplir con todas las requeridas)
      if (requiredDietary.length > 0) {
        const meetsAllDietary = requiredDietary.every((diet) =>
          restaurant.dietarySuitability.includes(diet)
        );
        if (!meetsAllDietary) {
          return false;
        }
      }

      // 5. Filtro de tipo de cocina (si se seleccionó alguna, debe coincidir al menos con una)
      if (selectedCuisines.length > 0) {
        const matchesCuisine = selectedCuisines.some((cuisine) =>
          restaurant.cuisines.includes(cuisine)
        );
        if (!matchesCuisine) {
          return false;
        }
      }

      // 6. Filtro temático (si se seleccionó alguna, debe coincidir al menos con una)
      if (selectedThemes.length > 0) {
        const matchesTheme = selectedThemes.some((theme) =>
          restaurant.themes.includes(theme)
        );
        if (!matchesTheme) {
          return false;
        }
      }

      // 7. Filtro de rango de precio (si se seleccionó alguno, debe coincidir con el nivel)
      if (selectedPriceLevels.length > 0) {
        if (!selectedPriceLevels.includes(restaurant.priceLevel)) {
          return false;
        }
      }

      return true;
    });

    if (eligibleCandidates.length === 0) {
      throw new NoEligibleRestaurantsError(
        "No se encontraron restaurantes que cumplan con todos los filtros y exclusiones en la zona indicada. Prueba ampliando el radio o relajando los filtros."
      );
    }

    // Selección aleatoria
    const randomIndex = Math.floor(Math.random() * eligibleCandidates.length);
    const selectedRestaurant = eligibleCandidates[randomIndex];

    return {
      selectedRestaurant,
      totalEligibleCandidates: eligibleCandidates.length,
      eligibleCandidates,
    };
  }
}
