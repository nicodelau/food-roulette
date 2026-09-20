import { ClassifiedRestaurant, DietaryRestriction, PlaceRaw } from "../types";

interface TaxonomyRule {
  category: string;
  keywords: string[];
}

const CUISINE_RULES: TaxonomyRule[] = [
  {
    category: "Italiana",
    keywords: ["italian", "italiana", "pasta", "pizza", "trattoria", "pizzeria", "pizzería"],
  },
  {
    category: "Argentina",
    keywords: [
      "argentinian",
      "argentina",
      "parrilla",
      "asado",
      "empanadas",
      "milanesa",
      "milanesas",
      "bodegon",
      "bodegón",
    ],
  },
  {
    category: "Japonesa / Sushi",
    keywords: ["japanese", "japonesa", "sushi", "ramen", "nikkei", "izakaya"],
  },
  {
    category: "Mexicana",
    keywords: ["mexican", "mexicana", "tex-mex", "taco", "tacos", "burrito", "quesadilla"],
  },
  {
    category: "Armenia / Medio Oriente",
    keywords: [
      "armenian",
      "armenia",
      "middle_eastern",
      "lebanese",
      "arabe",
      "árabe",
      "falafel",
      "shawarma",
      "hummus",
    ],
  },
  {
    category: "Americana / Burgers",
    keywords: ["burger", "burgers", "american", "hamburguesa", "hamburguesas", "bbq"],
  },
  {
    category: "Peruana",
    keywords: ["peruvian", "peruana", "ceviche", "cebiche", "anticuchos"],
  },
  {
    category: "Española",
    keywords: ["spanish", "española", "tapas", "paella", "taberna"],
  },
  {
    category: "China / Asiática",
    keywords: ["chinese", "china", "asian", "asiatica", "asiática", "wok", "korean", "thai", "vietnamese"],
  },
  {
    category: "Café & Pastelería",
    keywords: ["cafe", "café", "coffee", "bakery", "panaderia", "panadería", "pasteleria", "pastelería"],
  },
];

const THEME_RULES: TaxonomyRule[] = [
  {
    category: "Bodegón",
    keywords: ["bodegon", "bodegón", "cantina", "porteño"],
  },
  {
    category: "Parrilla / Asador",
    keywords: ["parrilla", "asador", "steak_house", "steakhouse"],
  },
  {
    category: "Pizzería",
    keywords: ["pizza", "pizzeria", "pizzería"],
  },
  {
    category: "Bar / Cervecería",
    keywords: ["pub", "bar", "brewery", "cerveceria", "cervecería", "craft_beer", "cerveza"],
  },
  {
    category: "Cafetería / Bakery",
    keywords: ["cafe", "café", "coffee_shop", "bakery", "pasteleria", "confiteria"],
  },
  {
    category: "Romántico / De Autor",
    keywords: ["fine_dining", "romantico", "romántico", "de_autor", "gourmet", "bistró", "bistro"],
  },
];

export class ClassifierService {
  classify(place: PlaceRaw): ClassifiedRestaurant {
    const combinedText = this.buildCombinedSearchText(place);

    const cuisines = this.detectCategories(combinedText, CUISINE_RULES);
    const themes = this.detectCategories(combinedText, THEME_RULES);
    const dietarySuitability = this.detectDietarySuitability(place, combinedText);

    return {
      id: place.externalId,
      externalId: place.externalId,
      name: place.name,
      location: place.location,
      address: place.address ?? "Dirección no especificada",
      cuisines: cuisines.length > 0 ? cuisines : ["Variada"],
      themes: themes.length > 0 ? themes : ["Casual"],
      dietarySuitability,
      rating: place.rating,
    };
  }

  private buildCombinedSearchText(place: PlaceRaw): string {
    const parts: string[] = [place.name.toLowerCase()];

    if (place.tags) {
      for (const [key, val] of Object.entries(place.tags)) {
        parts.push(key.toLowerCase());
        parts.push(val.toLowerCase());
      }
    }

    return parts.join(" ");
  }

  private detectCategories(text: string, rules: TaxonomyRule[]): string[] {
    const detected = new Set<string>();

    for (const rule of rules) {
      for (const kw of rule.keywords) {
        // Regex word boundary matching or substring for tags
        const pattern = new RegExp(`(^|[^a-záéíóúñ])${kw}([^a-záéíóúñ]|$)`, "i");
        if (pattern.test(text)) {
          detected.add(rule.category);
          break;
        }
      }
    }

    return Array.from(detected);
  }

  private detectDietarySuitability(
    place: PlaceRaw,
    combinedText: string
  ): DietaryRestriction[] {
    const results = new Set<DietaryRestriction>();
    const tags = place.tags ?? {};

    // Celiac / Gluten-free
    const dietGluten = tags["diet:gluten_free"]?.toLowerCase();
    const dietCeliac = tags["diet:celiac"]?.toLowerCase();
    if (
      dietGluten === "yes" ||
      dietGluten === "only" ||
      dietCeliac === "yes" ||
      dietCeliac === "only" ||
      combinedText.includes("gluten_free") ||
      combinedText.includes("sin tacc") ||
      combinedText.includes("sin gluten") ||
      combinedText.includes("senza glutine")
    ) {
      results.add("CELIAC");
    }

    // Vegan
    const dietVegan = tags["diet:vegan"]?.toLowerCase();
    if (
      dietVegan === "yes" ||
      dietVegan === "only" ||
      combinedText.includes("vegan") ||
      combinedText.includes("plant based") ||
      combinedText.includes("vegano")
    ) {
      results.add("VEGAN");
      results.add("VEGETARIAN"); // Vegan food is inherently vegetarian
    }

    // Vegetarian
    const dietVegetarian = tags["diet:vegetarian"]?.toLowerCase();
    if (
      dietVegetarian === "yes" ||
      dietVegetarian === "only" ||
      combinedText.includes("vegetarian") ||
      combinedText.includes("vegetariano")
    ) {
      results.add("VEGETARIAN");
    }

    // Kosher
    const dietKosher = tags["diet:kosher"]?.toLowerCase();
    if (dietKosher === "yes" || dietKosher === "only" || combinedText.includes("kosher")) {
      results.add("KOSHER");
    }

    // Halal
    const dietHalal = tags["diet:halal"]?.toLowerCase();
    if (dietHalal === "yes" || dietHalal === "only" || combinedText.includes("halal")) {
      results.add("HALAL");
    }

    // Lactose-free
    const dietLactose = tags["diet:lactose_free"]?.toLowerCase();
    if (
      dietLactose === "yes" ||
      dietLactose === "only" ||
      combinedText.includes("sin lactosa") ||
      combinedText.includes("lactose free")
    ) {
      results.add("LACTOSE_FREE");
    }

    return Array.from(results);
  }
}
