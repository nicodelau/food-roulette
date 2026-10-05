# Software Design Document (SDD) - Food Roulette
## Fase 5: Ingesta e Integración de Datasets Oficiales de Datos Abiertos de la Ciudad de Buenos Aires (BA Data)

---

## 1. Objetivo y Planteamiento del Problema

### Problema:
1. **Dispersión y Cobertura Dispar en CABA:** Aunque el catálogo cuenta con restaurantes reales y verificados, la cobertura en varias de las 15 comunas de Capital Federal puede expandirse significativamente aprovechando los datasets públicos oficiales del Gobierno de la Ciudad de Buenos Aires (**BA Data / GCBA**).
2. **Falta de Reconocimiento de Patrimonio Gastronómico Oficial:** El GCBA cataloga oficialmente espacios gastronómicos culturales emblemáticos (como los **Bares Notables**, cafés históricos y clubes gastronómicos con habilitación oficial), los cuales enriquecen la identidad porteña de la ruleta con historia, coordenadas de precisión y datos verificados por el Ministerio de Cultura.

### Objetivo:
- Integrar la fuente oficial abierta de **Buenos Aires Data (GCBA)** en el ecosistema de `food-roulette`.
- Desarrollar un cargador y normalizador robusto (`BaDataPlacesProvider` / `gcba-dataset-loader.ts`) que procese los registros oficiales y los transforme en `PlaceRaw` y `ClassifiedRestaurant`:
  - Asignación de `zoneId` correspondiente (`caba-1` a `caba-15`).
  - Coordenadas geográficas exactas (`lat`, `lng`).
  - Inferencia temática especializada (reconociendo "BAR NOTABLE", "Bodegón", "Cafetería / Bakery", etc.).
  - Asignación de rangos de precio (`$`, `$$`, `$$$`).
- Generar y mantener un snapshot local optimizado (`src/data/ba_data_gastronomia.json`) que garantiza cero latencia y disponibilidad offline sin depender de la red o límites de tasa de la CDN del GCBA, acompañado de un script de actualización automatizado (`scripts/sync_badata.py`).
- Integrar estos establecimientos oficiales dentro del proveedor de lugares para que los usuarios puedan descubrirlos en la ruleta, mapa y recomendaciones al filtrar por comunas de CABA.

---

## 2. Propuesta de Arquitectura y Flujo de Datos

```mermaid
flowchart TD
    BAData[Portal Buenos Aires Data GCBA] -->|juqdkmgo-711-resource CSV| Script[scripts/sync_badata.py]
    Script -->|Limpieza & Normalización| JSONFile[src/data/ba_data_gastronomia.json]
    JSONFile --> Provider[BaDataPlacesProvider]
    Provider --> Mock[MockPlacesProvider: CABA Oficial + AMBA/PBA]
    Mock --> Classifier[ClassifierService: Precios & Temas]
    Classifier --> API[/api/places & /api/roulette/spin]
    API --> UI[FilterBar, RouletteWheel, LeafletMap]
```

### 1. Estructura del Registro Oficial de BA Data
El dataset oficial de espacios gastronómicos culturales de la Ciudad contiene:
- `ESTABLECIMIENTO`: Nombre del local (ej. *Los 36 Billares*, *El Federal*, *Bar Británico*, *Bar de Cao*, *La Biela*, *Café Tortoni*, *Las Violetas*).
- `SUBCATEGORIA`: "BAR NOTABLE", "BAR TRADICIONAL", etc.
- `FUNCION_PRINCIPAL`: "BAR", "CLUB DE MUSICA EN VIVO", "CENTRO CULTURAL".
- `CALLE` + `ALTURA` / `DIRECCION`: Domicilio físico verificado.
- `BARRIO`: Barrio porteño (San Telmo, Palermo, Recoleta, Caballito, Boedo, etc.).
- `COMUNA`: "COMUNA 1" a "COMUNA 15".
- `LATITUD` y `LONGITUD`: Coordenadas WGS84.
- `TELEFONO`, `MAIL`, `WEB`: Información de contacto.

