import { NextRequest, NextResponse } from "next/server";
import { RecommendationEngine } from "@/domain/recommendations/recommendation-engine";
import { ClassifiedRestaurant, Coordinates, DietaryRestriction } from "@/domain/types";

const engine = new RecommendationEngine();

interface RecommendationRequestBody {
  pool: ClassifiedRestaurant[];
  visitedCuisinesCount?: Record<string, number>;
  visitedRestaurantIds?: string[];
  requiredDietary?: DietaryRestriction[];
  userLocation: Coordinates;
  limit?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RecommendationRequestBody;

    if (!body.pool || !Array.isArray(body.pool)) {
      return NextResponse.json(
        { success: false, error: "Missing or invalid pool" },
        { status: 400 }
      );
    }

    if (!body.userLocation || typeof body.userLocation.lat !== "number") {
      return NextResponse.json(
        { success: false, error: "Missing or invalid userLocation" },
        { status: 400 }
      );
    }

    const recommendations = engine.getRecommendations({
      pool: body.pool,
      visitedCuisinesCount: body.visitedCuisinesCount ?? {},
      visitedRestaurantIds: new Set(body.visitedRestaurantIds ?? []),
      requiredDietary: body.requiredDietary,
      userLocation: body.userLocation,
      limit: body.limit ?? 5,
    });

    return NextResponse.json({
      success: true,
      count: recommendations.length,
      recommendations,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Error generating recommendations";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
