import { NextRequest, NextResponse } from "next/server";
import { RouletteEngine } from "@/domain/roulette/roulette-engine";
import { NoEligibleRestaurantsError } from "@/domain/roulette/errors";
import { ClassifiedRestaurant, RouletteFilterOptions } from "@/domain/types";

const engine = new RouletteEngine();

interface SpinRequestBody extends RouletteFilterOptions {
  pool: ClassifiedRestaurant[];
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as SpinRequestBody;

    if (!body.pool || !Array.isArray(body.pool)) {
      return NextResponse.json(
        { success: false, error: "Missing or invalid restaurant pool" },
        { status: 400 }
      );
    }

    if (!body.userLocation || typeof body.userLocation.lat !== "number") {
      return NextResponse.json(
        { success: false, error: "Missing or invalid userLocation" },
        { status: 400 }
      );
    }

    const result = engine.spin({
      pool: body.pool,
      userLocation: body.userLocation,
      radiusKm: body.radiusKm ?? 3.0,
      selectedCuisines: body.selectedCuisines,
      selectedThemes: body.selectedThemes,
      requiredDietary: body.requiredDietary,
      excludeVisited: body.excludeVisited,
      visitedIds: body.visitedIds,
      blacklistedIds: body.blacklistedIds,
    });

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error: unknown) {
    if (error instanceof NoEligibleRestaurantsError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          code: "NO_ELIGIBLE_RESTAURANTS",
        },
        { status: 422 }
      );
    }

    const message = error instanceof Error ? error.message : "Error spinning roulette";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
