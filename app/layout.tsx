// app/layout.tsx
import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

import { LoaderProvider } from "@/components/providers/LoaderProvider";
import { CartProvider } from "@/components/CartContext";
import { FavoritesProvider } from "@/components/FavoritesContext";
import { ThemeProvider } from "@/components/ThemeContext";
import RootClientShell from "@/components/RootClientShell";

// Fuentes premium
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dulces Detalles Cartagena ER | Arreglos y regalos personalizados en Cartagena",
  description:
    "Arreglos con chocolates, flores, peluches, tazas y detalles personalizados para cumpleaños, aniversarios, novenas y más en Cartagena.",
  icons: {
    icon: "/favicon.ico",
  },
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${playfair.variable} ${inter.variable}`}>
      <body className="bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 min-h-screen antialiased font-sans">
        {/* Providers globales */}
        <ThemeProvider>
          <LoaderProvider>
            <CartProvider>
              <FavoritesProvider>
                <RootClientShell>{children}</RootClientShell>
              </FavoritesProvider>
            </CartProvider>
          </LoaderProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
