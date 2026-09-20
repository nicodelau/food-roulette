import { NextRequest, NextResponse } from "next/server";
import { GamificationService, VisitRecord } from "@/domain/gamification/gamification-service";
import { DuplicateVisitError } from "@/domain/gamification/errors";
import { ClassifiedRestaurant } from "@/domain/types";

const gamificationService = new GamificationService();

interface CheckInRequestBody {
  restaurant: ClassifiedRestaurant;
  currentPoints: number;
  previousVisits: Array<{
    restaurantId: string;
    cuisines: string[];
    visitedAt: string;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CheckInRequestBody;

    if (!body.restaurant || !body.restaurant.id) {
      return NextResponse.json(
        { success: false, error: "Restaurant payload is required" },
        { status: 400 }
      );
    }

    const previousVisitsParsed: VisitRecord[] = (body.previousVisits || []).map((v) => ({
      restaurantId: v.restaurantId,
      cuisines: v.cuisines,
      visitedAt: new Date(v.visitedAt),
    }));

    const result = gamificationService.processVisit({
      restaurant: body.restaurant,
      currentPoints: body.currentPoints || 0,
      previousVisits: previousVisitsParsed,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: unknown) {
    if (error instanceof DuplicateVisitError) {
      return NextResponse.json(
        { success: false, error: error.message, code: "DUPLICATE_VISIT" },
        { status: 409 }
      );
    }

    const message = error instanceof Error ? error.message : "Error processing check-in";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
