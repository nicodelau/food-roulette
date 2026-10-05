import { IPlacesProvider, SearchNearbyParams } from "./types";
import { PlaceRaw, PriceLevel } from "../types";
import { InvalidCoordinatesError } from "./errors";
import baDataJson from "../../data/ba_data_gastronomia.json";

export class MockPlacesProvider implements IPlacesProvider {
  private static readonly CURATED_PLACES: PlaceRaw[] = [
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

    // Más lugares reales y verificados de Palermo, Recoleta, San Telmo, Belgrano y Centro
    {
      externalId: "mock-26",
      name: "La Cabrera Sur",
      location: { lat: -34.5901, lng: -58.4322 },
      address: "José A. Cabrera 5099, Palermo",
      tags: { cuisine: "argentinian;parrilla;steakhouse", amenity: "restaurant" },
      rating: 4.7,
    },
    {
      externalId: "mock-27",
      name: "Niño Gordo Asian Grill",
      location: { lat: -34.5878, lng: -58.4283 },
      address: "Thames 1810, Palermo",
      tags: { cuisine: "asian;fusion;grill", amenity: "restaurant" },
      rating: 4.6,
    },
    {
      externalId: "mock-28",
      name: "La Carnicería",
      location: { lat: -34.5895, lng: -58.4258 },
      address: "Jorge Luis Borges 1772, Palermo",
      tags: { cuisine: "argentinian;parrilla;smoked", amenity: "restaurant" },
      rating: 4.7,
    },
    {
      externalId: "mock-29",
      name: "Cuervo Café",
      location: { lat: -34.5912, lng: -58.4235 },
      address: "El Salvador 4580, Palermo",
      tags: { cuisine: "cafe;specialty_coffee;pasteleria", amenity: "cafe", "diet:vegan": "yes" },
      rating: 4.8,
    },
    {
      externalId: "mock-30",
      name: "Tres Monos Bar",
      location: { lat: -34.5867, lng: -58.4252 },
      address: "Guatemala 4899, Palermo",
      tags: { cuisine: "bar_food;tapas;cocktails", amenity: "pub" },
      rating: 4.9,
    },
    {
      externalId: "mock-31",
      name: "Lo de Jesús Parrilla",
      location: { lat: -34.5908, lng: -58.4301 },
      address: "Gurruchaga 1406, Palermo",
      tags: { cuisine: "argentinian;parrilla;wine_bar", amenity: "restaurant" },
      rating: 4.6,
    },
    {
      externalId: "mock-32",
      name: "Chori",
      location: { lat: -34.5887, lng: -58.4299 },
      address: "Thames 1653, Palermo",
      tags: { cuisine: "argentinian;choripan;fast_food", amenity: "fast_food" },
      rating: 4.5,
    },
    {
      externalId: "mock-33",
      name: "El Cuartito Pizzería",
      location: { lat: -34.5976, lng: -58.3846 },
      address: "Talcahuano 937, Retiro",
      tags: { cuisine: "italian;pizza;fugazzeta", amenity: "restaurant", "diet:vegetarian": "yes" },
      rating: 4.7,
    },
    {
      externalId: "mock-34",
      name: "Pizzería Banchero",
      location: { lat: -34.6045, lng: -58.3855 },
      address: "Av. Corrientes 1300, San Nicolás",
      tags: { cuisine: "italian;pizza;traditional", amenity: "restaurant" },
      rating: 4.4,
    },
    {
      externalId: "mock-35",
      name: "Bar El Federal",
      location: { lat: -34.6198, lng: -58.3725 },
      address: "Carlos Calvo 599, San Telmo",
      tags: { cuisine: "argentinian;cafe;bodegon", amenity: "cafe" },
      rating: 4.5,
    },
    {
      externalId: "mock-36",
      name: "Santos Manjares",
      location: { lat: -34.5989, lng: -58.3798 },
      address: "Paraguay 938, Retiro",
      tags: { cuisine: "argentinian;parrilla;bodegon", amenity: "restaurant" },
      rating: 4.6,
    },
    {
      externalId: "mock-37",
      name: "Los Galgos Bar",
      location: { lat: -34.6051, lng: -58.3912 },
      address: "Av. Callao 501, Balvanera",
      tags: { cuisine: "cafe;bar_food;traditional", amenity: "cafe" },
      rating: 4.6,
    },
    {
      externalId: "mock-38",
      name: "El Sanjuanino Empanadas",
      location: { lat: -34.5893, lng: -58.3889 },
      address: "Posadas 1515, Recoleta",
      tags: { cuisine: "argentinian;empanadas;traditional", amenity: "restaurant" },
      rating: 4.7,
    },
    {
      externalId: "mock-39",
      name: "Restaurante Oviedo",
      location: { lat: -34.5916, lng: -58.4011 },
      address: "Antonio Beruti 2602, Recoleta",
      tags: { cuisine: "spanish;seafood;mediterranean", amenity: "restaurant" },
      rating: 4.8,
    },
    {
      externalId: "mock-40",
      name: "Milión Restaurant & Bar",
      location: { lat: -34.5968, lng: -58.3897 },
      address: "Paraná 1048, Recoleta",
      tags: { cuisine: "gourmet;cocktails;tapas", amenity: "restaurant" },
      rating: 4.5,
    },
    {
      externalId: "mock-41",
      name: "La Biela Café",
      location: { lat: -34.5878, lng: -58.3911 },
      address: "Av. Quintana 596, Recoleta",
      tags: { cuisine: "cafe;pasteleria;traditional", amenity: "cafe" },
      rating: 4.4,
    },
    {
      externalId: "mock-42",
      name: "Narda Comedor",
      location: { lat: -34.5518, lng: -58.4468 },
      address: "Mariscal Antonio José de Sucre 664, Belgrano",
      tags: { cuisine: "healthy;de_autor;organic", amenity: "restaurant", "diet:vegetarian": "yes" },
      rating: 4.6,
    },
    {
      externalId: "mock-43",
      name: "Sucre Restaurant",
      location: { lat: -34.5522, lng: -58.4471 },
      address: "Sucre 676, Belgrano",
      tags: { cuisine: "gourmet;parrilla;wine_bar", amenity: "restaurant" },
      rating: 4.6,
    },
    {
      externalId: "mock-44",
      name: "Oporto Almacén",
      location: { lat: -34.5451, lng: -58.4612 },
      address: "11 de Septiembre 4152, Nuñez",
      tags: { cuisine: "argentinian;bodegon;wine_bar", amenity: "restaurant" },
      rating: 4.7,
    },
    {
      externalId: "mock-45",
      name: "Sifón Sodería",
      location: { lat: -34.5875, lng: -58.4452 },
      address: "Av. Jorge Newbery 3881, Chacarita",
      tags: { cuisine: "tapas;vermuteria;bar_food", amenity: "pub" },
      rating: 4.7,
    },
    {
      externalId: "mock-46",
      name: "La Fuerza Vermutería",
      location: { lat: -34.5914, lng: -58.4445 },
      address: "Av. Dorrego 1409, Chacarita",
      tags: { cuisine: "bar_food;tapas;vermuteria", amenity: "pub" },
      rating: 4.7,
    },
    {
      externalId: "mock-47",
      name: "Águila Pabellón",
      location: { lat: -34.5779, lng: -58.4172 },
      address: "Av. Sarmiento 2725, Palermo",
      tags: { cuisine: "gourmet;cafe;bistro", amenity: "restaurant" },
      rating: 4.6,
    },
    {
      externalId: "mock-48",
      name: "Café Margot",
      location: { lat: -34.6231, lng: -58.4168 },
      address: "Av. Boedo 857, Boedo",
      tags: { cuisine: "cafe;bodegon;traditional", amenity: "cafe" },
      rating: 4.5,
    },
    {
      externalId: "mock-49",
      name: "Parrilla El Pobre Luis",
      location: { lat: -34.5562, lng: -58.4528 },
      address: "Arribeños 2393, Belgrano",
      tags: { cuisine: "argentinian;parrilla;steakhouse", amenity: "restaurant" },
      rating: 4.7,
    },
    {
      externalId: "mock-50",
      name: "Pizzería San Antonio",
      location: { lat: -34.6312, lng: -58.4185 },
      address: "Av. Juan de Garay 3528, Boedo",
      tags: { cuisine: "italian;pizza;empanadas", amenity: "restaurant" },
      rating: 4.6,
    },
    {
      externalId: "mock-51",
      name: "Los Chanchitos",
      location: { lat: -34.6075, lng: -58.4362 },
      address: "Ángel Gallardo 601, Caballito",
      tags: { cuisine: "argentinian;bodegon;pastas", amenity: "restaurant" },
      rating: 4.5,
    },
    {
      externalId: "mock-52",
      name: "Bellagamba Bodegón",
      location: { lat: -34.6105, lng: -58.3985 },
      address: "Av. Rivadavia 2138, Balvanera",
      tags: { cuisine: "argentinian;bodegon;milanesas", amenity: "restaurant" },
      rating: 4.3,
    },
    {
      externalId: "mock-53",
      name: "Parrilla Peña",
      location: { lat: -34.6012, lng: -58.3888 },
      address: "Rodríguez Peña 682, San Nicolás",
      tags: { cuisine: "argentinian;parrilla;traditional", amenity: "restaurant" },
      rating: 4.7,
    },
    {
      externalId: "mock-54",
      name: "Dandy Grill",
      location: { lat: -34.5791, lng: -58.4062 },
      address: "Av. del Libertador 2410, Palermo",
      tags: { cuisine: "argentinian;parrilla;bistro", amenity: "restaurant" },
      rating: 4.5,
    },
    {
      externalId: "mock-55",
      name: "Raggio Osteria",
      location: { lat: -34.5855, lng: -58.4245 },
      address: "Gurruchaga 2121, Palermo",
      tags: { cuisine: "italian;pasta;wine_bar", amenity: "restaurant" },
      rating: 4.7,
    },
    {
      externalId: "mock-56",
      name: "Broccolino Ristorante",
      location: { lat: -34.5992, lng: -58.3781 },
      address: "Esmeralda 776, Retiro",
      tags: { cuisine: "italian;pasta;traditional", amenity: "restaurant" },
      rating: 4.6,
    },
    {
      externalId: "mock-57",
      name: "El Trapiche Parrilla",
      location: { lat: -34.5815, lng: -58.4278 },
      address: "Paraguay 5099, Palermo",
      tags: { cuisine: "argentinian;parrilla;bodegon", amenity: "restaurant" },
      rating: 4.6,
    },
    {
      externalId: "mock-58",
      name: "Florería Atlántico",
      location: { lat: -34.5922, lng: -58.3812 },
      address: "Arroyo 872, Retiro",
      tags: { cuisine: "seafood;tapas;cocktails", amenity: "restaurant" },
      rating: 4.8,
    },
    {
      externalId: "mock-59",
      name: "La Lechería Café",
      location: { lat: -34.5612, lng: -58.4565 },
      address: "Av. Juramento 1945, Belgrano",
      tags: { cuisine: "cafe;bakery;heladeria", amenity: "cafe" },
      rating: 4.5,
    },

    // AMBA Norte: Vicente López
    {
      externalId: "amba-vl-1",
      name: "Cut Parrilla Olivos",
      location: { lat: -34.5126, lng: -58.4842 },
      address: "Av. del Libertador 2418, Olivos",
      tags: { cuisine: "argentinian;parrilla;steakhouse", amenity: "restaurant" },
      rating: 4.8,
      priceLevel: 3,
      zoneId: "amba-vicente-lopez",
    },
    {
      externalId: "amba-vl-2",
      name: "Asato Sushi Olivos",
      location: { lat: -34.5152, lng: -58.4871 },
      address: "Corrientes 584, Olivos",
      tags: { cuisine: "japanese;sushi;asian", amenity: "restaurant" },
      rating: 4.9,
      priceLevel: 3,
      zoneId: "amba-vicente-lopez",
    },
    {
      externalId: "amba-vl-3",
      name: "La Farola de Olivos",
      location: { lat: -34.5218, lng: -58.4883 },
      address: "Av. Maipú 2700, Olivos",
      tags: { cuisine: "argentinian;pizza;milanesa", amenity: "restaurant" },
      rating: 4.3,
      priceLevel: 1,
      zoneId: "amba-vicente-lopez",
    },

    // AMBA Norte: San Isidro
    {
      externalId: "amba-si-1",
      name: "Alo's Bistro San Isidro",
      location: { lat: -34.4984, lng: -58.5412 },
      address: "Blanco Encalada 2120, Boulogne",
      tags: { cuisine: "gourmet;de_autor;french", amenity: "restaurant" },
      rating: 4.9,
      priceLevel: 3,
      zoneId: "amba-san-isidro",
    },
    {
      externalId: "amba-si-2",
      name: "La Rosa Negra",
      location: { lat: -34.4912, lng: -58.5132 },
      address: "Dardo Rocha 1918, Martínez",
      tags: { cuisine: "argentinian;international;bar", amenity: "restaurant" },
      rating: 4.6,
      priceLevel: 3,
      zoneId: "amba-san-isidro",
    },
    {
      externalId: "amba-si-3",
      name: "El Hornero Parrilla",
      location: { lat: -34.4754, lng: -58.5321 },
      address: "Juan Segundo Fernández 151, San Isidro",
      tags: { cuisine: "argentinian;parrilla", amenity: "restaurant" },
      rating: 4.5,
      priceLevel: 2,
      zoneId: "amba-san-isidro",
    },

    // AMBA Norte: Tigre
    {
      externalId: "amba-tigre-1",
      name: "Il Novo María del Luján",
      location: { lat: -34.4172, lng: -58.5778 },
      address: "Paseo Victorica 511, Tigre",
      tags: { cuisine: "italian;pasta;seafood", amenity: "restaurant" },
      rating: 4.7,
      priceLevel: 2,
      zoneId: "amba-tigre",
    },
    {
      externalId: "amba-tigre-2",
      name: "Kanoo Cocina de Río",
      location: { lat: -34.4095, lng: -58.5632 },
      address: "Río Sarmiento 398, Delta Tigre",
      tags: { cuisine: "argentinian;seafood;de_autor", amenity: "restaurant" },
      rating: 4.7,
      priceLevel: 2,
      zoneId: "amba-tigre",
    },

    // AMBA Norte: San Martín & Pilar
    {
      externalId: "amba-sm-1",
      name: "Bodegón La Chicha",
      location: { lat: -34.5512, lng: -58.5524 },
      address: "Lacroze 4800, Villa Ballester",
      tags: { cuisine: "argentinian;bodegon;traditional", amenity: "restaurant" },
      rating: 4.5,
      priceLevel: 1,
      zoneId: "amba-san-martin",
    },
    {
      externalId: "amba-pilar-1",
      name: "La Aldea Parrilla Pilar",
      location: { lat: -34.4532, lng: -58.8891 },
      address: "Panamericana Km 44, Pilar",
      tags: { cuisine: "argentinian;parrilla", amenity: "restaurant" },
      rating: 4.6,
      priceLevel: 2,
      zoneId: "amba-pilar",
    },

    // AMBA Oeste: Morón & Castelar
    {
      externalId: "amba-moron-1",
      name: "Don Battaglia Trattoria",
      location: { lat: -34.6538, lng: -58.6291 },
      address: "Carlos Casares 948, Castelar",
      tags: { cuisine: "italian;bodegon;pasta", amenity: "restaurant" },
      rating: 4.7,
      priceLevel: 2,
      zoneId: "amba-moron-castelar",
    },
    {
      externalId: "amba-moron-2",
      name: "The Galley Burger Morón",
      location: { lat: -34.6519, lng: -58.6183 },
      address: "Brown 828, Morón",
      tags: { cuisine: "burger;american;casual", amenity: "restaurant" },
      rating: 4.6,
      priceLevel: 1,
      zoneId: "amba-moron-castelar",
    },

    // AMBA Oeste: Ramos Mejía
    {
      externalId: "amba-rm-1",
      name: "Cervecería Baum Ramos Mejía",
      location: { lat: -34.6468, lng: -58.5658 },
      address: "Av. de Mayo 600, Ramos Mejía",
      tags: { cuisine: "burger;brewery;pub", amenity: "pub" },
      rating: 4.5,
      priceLevel: 2,
      zoneId: "amba-ramos-mejia",
    },
    {
      externalId: "amba-rm-2",
      name: "Lo de Carlitos Ramos Mejía",
      location: { lat: -34.6441, lng: -58.5645 },
      address: "Av. de Mayo 280, Ramos Mejía",
      tags: { cuisine: "argentinian;crepes;casual", amenity: "restaurant" },
      rating: 4.4,
      priceLevel: 1,
      zoneId: "amba-ramos-mejia",
    },

    // AMBA Oeste: Parque Leloir & Tres de Febrero
    {
      externalId: "amba-leloir-1",
      name: "Bruce Grill Station Leloir",
      location: { lat: -34.6228, lng: -58.6871 },
      address: "Martín Fierro 3246, Parque Leloir",
      tags: { cuisine: "american;bbq;steakhouse", amenity: "restaurant" },
      rating: 4.8,
      priceLevel: 3,
      zoneId: "amba-parque-leloir",
    },
    {
      externalId: "amba-leloir-2",
      name: "Kansas Grill Parque Leloir",
      location: { lat: -34.6235, lng: -58.6892 },
      address: "Martín Fierro 3361, Parque Leloir",
      tags: { cuisine: "american;steakhouse;contemporary", amenity: "restaurant" },
      rating: 4.8,
      priceLevel: 3,
      zoneId: "amba-parque-leloir",
    },
    {
      externalId: "amba-tdf-1",
      name: "Tip Top Cervecería Ciudad Jardín",
      location: { lat: -34.5985, lng: -58.5881 },
      address: "Boulevard San Martín 2980, Ciudad Jardín",
      tags: { cuisine: "german;pub;casual", amenity: "pub" },
      rating: 4.5,
      priceLevel: 1,
      zoneId: "amba-tres-de-febrero",
    },

    // AMBA Sur: Lomas de Zamora (Las Lomitas)
    {
      externalId: "amba-lomas-1",
      name: "Bodega Las Lomitas",
      location: { lat: -34.7621, lng: -58.4024 },
      address: "Italia 450, Lomas de Zamora",
      tags: { cuisine: "argentinian;wine_bar;tapas", amenity: "restaurant" },
      rating: 4.7,
      priceLevel: 2,
      zoneId: "amba-lomas-de-zamora",
    },
    {
      externalId: "amba-lomas-2",
      name: "Antares Las Lomitas",
      location: { lat: -34.7615, lng: -58.4018 },
      address: "Sixto Fernández 289, Las Lomitas",
      tags: { cuisine: "burger;brewery;bar_food", amenity: "pub" },
      rating: 4.5,
      priceLevel: 2,
      zoneId: "amba-lomas-de-zamora",
    },

    // AMBA Sur: Quilmes & Lanús
    {
      externalId: "amba-quilmes-1",
      name: "Parque Cervecero Quilmes",
      location: { lat: -34.7265, lng: -58.2678 },
      address: "Av. 12 de Octubre y Gran Canaria, Quilmes",
      tags: { cuisine: "brewery;traditional;parrilla", amenity: "restaurant" },
      rating: 4.7,
      priceLevel: 2,
      zoneId: "amba-quilmes",
    },
    {
      externalId: "amba-lanus-1",
      name: "Taberna de Lanús",
      location: { lat: -34.7042, lng: -58.3912 },
      address: "Del Valle Iberlucea 2750, Lanucita",
      tags: { cuisine: "spanish;tapas;wine_bar", amenity: "restaurant" },
      rating: 4.6,
      priceLevel: 2,
      zoneId: "amba-lanus",
    },
    {
      externalId: "amba-lanus-2",
      name: "Guten Bier Lanús",
      location: { lat: -34.7031, lng: -58.3908 },
      address: "Del Valle Iberlucea 2650, Lanús",
      tags: { cuisine: "brewery;burger;pub", amenity: "pub" },
      rating: 4.4,
      priceLevel: 2,
      zoneId: "amba-lanus",
    },

    // AMBA Sur: Avellaneda & Adrogué
    {
      externalId: "amba-avell-1",
      name: "Pizzería Los Campeones",
      location: { lat: -34.6642, lng: -58.3685 },
      address: "Av. Mitre 500, Avellaneda",
      tags: { cuisine: "pizza;italian", amenity: "restaurant" },
      rating: 4.6,
      priceLevel: 1,
      zoneId: "amba-avellaneda",
    },
    {
      externalId: "amba-adrogue-1",
      name: "Folies Bistro Adrogué",
      location: { lat: -34.7972, lng: -58.3892 },
      address: "Mitre 1050, Adrogué",
      tags: { cuisine: "french;de_autor;bistro", amenity: "restaurant" },
      rating: 4.8,
      priceLevel: 3,
      zoneId: "amba-almirante-brown",
    },

    // Provincia de Buenos Aires: La Plata & City Bell
    {
      externalId: "pba-lp-1",
      name: "Baxar Mercado Gastronómico",
      location: { lat: -34.9152, lng: -57.9482 },
      address: "Calle 51 entre 5 y 6, La Plata",
      tags: { cuisine: "varied;gourmet;market", amenity: "restaurant" },
      rating: 4.8,
      priceLevel: 2,
      zoneId: "pba-la-plata",
    },
    {
      externalId: "pba-lp-2",
      name: "Café Urquiza La Plata",
      location: { lat: -34.9254, lng: -57.9582 },
      address: "Calle 13 y 56, La Plata",
      tags: { cuisine: "cafe;bakery;bistro", amenity: "cafe" },
      rating: 4.7,
      priceLevel: 2,
      zoneId: "pba-la-plata",
    },
    {
      externalId: "pba-cb-1",
      name: "Paesano Ristorante City Bell",
      location: { lat: -34.8624, lng: -58.0441 },
      address: "Calle 13C y Cantilo, City Bell",
      tags: { cuisine: "italian;pizza;pasta", amenity: "restaurant" },
      rating: 4.8,
      priceLevel: 2,
      zoneId: "pba-city-bell",
    },
    {
      externalId: "pba-merc-1",
      name: "Restaurante Silvano Tomás Jofré",
      location: { lat: -34.6712, lng: -59.3812 },
      address: "Calle Principal s/n, Tomás Jofré, Mercedes",
      tags: { cuisine: "argentinian;campo;pasta;parrilla", amenity: "restaurant" },
      rating: 4.7,
      priceLevel: 2,
      zoneId: "pba-mercedes-areco",
    },
  ];

