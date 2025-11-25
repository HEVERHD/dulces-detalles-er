"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { CATEGORY_LABELS } from "@/lib/categories"; // opcional si quieres usar algo luego

export default function AdminLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const isActive = (href: string) => pathname.startsWith(href);

    const closeSidebar = () => setIsSidebarOpen(false);

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Botón menú móvil */}
            <button
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden fixed top-3 left-3 z-40 inline-flex items-center justify-center rounded-full bg-white/90 border border-slate-200 shadow-sm px-3 py-2 text-slate-700 text-sm"
            >
                ☰ <span className="ml-1 text-[11px] font-semibold">Menú</span>
            </button>

            {/* Overlay móvil */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-30 md:hidden"
                    onClick={closeSidebar}
                />
            )}

            {/* SIDEBAR */}
            <aside
                className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 px-4 py-6
          flex flex-col overflow-y-auto transform transition-transform duration-200
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:static md:translate-x-0 md:w-60
        `}
            >
                {/* Logo + título */}
                <div className="flex items-center gap-2 mb-6">
                    <Image
                        src="/images/logo.png"
                        width={36}
                        height={36}
                        alt="Dulces Detalles ER"
                        className="rounded-full object-cover"
                        priority
                    />
                    <div>
                        <p className="text-sm font-semibold text-slate-900">
                            Dulces Detalles ER
                        </p>
                        <p className="text-[11px] text-slate-400">
                            Panel de administración
                        </p>
                    </div>
                </div>

                {/* Navegación */}
                <nav className="flex-1 text-sm space-y-1">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2">
                        Menú
                    </p>

                    <Link
                        href="/admin/productos"
                        onClick={closeSidebar}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded-lg
              ${isActive("/admin/productos")
                                ? "text-pink-600 bg-pink-50 font-semibold"
                                : "text-slate-600 hover:bg-slate-100"
                            }
            `}
                    >
                        📦 Productos
                    </Link>

                    <Link
                        href="/admin/categorias"
                        onClick={closeSidebar}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded-lg
              ${isActive("/admin/categorias")
                                ? "text-pink-600 bg-pink-50 font-semibold"
                                : "text-slate-600 hover:bg-slate-100"
                            }
            `}
                    >
                        📁 Categorías
                    </Link>

                    <button
                        disabled
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-slate-500 hover:bg-slate-100 opacity-60 cursor-not-allowed"
                    >
                        🧾 Pedidos
                        <span className="ml-auto text-[10px] text-slate-400">
                            Próximamente
                        </span>
                    </button>
                </nav>

                {/* Footer / usuario */}
                <div className="border-t border-slate-200 pt-3 mt-3">
                    <p className="text-[11px] text-slate-400">Sesión activa</p>
                    <p className="text-xs font-semibold text-slate-700">
                        Admin Dulces
                    </p>

                    <Link
                        href="/"
                        className="block mt-3 text-xs text-pink-600 hover:underline"
                        onClick={closeSidebar}
                    >
                        ← Volver al sitio
                    </Link>
                </div>
            </aside>

            {/* CONTENIDO PRINCIPAL */}
            <main className="flex-1 px-4 md:px-6 py-6 md:ml-0 ml-0">
                {children}
            </main>
        </div>
    );
}
