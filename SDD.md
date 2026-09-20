# Software Design Document (SDD) - Food Roulette

## 1. Objetivo y Planteamiento del Problema
- **Problema:** La elección de un lugar para comer suele generar parálisis por indecisión ("fatiga de decisión"), monotonía al repetir siempre los mismos restaurantes, o frustración al no poder excluir fácilmente lugares ya conocidos o filtrar con rigor por restricciones dietarias (celiaquía, vegetarianismo, veganismo). Además, explorar opciones de Google Maps carece de clasificación temática lúdica e interactiva.
- **Objetivo:** Desarrollar **Food Roulette**, una plataforma web responsive (Mobile-First) que explore restaurantes por coordenadas o zonas geográficas (soportando tanto OpenStreetMap gratuito como Google Places opcional), los clasifique automáticamente por origen culinario y temática, y ofrezca una ruleta aleatoria inteligente con exclusión de visitas previas, filtros dietarios, perfiles de usuario y un sistema de gamificación con puntos y medallas.

---

## 2. Propuesta de Arquitectura y Flujo de Datos

### Arquitectura General
Arquitectura limpia y modular basada en **Next.js 15 (App Router, TypeScript estricto, Tailwind CSS)** con **PostgreSQL + Prisma ORM**:

```
[ Frontend (Next.js / React 19 / Leaflet Map) ]
                     │
                     ▼
[ API Routes / Server Actions ]
                     │
     ┌───────────────┼───────────────┬─────────────────┐
     ▼               ▼               ▼                 ▼
[PlacesService] [Classifier]  [RouletteEngine]  [GamificationService]
     │                               │                 │
     ▼                               ▼                 ▼
[IPlacesProvider]               [Filtros &      [Puntos, Badges
(OSM Overpass /                  Exclusiones]    e Historial]
 Google Places / Mock)               │                 │
                                     ▼                 ▼
                     [ PostgreSQL Database (Prisma ORM) ]
```

### Proveedor de Mapas Gratuito vs Google Maps
Para garantizar un funcionamiento **100% gratuito sin depender obligatoriamente de una tarjeta de crédito o costos de Google Cloud**:
- **`IPlacesProvider`**:
  1. **`OpenStreetMapProvider` (Por defecto / Gratuito):** Consulta la API pública de **Overpass (OSM)** (`node["amenity"="restaurant"]`) y **Nominatim** para geocodificación de zonas. Totalmente gratuito y de código abierto.
  2. **`GooglePlacesProvider` (Opcional):** Habilitable mediante variable de entorno `GOOGLE_MAPS_API_KEY` usando la nueva Google Places API.
  3. **`MockPlacesProvider`:** Implementación en memoria para pruebas automatizadas TDD y desarrollo veloz offline.
- **Mapas en Frontend:** Renderizado mediante **Leaflet / React-Leaflet** con OpenStreetMap tiles (sin costo de API de mapas).

### Modelos de Datos (Prisma Schema)
1. **`User` & `Profile`:**
   - `id`, `email`, `name`, `points` (balance actual), `level`.
2. **`DietaryRestriction`:**
   - `CELIAC` (Sin TACC), `VEGAN`, `VEGETARIAN`, `KOSHER`, `HALAL`, `LACTOSE_FREE`.
3. **`Restaurant` (Caché local de lugares):**
   - `id`, `externalId`, `provider` (OSM | GOOGLE), `name`, `lat`, `lng`, `address`, `priceLevel`, `rating`.
   - `cuisines`: Array o relación (ej: Italiana, Japonesa, Argentina, Mexicana, etc.).
   - `themes`: Array o relación (ej: Bodegón, Romántico, De autor, Bar/Pub, Familiar).
   - `dietaryFlags`: Array de restricciones cubiertas.
4. **`UserExclusion` & `Blacklist`:**
   - Lugares vetados o ignorados voluntariamente por el usuario.
5. **`VisitHistory`:**
   - Historial de lugares visitados, fecha, valoración personal y puntos otorgados.
6. **`PointsTransaction` & `Badge`:**
   - Registro auditable de puntos obtenidos (ej. +50 por nueva cocina descubierta, +20 por giro y visita confirmada).

### Flujo de Datos
1. **Búsqueda & Extracción:** El usuario ingresa una zona o usa geolocalización. El backend consulta `PlacesService` (revisando primero el caché local para optimizar latencia) y ejecuta `ClassifierService` para etiquetar tipos de comida y temáticas.
2. **Filtrado & Ruleta:** El usuario activa sus filtros (radio, tipo de comida, restricciones y switch `Excluir lugares ya visitados`).
3. **Selección:** `RouletteEngine` descarta restaurantes incompatibles o ya registrados en `VisitHistory`/`Blacklist`. Si quedan candidatos, genera la selección aleatoria o lista para la ruleta visual.
4. **Confirmación & Gamificación:** El usuario acepta el destino. Al confirmar la salida / check-in, `GamificationService` computa los puntos, actualiza el nivel y registra la visita en el historial.

---

## 3. Cambios en APIs e Interfaces

