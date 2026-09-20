import { IPlacesProvider, SearchNearbyParams } from "./types";
import { PlaceRaw } from "../types";
import { InvalidCoordinatesError } from "./errors";

export class MockPlacesProvider implements IPlacesProvider {
  private basePlaces: PlaceRaw[] = [
    // Palermo Soho & Hollywood (Comuna 14)
    {
      externalId: "mock-1",
      name: "Don Julio Parrilla",
      location: { lat: -34.5888, lng: -58.4239 },
      address: "Guatemala 4699, Palermo",
      tags: { cuisine: "argentinian;parrilla;steakhouse", amenity: "restaurant" },
      rating: 4.9,
    },
    {
      externalId: "mock-2",
      name: "El Preferido de Palermo",
      location: { lat: -34.5885, lng: -58.4306 },
      address: "Jorge Luis Borges 2108, Palermo Soho",
      tags: { cuisine: "argentinian;bodegon;traditional", amenity: "restaurant" },
      rating: 4.8,
    },
    {
      externalId: "mock-3",
      name: "Cucina Paradiso Senza Glutine",
      location: { lat: -34.5772, lng: -58.4377 },
      address: "Arévalo 1538, Palermo",
      tags: { cuisine: "italian;pasta;pizza", amenity: "restaurant", "diet:gluten_free": "only", "diet:celiac": "yes" },
      rating: 4.7,
    },
    {
      externalId: "mock-4",
      name: "Osaka Nikkei",
      location: { lat: -34.5841, lng: -58.4239 },
      address: "Soler 5608, Palermo Hollywood",
      tags: { cuisine: "japanese;peruvian;sushi;fusion", amenity: "restaurant" },
      rating: 4.9,
    },
    {
      externalId: "mock-5",
      name: "Taco Box",
      location: { lat: -34.5823, lng: -58.4351 },
      address: "Soler 5598, Palermo",
      tags: { cuisine: "mexican;tex-mex;tacos", amenity: "restaurant", "diet:vegetarian": "yes" },
      rating: 4.3,
    },
    {
      externalId: "mock-6",
      name: "Antares Craft Beer & Burgers",
      location: { lat: -34.5898, lng: -58.4291 },
      address: "Armenia 1447, Palermo",
      tags: { cuisine: "burger;bar_food", amenity: "pub", brewery: "yes" },
      rating: 4.4,
    },
    {
      externalId: "mock-7",
      name: "La Alacena Pastificio",
      location: { lat: -34.5881, lng: -58.4192 },
      address: "Gascón 1396, Palermo",
      tags: { cuisine: "italian;pasta;bakery", amenity: "restaurant" },
      rating: 4.7,
    },
    {
      externalId: "mock-8",
      name: "Mishiguene Cocina Judía",
      location: { lat: -34.5802, lng: -58.4121 },
      address: "Lafinur 3368, Palermo",
      tags: { cuisine: "jewish;middle_eastern;gourmet", amenity: "restaurant", "diet:kosher": "yes" },
      rating: 4.8,
    },

    // San Telmo / Montserrat / Puerto Madero (Comuna 1)
    {
      externalId: "mock-9",
      name: "La Brigada Parrilla",
      location: { lat: -34.6186, lng: -58.3712 },
      address: "Estados Unidos 465, San Telmo",
      tags: { cuisine: "argentinian;parrilla;steakhouse", amenity: "restaurant", "diet:gluten_free": "yes" },
      rating: 4.6,
    },
    {
      externalId: "mock-10",
      name: "Pizzería Güerrin",
      location: { lat: -34.6042, lng: -58.3862 },
      address: "Av. Corrientes 1368, Centro",
      tags: { cuisine: "italian;pizza", amenity: "restaurant", "diet:vegetarian": "yes" },
      rating: 4.8,
    },
    {
      externalId: "mock-11",
      name: "Café Tortoni",
      location: { lat: -34.6083, lng: -58.3792 },
      address: "Av. de Mayo 825, Montserrat",
      tags: { cuisine: "cafe;bakery;traditional", amenity: "cafe" },
      rating: 4.6,
    },
    {
      externalId: "mock-12",
      name: "Cabaña Las Lilas",
      location: { lat: -34.6052, lng: -58.3654 },
      address: "Av. Alicia Moreau de Justo 516, Puerto Madero",
      tags: { cuisine: "argentinian;parrilla;fine_dining", amenity: "restaurant" },
      rating: 4.7,
    },

    // Recoleta (Comuna 2)
    {
      externalId: "mock-13",
      name: "Fervor Brasas",
      location: { lat: -34.5891, lng: -58.3892 },
      address: "Posadas 1519, Recoleta",
      tags: { cuisine: "argentinian;parrilla;seafood", amenity: "restaurant" },
      rating: 4.7,
    },
    {
      externalId: "mock-14",
      name: "Roux Bistró",
      location: { lat: -34.5872, lng: -58.3941 },
      address: "Peña 2300, Recoleta",
      tags: { cuisine: "gourmet;de_autor;french", amenity: "restaurant" },
      rating: 4.8,
    },

    // Belgrano / Chinatown (Comuna 13)
    {
      externalId: "mock-15",
      name: "Hong Kong Style Dim Sum",
      location: { lat: -34.5582, lng: -58.4553 },
      address: "Montañeses 2149, Barrio Chino",
      tags: { cuisine: "chinese;asian;dim_sum", amenity: "restaurant", "diet:vegan": "yes" },
      rating: 4.6,
    },
    {
      externalId: "mock-16",
      name: "Corte Comedor",
      location: { lat: -34.5541, lng: -58.4512 },
      address: "Olazábal 1391, Belgrano",
      tags: { cuisine: "argentinian;parrilla;de_autor", amenity: "restaurant" },
      rating: 4.8,
    },
    {
      externalId: "mock-17",
      name: "Nobiru Izakaya",
      location: { lat: -34.5574, lng: -58.4539 },
      address: "Mendoza 1627, Belgrano",
      tags: { cuisine: "japanese;ramen;sushi", amenity: "restaurant" },
      rating: 4.5,
    },

    // Villa Crespo & Chacarita (Comuna 15)
    {
      externalId: "mock-18",
      name: "Sarkis Cocina Armenia",
      location: { lat: -34.5905, lng: -58.4382 },
      address: "Thames 1101, Villa Crespo",
      tags: { cuisine: "armenian;middle_eastern", amenity: "restaurant", "diet:vegetarian": "yes", "diet:vegan": "yes" },
      rating: 4.8,
    },
    {
      externalId: "mock-19",
      name: "Donnet Hongos & Plant Based",
      location: { lat: -34.5861, lng: -58.4472 },
      address: "Av. Jorge Newbery 4081, Chacarita",
      tags: { cuisine: "vegan;organic;healthy", amenity: "restaurant", "diet:vegan": "only", "diet:celiac": "yes" },
      rating: 4.7,
    },
    {
      externalId: "mock-20",
      name: "Anchoíta Cava & Cocina",
      location: { lat: -34.5882, lng: -58.4431 },
      address: "Juan Ramírez de Velasco 1520, Chacarita",
      tags: { cuisine: "argentinian;de_autor;wine_bar", amenity: "restaurant" },
      rating: 4.9,
    },

    // Caballito / Almagro / Boedo (Comunas 5 y 6)
    {
      externalId: "mock-21",
      name: "Las Violetas",
      location: { lat: -34.6184, lng: -58.4214 },
      address: "Av. Rivadavia 3899, Almagro",
      tags: { cuisine: "cafe;bakery;pasteleria", amenity: "cafe", "diet:vegetarian": "yes" },
      rating: 4.6,
    },
    {
      externalId: "mock-22",
      name: "El Boliche de Darío",
      location: { lat: -34.6212, lng: -58.4451 },
      address: "Coronel Díaz 700, Caballito",
      tags: { cuisine: "argentinian;parrilla;bodegon", amenity: "restaurant" },
      rating: 4.5,
    },

    // La Boca & Barracas (Comuna 4)
    {
      externalId: "mock-23",
      name: "El Obrero Bodegón",
      location: { lat: -34.6341, lng: -58.3615 },
      address: "Agustín R. Caffarena 64, La Boca",
      tags: { cuisine: "argentinian;bodegon", amenity: "restaurant" },
      rating: 4.5,
    },

    // Devoto & Villa Urquiza (Comunas 11 y 12)
    {
      externalId: "mock-24",
      name: "Café de la Plaza Devoto",
      location: { lat: -34.6072, lng: -58.5023 },
      address: "Av. Lincoln 3990, Villa Devoto",
      tags: { cuisine: "cafe;pizzeria;bodegon", amenity: "restaurant" },
      rating: 4.4,
    },
    {
      externalId: "mock-25",
      name: "Parrilla Urquiza",
      location: { lat: -34.5732, lng: -58.4912 },
      address: "Av. Triunvirato 4500, Villa Urquiza",
      tags: { cuisine: "argentinian;parrilla", amenity: "restaurant" },
      rating: 4.3,
    },
  ];

