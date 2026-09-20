import { Coordinates } from "../types";

export interface ComunaCaba {
  id: number;
  numberLabel: string;
  name: string;
  barrios: string[];
  location: Coordinates;
}

export const CABA_COMUNAS: ComunaCaba[] = [
  {
    id: 1,
    numberLabel: "Comuna 1",
    name: "Retiro, San Telmo, Pto. Madero, Centro",
    barrios: ["Retiro", "San Nicolás", "Puerto Madero", "San Telmo", "Montserrat", "Constitución"],
    location: { lat: -34.6083, lng: -58.3732 },
  },
  {
    id: 2,
    numberLabel: "Comuna 2",
    name: "Recoleta",
    barrios: ["Recoleta"],
    location: { lat: -34.5886, lng: -58.3934 },
  },
  {
    id: 3,
    numberLabel: "Comuna 3",
    name: "Balvanera, San Cristóbal",
    barrios: ["Balvanera", "San Cristóbal", "Once"],
    location: { lat: -34.6133, lng: -58.4025 },
  },
  {
    id: 4,
    numberLabel: "Comuna 4",
    name: "La Boca, Barracas, Parque Patricios",
    barrios: ["La Boca", "Barracas", "Parque Patricios", "Nueva Pompeya"],
    location: { lat: -34.6465, lng: -58.3842 },
  },
  {
    id: 5,
    numberLabel: "Comuna 5",
    name: "Almagro, Boedo",
    barrios: ["Almagro", "Boedo"],
    location: { lat: -34.6184, lng: -58.4214 },
  },
  {
    id: 6,
    numberLabel: "Comuna 6",
    name: "Caballito",
    barrios: ["Caballito"],
    location: { lat: -34.6206, lng: -58.4431 },
  },
  {
    id: 7,
    numberLabel: "Comuna 7",
    name: "Flores, Parque Chacabuco",
    barrios: ["Flores", "Parque Chacabuco"],
    location: { lat: -34.6334, lng: -58.4485 },
  },
  {
    id: 8,
    numberLabel: "Comuna 8",
    name: "Villa Lugano, Soldati, Riachuelo",
    barrios: ["Villa Soldati", "Villa Riachuelo", "Villa Lugano"],
    location: { lat: -34.6732, lng: -58.4614 },
  },
  {
    id: 9,
    numberLabel: "Comuna 9",
    name: "Liniers, Mataderos, Pque. Avellaneda",
    barrios: ["Liniers", "Mataderos", "Parque Avellaneda"],
    location: { lat: -34.6542, lng: -58.4981 },
  },
  {
    id: 10,
    numberLabel: "Comuna 10",
    name: "Floresta, Monte Castro, Villa Luro",
    barrios: ["Villa Luro", "Vélez Sársfield", "Floresta", "Monte Castro", "Villa Real", "Versalles"],
    location: { lat: -34.6261, lng: -58.4984 },
  },
  {
    id: 11,
    numberLabel: "Comuna 11",
    name: "Villa Devoto, Villa del Parque",
    barrios: ["Villa Devoto", "Villa del Parque", "Villa Santa Rita", "Villa General Mitre"],
    location: { lat: -34.6072, lng: -58.5023 },
  },
  {
    id: 12,
    numberLabel: "Comuna 12",
    name: "Saavedra, Villa Urquiza, Coghlan",
    barrios: ["Coghlan", "Saavedra", "Villa Urquiza", "Villa Pueyrredón"],
    location: { lat: -34.5732, lng: -58.4912 },
  },
  {
    id: 13,
    numberLabel: "Comuna 13",
    name: "Belgrano, Núñez, Colegiales",
    barrios: ["Núñez", "Belgrano", "Colegiales"],
    location: { lat: -34.5582, lng: -58.4553 },
  },
  {
    id: 14,
    numberLabel: "Comuna 14",
    name: "Palermo",
    barrios: ["Palermo", "Palermo Soho", "Palermo Hollywood", "Las Cañitas"],
    location: { lat: -34.5824, lng: -58.4201 },
  },
  {
    id: 15,
    numberLabel: "Comuna 15",
    name: "Chacarita, Villa Crespo, Paternal",
    barrios: ["Chacarita", "Villa Crespo", "La Paternal", "Villa Ortúzar", "Agronomía", "Parque Chas"],
    location: { lat: -34.5932, lng: -58.4572 },
  },
];
