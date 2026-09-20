import { ClassifiedRestaurant } from "../types";
import { DuplicateVisitError } from "./errors";

export interface VisitRecord {
  restaurantId: string;
  cuisines: string[];
  visitedAt: Date;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface UserLevel {
  level: number;
  name: string;
  minPoints: number;
  maxPoints: number;
}

export interface ProcessVisitParams {
  restaurant: ClassifiedRestaurant;
  currentPoints: number;
  previousVisits: VisitRecord[];
}

export interface ProcessVisitResult {
  pointsEarned: number;
  newTotalPoints: number;
  isNewCuisineExplored: boolean;
  exploredCuisineName?: string;
  unlockedBadges: Badge[];
  newLevel: UserLevel;
}

const ALL_BADGES: Record<string, Badge> = {
  FIRST_BITE: {
    id: "FIRST_BITE",
    name: "Primer Bocado",
    description: "¡Completaste tu primera salida gastronómica con Food Roulette!",
    icon: "🍽️",
  },
  PALATE_POLYGLOT: {
    id: "PALATE_POLYGLOT",
    name: "Políglota del Paladar",
    description: "Has explorado al menos 5 cocinas de orígenes diferentes.",
    icon: "🌍",
  },
  LOCAL_EXPLORER: {
    id: "LOCAL_EXPLORER",
    name: "Explorador Local",
    description: "Alcanzaste 10 restaurantes visitados.",
    icon: "🧭",
  },
};

const USER_LEVELS: UserLevel[] = [
  { level: 1, name: "Novato Gastronómico", minPoints: 0, maxPoints: 99 },
  { level: 2, name: "Comensal Curioso", minPoints: 100, maxPoints: 249 },
  { level: 3, name: "Gourmet Aventurero", minPoints: 250, maxPoints: 499 },
  { level: 4, name: "Maestro Culinario", minPoints: 500, maxPoints: Infinity },
];

export class GamificationService {
  private readonly BASE_POINTS = 20;
  private readonly NOVEL_CUISINE_BONUS = 50;
  private readonly MIN_HOURS_BETWEEN_SAME_VISIT = 2;

  calculateLevel(points: number): UserLevel {
    for (let i = USER_LEVELS.length - 1; i >= 0; i--) {
      if (points >= USER_LEVELS[i].minPoints) {
        return USER_LEVELS[i];
      }
    }
    return USER_LEVELS[0];
  }

  processVisit(params: ProcessVisitParams): ProcessVisitResult {
    const { restaurant, currentPoints, previousVisits } = params;

    // 1. Detección defensiva de check-in duplicado
    const now = Date.now();
    const minIntervalMs = this.MIN_HOURS_BETWEEN_SAME_VISIT * 60 * 60 * 1000;

    for (const prev of previousVisits) {
      if (prev.restaurantId === restaurant.id) {
        const diff = now - prev.visitedAt.getTime();
        if (diff < minIntervalMs) {
          throw new DuplicateVisitError(
            `Ya registraste una visita en '${restaurant.name}' hace menos de ${this.MIN_HOURS_BETWEEN_SAME_VISIT} horas.`
          );
        }
      }
    }

    // 2. Cálculo de cocinas exploradas previamente
    const knownCuisines = new Set<string>();
    for (const prev of previousVisits) {
      for (const c of prev.cuisines) {
        knownCuisines.add(c.toLowerCase());
      }
    }

    let isNewCuisineExplored = false;
    let exploredCuisineName: string | undefined;

    for (const cuisine of restaurant.cuisines) {
      if (cuisine !== "Variada" && !knownCuisines.has(cuisine.toLowerCase())) {
        isNewCuisineExplored = true;
        exploredCuisineName = cuisine;
        break;
      }
    }

    // 3. Puntos ganados
    let pointsEarned = this.BASE_POINTS;
    if (isNewCuisineExplored) {
      pointsEarned += this.NOVEL_CUISINE_BONUS;
    }

    const newTotalPoints = currentPoints + pointsEarned;
    const newLevel = this.calculateLevel(newTotalPoints);

    // 4. Medallas / Insignias
    const unlockedBadges: Badge[] = [];

    // Primera visita
    if (previousVisits.length === 0) {
      unlockedBadges.push(ALL_BADGES.FIRST_BITE);
    }

    // Políglota del Paladar (5 o más cocinas)
    const updatedCuisines = new Set(knownCuisines);
    for (const c of restaurant.cuisines) {
      if (c !== "Variada") updatedCuisines.add(c.toLowerCase());
    }
    if (updatedCuisines.size >= 5 && knownCuisines.size < 5) {
      unlockedBadges.push(ALL_BADGES.PALATE_POLYGLOT);
    }

    // Explorador Local (10 o más visitas)
    if (previousVisits.length + 1 >= 10 && previousVisits.length < 10) {
      unlockedBadges.push(ALL_BADGES.LOCAL_EXPLORER);
    }

    return {
      pointsEarned,
      newTotalPoints,
      isNewCuisineExplored,
      exploredCuisineName,
      unlockedBadges,
      newLevel,
    };
  }
}