### Interfaces de Dominio
```typescript
export interface Coordinates {
  lat: number;
  lng: number;
}

export interface PlaceRaw {
  externalId: string;
  name: string;
  location: Coordinates;
  address?: string;
  tags?: Record<string, string>;
  rating?: number;
}

export interface ClassifiedRestaurant {
  id: string;
  name: string;
  location: Coordinates;
  address: string;
  cuisines: string[];
  themes: string[];
  dietarySuitability: string[];
  rating?: number;
}

export interface RouletteFilterOptions {
  userLocation: Coordinates;
  radiusKm: number;
  selectedCuisines?: string[];
  selectedThemes?: string[];
  requiredDietary?: string[];
  excludeVisited?: boolean;
  userId?: string;
}

export interface RouletteResult {
  selectedRestaurant: ClassifiedRestaurant;
  totalEligibleCandidates: number;
}
```

### Endpoints / Server Actions
- `GET /api/places/nearby`:
  - Entrada: `lat`, `lng`, `radiusKm`.
  - Salida: Lista de `ClassifiedRestaurant`.
- `POST /api/roulette/spin`:
  - Entrada: `RouletteFilterOptions`.
  - Salida: `RouletteResult` (restaurante seleccionado + pool de alternativas).
- `POST /api/visits/check-in`:
  - Entrada: `{ userId: string, restaurantId: string, notes?: string }`.
  - Salida: `{ success: boolean, pointsEarned: number, newTotalPoints: number, newBadges: Badge[] }`.
- `GET /api/user/preferences`:
  - Salida: Restricciones dietarias del usuario, historial de visitas y lista de exclusión.
- `PUT /api/user/preferences`:
  - Entrada: Actualización de restricciones dietarias y blacklist.

---

## 4. Plan de Pruebas (TDD)

### A. Casos de Éxito (Happy Paths)
1. **Proveedores de Lugares:**
   - `MockPlacesProvider` y `OpenStreetMapProvider` devuelven una lista normalizada de restaurantes dada una coordenada y radio.
2. **Clasificador Gastronómico:**
   - Clasifica correctamente un restaurante con tags `cuisine=pizza` o `cuisine=italian` como cocina `Italiana`.
   - Clasifica atributos temáticos (ej: `amenity=pub`, `brewery=yes` como `Bar/Cervecería`).
   - Detecta banderas dietarias (`diet:vegan=yes` o `diet:gluten_free=yes`).
3. **Motor de Ruleta con Exclusiones:**
   - Dado un pool de 10 restaurantes donde 3 están en `visitedIds` y `excludeVisited = true`, el pool elegible se reduce exactamente a 7.
   - Dado un pool con restaurantes variados y un filtro dietario `CELIAC`, solo permanecen los que soportan celiaquía.
   - La ruleta selecciona aleatoriamente un elemento que pertenece estrictamente al pool elegible.
4. **Sistema de Gamificación:**
   - Registrar una visita otorga el puntaje base (+20 pts).
   - Registrar una visita con una cocina que el usuario nunca antes había probado otorga bonificación de primera exploración (+50 pts) y actualiza el pasaporte gastronómico.

### B. Casos de Fallo y Errores (Edge Cases)
1. **Sin Candidatos Disponibles:**
   - Si tras aplicar exclusiones y filtros dietarios el pool queda vacío, `RouletteEngine` arroja una excepción controlada `NoEligibleRestaurantsError` con sugerencias de relajación de filtros.
2. **Coordenadas / Radio Fuera de Límites:**
   - Si `radiusKm <= 0` o coordenadas están fuera de rango (-90 a 90, -180 a 180), el servicio responde con validación defensiva `InvalidCoordinatesError`.
3. **Tolerancia a Fallos en Proveedor Externo:**
   - Si la API externa de mapas falla o tiene timeout, el sistema utiliza restaurantes cacheados previamente en base de datos o retorna un error amigable sin crashear.
4. **Check-in Duplicado:**
   - Si el usuario intenta registrar un check-in idéntico en un intervalo menor a 2 horas, se rechaza para evitar abuso de puntos (`DuplicateVisitError`).

---

## 5. Plan de Implementación (Paso a Paso)

1. [ ] **Fase 1: Configuración de Entorno & Tooling**
   - Inicializar proyecto Next.js 15 con TypeScript, Tailwind CSS, Vitest para testing y Prisma con PostgreSQL.
2. [ ] **Fase 2: Dominio Places Provider (TDD)**
   - Escribir tests para interfaz `IPlacesProvider`, `MockPlacesProvider` y `OpenStreetMapProvider`.
   - Implementar el adaptador Overpass / OSM y el parser de restaurantes.
3. [ ] **Fase 3: Dominio Clasificador Temático & Dietario (TDD)**
   - Escribir tests unitarios para reglas de clasificación (países, temáticas, restricciones).
   - Implementar `ClassifierService`.
4. [ ] **Fase 4: Motor de Ruleta & Filtros de Exclusión (TDD)**
   - Escribir tests de exclusión por visitas previas, blacklist y restricciones dietarias.
   - Implementar `RouletteEngine` con cálculo de distancias (Haversine) y selección aleatoria.
5. [ ] **Fase 5: Gamificación y Puntos (TDD)**
   - Escribir tests para cálculo de puntos, registro de visitas e insignias.
   - Implementar `GamificationService`.
6. [ ] **Fase 6: Esquema Prisma & Base de Datos**
   - Configurar esquemas Prisma para usuarios, visitas, restaurantes y puntos.
7. [ ] **Fase 7: API Endpoints & UI Interactiva**
   - Implementar Server Actions / Endpoints.
   - Construir interfaz de usuario con Ruleta animada, vista de Mapa interactivo (Leaflet), panel de filtros y perfil de usuario con pasaporte de puntos.
