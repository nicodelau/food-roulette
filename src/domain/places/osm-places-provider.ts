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

export class OpenStreetMapProvider implements IPlacesProvider {
  private readonly endpointUrl: string;
  private readonly fetchClient: typeof fetch;

  constructor(options?: OSMProviderOptions) {
    this.endpointUrl =
      options?.endpointUrl ?? "https://overpass-api.de/api/interpreter";
    this.fetchClient = options?.fetchClient ?? fetch;
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

    const radiusMeters = Math.round(radiusKm * 1000);
    const query = `[out:json][timeout:25];(node["amenity"~"restaurant|cafe|pub|fast_food"](around:${radiusMeters},${lat},${lng}););out center;`;

    let response: Response;
    try {
      response = await this.fetchClient(this.endpointUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `data=${encodeURIComponent(query)}`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown network error";
      throw new PlacesProviderError(`Failed to fetch from OpenStreetMap Overpass: ${msg}`);
    }

    if (!response.ok) {
      throw new PlacesProviderError(
        `Overpass API returned HTTP error ${response.status}: ${response.statusText}`,
        response.status
      );
    }

    const data: OverpassResponse = await response.json();
    return this.parseElements(data.elements);
  }

  private parseElements(elements: OverpassNode[]): PlaceRaw[] {
    const places: PlaceRaw[] = [];

    for (const elem of elements) {
      const name = elem.tags?.name;
      if (!name) continue; // Skip un-named amenities

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
