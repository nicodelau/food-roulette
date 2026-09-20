import {
  ClassifiedRestaurant,
  Coordinates,
  DietaryRestriction,
} from "../types";

export interface RecommendationParams {
  pool: ClassifiedRestaurant[];
  visitedCuisinesCount: Record<string, number>;
  visitedRestaurantIds: Set<string>;
  requiredDietary?: DietaryRestriction[];
  userLocation: Coordinates;
  limit?: number;
}

export class RecommendationEngine {
  /**
   * Calcula la distancia en kilómetros usando Haversine.
   */
  private calculateDistanceKm(from: Coordinates, to: Coordinates): number {
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
   * Obtiene recomendaciones personalizadas basadas en afinidad de cocinas, restricciones y valoración.
   */
  getRecommendations(params: RecommendationParams): ClassifiedRestaurant[] {
    const {
      pool,
      visitedCuisinesCount,
      visitedRestaurantIds,
      requiredDietary = [],
      userLocation,
      limit = 5,
    } = params;

    const candidates = pool.filter((restaurant) => {
      // 1. Excluir restaurantes ya visitados
      if (
        visitedRestaurantIds.has(restaurant.id) ||
        visitedRestaurantIds.has(restaurant.externalId)
      ) {
        return false;
      }

      // 2. Filtrar por restricciones dietarias requeridas
      if (requiredDietary.length > 0) {
        const matchesAll = requiredDietary.every((diet) =>
          restaurant.dietarySuitability.includes(diet)
        );
        if (!matchesAll) return false;
      }

      return true;
    });

    // 3. Puntuación y ranking por afinidad
    const scored = candidates.map((restaurant) => {
      const rating = restaurant.rating ?? 3.5;
      let affinityScore = rating * 10;

      // Sumar bonificación por cocinas frecuentes del usuario
      for (const cuisine of restaurant.cuisines) {
        const count = visitedCuisinesCount[cuisine] ?? 0;
        affinityScore += count * 20;
      }

      // Penalización leve por distancia
      const distance = this.calculateDistanceKm(userLocation, restaurant.location);
      affinityScore -= distance * 0.2;

      return {
        restaurant,
        score: affinityScore,
      };
    });

    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, limit).map((item) => item.restaurant);
  }
}
