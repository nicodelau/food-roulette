# 🎡 Food Roulette

Descubrimiento inteligente y gamificado de restaurantes por zonas geográficas. Clasifica opciones por tipo de comida (orígenes/países), temáticas y restricciones dietarias, permitiendo girar una ruleta para elegir a dónde ir, con filtros de exclusión (lugares visitados, blacklist) y un sistema de niveles y puntos.

---

## 🚀 Características Principales

1. **Ingesta Geográfica Gratuita:**
   - Consulta restaurantes mediante **OpenStreetMap (Overpass API + Nominatim)** sin costo de API ni necesidad de tarjeta de crédito.
   - Adaptador desacoplado (`IPlacesProvider`) con soporte opcional para Google Places API vía variables de entorno.
   - Modo Mock integrado para desarrollo offline y pruebas ultrarrápidas.

2. **Clasificador Gastronómico:**
   - **Por Origen/País:** Argentina, Italiana, Japonesa / Sushi, Mexicana, Armenia / Medio Oriente, Americana / Burgers, Peruana, Española, China / Asiática, Café & Pastelería.
   - **Por Temática:** Bodegón, Parrilla / Asador, Pizzería, Bar / Cervecería, Romántico / De Autor, Cafetería.
   - **Aptitud Dietaria:** Sin TACC / Celíacos, Vegano, Vegetariano, Sin Lactosa.

3. **Ruleta Inteligente & Exclusiones:**
   - Filtro geodésico por radio (Haversine).
   - Switch de exclusión: **"Excluir lugares donde ya fui"** (ignora historial del usuario).
   - Lista negra: Veta restaurantes para que nunca más aparezcan.
   - Animación interactiva de ruleta con cálculo de distancia y dirección a Google Maps / OSM.

4. **Gamificación & Pasaporte Culinario:**
   - **+20 puntos** por cada salida gastronómica confirmada (check-in).
   - **+50 puntos** de bono por explorar una nueva cocina nunca antes probada por el usuario.
   - Rango y niveles: *Novato Gastronómico*, *Comensal Curioso*, *Gourmet Aventurero*, *Maestro Culinario*.
   - Medallas desbloqueables: *Primer Bocado*, *Políglota del Paladar*, *Explorador Local*.

---

## 🛠️ Stack Tecnológico

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router, React 19, TypeScript estricto).
- **Estilos:** Tailwind CSS con diseño responsive y tema oscuro.
- **Mapas:** Leaflet con capas libres de CartoDB / OpenStreetMap.
- **Testing:** [Vitest](https://vitest.dev/) con cobertura TDD para dominio y endpoints.

---

## 🏃 Puesta en Marcha

```bash
# 1. Instalar dependencias
npm install

# 2. Ejecutar suite de pruebas (TDD)
npm test

# 3. Iniciar servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para usar Food Roulette.
