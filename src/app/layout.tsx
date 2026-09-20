import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Food Roulette - Descubrí dónde comer por zonas",
  description:
    "Ruleta gastronómica inteligente por zonas, clasificada por origen y temáticas, con exclusiones, restricciones dietarias y sistema de puntos.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="bg-slate-950 text-slate-100 antialiased selection:bg-orange-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
