import { describe, it, expect } from "vitest";
import { CABA_COMUNAS } from "../comunas";

describe("CABA Comunas Catalog", () => {
  it("should contain exactly 15 comunas", () => {
    expect(CABA_COMUNAS).toHaveLength(15);
  });

  it("should have valid coordinates within Buenos Aires latitude/longitude bounds", () => {
    CABA_COMUNAS.forEach((comuna) => {
      // CABA latitude is roughly -34.70 to -34.50
      expect(comuna.location.lat).toBeLessThan(-34.5);
      expect(comuna.location.lat).toBeGreaterThan(-34.75);

      // CABA longitude is roughly -58.55 to -58.35
      expect(comuna.location.lng).toBeLessThan(-58.35);
      expect(comuna.location.lng).toBeGreaterThan(-58.55);

      expect(comuna.barrios.length).toBeGreaterThan(0);
    });
  });
});