  private basePlaces: PlaceRaw[];

  constructor(customPlaces?: PlaceRaw[]) {
    if (customPlaces) {
      this.basePlaces = customPlaces;
    } else {
      this.basePlaces = MockPlacesProvider.CURATED_PLACES.map((p) => ({ ...p }));
      this.ensureZoneIds();
      this.loadBaDataPlaces();
    }
  }

  private loadBaDataPlaces(): void {
    const existingNames = new Set(
      this.basePlaces.map((p) => p.name.trim().toLowerCase())
    );
    for (const item of baDataJson as any[]) {
      const name = String(item.name).trim();
      if (!existingNames.has(name.toLowerCase())) {
        existingNames.add(name.toLowerCase());
        this.basePlaces.push({
          externalId: String(item.externalId),
          name: name,
          location: {
            lat: Number(item.location.lat),
            lng: Number(item.location.lng),
          },
          address: item.address ? String(item.address) : undefined,
          tags: item.tags ? (item.tags as Record<string, string>) : undefined,
          rating: item.rating ? Number(item.rating) : undefined,
          priceLevel: (item.priceLevel ?? 2) as PriceLevel,
          zoneId: item.zoneId ? String(item.zoneId) : undefined,
        });
      }
    }
  }

  private ensureZoneIds(): void {
    for (const place of this.basePlaces) {
      if (!place.zoneId) {
        place.zoneId = this.inferZoneId(place);
      }
    }
  }

