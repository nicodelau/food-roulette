# Software Design Document (SDD) - Food Roulette (Fase 3: Rediseño Editorial, Modo Claro/Oscuro y Rango de Precios)

## 1. Objetivo y Planteamiento del Problema
- **Problema:**
  1. **Estética genérica ("AI-generated vibe"):** La interfaz actual abusa de gradientes morados/oscuros, bordes brillantes y sombras de estilo dashboard genérico de IA, alejándose de la identidad visual de una app gastronómica de autor (estilo Beli, Michelin Guide o Eater).
  2. **Falta de Modo Claro / Oscuro:** La app está forzada a modo oscuro sin opción de alternar según preferencia o luz ambiental.
  3. **Ausencia de Rango de Precios:** Los usuarios no pueden filtrar por presupuesto (`$` Barato, `$$` Medio, `$$$` Caro) ni conocer el costo estimado de los lugares sugeridos antes de girar la ruleta.
- **Objetivo:**
  - Rediseñar por completo la experiencia visual hacia un estilo **Gourmet Editorial / Modern Bistro** con tipografía refinada, superficies limpias y paleta orgánica inspirada en el logo (terracota, ocre, lima fresca y carbón profundo).
  - Implementar un sistema nativo de **Modo Claro y Oscuro** con persistencia en `localStorage` y detección de preferencia del sistema.
  - Diseñar e implementar el módulo de **Rango de Precios (`$`, `$$`, `$$$`)** con rangos estimados en ARS, selector táctil en filtros y visualización clara en todas las tarjetas de restaurantes.

---

## 2. Propuesta de Arquitectura y Flujo de Datos

### 1. Sistema de Temas (Claro / Oscuro)
- Implementación de `ThemeProvider` / estado global reactivo:
  - Clase `.dark` en el tag `<html>` controlada por estado y persistida en `localStorage('fr_theme')`.
  - **Modo Claro (Gourmet Linen):** Fondo marfil/lino cálido (`#faf8f5`), tarjetas blancas puras (`#ffffff`), bordes sutiles en piedra cálida (`#e7e3dc`), texto en carbón tipográfico (`#1c1917`).
  - **Modo Oscuro (Obsidian Bistro):** Fondo carbón profundo (`#121316`), tarjetas grafito suave (`#1a1c22`), bordes en pizarra (`#2a2d36`), texto en blanco suave (`#f4f4f6`).
  - **Acentos Compartidos:** Naranja terracota del logo (`#ea580c` / `#f97316`), ocre tostado (`#d97706`), verde oliva/fresco (`#65a30d`), azul marino (`#0284c7`).

### 2. Clasificación y Filtrado por Rango de Precios
- **Modelo de Precios:**
  - Nivel 1 (`$` - Barato / Económico): Estimado hasta $10.000 ARS por persona (pizzerías al paso, comida rápida, bodegones populares).
  - Nivel 2 (`$$` - Medio / Estándar): Estimado $10.000 a $25.000 ARS por persona (trattorias, bares de autor, cocina regional).
  - Nivel 3 (`$$$` - Caro / Premium): Estimado más de $25.000 ARS por persona (fine dining, parrillas premium, omakase).
- **Inferencia en `ClassifierService`:**
  - Tags de OSM: `fee`, `stars`, `cuisine` (`fine_dining`, `steak_house` -> 3; `fast_food`, `sandwich` -> 1).
  - Palabras clave en nombre y temática.
- **Filtrado en `RouletteEngine`:**
  - `selectedPriceLevels?: (1 | 2 | 3)[]`. Si se selecciona uno o más niveles, se descartan candidatos que no coincidan.

---

## 3. Cambios en APIs e Interfaces

```typescript
export type PriceLevel = 1 | 2 | 3;

export interface PriceTierInfo {
  level: PriceLevel;
  symbol: string;
  label: string;
  rangeDescription: string;
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
}

export interface RouletteFilterOptions {
  userLocation: Coordinates;
  radiusKm: number;
  selectedCuisines?: string[];
  selectedThemes?: string[];
  selectedPriceLevels?: PriceLevel[];
  requiredDietary?: DietaryRestriction[];
  excludeVisited?: boolean;
  visitedIds?: string[];
  blacklistedIds?: string[];
}
```

---

## 4. Plan de Pruebas (TDD)

### A. Casos de Éxito (Happy Paths)
1. **Clasificador de Precios:**
   - Detecta nivel 1 (`$`) para lugares de comida rápida o bodegones tradicionales.
   - Detecta nivel 3 (`$$$`) para fine dining, asadores premium y comida de autor.
   - Asigna nivel 2 (`$$`) por defecto a restaurantes estándar.
2. **Motor de Ruleta con Precios:**
   - Si se selecciona solo nivel 1 (`$`), el pool resultante contiene exclusivamente restaurantes con `priceLevel === 1`.
   - Si se seleccionan niveles 1 y 2 (`$`, `$$`), descarta los de nivel 3 (`$$$`).
3. **Persistencia y Selector de Modo Claro/Oscuro:**
   - Alternar el modo actualiza la clase del documento y persiste en almacenamiento.

### B. Casos de Fallo y Errores (Edge Cases)
1. **Filtro de precio sin coincidencias:** Lanza `NoEligibleRestaurantsError` sugiriendo ampliar el rango presupuestario.
2. **Tags de precio inválidos o ausentes:** Fallback defensivo a nivel 2 sin fallar la consulta.

---

## 5. Plan de Implementación (Paso a Paso)

1. [ ] **TDD Fase 1:** Escribir pruebas unitarias para `PriceLevel` en `ClassifierService` y `RouletteEngine`.
2. [ ] **TDD Fase 2:** Implementar lógica de inferencia y filtrado de precios.
3. [ ] **Sistema de Tema (Claro / Oscuro):** Configurar soporte `darkMode: 'class'` en Tailwind, botón conmutador en `Navbar` y variables semánticas.
4. [ ] **Rediseño Visual Completo (Anti-AI Aesthetic):**
   - Tipografía editorial estilizada, tarjetas con acabado mate/papel texturado, controles segmentados limpios y ruleta artesanal con la paleta del logo.
5. [ ] **Selector y Visualización de Precios:**
   - Añadir control segmentado `$ / $$ / $$$` con rangos de costos en `FilterBar`.
   - Mostrar insignias de costo en `WinnerCard` y `RecommendationsSection`.
6. [ ] **Verificación con Vitest, Build de producción y Push a GitHub.**
