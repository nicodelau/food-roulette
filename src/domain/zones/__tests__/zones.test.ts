import { describe, it, expect } from "vitest";
import {
  ALL_GASTRONOMIC_ZONES,
  getZoneById,
  getZonesByRegion,
  GastronomicZone,
  ZoneRegion,
} from "../gastronomic-zones";
import { CABA_COMUNAS } from "../../caba/comunas";

describe("Gastronomic Zones - TDD", () => {
  it("should contain all 15 CABA comunas and multiple AMBA/PBA regions", () => {
    const cabaZones = ALL_GASTRONOMIC_ZONES.filter((z) => z.region === "CABA");
    expect(cabaZones).toHaveLength(15);

    const ambaNorte = ALL_GASTRONOMIC_ZONES.filter((z) => z.region === "AMBA_NORTE");
    expect(ambaNorte.length).toBeGreaterThanOrEqual(4);

    const ambaOeste = ALL_GASTRONOMIC_ZONES.filter((z) => z.region === "AMBA_OESTE");
    expect(ambaOeste.length).toBeGreaterThanOrEqual(3);

    const ambaSur = ALL_GASTRONOMIC_ZONES.filter((z) => z.region === "AMBA_SUR");
    expect(ambaSur.length).toBeGreaterThanOrEqual(3);

    const pba = ALL_GASTRONOMIC_ZONES.filter((z) => z.region === "PROVINCIA_BSAS");
    expect(pba.length).toBeGreaterThanOrEqual(2);
  });

  it("should have valid coordinates and non-empty neighborhoods for every zone", () => {
    ALL_GASTRONOMIC_ZONES.forEach((zone: GastronomicZone) => {
      expect(zone.id).toBeTruthy();
      expect(zone.name).toBeTruthy();
      expect(zone.regionLabel).toBeTruthy();
      expect(zone.barrios.length).toBeGreaterThan(0);

      // Coordinates within Greater Buenos Aires / PBA bounds
      expect(zone.location.lat).toBeLessThan(-34.0);
      expect(zone.location.lat).toBeGreaterThan(-35.5);
      expect(zone.location.lng).toBeLessThan(-57.5);
      expect(zone.location.lng).toBeGreaterThan(-59.5);
    });
  });

  it("should retrieve a zone by its ID accurately", () => {
    const comuna14 = getZoneById("caba-14");
    expect(comuna14).toBeDefined();
    expect(comuna14?.name).toContain("Palermo");
    expect(comuna14?.region).toBe("CABA");

    const vlopez = getZoneById("amba-vicente-lopez");
    expect(vlopez).toBeDefined();
    expect(vlopez?.region).toBe("AMBA_NORTE");
    expect(vlopez?.barrios).toContain("Olivos");

    const nonExistent = getZoneById("unknown-zone-999");
    expect(nonExistent).toBeUndefined();
  });

  it("should filter zones by region correctly", () => {
    const oesteZones = getZonesByRegion("AMBA_OESTE");
    expect(oesteZones.length).toBeGreaterThan(0);
    oesteZones.forEach((z) => {
      expect(z.region).toBe("AMBA_OESTE");
    });
  });

  it("should maintain full backward compatibility with CABA_COMUNAS", () => {
    expect(CABA_COMUNAS).toHaveLength(15);
    CABA_COMUNAS.forEach((c) => {
      expect(c.id).toBeGreaterThanOrEqual(1);
      expect(c.id).toBeLessThanOrEqual(15);
      expect(c.location.lat).toBeLessThan(-34.5);
      expect(c.location.lat).toBeGreaterThan(-34.75);
    });
  });
});
