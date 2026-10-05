# Food Roulette - System Memory

## 1. Visión y Decisiones Arquitectónicas
- **Nombre del Proyecto:** `food-roulette`
- **Objetivo:** Descubrimiento gamificado de gastronomía por zonas, clasificación temática/precios y por origen, ruleta aleatoria con exclusiones inteligentes y sistema de puntos/niveles.
- **Stack Tecnológico:**
  - Frontend & Backend: Next.js 15 (App Router, React 19, TypeScript estricto, Tailwind CSS).
  - Tema: Modo Claro y Oscuro nativo con diseño editorial gastronómico (Gourmet Linen / Obsidian Bistro).
  - Precios: Sistema de 3 niveles (`$` Económico, `$$` Medio, `$$$` Premium) con rangos estimados en ARS.
  - Zonas & Regiones: Catálogo unificado de comunas CABA (1-15) + AMBA Norte, AMBA Oeste, AMBA Sur y Provincia de Bs. As. (Gran La Plata y polos tradicionales).
  - Repositorio: `https://github.com/nicodelau/food-roulette`
  - Testing: Vitest (TDD riguroso, 55/55 tests en verde).
  - Datasets Abiertos: Buenos Aires Data (GCBA) con 736 espacios gastronómicos y 84 Bares Notables oficiales con coordenadas WGS84 verificadas.

## 2. Foco Actual
- Integración oficial con datasets abiertos de la Ciudad de Buenos Aires (BA Data) para alimentar el catálogo gastronómico de CABA y Bares Notables.

## 3. Roadmap Inmediato
- [x] Actualización de SDD.md con Fase 4 (Selección Múltiple de Comunas y Extensión AMBA/PBA).
- [x] TDD Fase 4: Módulo de Zonas Gastronómicas, multi-zona en RouletteEngine y UI multi-comuna en FilterBar + Leaflet fitBounds.
- [x] Fase 5 SDD: Especificación de ingesta y normalización de datasets abiertos de CABA (Buenos Aires Data).
- [x] Script de ingesta y snapshot local: `scripts/sync_badata.py` -> `src/data/ba_data_gastronomia.json` (736 establecimientos reales, 84 Bares Notables con tags patrimoniales).
- [x] Proveedor de datos BA Data: `src/domain/places/badata-places-provider.ts` y tests unitarios TDD (`badata-places-provider.test.ts`).
- [x] Integración en `MockPlacesProvider` y endpoints `/api/places`: unificación de catálogo oficial CABA + AMBA/PBA.
- [x] Verificación completa: 55/55 tests en verde y build de producción Next.js 15 exitoso.
