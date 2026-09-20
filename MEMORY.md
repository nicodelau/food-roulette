# Food Roulette - System Memory

## 1. Visión y Decisiones Arquitectónicas
- **Nombre del Proyecto:** `food-roulette`
- **Objetivo:** Descubrimiento gamificado de gastronomía por zonas, clasificación temática/precios y por origen, ruleta aleatoria con exclusiones inteligentes y sistema de puntos/niveles.
- **Stack Tecnológico:**
  - Frontend & Backend: Next.js 15 (App Router, React 19, TypeScript estricto, Tailwind CSS).
  - Tema: Modo Claro y Oscuro nativo con diseño editorial gastronómico (Gourmet Linen / Obsidian Bistro).
  - Precios: Sistema de 3 niveles (`$` Económico, `$$` Medio, `$$$` Premium) con rangos estimados en ARS.
  - Repositorio: `https://github.com/nicodelau/food-roulette`
  - Testing: Vitest (TDD riguroso).

## 2. Foco Actual
- Calibración geográfica precisa de pines (SVG teardrop con aguja al portal) y eliminación de puntos ficticios en el catálogo.

## 3. Roadmap Inmediato
- [x] Actualización de SDD.md con Fase 3.
- [x] TDD Fase 1: Pruebas unitarias de detección y filtrado de rango de precios (`PriceLevel`).
- [x] TDD Fase 2: Implementación de inferencia en `ClassifierService` y filtro en `RouletteEngine`.
- [x] Implementación de Modo Claro / Oscuro con toggle en Navbar y persistencia (`localStorage`).
- [x] Rediseño estético global: paleta cálida y refinada, tipografía y tarjetas estilo guía gastronómica (Bistro / Beli).
- [x] Selector táctil de precios `$ / $$ / $$$` con rangos de costos en `FilterBar`, `WinnerCard` y `LeafletMap`.
- [x] Calibración de Waypoints: pines SVG tipo aguja (teardrop needle `iconAnchor: [width/2, height]`) anclados a la puerta exacta del local.
- [x] Eliminación total de datos sintéticos: catálogo de 60 lugares 100% reales en CABA con coordenadas y direcciones físicas verificadas.
- [x] Optimización de Overpass OpenStreetMap con filtro `["name"]`, timeout dinámico de 4.2s y fallback defensivo con lugares reales.
- [x] Pruebas completas (38/38 tests pasando), build de producción y push a GitHub.
