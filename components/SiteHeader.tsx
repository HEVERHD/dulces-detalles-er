// components/SiteHeader.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useFavorites } from "./FavoritesContext";
import { useTheme } from "./ThemeContext";

type Branch = "outlet" | "supercentro";
const BRANCH_STORAGE_KEY = "dd-default-branch";

const WHATSAPP_OUTLET = "573504737638";
const WHATSAPP_SUPERCENTRO = "573202304977";

function buildWhatsAppUrl(branch: Branch) {
    const phone = branch === "supercentro" ? WHATSAPP_SUPERCENTRO : WHATSAPP_OUTLET;
    const text =
        "Hola, vengo desde la web de *Dulces Detalles ER* 💖 Quiero más información sobre sus arreglos y detalles.";
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export default function SiteHeader() {
    const { totalFavorites } = useFavorites();
    const { isDark, toggleTheme } = useTheme();
    const [branch, setBranch] = useState<Branch>("outlet");

    // Leer sucursal de localStorage al montar
    useEffect(() => {
        if (typeof window === "undefined") return;
        const stored = window.localStorage.getItem(BRANCH_STORAGE_KEY);
        if (stored === "outlet" || stored === "supercentro") {
            setBranch(stored);
        }

        // Escuchar cambios desde HomePageClient u otras tabs
        const handleStorage = (e: StorageEvent) => {
            if (e.key === BRANCH_STORAGE_KEY && (e.newValue === "outlet" || e.newValue === "supercentro")) {
                setBranch(e.newValue);
            }
        };

        // Escuchar evento custom para sync dentro de la misma tab
        const handleCustom = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            if (detail === "outlet" || detail === "supercentro") {
                setBranch(detail);
            }
        };

        window.addEventListener("storage", handleStorage);
        window.addEventListener("branch-change", handleCustom);
        return () => {
            window.removeEventListener("storage", handleStorage);
            window.removeEventListener("branch-change", handleCustom);
        };
    }, []);

    const handleBranchChange = (newBranch: Branch) => {
        setBranch(newBranch);
        if (typeof window !== "undefined") {
            window.localStorage.setItem(BRANCH_STORAGE_KEY, newBranch);
            window.dispatchEvent(new CustomEvent("branch-change", { detail: newBranch }));
        }
    };

    const handleWhatsAppClick = () => {
        if (typeof window === "undefined") return;
        window.open(buildWhatsAppUrl(branch), "_blank");
    };

    return (
        <header className="sticky top-0 z-30 glass-card border-b border-pink-100/50 shadow-sm">
            <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-4">
                {/* Logo + marca */}
                <Link href="/" className="flex items-center gap-2 sm:gap-3 group min-w-0">
                    <div className="relative flex-shrink-0">
                        <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full opacity-0 group-hover:opacity-70 blur transition-opacity"></div>
                        <Image
                            src="/images/logo.png"
                            alt="Dulces Detalles ER"
                            width={44}
                            height={44}
                            className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-full object-cover ring-2 ring-pink-100 group-hover:ring-pink-300 transition-all"
                            priority
                        />
                    </div>
                    <div className="leading-tight min-w-0">
                        <p className="font-display text-xs sm:text-sm font-bold text-slate-900 group-hover:text-pink-600 transition-colors truncate">
                            Dulces Detalles Cartagena ER
                        </p>
                        <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">
                            Un mundo divertido de sabores
                        </p>
                    </div>
                </Link>

                {/* Navegacion desktop */}
                <nav className="hidden md:flex items-center gap-1">
                    {[
                        { label: "Categorias", href: "/categorias" },
                        { label: "Destacados", href: "/destacados" },
                        { label: "Sucursales", href: "/sucursales" },
                    ].map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="px-4 py-2 text-sm text-slate-600 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-all"
                        >
                            {item.label}
                        </Link>
                    ))}

                    {/* Favoritos con badge */}
                    <Link
                        href="/favoritos"
                        className="relative px-4 py-2 text-sm text-slate-600 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-all flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span>Favoritos</span>
                        {totalFavorites > 0 && (
                            <span className="inline-flex items-center justify-center min-w-[20px] h-[20px] text-[10px] font-bold text-white bg-gradient-to-r from-pink-500 to-rose-500 rounded-full px-1.5 shadow-sm">
                                {totalFavorites}
                            </span>
                        )}
                    </Link>
                </nav>

                {/* Acciones: Branch + Toggle + WhatsApp */}
                <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
                    {/* Selector de sucursal - compacto */}
                    <div className="inline-flex rounded-lg bg-slate-100 p-0.5">
                        <button
                            type="button"
                            onClick={() => handleBranchChange("outlet")}
                            className={`px-2 sm:px-2.5 py-1.5 rounded-md text-[10px] sm:text-[11px] font-semibold transition-all ${
                                branch === "outlet"
                                    ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-sm"
                                    : "text-slate-500 hover:text-slate-700"
                            }`}
                            title="Outlet del Bosque"
                        >
                            <span className="hidden sm:inline">Outlet</span>
                            <span className="sm:hidden">OB</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => handleBranchChange("supercentro")}
                            className={`px-2 sm:px-2.5 py-1.5 rounded-md text-[10px] sm:text-[11px] font-semibold transition-all ${
                                branch === "supercentro"
                                    ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-sm"
                                    : "text-slate-500 hover:text-slate-700"
                            }`}
                            title="Supercentro Los Ejecutivos"
                        >
                            <span className="hidden sm:inline">Supercentro</span>
                            <span className="sm:hidden">SC</span>
                        </button>
                    </div>

                    {/* Toggle Dark Mode */}
                    <button
                        onClick={toggleTheme}
                        className="theme-toggle"
                        aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
                        title={isDark ? "Modo claro" : "Modo oscuro"}
                    >
                        <span className="theme-toggle-icon sun-icon">&#9728;</span>
                        <span className="theme-toggle-icon moon-icon">&#127769;</span>
                    </button>

                    {/* CTA WhatsApp */}
                    <button
                        onClick={handleWhatsAppClick}
                        className="btn-premium inline-flex items-center gap-1.5 sm:gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-xs md:text-sm font-semibold px-3 sm:px-5 py-2 sm:py-2.5 shadow-lg shadow-green-500/25 transition-all"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        <span className="hidden sm:inline">WhatsApp</span>
                    </button>
                </div>
            </div>
        </header>
    );
}
