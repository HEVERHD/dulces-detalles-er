// app/(web)/layout.tsx
import type { ReactNode } from "react";
import Link from "next/link";
import Footer from "@/components/Footer";
// importa aquí tu footer si ya lo tienes
// import Footer from "@/components/Footer";

export default function WebLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col bg-pink-50/40">
            {/* HEADER PÚBLICO */}
            <header className="border-b border-pink-100 bg-white/80 backdrop-blur-md">
                <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3 gap-4">
                    <Link href="/" className="flex items-center gap-2">
                        <img
                            src="/images/logo.png"
                            alt="Dulces Detalles Cartagena ER"
                            className="h-8 w-8 rounded-full object-cover"
                        />
                        <div className="leading-tight">
                            <p className="text-sm font-semibold text-pink-700">
                                Dulces Detalles Cartagena ER
                            </p>
                            <p className="text-[11px] text-pink-400">
                                Un mundo divertido de sabores
                            </p>
                        </div>
                    </Link>

                    <nav className="flex items-center gap-4 text-xs md:text-sm">
                        <Link href="/categorias" className="text-slate-600 hover:text-pink-600">
                            Categorías
                        </Link>
                        <Link href="/destacados" className="text-slate-600 hover:text-pink-600">
                            Detalles destacados
                        </Link>
                        <Link href="/sucursales" className="text-slate-600 hover:text-pink-600">
                            Sucursales
                        </Link>
                        <a
                            href="#contacto"
                            className="hidden sm:inline-flex items-center rounded-full bg-pink-500 text-white px-4 py-1.5 text-xs font-semibold shadow-sm hover:bg-pink-600"
                        >
                            Pedir por WhatsApp
                        </a>
                    </nav>
                </div>
            </header>

            {/* CONTENIDO */}
            <main className="flex-1">{children}</main>

            <Footer />
        </div>
    );
}