  private inferZoneId(place: PlaceRaw): string {
    const addr = (place.address || "").toLowerCase();
    if (addr.includes("palermo")) return "caba-14";
    if (
      addr.includes("san telmo") ||
      addr.includes("centro") ||
      addr.includes("montserrat") ||
      addr.includes("puerto madero") ||
      addr.includes("retiro")
    )
      return "caba-1";
    if (addr.includes("recoleta")) return "caba-2";
    if (
      addr.includes("belgrano") ||
      addr.includes("barrio chino") ||
      addr.includes("núñez")
    )
      return "caba-13";
    if (addr.includes("villa crespo") || addr.includes("chacarita"))
      return "caba-15";
    if (addr.includes("caballito")) return "caba-6";
    if (addr.includes("almagro") || addr.includes("boedo")) return "caba-5";
    if (addr.includes("la boca") || addr.includes("barracas")) return "caba-4";
    if (addr.includes("devoto")) return "caba-11";
    if (addr.includes("urquiza") || addr.includes("saavedra")) return "caba-12";
    if (addr.includes("flores")) return "caba-7";
    return "caba-14";
  }

  async searchByZones(zoneIds: string[]): Promise<PlaceRaw[]> {
    if (!zoneIds || zoneIds.length === 0) {
      return this.basePlaces.slice(0, 40);
    }
    const zoneSet = new Set(zoneIds);
    return this.basePlaces.filter((p) => p.zoneId && zoneSet.has(p.zoneId));
  }

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

    // Calculate proximity to every real verified establishment
    const placesWithDistance = this.basePlaces.map((p) => ({
      place: p,
      dist: this.calculateDistanceKm(lat, lng, p.location.lat, p.location.lng),
    }));

    // Sort ascending by distance
    placesWithDistance.sort((a, b) => a.dist - b.dist);

    // Filter places strictly within the requested radius
    const withinRadius = placesWithDistance
      .filter((item) => item.dist <= radiusKm)
      .map((item) => item.place);

    // If there are at least 6 real places in radius, return them (up to 40)
    if (withinRadius.length >= 6) {
      return withinRadius.slice(0, 40);
    }

    // If radius is very small or in a peripheral neighborhood with few base entries,
    // take the closest real verified places (up to 25) so the user always has genuine choices.
    // Strictly NO synthetic dummy places or artificial coordinates are ever generated.
    return placesWithDistance
      .slice(0, Math.min(25, this.basePlaces.length))
      .map((item) => item.place);
  }
}