  private calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  async searchNearby(params: SearchNearbyParams): Promise<PlaceRaw[]> {
    const { lat, lng, radiusKm } = params;

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      throw new InvalidCoordinatesError(`Coordinates (${lat}, ${lng}) out of range`);
    }
    if (radiusKm <= 0) {
      throw new InvalidCoordinatesError(`Radius must be positive`);
    }

    // 1. Filtrar los lugares base que caen dentro del radio
    const withinRadius = this.basePlaces.filter((p) => {
      const dist = this.calculateDistanceKm(lat, lng, p.location.lat, p.location.lng);
      return dist <= radiusKm;
    });

    // 2. Si hay pocos dentro del radio (por ejemplo en una comuna periférica o radio muy chico),
    // generar puntos cercanos dinámicos proporcionales al radio para que siempre haya variedad (15 a 45 lugares)
    const results: PlaceRaw[] = [...withinRadius];
    const targetCount = Math.min(Math.max(12, Math.round(radiusKm * 6)), 50);

    const sampleCuisines = [
      { name: "Parrilla", cuisine: "argentinian;parrilla", theme: "Parrilla / Asador" },
      { name: "Trattoria", cuisine: "italian;pasta;pizza", theme: "Pizzería" },
      { name: "Sushi House", cuisine: "japanese;sushi", theme: "Casual" },
      { name: "Taquería", cuisine: "mexican;tacos", theme: "Casual" },
      { name: "Bodegón Porteño", cuisine: "argentinian;bodegon", theme: "Bodegón" },
      { name: "Cervecería Artesanal", cuisine: "burger;pub", theme: "Bar / Cervecería" },
      { name: "Café & Delicias", cuisine: "cafe;bakery", theme: "Cafetería / Bakery" },
      { name: "Verde Gourmet", cuisine: "vegan;healthy", theme: "Romántico / De Autor", diet: "diet:vegan" },
      { name: "Senza Glutine", cuisine: "italian;gluten_free", theme: "Pizzería", diet: "diet:gluten_free" },
    ];

    let seed = 1;
    while (results.length < targetCount) {
      const template = sampleCuisines[seed % sampleCuisines.length];
      const angle = (seed * 137.5 * Math.PI) / 180; // Golden ratio distribution
      const dist = (radiusKm * 0.2) + (radiusKm * 0.7 * (seed / targetCount));
      const latOffset = (dist / 111) * Math.cos(angle);
      const lngOffset = (dist / (111 * Math.cos((lat * Math.PI) / 180))) * Math.sin(angle);

      results.push({
        externalId: `mock-dyn-${seed}`,
        name: `${template.name} ${seed}`,
        location: {
          lat: lat + latOffset,
          lng: lng + lngOffset,
        },
        address: `Zona de búsqueda ${seed}`,
        tags: {
          cuisine: template.cuisine,
          amenity: "restaurant",
          ...(template.diet ? { [template.diet]: "yes" } : {}),
        },
        rating: 4.0 + (seed % 10) * 0.1,
      });

      seed++;
    }

    return results;
  }
}
