// components/Footer.tsx
"use client";

import Link from "next/link";

const Footer = () => {
    const year = new Date().getFullYear();

    return (
        <footer className="mt-10 border-t border-slate-100 bg-white/90">
            <div className="max-w-6xl mx-auto px-4 py-5 flex flex-col md:flex-row items-center justify-between gap-2 text-[11px] md:text-xs text-slate-500">
                <p>
                    © {year} <span className="font-semibold text-pink-600">Dulces Detalles ER</span>.{" "}
                    Todos los derechos reservados.
                </p>

                <p className="flex items-center gap-1 text-center md:text-right">
                    <span className="text-slate-400">Desarrollado por</span>
                    <span className="font-semibold text-pink-600">
                        Hevert David
                    </span>
                    <span className="text-slate-400">
                        · Analista profesional Frontend
                    </span>
                </p>
            </div>
        </footer>
    );
};

export default Footer;
