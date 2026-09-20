import { describe, it, expect, vi } from "vitest";
import { MockPlacesProvider } from "../mock-places-provider";
import { OpenStreetMapProvider } from "../osm-places-provider";
import { InvalidCoordinatesError, PlacesProviderError } from "../errors";

describe("Places Provider - TDD", () => {
  describe("MockPlacesProvider", () => {
    it("should return a predefined list of places within radius", async () => {
      const provider = new MockPlacesProvider();
      const places = await provider.searchNearby({
        lat: -34.5885,
        lng: -58.4306, // Palermo, Buenos Aires
        radiusKm: 2,
      });

      expect(places).toBeDefined();
      expect(Array.isArray(places)).toBe(true);
      expect(places.length).toBeGreaterThan(0);
      expect(places[0]).toHaveProperty("externalId");
      expect(places[0]).toHaveProperty("name");
      expect(places[0]).toHaveProperty("location");
    });
  });

  describe("OpenStreetMapProvider (Overpass API)", () => {
    it("should reject invalid coordinates (latitude out of range)", async () => {
      const provider = new OpenStreetMapProvider();
      await expect(
        provider.searchNearby({
          lat: 105.0, // Invalid lat > 90
          lng: -58.4,
          radiusKm: 1,
        })
      ).rejects.toThrow(InvalidCoordinatesError);
    });

    it("should reject invalid coordinates (radius <= 0)", async () => {
      const provider = new OpenStreetMapProvider();
      await expect(
        provider.searchNearby({
          lat: -34.6,
          lng: -58.4,
          radiusKm: -1,
        })
      ).rejects.toThrow(InvalidCoordinatesError);
    });

    it("should build correct Overpass query and parse elements into PlaceRaw", async () => {
      const mockOverpassResponse = {
        elements: [
          {
            type: "node",
            id: 12345,
            lat: -34.588,
            lon: -58.43,
            tags: {
              name: "Pizzería Nápoles",
              amenity: "restaurant",
              cuisine: "pizza;italian",
              "diet:vegan": "yes",
              "addr:street": "Av. Santa Fe 3000",
            },
          },
          {
            type: "node",
            id: 67890,
            lat: -34.589,
            lon: -58.431,
            tags: {
              // Element without name should be skipped
              amenity: "restaurant",
            },
          },
        ],
      };

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockOverpassResponse,
      });

      const provider = new OpenStreetMapProvider({ fetchClient: mockFetch as unknown as typeof fetch });
      const results = await provider.searchNearby({
        lat: -34.588,
        lng: -58.43,
        radiusKm: 1.5,
      });

      const callArgs = mockFetch.mock.calls[0];
      const body = callArgs[1]?.body as string;
      const decodedBody = decodeURIComponent(body);
      expect(decodedBody).toContain('node["amenity"~"restaurant|cafe|pub|fast_food"]');
      expect(decodedBody).toContain("around:1500,-34.588,-58.43");

      // Verify parsing and filter of nameless places
      expect(results).toHaveLength(1);
      expect(results[0]).toEqual({
        externalId: "osm-node-12345",
        name: "Pizzería Nápoles",
        location: {
          lat: -34.588,
          lng: -58.43,
        },
        address: "Av. Santa Fe 3000",
        tags: {
          name: "Pizzería Nápoles",
          amenity: "restaurant",
          cuisine: "pizza;italian",
          "diet:vegan": "yes",
          "addr:street": "Av. Santa Fe 3000",
        },
      });
    });

    it("should handle Overpass API network/HTTP errors defensively", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 504,
        statusText: "Gateway Timeout",
      });

      const provider = new OpenStreetMapProvider({ fetchClient: mockFetch as unknown as typeof fetch });
      await expect(
        provider.searchNearby({
          lat: -34.6,
          lng: -58.4,
          radiusKm: 1,
        })
      ).rejects.toThrow(PlacesProviderError);
    });
  });
});
