import { NextRequest, NextResponse } from "next/server";
import { OpenStreetMapProvider } from "@/domain/places/osm-places-provider";
import { MockPlacesProvider } from "@/domain/places/mock-places-provider";
import { ClassifierService } from "@/domain/classifier/classifier-service";
import { ClassifiedRestaurant } from "@/domain/types";

const osmProvider = new OpenStreetMapProvider();
const mockProvider = new MockPlacesProvider();
const classifier = new ClassifierService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const latStr = searchParams.get("lat");
    const lngStr = searchParams.get("lng");
    const radiusStr = searchParams.get("radiusKm");
    const useMock = searchParams.get("mock") === "true";

    // Default coordinates: Palermo, Buenos Aires
    const lat = latStr ? parseFloat(latStr) : -34.5885;
    const lng = lngStr ? parseFloat(lngStr) : -58.4306;
    const radiusKm = radiusStr ? parseFloat(radiusStr) : 2.5;

    let rawPlaces;
    if (useMock) {
      rawPlaces = await mockProvider.searchNearby({ lat, lng, radiusKm });
    } else {
      try {
        // Timeout race (4.2s) to allow Overpass to resolve while preventing long stalls
        const fetchPromise = osmProvider.searchNearby({ lat, lng, radiusKm });
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("OSM query timeout")), 4200)
        );

        rawPlaces = await Promise.race([fetchPromise, timeoutPromise]);

        if (rawPlaces.length === 0) {
          rawPlaces = await mockProvider.searchNearby({ lat, lng, radiusKm });
        }
      } catch (osmError: unknown) {
        const msg = osmError instanceof Error ? osmError.message : String(osmError);
        console.log(`[Places] OSM Overpass (${msg}), using enriched local catalog fallback.`);
        rawPlaces = await mockProvider.searchNearby({ lat, lng, radiusKm });
      }
    }

    const classified: ClassifiedRestaurant[] = rawPlaces.map((p) =>
      classifier.classify(p)
    );

    return NextResponse.json({
      success: true,
      count: classified.length,
      places: classified,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}
