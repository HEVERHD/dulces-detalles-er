// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

import { LoaderProvider } from "@/components/providers/LoaderProvider";
import { CartProvider } from "@/components/CartContext";
import RootClientShell from "@/components/RootClientShell";

export const metadata: Metadata = {
  title: "Dulces Detalles ER | Arreglos y regalos personalizados en Cartagena",
  description:
    "Arreglos con chocolates, flores, peluches, tazas y detalles personalizados para cumpleaños, aniversarios, novenas y más en Cartagena.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-pink-50 antialiased">
        {/* Providers globales (para useGlobalLoader y useCart) */}
        <LoaderProvider>
          <CartProvider>
            <RootClientShell>{children}</RootClientShell>
          </CartProvider>
        </LoaderProvider>
      </body>
    </html>
  );
}
