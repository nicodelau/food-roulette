# Software Design Document (SDD) - Food Roulette

## 1. Objetivo y Planteamiento del Problema
- **Problema:**
  1. **Selección geográfica rígida:** El usuario no puede definir libremente el centro de búsqueda haciendo clic directamente en el mapa ni elegir de manera estructurada entre las comunas de Capital Federal (CABA).
  2. **Radio insuficiente:** El límite anterior de 5 km resulta estrecho para traslados en vehículo o zonas más amplias.
  3. **Superposición visual (Z-Index):** Al abrir el pasaporte gastronómico, los elementos y capas de Leaflet se superponen sobre el modal.
  4. **Falta de recomendaciones personalizadas:** No existe un módulo que sugiera lugares basados en el perfil y frecuencia de visitas previas del usuario.
  5. **Autenticación e Identidad:** Las sesiones de usuario son efímeras o solo en localStorage local; se requiere inicio de sesión con Google OAuth para vincular la identidad, foto y persistir los puntos y medallas.
- **Objetivo:**
  Evolucionar Food Roulette para incorporar:
  - Selección de centro de búsqueda por clic en el mapa.
  - Catálogo completo de las 15 comunas de CABA con sus barrios.
  - Ampliación del radio de búsqueda hasta 20 km.
  - Corrección definitiva del contexto de apilamiento (z-index) del modal y mapa.
  - Integración del logotipo oficial provisto por el usuario.
  - Motor de recomendaciones personalizadas basado en afinidad de cocinas y restricciones.
  - Autenticación con Google OAuth utilizando las credenciales provistas (`clientId` y `clientSecret`).

---

## 2. Propuesta de Arquitectura y Flujo de Datos

### Arquitectura de Componentes (Fase 2)
```
[ Frontend: Next.js 15 App Router ]
  ├── Navbar (Logo oficial, Sesión Google, Puntos y Nivel)
  ├── FilterBar (Comunas de CABA, Radio hasta 20km, Clic en mapa)
  ├── LeafletMap (Selector de centro por clic con 'map.on(click)', Z-Index aislado)
  ├── RecommendationSection ("Recomendados para vos" según historial)
  ├── RouletteWheel & WinnerCard
  └── PassportModal (Z-Index [9999], progreso, insignias e historial)
         │
         ▼
[ API Routes & Servidores de Dominio ]
  ├── /api/auth/[...nextauth] o /api/auth/google (Google OAuth)
  ├── /api/places (Búsqueda OSM / Mock por coordenadas de comuna o clic)
  ├── /api/recommendations (Cálculo de afinidad de usuario)
  ├── /api/roulette/spin
  └── /api/visits/check-in
```

### 1. Clic en Mapa para Centro de Búsqueda
- En `LeafletMap`, se añade un listener `useMapEvents` o `map.on('click', (e) => onMapClick(e.latlng))`.
- Al hacer clic, se actualiza el marcador del usuario ("📍 Punto seleccionado en el mapa"), se recalcula la distancia y se refrescan los restaurantes candidatos en el nuevo radio.

### 2. Catálogo de Comunas de CABA
- Definición estructurada de las 15 Comunas porteñas con su centroide geográfico y barrios que la componen (ej. Comuna 14: Palermo; Comuna 13: Belgrano, Núñez, Colegiales; Comuna 6: Caballito, etc.).
- Selector directo tipo dropdown/pills en la barra de filtros.

### 3. Corrección de Z-Index del Modal
- En `LeafletMap.tsx`: envolver el mapa con estilo de aislamiento `isolation: isolate; z-index: 10;`.
- En `PassportModal.tsx`: elevar el overlay a `z-[9999]` con `backdrop-blur-md`, garantizando que quede siempre por encima de cualquier tile o control de Leaflet.

### 4. Motor de Recomendaciones Personalizadas (`RecommendationEngine`)
- **Algoritmo de Afinidad Gastronómica:**
  1. Calcula la frecuencia de cocinas visitadas por el usuario:
     `weight(cuisine) = count(visits with cuisine) * 1.5`
  2. Filtra candidatos para excluir los ya visitados y los incompatibles con restricciones dietarias.
  3. Puntuación por restaurante:
     `score = (rating || 3.5) * 10 + sum(weight(cuisine for each match)) - (distanceKm * 2)`
  4. Ordena descendentemente y entrega el Top 5 de recomendaciones destacadas ("Especialmente para ti").

