// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dulces Detalles ER | Marketplace",
  description: "Un mundo divertido de sabores y detalles en Cartagena.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-gradient-to-b from-pink-50 via-white to-sky-50 text-slate-900 min-h-screen">
        <header className="border-b border-pink-100 bg-white/70 backdrop-blur sticky top-0 z-20">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            {/* LOGO + NOMBRE */}
            <div className="flex items-center gap-3">
              <img
                src="/images/logo.png" // asegúrate que el archivo exista aquí
                alt="Dulces Detalles ER"
                className="w-14 h-auto drop-shadow-md"
              />

              <div className="flex flex-col leading-tight">
                <span className="font-extrabold text-pink-600 text-lg">
                  Dulces Detalles ER
                </span>
                <span className="text-xs text-slate-500">
                  Un mundo divertido de sabores
                </span>
              </div>
            </div>

            {/* NAV */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <a href="/categorias" className="hover:text-pink-600">
                Categorías
              </a>
              <a href="/destacados" className="hover:text-pink-600">
                Detalles destacados
              </a>
              <a href="/sucursales" className="hover:text-pink-600">
                Sucursales
              </a>

              <a
                href="#contacto"
                className="px-4 py-1.5 rounded-full bg-pink-500 text-white hover:bg-pink-600 shadow-md"
              >
                Pedir por WhatsApp
              </a>
            </nav>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 pb-24 pt-6">
          {children}
        </main>
      </body>
    </html>
  );
}
