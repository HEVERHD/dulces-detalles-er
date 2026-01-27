// components/SiteHeader.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useFavorites } from "./FavoritesContext";

const WHATSAPP_MAIN = "573504737638"; // 57 + 3504737638

function buildWhatsAppUrl() {
    const text =
        "Hola, vengo desde la web de *Dulces Detalles ER* 💖 y quiero información sobre sus detalles.";
    return `https://wa.me/${WHATSAPP_MAIN}?text=${encodeURIComponent(text)}`;
}

export default function SiteHeader() {
    const { totalFavorites } = useFavorites();

    const handleWhatsAppClick = () => {
        if (typeof window === "undefined") return;
        window.open(buildWhatsAppUrl(), "_blank");
    };

    return (
        <header className="sticky top-0 z-30 border-b border-pink-100 bg-white/90 backdrop-blur">
            <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
                {/* Logo + marca */}
                <Link href="/" className="flex items-center gap-2">
                    <Image
                        src="/images/logo.png"
                        alt="Dulces Detalles ER"
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                        priority
                    />
                    <div className="leading-tight">
                        <p className="text-sm font-semibold text-slate-900">
                            Dulces Detalles Cartagena ER
                        </p>
                        <p className="text-[11px] text-slate-400">
                            Un mundo divertido de sabores
                        </p>
                    </div>
                </Link>

                {/* Navegación */}
                <nav className="hidden md:flex items-center gap-4 text-sm">
                    <Link
                        href="/categorias"
                        className="text-slate-600 hover:text-pink-600 transition-colors"
                    >
                        Categorías
                    </Link>
                    <Link
                        href="/destacados"
                        className="text-slate-600 hover:text-pink-600 transition-colors"
                    >
                        Detalles destacados
                    </Link>
                    <Link
                        href="/sucursales"
                        className="text-slate-600 hover:text-pink-600 transition-colors"
                    >
                        Sucursales
                    </Link>
                    <Link
                        href="/favoritos"
                        className="relative text-slate-600 hover:text-pink-600 transition-colors"
                    >
                        <span className="flex items-center gap-1">
                            💝 Favoritos
                            {totalFavorites > 0 && (
                                <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] text-[10px] font-bold text-white bg-pink-500 rounded-full px-1">
                                    {totalFavorites}
                                </span>
                            )}
                        </span>
                    </Link>
                </nav>

                {/* CTA WhatsApp */}
                <button
                    onClick={handleWhatsAppClick}
                    className="inline-flex items-center gap-2 rounded-full bg-pink-500 hover:bg-pink-600 text-white text-xs md:text-sm font-semibold px-4 py-2 shadow-md"
                >
                    <span>💬 Pedir por WhatsApp</span>
                </button>
            </div>
        </header>
    );
}
