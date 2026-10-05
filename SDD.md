# Software Design Document (SDD) - Food Roulette
## Fase 4: Selección Múltiple de Comunas y Extensión a AMBA y Provincia de Buenos Aires

---

## 1. Objetivo y Planteamiento del Problema

### Problema:
1. **Restricción de Comuna Única:** La selección actual de ubicación está limitada a elegir una única comuna de CABA a la vez. Los usuarios no pueden combinar varias comunas vecinas o de interés simultáneo (por ejemplo, Comuna 14 Palermo + Comuna 15 Villa Crespo/Chacarita + Comuna 13 Belgrano).
2. **Límite Geográfico Estricto en Capital Federal:** La aplicación actualmente solo contempla las 15 comunas de CABA. Los usuarios que viven o desean salir a comer en el Gran Buenos Aires (AMBA Norte, Oeste, Sur) o polos gastronómicos de la Provincia de Buenos Aires (Gran La Plata, Pilar, etc.) no tienen cobertura ni opciones reales en la ruleta.

### Objetivo:
- Permitir la **selección múltiple y simultánea de comunas y partidos gastronómicos** (multi-select interactivo).
- Extender la cobertura geográfica oficial incorporando **AMBA (Zona Norte, Zona Oeste, Zona Sur) y Provincia de Buenos Aires (Gran La Plata, Polos Gastronómicos)**, con zonas estructuradas por región.
- Enriquecer el catálogo con **restaurantes 100% reales y verificados** de las nuevas áreas de AMBA y PBA, con coordenadas exactas, rango de precios y etiquetas gastronómicas.
- Actualizar el motor de ruleta (`RouletteEngine`), el proveedor de lugares (`MockPlacesProvider`, `OpenStreetMapProvider`), los endpoints de API (`/api/places`) y la interfaz gráfica (`FilterBar`, `LeafletMap`, `page.tsx`) para soportar búsquedas y filtros multi-zona fluidos.

---

## 2. Propuesta de Arquitectura y Flujo de Datos

```mermaid
flowchart TD
    UI[FilterBar Component] -->|selectedZoneIds: string[]| State[Page State / Store]
    State -->|GET /api/places?zones=...| API[/api/places Route]
    API --> Mock[MockPlacesProvider: CABA + AMBA + PBA]
    API --> OSM[OpenStreetMapProvider: Multi-center query]
    API --> Classifier[ClassifierService: Precios & Temas]
    API -->|ClassifiedRestaurant[]| State
    State --> Engine[RouletteEngine: Multi-zone & Radius filter]
    State --> Map[LeafletMap: Multi-marker & Auto-fit bounds]
    Engine --> Wheel[RouletteWheel: Spin with eligible pool]
```

### 1. Modelo de Zonas Gastronómicas (`GastronomicZone`)
Se formaliza el modelo de zonas geográficas manteniendo compatibilidad retroactiva con `CABA_COMUNAS`:

```typescript
export type ZoneRegion =
  | "CABA"
  | "AMBA_NORTE"
  | "AMBA_OESTE"
  | "AMBA_SUR"
  | "PROVINCIA_BSAS";

export interface GastronomicZone {
  id: string; // ej: "caba-14", "amba-vicente-lopez", "amba-san-isidro", "amba-moron", "amba-lomas", "pba-la-plata"
  region: ZoneRegion;
  regionLabel: string;
  name: string;
  numberLabel?: string;
  barrios: string[];
  location: Coordinates;
  radiusKm?: number;
}
```

### 2. Estructura de Regiones y Partidos
- **CABA (15 Comunas):** Comunas 1 a 15 con todos sus barrios (Palermo, Recoleta, San Telmo, Belgrano, Caballito, Devoto, etc.).
- **AMBA Norte:**
  - Vicente López (Olivos, Florida, Vicente López Centro, La Lucila)
  - San Isidro (San Isidro Centro, Acassuso, Martínez, Boulogne)
  - San Fernando (San Fernando, Victoria)
  - Tigre (Tigre Centro, Delta, Rincón de Milberg, Nordelta)
  - San Martín (San Martín, Villa Ballester)
  - Pilar (Pilar Centro, Panamericana km 50)