### 5. Autenticación con Google OAuth
- Configuración de variables de entorno seguras en `.env.local`:
  - `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
- Endpoint de verificación / gestión de sesión OAuth.
- Guardado del perfil en estado y vinculación del email del usuario a su saldo de puntos, medallas y visitas.

---

## 3. Cambios en APIs e Interfaces

### Nuevas Interfaces de Dominio
```typescript
export interface ComunaCaba {
  id: number;
  name: string;
  barrios: string[];
  location: Coordinates;
}

export interface RecommendationParams {
  pool: ClassifiedRestaurant[];
  visitedCuisinesCount: Record<string, number>;
  visitedRestaurantIds: Set<string>;
  requiredDietary?: DietaryRestriction[];
  userLocation: Coordinates;
  limit?: number;
}

export interface UserSession {
  id: string;
  name: string;
  email: string;
  picture?: string;
}
```

### Endpoints
- `POST /api/recommendations`:
  - Entrada: `{ pool, visitedCuisinesCount, visitedRestaurantIds, requiredDietary, userLocation }`
  - Salida: `{ success: boolean, recommendations: ClassifiedRestaurant[] }`
- `POST /api/auth/google`:
  - Entrada: `{ credential: string }` (Google ID Token) o sesión OAuth.
  - Salida: `{ success: boolean, user: UserSession }`

---

## 4. Plan de Pruebas (TDD)

### A. Casos de Éxito (Happy Paths)
1. **Motor de Recomendaciones (`RecommendationEngine`):**
   - Un usuario con 3 visitas a comida "Italiana" y 1 a "Argentina" recibe primero restaurantes italianos no visitados.
   - Si el usuario tiene restricción `CELIAC`, el motor solo recomienda opciones aptas para celíacos.
   - Si no hay historial previo, devuelve los mejores calificados de la zona sin fallar.
2. **Catálogo de Comunas de CABA:**
   - La selección de cualquier comuna (1 a 15) entrega coordenadas válidas dentro del polígono de la Ciudad de Buenos Aires.
3. **Mapeo y Manejo de Sesión Google:**
   - Decodificación y verificación de perfil de usuario Google (nombre, email, avatar).

### B. Casos de Fallo y Errores (Edge Cases)
1. **Clic en el mapa fuera de límites:** Validación que restringe coordenadas anómalas.
2. **Pool de recomendaciones vacío:** Retorna lista vacía con mensaje sugerido sin lanzar excepción de sistema.
3. **Fallo en autenticación Google:** Respuesta clara con código 401/400 ante credenciales inválidas.

---

## 5. Plan de Implementación (Paso a Paso)

1. [ ] **TDD Fase 1: Motor de Recomendaciones**
   - Escribir tests unitarios en `src/domain/recommendations/__tests__/recommendation-engine.test.ts`.
   - Implementar `RecommendationEngine`.
2. [ ] **Catálogo de Comunas y Ampliación de Radio**
   - Crear dataset y utilidades de las 15 comunas de CABA en `src/domain/caba/comunas.ts`.
   - Modificar `FilterBar.tsx` para extender el slider de radio a 20 km y agregar selector de comunas.
3. [ ] **Mapa Interactivo con Clic para Seleccionar Centro**
   - Modificar `LeafletMap.tsx` con listener de clic que emite `onMapClick(lat, lng)`.
   - Aislar el contexto de apilamiento (`isolation: isolate`) para evitar colisión de capas.
4. [ ] **Corrección de Z-Index del Modal de Pasaporte**
   - Actualizar `PassportModal.tsx` con `z-[9999]` y backdrop superior.
5. [ ] **Integración del Logo Oficial**
   - Copiar logo a `public/logo.png` y actualizar `Navbar.tsx` y favicon.
6. [ ] **Autenticación con Google OAuth**
   - Configurar variables de entorno y componente/botón de inicio de sesión con Google.
   - Vincular datos de sesión con el perfil y pasaporte gastronómico.
7. [ ] **Pruebas de Regresión y Build de Producción**
   - Ejecutar suite completa con Vitest y verificar `npm run build`.
