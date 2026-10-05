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
  - Testing: Vitest (TDD riguroso, 47/47 tests en verde).

## 2. Foco Actual
- Soporte multi-zona simultáneo (seleccionar múltiples comunas y partidos a la vez) con encuadre dinámico en Leaflet y catálogo real enriquecido en GBA/PBA.

## 3. Roadmap Inmediato
- [x] Actualización de SDD.md con Fase 4 (Selección Múltiple de Comunas y Extensión AMBA/PBA).
- [x] TDD Fase 1: Módulo de Zonas Gastronómicas (`gastronomic-zones.ts` y `zones.test.ts`) con CABA, AMBA Norte, Oeste, Sur y PBA.
- [x] TDD Fase 2: Soporte para `selectedZoneIds` en `RouletteEngine` (`roulette-engine.test.ts`).
- [x] TDD Fase 3: Ampliación del catálogo con restaurantes 100% reales en AMBA y PBA en `MockPlacesProvider` y `searchByZones`.
- [x] TDD Fase 4: Endpoint `/api/places?zones=...` y POST `/api/roulette/spin` con multi-zona.
- [x] UI FilterBar: Selector multi-comuna interactivo con pestañas de regiones (CABA, AMBA Norte, AMBA Oeste, AMBA Sur, PBA), checkboxes, chips removibles con `✕` y botón "Seleccionar todas de CABA".
- [x] Mapa Leaflet: Soporte para encuadre dinámico (`fitBounds`) de pines distribuidos entre múltiples comunas y partidos.
- [x] Verificación completa: 47/47 tests en verde y build de producción Next.js 15 exitoso.
