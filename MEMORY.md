# Food Roulette - System Memory

## 1. Visión y Decisiones Arquitectónicas
- **Nombre del Proyecto:** `food-roulette`
- **Objetivo:** Descubrimiento gamificado de gastronomía por zonas, clasificación temática y por origen, ruleta aleatoria con exclusiones inteligentes (lugares visitados, blacklist, dietas) y sistema de puntos/niveles.
- **Stack Tecnológico:**
  - Frontend & Backend: Next.js 15 (App Router, React 19, TypeScript estricto, Tailwind CSS).
  - Despliegue: Listo para Vercel (`vercel.json`, variables de entorno en `.env.example`).
  - Testing: Vitest (31 pruebas unitarias y de integración pasando al 100%).
- **Proveedor de Mapas (100% Gratuito):**
  - Implementado `OpenStreetMapProvider` conectando a Overpass API.
  - `MockPlacesProvider` disponible como fallback automático para resiliencia offline.
  - Visualización en Frontend con Leaflet y capas CartoDB Dark (sin costo).
- **Nuevas Capacidades Fase 2:**
  - **Clic en Mapa:** Reubicación de centro de búsqueda interactiva.
  - **Comunas CABA:** Catálogo completo de 15 comunas de Capital Federal con barrios y centroides.
  - **Radio Extendido:** Rango de 0.5 km a 20 km.
  - **Aislamiento Visual:** Contexto de apilamiento aislado (`isolation: isolate`) y modales en `z-[9999]`.
  - **Identidad de Marca:** Logo oficial en `public/logo.png`.
  - **Recomendaciones:** `RecommendationEngine` por afinidad histórica de cocinas y restricciones.
  - **Autenticación:** Google OAuth con Google Identity Services y endpoint `/api/auth/google`.

## 2. Foco Actual
- Publicación del repositorio en GitHub mediante `gh` y preparación final para Vercel.

## 3. Roadmap Inmediato
- [x] Actualización del SDD.md y validación con el usuario.
- [x] TDD: Motor de recomendaciones (`RecommendationEngine`) y pruebas.
- [x] TDD: Catálogo de 15 comunas de CABA y pruebas.
- [x] Mapa interactivo con selección de centro por clic.
- [x] Corrección de Z-index del modal de pasaporte.
- [x] Logo oficial integrado en Navbar y favicon.
- [x] Autenticación Google OAuth configurada.
- [x] Configuración para Vercel (`vercel.json`, `.env.example`).
- [ ] Creación de repositorio en GitHub con `gh` y push.
