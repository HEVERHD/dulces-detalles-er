"use client";

import { CartProvider } from "@/components/CartContext";
import { LoaderProvider } from "@/components/providers/LoaderProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <LoaderProvider>
            <CartProvider>
                {children}
            </CartProvider>
        </LoaderProvider>
    );
}