- **AMBA Oeste:**
  - Morón / Castelar (Morón Centro, Castelar, Haedo)
  - Ramos Mejía / La Matanza (Ramos Mejía, San Justo)
  - Tres de Febrero (Caseros, Ciudad Jardín)
  - Ituzaingó / Parque Leloir (Parque Leloir, Ituzaingó Centro)
- **AMBA Sur:**
  - Lomas de Zamora (Las Lomitas, Banfield, Temperley)
  - Quilmes (Quilmes Centro, Bernal)
  - Lanús (Lanucita polo gastronómico, Lanús Oeste)
  - Avellaneda (Avellaneda Centro, Wilde)
  - Almirante Brown (Adrogué, Burzaco)
- **Gran La Plata & Provincia de Bs As:**
  - La Plata Centro (Plaza Moreno, Eje Fundacional)
  - City Bell & Gonnet (Polo gastronómico Cantilo)
  - Campana / Zárate
  - Polos de campo (Mercedes / Tomás Jofré, San Antonio de Areco)

### 3. Enriquecimiento del Catálogo de Restaurantes Reales
Se añaden locales 100% reales en AMBA y PBA:
- **Vicente López & San Isidro:** Alo's Bistro (San Isidro/Boulogne), Cut Parrilla (Olivos), Asato Sushi (Olivos), La Rosa Negra (San Isidro), El Hornero (San Isidro).
- **Tigre & Delta:** Il Novo María del Luján (Paseo Victorica, Tigre), Kanoo Cocina de Río.
- **Morón, Castelar & Parque Leloir:** Bruce Grill Station (Parque Leloir), Kansas Grill Leloir, Don Battaglia (Castelar), The Galley Burgers (Morón).
- **Ramos Mejía:** Cervecería Baum (Ramos Mejía), Lo de Carlitos (Av. de Mayo).
- **Lomas de Zamora (Las Lomitas), Lanús & Quilmes:** Bodega Las Lomitas (Italia 450), Antares Las Lomitas, Taberna de Lanús (Lanucita), Parque Cervecero Quilmes.
- **La Plata & City Bell:** Baxar Mercado Gastronómico (Calle 51), Paesano Ristorante (City Bell), Café Urquiza (La Plata).

---

## 3. Cambios en APIs e Interfaces

### 1. `src/domain/types.ts`
```typescript
export interface PlaceRaw {
  externalId: string;
  name: string;
  location: Coordinates;
  address?: string;
  tags?: Record<string, string>;
  rating?: number;
  priceLevel?: PriceLevel;
  zoneId?: string;
}

export interface ClassifiedRestaurant {
  id: string;
  externalId: string;
  name: string;
  location: Coordinates;
  address: string;
  cuisines: string[];
  themes: string[];
  dietarySuitability: DietaryRestriction[];
  priceLevel: PriceLevel;
  rating?: number;
  zoneId?: string;
}

export interface RouletteFilterOptions {
  userLocation: Coordinates;
  radiusKm: number;
  selectedZoneIds?: string[];
  selectedCuisines?: string[];
  selectedThemes?: string[];
  selectedPriceLevels?: PriceLevel[];
  requiredDietary?: DietaryRestriction[];
  excludeVisited?: boolean;
  visitedIds?: string[];
  blacklistedIds?: string[];
}
```

### 2. `src/domain/roulette/roulette-engine.ts`
- Se incorpora `selectedZoneIds?: string[]` a `SpinParams`.
- Lógica de elegibilidad espacial:
  - Si `selectedZoneIds` está activo ($\ge 1$), un restaurante es elegible si su `zoneId` coincide con alguno de los seleccionados, o si su proximidad a cualquiera de los centros de las zonas seleccionadas está dentro del radio.
  - Si `selectedZoneIds` está vacío, se aplica el filtro estándar por `userLocation` y `radiusKm` (GPS / clic en mapa).

### 3. `src/app/api/places/route.ts`
- Acepta query param opcional `zones` (ej: `?zones=caba-14,amba-vicente-lopez,amba-lomas`).
- Devuelve todos los restaurantes pertenecientes a las zonas seleccionadas o cercanos a las coordenadas proporcionadas.

