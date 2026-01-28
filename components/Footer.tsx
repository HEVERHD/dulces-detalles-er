// components/Footer.tsx
"use client";

import Link from "next/link";
import NewsletterSignup from "./NewsletterSignup";

const Footer = () => {
    const year = new Date().getFullYear();

    return (
        <footer className="relative mt-16 overflow-hidden">
            {/* Fondo con gradiente sutil */}
            <div className="absolute inset-0 bg-gradient-to-b from-white via-pink-50/50 to-pink-100/30"></div>

            {/* Decoracion superior */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-300 to-transparent"></div>

            <div className="relative">
                {/* Newsletter section */}
                <div className="max-w-6xl mx-auto px-4 pt-12 pb-10">
                    <NewsletterSignup />
                </div>

                {/* Links y redes sociales */}
                <div className="max-w-6xl mx-auto px-4 pb-8">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Logo y descripcion */}
                        <div className="lg:col-span-2">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg">
                                    <span className="text-2xl text-white">&#127873;</span>
                                </div>
                                <div>
                                    <h3 className="font-display font-bold text-slate-900">Dulces Detalles</h3>
                                    <p className="text-xs text-slate-500">Cartagena ER</p>
                                </div>
                            </div>
                            <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
                                Creamos momentos inolvidables con arreglos personalizados.
                                Chocolates, flores, peluches y mas para sorprender a quien amas.
                            </p>
                        </div>

                        {/* Enlaces rapidos */}
                        <div>
                            <h4 className="font-display font-bold text-slate-900 mb-4">Enlaces</h4>
                            <ul className="space-y-2">
                                {[
                                    { label: "Inicio", href: "/" },
                                    { label: "Categorias", href: "#categorias" },
                                    { label: "Sucursales", href: "#sucursales" },
                                    { label: "Contacto", href: "#contacto" },
                                ].map((link) => (
                                    <li key={link.href}>
                                        <Link
                                            href={link.href}
                                            className="text-sm text-slate-500 hover:text-pink-600 transition-colors flex items-center gap-1 group"
                                        >
                                            <svg className="w-3 h-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Contacto */}
                        <div>
                            <h4 className="font-display font-bold text-slate-900 mb-4">Contacto</h4>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-2 text-sm text-slate-500">
                                    <span className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center flex-shrink-0">
                                        <span>&#128222;</span>
                                    </span>
                                    <span>+57 350 473 7638</span>
                                </li>
                                <li className="flex items-center gap-2 text-sm text-slate-500">
                                    <span className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center flex-shrink-0">
                                        <span>&#128205;</span>
                                    </span>
                                    <span>Cartagena, Colombia</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="border-t border-pink-200/50">
                    <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-3">
                        <p className="text-xs text-slate-500">
                            &copy; {year} <span className="font-semibold text-pink-600">Dulces Detalles ER</span>.
                            Todos los derechos reservados.
                        </p>

                        <p className="flex items-center gap-2 text-xs text-slate-400">
                            <span>Desarrollado con</span>
                            <span className="text-pink-500">&#10084;</span>
                            <span>por</span>
                            <span className="font-semibold text-slate-600">Hevert David</span>
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
