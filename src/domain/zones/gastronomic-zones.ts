import { Coordinates } from "../types";
import { CABA_COMUNAS, ComunaCaba } from "../caba/comunas";

export type ZoneRegion =
  | "CABA"
  | "AMBA_NORTE"
  | "AMBA_OESTE"
  | "AMBA_SUR"
  | "PROVINCIA_BSAS";

export interface GastronomicZone {
  id: string;
  region: ZoneRegion;
  regionLabel: string;
  name: string;
  numberLabel?: string;
  barrios: string[];
  location: Coordinates;
  radiusKm?: number;
}

// Convert CABA Comunas to GastronomicZone format
const CABA_ZONES: GastronomicZone[] = CABA_COMUNAS.map((c: ComunaCaba) => ({
  id: `caba-${c.id}`,
  region: "CABA",
  regionLabel: "CABA (Capital Federal)",
  name: `${c.numberLabel}: ${c.name}`,
  numberLabel: c.numberLabel,
  barrios: c.barrios,
  location: c.location,
  radiusKm: 3.0,
}));

export const AMBA_PBA_ZONES: GastronomicZone[] = [
  // AMBA Norte
  {
    id: "amba-vicente-lopez",
    region: "AMBA_NORTE",
    regionLabel: "AMBA Norte",
    name: "Vicente López (Olivos, Florida, La Lucila)",
    numberLabel: "Vicente López",
    barrios: ["Olivos", "Florida", "Vicente López", "La Lucila", "Carapachay"],
    location: { lat: -34.5262, lng: -58.4815 },
    radiusKm: 3.5,
  },
  {
    id: "amba-san-isidro",
    region: "AMBA_NORTE",
    regionLabel: "AMBA Norte",
    name: "San Isidro (Acassuso, Martínez, Boulogne)",
    numberLabel: "San Isidro",
    barrios: ["San Isidro", "Acassuso", "Martínez", "Boulogne", "Béccar"],
    location: { lat: -34.4717, lng: -58.5284 },
    radiusKm: 4.0,
  },
  {
    id: "amba-san-fernando",
    region: "AMBA_NORTE",
    regionLabel: "AMBA Norte",
    name: "San Fernando & Victoria",
    numberLabel: "San Fernando",
    barrios: ["San Fernando", "Victoria", "Virreyes"],
    location: { lat: -34.4443, lng: -58.5587 },
    radiusKm: 3.5,
  },
  {
    id: "amba-tigre",
    region: "AMBA_NORTE",
    regionLabel: "AMBA Norte",
    name: "Tigre (Centro, Delta, Nordelta)",
    numberLabel: "Tigre",
    barrios: ["Tigre Centro", "Paseo Victorica", "Nordelta", "Rincón de Milberg"],
    location: { lat: -34.426, lng: -58.5796 },
    radiusKm: 4.5,
  },
  {
    id: "amba-san-martin",
    region: "AMBA_NORTE",
    regionLabel: "AMBA Norte",
    name: "General San Martín (Ballester, San Martín)",
    numberLabel: "San Martín",
    barrios: ["San Martín", "Villa Ballester", "Villa Lynch"],
    location: { lat: -34.5772, lng: -58.5365 },
    radiusKm: 3.5,
  },
  {
    id: "amba-pilar",
    region: "AMBA_NORTE",
    regionLabel: "AMBA Norte",
    name: "Pilar (Centro & Km 50)",
    numberLabel: "Pilar",
    barrios: ["Pilar Centro", "Del Viso", "Panamericana Km 50"],
    location: { lat: -34.4586, lng: -58.9142 },
    radiusKm: 5.0,
  },

  // AMBA Oeste
  {
    id: "amba-moron-castelar",
    region: "AMBA_OESTE",
    regionLabel: "AMBA Oeste",
    name: "Morón & Castelar",
    numberLabel: "Morón / Castelar",
    barrios: ["Morón Centro", "Castelar", "Haedo"],
    location: { lat: -34.6534, lng: -58.6198 },
    radiusKm: 4.0,
  },
  {
    id: "amba-ramos-mejia",
    region: "AMBA_OESTE",
    regionLabel: "AMBA Oeste",
    name: "Ramos Mejía (La Matanza)",
    numberLabel: "Ramos Mejía",
    barrios: ["Ramos Mejía", "San Justo", "Villa Luzuriaga"],
    location: { lat: -34.6497, lng: -58.5638 },
    radiusKm: 3.5,
  },
  {
    id: "amba-parque-leloir",
    region: "AMBA_OESTE",
    regionLabel: "AMBA Oeste",
    name: "Ituzaingó & Parque Leloir",
    numberLabel: "Parque Leloir",
    barrios: ["Parque Leloir", "Ituzaingó Centro"],
    location: { lat: -34.6231, lng: -58.6874 },
    radiusKm: 4.0,
  },
  {
    id: "amba-tres-de-febrero",
    region: "AMBA_OESTE",
    regionLabel: "AMBA Oeste",
    name: "Tres de Febrero (Caseros, Ciudad Jardín)",
    numberLabel: "Tres de Febrero",
    barrios: ["Caseros", "Ciudad Jardín", "Santos Lugares"],
    location: { lat: -34.6019, lng: -58.5639 },
    radiusKm: 3.5,
  },

  // AMBA Sur
  {
    id: "amba-lomas-de-zamora",
    region: "AMBA_SUR",
    regionLabel: "AMBA Sur",
    name: "Lomas de Zamora (Las Lomitas, Banfield)",
    numberLabel: "Lomas (Las Lomitas)",
    barrios: ["Las Lomitas", "Lomas de Zamora Centro", "Banfield", "Temperley"],
    location: { lat: -34.7618, lng: -58.4011 },
    radiusKm: 3.5,
  },
  {
    id: "amba-quilmes",
    region: "AMBA_SUR",
    regionLabel: "AMBA Sur",
    name: "Quilmes & Bernal",
    numberLabel: "Quilmes",
    barrios: ["Quilmes Centro", "Bernal", "Quilmes Oeste"],
    location: { lat: -34.7242, lng: -58.2608 },
    radiusKm: 4.0,
  },
  {
    id: "amba-lanus",
    region: "AMBA_SUR",
    regionLabel: "AMBA Sur",
    name: "Lanús (Polo 'Lanucita')",
    numberLabel: "Lanús",
    barrios: ["Lanús Oeste", "Lanucita Gastronómica", "Lanús Este", "Valentín Alsina"],
    location: { lat: -34.7003, lng: -58.3923 },
    radiusKm: 3.5,
  },
  {
    id: "amba-avellaneda",
    region: "AMBA_SUR",
    regionLabel: "AMBA Sur",
    name: "Avellaneda & Wilde",
    numberLabel: "Avellaneda",
    barrios: ["Avellaneda Centro", "Wilde", "Sarandí"],
    location: { lat: -34.6624, lng: -58.3648 },
    radiusKm: 3.5,
  },
  {
    id: "amba-almirante-brown",
    region: "AMBA_SUR",
    regionLabel: "AMBA Sur",
    name: "Almirante Brown (Adrogué)",
    numberLabel: "Adrogué",
    barrios: ["Adrogué", "Burzaco", "José Mármol"],
    location: { lat: -34.7986, lng: -58.3905 },
    radiusKm: 3.5,
  },

  // Provincia de Buenos Aires (Gran La Plata y Polos)
  {
    id: "pba-la-plata",
    region: "PROVINCIA_BSAS",
    regionLabel: "Provincia de Bs. As.",
    name: "La Plata (Centro & Eje Cívico)",
    numberLabel: "La Plata Centro",
    barrios: ["La Plata Centro", "Plaza Moreno", "Tolosa"],
    location: { lat: -34.9214, lng: -57.9545 },
    radiusKm: 4.5,
  },
  {
    id: "pba-city-bell",
    region: "PROVINCIA_BSAS",
    regionLabel: "Provincia de Bs. As.",
    name: "City Bell & Gonnet (Polo Cantilo)",
    numberLabel: "City Bell",
    barrios: ["City Bell", "Gonnet", "Villa Elisa"],
    location: { lat: -34.8631, lng: -58.0436 },
    radiusKm: 4.0,
  },
  {
    id: "pba-campana-zarate",
    region: "PROVINCIA_BSAS",
    regionLabel: "Provincia de Bs. As.",
    name: "Campana & Zárate",
    numberLabel: "Campana / Zárate",
    barrios: ["Campana", "Zárate"],
    location: { lat: -34.1687, lng: -58.9591 },
    radiusKm: 5.0,
  },
  {
    id: "pba-mercedes-areco",
    region: "PROVINCIA_BSAS",
    regionLabel: "Provincia de Bs. As.",
    name: "Mercedes & Tomás Jofré (Polo Tradicional)",
    numberLabel: "Mercedes / Jofré",
    barrios: ["Mercedes", "Tomás Jofré"],
    location: { lat: -34.6515, lng: -59.4307 },
    radiusKm: 6.0,
  },
];

export const ALL_GASTRONOMIC_ZONES: GastronomicZone[] = [
  ...CABA_ZONES,
  ...AMBA_PBA_ZONES,
];

export const REGIONS_METADATA: { id: ZoneRegion; label: string; count: number }[] = [
  { id: "CABA", label: "CABA (15 Comunas)", count: 15 },
  { id: "AMBA_NORTE", label: "AMBA Norte", count: 6 },
  { id: "AMBA_OESTE", label: "AMBA Oeste", count: 4 },
  { id: "AMBA_SUR", label: "AMBA Sur", count: 5 },
  { id: "PROVINCIA_BSAS", label: "Provincia & La Plata", count: 4 },
];

export function getZoneById(id: string): GastronomicZone | undefined {
  return ALL_GASTRONOMIC_ZONES.find((z) => z.id === id);
}

export function getZonesByRegion(region: ZoneRegion): GastronomicZone[] {
  return ALL_GASTRONOMIC_ZONES.filter((z) => z.region === region);
}
