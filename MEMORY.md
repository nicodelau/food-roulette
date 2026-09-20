# Food Roulette - System Memory

## 1. Visión y Decisiones Arquitectónicas
- **Nombre del Proyecto:** `food-roulette`
- **Objetivo:** Descubrimiento gamificado de gastronomía por zonas, clasificación temática y por origen, ruleta aleatoria con exclusiones inteligentes (lugares visitados, blacklist, dietas) y sistema de puntos/niveles.
- **Stack Tecnológico:**
  - Frontend & Backend: Next.js 15 (App Router, React 19, TypeScript estricto, Tailwind CSS).
  - Testing: Vitest (25 pruebas unitarias y de integración pasando al 100%).
- **Proveedor de Mapas (100% Gratuito):**
  - Implementado `OpenStreetMapProvider` conectando a Overpass API (`node["amenity"~"restaurant|cafe|pub|fast_food"]`).
  - `MockPlacesProvider` disponible como fallback automático para resiliencia offline.
  - Interfaz `IPlacesProvider` extensible para Google Places API mediante `.env`.
  - Visualización en Frontend con Leaflet y capas CartoDB Dark (sin costo).

## 2. Componentes y Módulos de Dominio
- **`PlacesProvider`:** Ingesta y normalización de nodos geográficos con validación defensiva de coordenadas y radio.
- **`ClassifierService`:** Clasificación en 10 orígenes gastronómicos, 6 temáticas y 4 restricciones dietarias (Sin TACC, Vegano, Vegetariano, Sin Lactosa).
- **`RouletteEngine`:** Distancia con Haversine, filtros de exclusión estricta de historial de visitas y blacklist, y selección aleatoria con excepción controlada `NoEligibleRestaurantsError`.
- **`GamificationService`:** Puntos base (+20), bonos de exploración (+50 al probar cocinas nuevas), medallas (`FIRST_BITE`, `PALATE_POLYGLOT`, `LOCAL_EXPLORER`), cálculo de niveles y prevención de check-in duplicado.
- **UI:** Ruleta interactiva animada, barra de filtros reactivos, tarjeta de destino con navegación, mapa interactivo y modal de pasaporte culinario.

## 3. Estado Actual y Roadmap Inmediato
- [x] Paso A: Documento de Diseño Técnico (SDD.md) aprobado por el usuario.
- [x] Scaffolding del proyecto con Next.js 15, TypeScript y Tailwind CSS.
- [x] Paso B: Fase Roja y Fase Verde completadas con Vitest (25/25 tests en verde).
- [x] APIs `/api/places`, `/api/roulette/spin`, `/api/visits/check-in`.
- [x] Interfaz de usuario interactiva y mapa de Leaflet funcional.
- [x] Build de producción (`npm run build`) verificado con éxito.
- [ ] Opcional futuro: Integración con base de datos PostgreSQL persistente mediante Prisma ORM para sincronización multi-dispositivo.
