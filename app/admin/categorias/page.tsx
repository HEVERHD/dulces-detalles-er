"use client";

import { CATEGORIES } from "@/lib/categories";
import { PRODUCTS } from "@/lib/products";

export default function AdminCategoriesPage() {
    const stats = CATEGORIES.map((cat) => {
        const productsInCategory = PRODUCTS.filter((p) => p.category === cat.id);
        const total = productsInCategory.length;
        const featured = productsInCategory.filter((p) => p.isFeatured).length;
        const inactive = productsInCategory.filter((p) => !p.isActive).length;

        return { ...cat, total, featured, inactive };
    });

    return (
        <div className="space-y-6">
            <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                    <h1 className="text-xl md:text-2xl font-extrabold text-slate-900">
                        Categorías
                    </h1>
                    <p className="text-sm text-slate-500">
                        Agrupa y organiza los detalles por tipo de ocasión.
                    </p>
                </div>

                <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-600 text-xs px-3 py-1">
                    Módulo informativo por ahora — CRUD próximamente ✨
                </span>
            </header>

            <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="hidden md:grid grid-cols-[2fr,1fr,1fr,1fr] gap-3 px-4 py-2 text-[11px] font-semibold text-slate-500 border-b border-slate-100 uppercase tracking-wide">
                    <span>Categoría</span>
                    <span className="text-right">Productos</span>
                    <span className="text-right">Destacados</span>
                    <span className="text-right">Ocultos</span>
                </div>

                <div className="divide-y divide-slate-100">
                    {stats.map((cat) => (
                        <div
                            key={cat.id}
                            className="grid md:grid-cols-[2fr,1fr,1fr,1fr] gap-3 px-4 py-3 items-center hover:bg-pink-50/40 transition-colors"
                        >
                            <div>
                                <p className="text-sm font-semibold text-slate-900">{cat.label}</p>
                                {cat.description && (
                                    <p className="text-xs text-slate-500">{cat.description}</p>
                                )}
                                <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                                    id: {cat.id}
                                </p>
                            </div>

                            <div className="text-right text-sm text-slate-800">
                                {cat.total}
                            </div>
                            <div className="text-right text-sm text-pink-600">
                                {cat.featured}
                            </div>
                            <div className="text-right text-sm text-slate-600">
                                {cat.inactive}
                            </div>
                        </div>
                    ))}

                    {stats.length === 0 && (
                        <div className="px-4 py-6 text-sm text-slate-500 text-center">
                            No hay categorías definidas.
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