### 4. Componentes UI:
- **`FilterBar.tsx`:**
  - Selector multi-zona con pestañas/acordeón de regiones (`CABA`, `AMBA Norte`, `AMBA Oeste`, `AMBA Sur`, `Provincia / La Plata`).
  - Chips interactivos con checkboxes, badge de conteo (`"3 zonas seleccionadas"`), botón "Seleccionar todas de CABA" y tags removibles con botón "X".
  - Opción de conmutar a "Mi GPS" para búsqueda por radio geolocalizado.
- **`LeafletMap.tsx`:**
  - Auto-ajuste de vista (`fitBounds`) para encuadrar todos los pines de las múltiples zonas seleccionadas sin perder legibilidad.

---

## 4. Plan de Pruebas (TDD)

### A. Casos de Éxito (Happy Paths)
1. **Catálogo Unificado de Zonas (`zones.test.ts`):**
   - Mantiene las 15 comunas de CABA con sus IDs y coordenadas válidas.
   - Provee zonas de AMBA Norte, Oeste, Sur y PBA con coordenadas válidas dentro del conurbano y provincia.
   - Permite filtrar zonas por región (`filterZonesByRegion("AMBA_NORTE")`).
2. **Filtrado Multi-Zona en `RouletteEngine` (`roulette-engine.test.ts`):**
   - Al seleccionar múltiples `selectedZoneIds` (ej: `["caba-14", "amba-vicente-lopez"]`), el motor incluye restaurantes de ambas zonas y descarta los de otras comunas (ej: `caba-1`).
   - Respeta de forma conjunta los filtros de `selectedPriceLevels` y `requiredDietary` sobre las múltiples comunas.
3. **Catálogo Real de AMBA / PBA en `MockPlacesProvider` (`places-provider.test.ts`):**
   - Retorna restaurantes verificados en Vicente López, San Isidro, Morón, Lomas de Zamora y La Plata.
   - `searchByZones(["amba-moron", "amba-lomas"])` retorna los locales de Zona Oeste y Sur solicitados.
4. **Endpoint API `/api/places` (`api-endpoints.test.ts`):**
   - La consulta `GET /api/places?zones=caba-14,amba-vicente-lopez` responde `200` con restaurantes de Palermo y Vicente López.

### B. Casos de Fallo y Errores (Edge Cases)
1. **Zonas sin restaurantes que cumplan filtros estrictos:** `RouletteEngine` lanza `NoEligibleRestaurantsError` indicando ampliar los criterios o zonas.
2. **IDs de zona inválidos o desconocidos:** Fallback defensivo que descarta IDs inexistentes sin romper la consulta ni retornar error 500.

---

## 5. Plan de Implementación (Paso a Paso)

1. [ ] **Fase 1 (Zonas & Modelos):**
   - Crear catálogo completo de zonas en `src/domain/zones/gastronomic-zones.ts` (15 comunas CABA + 15+ partidos AMBA/PBA).
   - Mantener retrocompatibilidad en `src/domain/caba/comunas.ts`.
   - Escribir tests unitarios en `src/domain/zones/__tests__/zones.test.ts`.
2. [ ] **Fase 2 (Catálogo Real & Proveedor de Lugares):**
   - Incorporar restaurantes 100% reales de AMBA y PBA con coordenadas verificadas en `MockPlacesProvider`.
   - Implementar método `searchByZones` y actualizar `searchNearby`.
   - Escribir tests unitarios en `places-provider.test.ts`.
3. [ ] **Fase 3 (Motor de Ruleta Multi-Zona):**
   - Actualizar `RouletteEngine` para soportar `selectedZoneIds`.
   - Escribir tests en `roulette-engine.test.ts`.
4. [ ] **Fase 4 (Endpoint API `/api/places`):**
   - Soportar query param `zones` en `/api/places/route.ts`.
   - Escribir tests de integración en `api-endpoints.test.ts`.
5. [ ] **Fase 5 (Interfaz de Usuario):**
   - Actualizar `FilterBar.tsx` con selector multi-zona agrupado por región (CABA, AMBA Norte/Oeste/Sur, La Plata/PBA) y chips interactivos.
   - Actualizar `page.tsx` para sincronizar `selectedZoneIds` con el mapa, ruleta y API.
   - Actualizar `LeafletMap.tsx` con ajuste dinámico de límites (`fitBounds`).
6. [ ] **Fase 6 (Verificación & Calidad):**
   - Ejecutar la suite completa de tests con Vitest (`npm test`).
   - Validar build de producción (`npm run build`).
