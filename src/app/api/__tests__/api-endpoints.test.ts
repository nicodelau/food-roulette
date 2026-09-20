import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { GET as getPlaces } from "../places/route";
import { POST as postSpin } from "../roulette/spin/route";
import { POST as postCheckIn } from "../visits/check-in/route";

describe("API Endpoints Integration - TDD", () => {
  describe("GET /api/places", () => {
    it("should return classified places using mock fallback", async () => {
      const req = new NextRequest("http://localhost:3000/api/places?mock=true&lat=-34.58&lng=-58.43&radiusKm=3");
      const res = await getPlaces(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.places.length).toBeGreaterThan(0);
      expect(data.places[0]).toHaveProperty("cuisines");
      expect(data.places[0]).toHaveProperty("themes");
    });

    it("should return classified places with radiusKm=20 gracefully", async () => {
      const req = new NextRequest("http://localhost:3000/api/places?lat=-34.5885&lng=-58.4306&radiusKm=20");
      const res = await getPlaces(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.places.length).toBeGreaterThan(0);
    });
  });

  describe("POST /api/roulette/spin", () => {
    it("should spin roulette and return selected restaurant", async () => {
      const pool = [
        {
          id: "r1",
          externalId: "ext1",
          name: "Bodegón El Tropezón",
          location: { lat: -34.6, lng: -58.38 },
          address: "Callao 248",
          cuisines: ["Argentina"],
          themes: ["Bodegón"],
          dietarySuitability: [],
        },
      ];

      const req = new NextRequest("http://localhost:3000/api/roulette/spin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pool,
          userLocation: { lat: -34.6, lng: -58.38 },
          radiusKm: 2,
        }),
      });

      const res = await postSpin(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.result.selectedRestaurant.id).toBe("r1");
    });

    it("should return 422 if all restaurants are filtered out", async () => {
      const pool = [
        {
          id: "r1",
          externalId: "ext1",
          name: "Parrilla",
          location: { lat: -34.6, lng: -58.38 },
          address: "Callao 248",
          cuisines: ["Argentina"],
          themes: ["Parrilla / Asador"],
          dietarySuitability: [],
        },
      ];

      const req = new NextRequest("http://localhost:3000/api/roulette/spin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pool,
          userLocation: { lat: -34.6, lng: -58.38 },
          radiusKm: 2,
          requiredDietary: ["CELIAC"], // Not celiac -> will be filtered out
        }),
      });

      const res = await postSpin(req);
      const data = await res.json();

      expect(res.status).toBe(422);
      expect(data.success).toBe(false);
      expect(data.code).toBe("NO_ELIGIBLE_RESTAURANTS");
    });
  });

  describe("POST /api/visits/check-in", () => {
    it("should process check-in and return points", async () => {
      const restaurant = {
        id: "r-new",
        externalId: "ext-new",
        name: "Nuevo Sushi",
        location: { lat: -34.6, lng: -58.38 },
        address: "Palermo",
        cuisines: ["Japonesa / Sushi"],
        themes: ["Casual"],
        dietarySuitability: [],
      };

      const req = new NextRequest("http://localhost:3000/api/visits/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurant,
          currentPoints: 10,
          previousVisits: [],
        }),
      });

      const res = await postCheckIn(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.pointsEarned).toBe(70); // 20 base + 50 exploration
      expect(data.data.newTotalPoints).toBe(80);
    });
  });
});
