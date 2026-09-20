import { IPlacesProvider, SearchNearbyParams } from "./types";
import { PlaceRaw } from "../types";
import { InvalidCoordinatesError, PlacesProviderError } from "./errors";

interface OverpassNode {
  type: "node" | "way";
  id: number;
  lat?: number;
  lon?: number;
  center?: {
    lat: number;
    lon: number;
  };
  tags?: Record<string, string>;
}

interface OverpassResponse {
  elements: OverpassNode[];
}

interface OSMProviderOptions {
  endpointUrl?: string;
  fetchClient?: typeof fetch;
}

const DEFAULT_MIRRORS = [
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
  "https://overpass-api.de/api/interpreter",
];

export class OpenStreetMapProvider implements IPlacesProvider {
  private readonly endpoints: string[];
  private readonly fetchClient: typeof fetch;
  private readonly hasCustomFetchClient: boolean;

  constructor(options?: OSMProviderOptions) {
    this.endpoints = options?.endpointUrl
      ? [options.endpointUrl]
      : DEFAULT_MIRRORS;
    this.fetchClient = options?.fetchClient ?? fetch;
    this.hasCustomFetchClient = !!options?.fetchClient;
  }

  async searchNearby(params: SearchNearbyParams): Promise<PlaceRaw[]> {
    const { lat, lng, radiusKm } = params;

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      throw new InvalidCoordinatesError(
        `Coordinates out of range: lat=${lat}, lng=${lng}`
      );
    }

    if (radiusKm <= 0) {
      throw new InvalidCoordinatesError(
        `Radius must be strictly positive, got: ${radiusKm}`
      );
    }

    const queryRadiusMeters = Math.min(Math.round(radiusKm * 1000), 5000);
    const query = `[out:json][timeout:20];(node["amenity"~"restaurant|cafe|pub|fast_food"](around:${queryRadiusMeters},${lat},${lng}););out center 80;`;

    let lastError: Error | null = null;

    // 1. Try curl bridge on Node.js runtime if not a custom test mock client
    if (!this.hasCustomFetchClient && typeof window === "undefined") {
      try {
        const { execFile } = await import("child_process");
        const { promisify } = await import("util");
        const execFileAsync = promisify(execFile);

        for (const endpoint of this.endpoints) {
          try {
            const { stdout } = await execFileAsync("curl", [
              "-s",
              "-4",
              "-X",
              "POST",
              "--max-time",
              "6",
              "--data-urlencode",
              `data=${query}`,
              endpoint,
            ]);

            if (stdout && stdout.trim().startsWith("{")) {
              const data: OverpassResponse = JSON.parse(stdout);
              if (Array.isArray(data.elements) && data.elements.length > 0) {
                return this.parseElements(data.elements);
              }
            }
          } catch {
            // Try next mirror
          }
        }
      } catch {
        // Fallback to fetch
      }
    }

    // 2. Fallback to standard fetch
    for (const endpoint of this.endpoints) {
      try {
        const response = await this.fetchClient(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "FoodRouletteApp/1.0 (https://github.com/nicodelau/food-roulette)",
          },
          body: `data=${encodeURIComponent(query)}`,
          signal:
            typeof AbortSignal !== "undefined" && "timeout" in AbortSignal
              ? AbortSignal.timeout(6000)
              : undefined,
        });

        if (!response.ok) {
          throw new PlacesProviderError(
            `Overpass API returned HTTP error ${response.status}: ${response.statusText}`,
            response.status
          );
        }

        let data: OverpassResponse;
        if (typeof response.text === "function") {
          const rawText = await response.text();
          if (!rawText.trim().startsWith("{")) {
            throw new PlacesProviderError(`Overpass returned non-JSON response`);
          }
          data = JSON.parse(rawText);
        } else {
          data = await response.json();
        }

        return this.parseElements(data.elements);
      } catch (err: unknown) {
        lastError = err instanceof Error ? err : new Error(String(err));
      }
    }

    const msg = lastError?.message || "All Overpass mirrors failed";
    throw new PlacesProviderError(`Failed to fetch from OpenStreetMap Overpass: ${msg}`);
  }

  private parseElements(elements: OverpassNode[]): PlaceRaw[] {
    const places: PlaceRaw[] = [];

    for (const elem of elements) {
      const name = elem.tags?.name;
      if (!name) continue;

      const latitude = elem.lat ?? elem.center?.lat;
      const longitude = elem.lon ?? elem.center?.lon;

      if (latitude === undefined || longitude === undefined) continue;

      const address =
        elem.tags?.["addr:street"] && elem.tags?.["addr:housenumber"]
          ? `${elem.tags["addr:street"]} ${elem.tags["addr:housenumber"]}`
          : elem.tags?.["addr:street"] ?? undefined;

      places.push({
        externalId: `osm-${elem.type}-${elem.id}`,
        name,
        location: {
          lat: latitude,
          lng: longitude,
        },
        address,
        tags: elem.tags,
      });
    }

    return places;
  }
}
