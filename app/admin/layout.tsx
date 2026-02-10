// app/admin/layout.tsx
"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    const isActive = (href: string) => pathname.startsWith(href);
    const closeSidebar = () => setIsSidebarOpen(false);

    // En la ruta de login NO mostramos layout de admin
    if (pathname === "/admin/login") {
        return <>{children}</>;
    }

    const handleConfirmLogout = () => {
        setIsLogoutModalOpen(false);
        router.push("/admin/logout");
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Botón menú móvil */}
            <button
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden fixed top-3 left-3 z-50 inline-flex items-center justify-center rounded-full bg-white/90 border border-slate-200 shadow-sm px-3 py-2 text-slate-700 text-sm"
            >
                ☰ <span className="ml-1 text-[11px] font-semibold">Menú</span>
            </button>

            {/* Overlay móvil */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 md:hidden"
                    onClick={closeSidebar}
                />
            )}

            {/* SIDEBAR — FIJO A LA IZQUIERDA EN TODA LA ALTURA */}
            <aside
                className={`
                    fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 px-4 py-6
                    flex flex-col overflow-y-auto transform transition-transform duration-200
                    ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
                    md:translate-x-0
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

                    <Link
                        href="/admin/cupones"
                        onClick={closeSidebar}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded-lg
                            ${isActive("/admin/cupones")
                                ? "text-pink-600 bg-pink-50 font-semibold"
                                : "text-slate-600 hover:bg-slate-100"
                            }
                        `}
                    >
                        🎟️ Cupones
                    </Link>

                    <Link
                        href="/admin/resenas"
                        onClick={closeSidebar}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded-lg
                            ${isActive("/admin/resenas")
                                ? "text-pink-600 bg-pink-50 font-semibold"
                                : "text-slate-600 hover:bg-slate-100"
                            }
                        `}
                    >
                        ⭐ Reseñas
                    </Link>

                    <Link
                        href="/admin/suscriptores"
                        onClick={closeSidebar}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded-lg
                            ${isActive("/admin/suscriptores")
                                ? "text-pink-600 bg-pink-50 font-semibold"
                                : "text-slate-600 hover:bg-slate-100"
                            }
                        `}
                    >
                        📬 Suscriptores
                    </Link>

                    <Link
                        href="/admin/banners"
                        onClick={closeSidebar}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded-lg
                            ${isActive("/admin/banners")
                                ? "text-pink-600 bg-pink-50 font-semibold"
                                : "text-slate-600 hover:bg-slate-100"
                            }
                        `}
                    >
                        🖼️ Banners del Home
                    </Link>

                    <Link
                        href="/admin/countdowns"
                        onClick={closeSidebar}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded-lg
                            ${isActive("/admin/countdowns")
                                ? "text-pink-600 bg-pink-50 font-semibold"
                                : "text-slate-600 hover:bg-slate-100"
                            }
                        `}
                    >
                        ⏳ Cuenta Regresiva
                    </Link>

                    <Link
                        href="/admin/pedidos"
                        onClick={closeSidebar}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded-lg
                            ${isActive("/admin/pedidos")
                                ? "text-pink-600 bg-pink-50 font-semibold"
                                : "text-slate-600 hover:bg-slate-100"
                            }
                        `}
                    >
                        🧾 Pedidos
                    </Link>
                </nav>

                {/* Footer / usuario */}
                <div className="border-top border-slate-200 pt-3 mt-3">
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

                    <button
                        type="button"
                        onClick={() => {
                            closeSidebar();
                            setIsLogoutModalOpen(true);
                        }}
                        className="block mt-2 text-left text-xs text-slate-500 hover:text-red-500 hover:underline"
                    >
                        Cerrar sesión
                    </button>
                </div>
            </aside>

            {/* CONTENIDO PRINCIPAL */}
            {/* En desktop le damos margen izquierdo del ancho del sidebar (w-64) */}
            <main className="md:ml-64 px-4 md:px-8 py-6">
                <div className="w-full max-w-5xl mx-auto">
                    {children}
                </div>
            </main>

            {/* MODAL CONFIRMACIÓN LOGOUT */}
            {isLogoutModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6">
                        <h2 className="text-base font-semibold text-slate-900">
                            ¿Cerrar sesión?
                        </h2>
                        <p className="mt-2 text-xs text-slate-500">
                            Se cerrará tu sesión del panel administrativo. Tendrás que
                            iniciar sesión de nuevo para volver a entrar.
                        </p>

                        <div className="mt-4 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setIsLogoutModalOpen(false)}
                                className="px-4 py-2 rounded-full text-xs font-semibold text-slate-600 hover:bg-slate-100"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmLogout}
                                className="px-4 py-2 rounded-full text-xs font-semibold text-white bg-red-500 hover:bg-red-600 shadow-md"
                            >
                                Cerrar sesión
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