### 2. Normalización a `PlaceRaw`
- `externalId`: `badata-{fid}`
- `name`: `ESTABLECIMIENTO`
- `location`: `{ lat: Number(LATITUD), lng: Number(LONGITUD) }`
- `address`: `DIRECCION`
- `zoneId`: Mapeo directo `COMUNA X` $\rightarrow$ `caba-X`
- `tags`:
  - `amenity`: "cafe" o "bar" o "restaurant"
  - `cuisine`: Inferencia basada en nombre y categorías (ej. tradicional, porteña, café)
  - `heritage`: "bar_notable" si corresponde a la subcategoría oficial.

---

## 3. Cambios en APIs e Interfaces

### 1. `src/domain/places/badata-places-provider.ts`
```typescript
export interface BaDataRawRecord {
  fid: string | number;
  ESTABLECIMIENTO: string;
  FUNCION_PRINCIPAL?: string;
  SUBCATEGORIA?: string;
  DIRECCION: string;
  BARRIO: string;
  COMUNA: string;
  LATITUD: string | number;
  LONGITUD: string | number;
  TELEFONO?: string;
  WEB?: string;
}

export class BaDataPlacesProvider implements IPlacesProvider {
  searchNearby(params: SearchNearbyParams): Promise<PlaceRaw[]>;
  searchByZones(zoneIds: string[]): Promise<PlaceRaw[]>;
  getNotableBars(): Promise<PlaceRaw[]>;
}
```

### 2. Integración en `MockPlacesProvider`
`MockPlacesProvider` unificará el catálogo oficial de BA Data para CABA con la selección verificada de locales de AMBA y PBA.

---

## 4. Plan de Pruebas (TDD)

### A. Casos de Éxito (Happy Paths)
1. **Carga y Normalización (`badata-places-provider.test.ts`):**
   - Transforma correctamente registros de BA Data a `PlaceRaw` válidos.
   - Normaliza cadenas como `"COMUNA 14"` a `"caba-14"`.
   - Asigna tags de `heritage: "bar_notable"` a locales con subcategoría `BAR NOTABLE`.
2. **Cobertura de Comunas:**
   - Cada una de las 15 comunas de CABA cuenta con establecimientos oficiales verificados con coordenadas válidas.
3. **Búsqueda por Zonas y Cercanía:**
   - `searchByZones(["caba-1", "caba-14"])` devuelve locales oficiales de Comuna 1 y Comuna 14.
   - `searchNearby({ lat, lng, radiusKm })` calcula distancias Haversine correctas hacia los puntos de BA Data.
4. **Integración con `ClassifierService`:**
   - Los locales de BA Data son clasificados con éxito con `priceLevel` (1 o 2) y temas relevantes (*Bodegón*, *Bar / Cervecería*, *Cafetería / Bakery*).

### B. Casos de Fallo y Errores (Edge Cases)
1. **Coordenadas inválidas o vacías en registros:** Descarta registros corruptos sin romper la carga de los válidos.
2. **Comuna no reconocida:** Asigna la comuna por barrio o por cercanía a centros de comunas de CABA en lugar de fallar.

---

## 5. Plan de Implementación (Paso a Paso)

1. [ ] **TDD Fase 1:** Escribir pruebas unitarias en `src/domain/places/__tests__/badata-places-provider.test.ts`.
2. [ ] **TDD Fase 2:** Desarrollar `BaDataPlacesProvider` y el script de extracción/snapshot `scripts/sync_badata.py` generando `src/data/ba_data_gastronomia.json`.
3. [ ] **TDD Fase 3:** Integrar `BaDataPlacesProvider` en `MockPlacesProvider` para nutrir todas las comunas de CABA con los datos abiertos oficiales.
4. [ ] **TDD Fase 4:** Verificar con Vitest que los 47+ tests continúen en verde y que los nuevos tests de BA Data pasen al 100%.
5. [ ] **Verificación de Build & Git:** Ejecutar build de producción Next.js y actualizar memoria estática.
