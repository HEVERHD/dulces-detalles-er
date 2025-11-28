// app/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Product } from "../lib/products";
import { useCart } from "@/components/CartContext";
import { useGlobalLoader } from "@/components/providers/LoaderProvider";


import type { Metadata } from "next";




const CATEGORIES = [
    { id: "cumple", name: "Cumpleaños 🎂", description: "Tortas, cajas sorpresa, globos y más." },
    { id: "aniversario", name: "Aniversarios 💘", description: "Detalles románticos para celebrar el amor." },
    { id: "declaracion", name: "Declaraciones 💍", description: "Momentos inolvidables para decir lo que sientes." },
    { id: "infantil", name: "Infantil 🎈", description: "Detalles para los más pequeños y sus héroes favoritos." },
    { id: "dietetico", name: "Sin azúcar / especiales 🌱", description: "Opciones especiales según tu necesidad." },
];

// Números en formato internacional para WhatsApp (sin +, con 57)
const WHATSAPP_OUTLET_BOSQUE = "3504737638";
const WHATSAPP_SUPERCENTRO = "3202304977";

type Branch = "outlet" | "supercentro";
const BRANCH_STORAGE_KEY = "dd-default-branch";

function buildWhatsAppUrl(phone: string, productName?: string) {
    const text = `Hola, vengo desde la web de *Dulces Detalles ER* 💖 Quiero más información sobre${productName ? ` el detalle: *${productName}*` : " sus arreglos y detalles."
        }`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

function getBranchLabel(branch: Branch) {
    return branch === "outlet" ? "Outlet del Bosque" : "Supercentro Los Ejecutivos";
}

export default function HomePageClient() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoadingProducts, setIsLoadingProducts] = useState(true);
    const [errorProducts, setErrorProducts] = useState<string | null>(null);
    const { showLoader, hideLoader } = useGlobalLoader();

    // Paginación
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const LIMIT = 6;

    // 🧺 Carrito
    const { addItem, totalItems } = useCart();
    const [animateCart, setAnimateCart] = useState(false);

    // Sucursal default
    const [defaultBranch, setDefaultBranch] = useState<Branch>("outlet");

    // Buscador
    const [searchQuery, setSearchQuery] = useState("");

    // ✔ Animación carrito
    useEffect(() => {
        if (totalItems > 0) {
            setAnimateCart(true);
            const timer = setTimeout(() => setAnimateCart(false), 700);
            return () => clearTimeout(timer);
        }
    }, [totalItems]);

    // ✔ Filtro buscador
    const filteredProducts = products.filter((product) => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return true;

        return (
            product.name.toLowerCase().includes(q) ||
            (product.tag ?? "").toLowerCase().includes(q) ||
            (product.shortDescription ?? "").toLowerCase().includes(q)
        );
    });

    // Productos ordenados: primero los que tienen ventas
    const sortedProducts = [...filteredProducts].sort((a, b) => {
        const aSales = (a as any).soldCount ?? 0;
        const bSales = (b as any).soldCount ?? 0;

        // Primero los que tienen más ventas
        if (bSales !== aSales) return bSales - aSales;

        // Dejar el resto como venían (podrías usar createdAt si lo tienes)
        return 0;
    });


    // ✔ Acción WhatsApp
    const handleWhatsAppClick = (branch?: Branch, productName?: string) => {
        if (typeof window === "undefined") return;

        const effectiveBranch: Branch = branch ?? defaultBranch;
        const phone = effectiveBranch === "supercentro" ? WHATSAPP_SUPERCENTRO : WHATSAPP_OUTLET_BOSQUE;

        window.open(buildWhatsAppUrl(phone, productName), "_blank");
    };

    // ✔ Leer sucursal del storage
    useEffect(() => {
        if (typeof window === "undefined") return;
        const stored = window.localStorage.getItem(BRANCH_STORAGE_KEY);
        if (stored === "outlet" || stored === "supercentro") {
            setDefaultBranch(stored);
        }
    }, []);

    // ✔ Guardar sucursal
    useEffect(() => {
        if (typeof window === "undefined") return;
        window.localStorage.setItem(BRANCH_STORAGE_KEY, defaultBranch);
    }, [defaultBranch]);

    // ✔ Cargar PRIMERA página
    useEffect(() => {
        const loadInitialProducts = async () => {
            try {
                showLoader();
                setIsLoadingProducts(true);
                setErrorProducts(null);

                const res = await fetch(`/api/products?page=1&limit=${LIMIT}`);
                if (!res.ok) throw new Error(`Error cargando productos (${res.status})`);

                const data = await res.json();
                setProducts(data.products);
                setTotal(data.total);
                setPage(1);
            } catch (err: any) {
                console.error(err);
                setErrorProducts(err?.message);
            } finally {
                setIsLoadingProducts(false);
                hideLoader();
            }
        };

        loadInitialProducts();
    }, []);

    const handleLoadMore = async () => {
        if (isLoadingProducts) return;
        if (products.length >= total) return;

        try {
            showLoader();
            setIsLoadingProducts(true);
            const nextPage = page + 1;

            const res = await fetch(`/api/products?page=${nextPage}&limit=${LIMIT}`);
            if (!res.ok) throw new Error("Error cargando más productos");

            const data = await res.json();

            setProducts((prev) => [...prev, ...data.products]);
            setPage(nextPage);
        } catch (err: any) {
            setErrorProducts(err?.message);
        } finally {
            setIsLoadingProducts(false);
            hideLoader();
        }
    };

    const formatPrice = (value: number) =>
        value.toLocaleString("es-CO", {
            style: "currency",
            currency: "COP",
            maximumFractionDigits: 0,
        });

    return (
        <div className="space-y-16 pb-20">
            {/* SWITCH DE SUCURSAL POR DEFECTO */}
            <div className="mt-2 flex flex-col gap-1 md:flex-row md:items-center md:justify-end">
                <div className="flex items-center justify-between md:justify-end gap-2 text-[11px] md:text-xs text-slate-500">
                    <span>Quiero escribir a:</span>
                    <div className="inline-flex rounded-full bg-slate-100 p-1">
                        <button
                            type="button"
                            onClick={() => setDefaultBranch("outlet")}
                            className={`px-3 py-1 rounded-full text-[11px] md:text-xs font-semibold transition ${defaultBranch === "outlet"
                                ? "bg-pink-500 text-white shadow-sm"
                                : "text-slate-600 hover:text-slate-800"
                                }`}
                        >
                            Outlet del Bosque
                        </button>
                        <button
                            type="button"
                            onClick={() => setDefaultBranch("supercentro")}
                            className={`px-3 py-1 rounded-full text-[11px] md:text-xs font-semibold transition ${defaultBranch === "supercentro"
                                ? "bg-pink-500 text-white shadow-sm"
                                : "text-slate-600 hover:text-slate-800"
                                }`}
                        >
                            Supercentro Ejecutivos
                        </button>
                    </div>
                </div>

                <p className="text-[11px] md:text-xs text-slate-400 md:text-right">
                    Estás escribiendo a:{" "}
                    <span className="font-semibold text-pink-600">
                        {getBranchLabel(defaultBranch)}
                    </span>
                </p>
            </div>

            {/* HERO NAVIDEÑO */}
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-emerald-900 via-red-800 to-rose-700 px-4 py-8 md:px-8 md:py-10 shadow-lg">
                <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-1 shadow-md border border-emerald-100">
                        <span className="text-sm">🎄</span>
                        <p className="text-[11px] md:text-xs font-semibold text-emerald-800">
                            Especial Navidad · Detalles listos para regalar
                        </p>
                    </div>
                </div>

                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -top-16 -right-10 w-40 h-40 bg-emerald-500/40 rounded-full blur-3xl" />
                    <div className="absolute -bottom-16 -left-10 w-48 h-48 bg-red-500/40 rounded-full blur-3xl" />
                    <div className="absolute top-10 left-6 w-16 h-16 border border-white/50 rounded-full opacity-70" />
                    <div className="absolute bottom-10 right-10 w-10 h-10 border border-white/40 rounded-full opacity-60" />
                </div>

                <div className="relative grid gap-8 md:grid-cols-2 md:items-center">
                    {/* Imagen navideña */}
                    <div className="order-1 md:order-2 flex justify-center">
                        <div className="relative w-full max-w-xs md:max-w-sm">
                            <div className="absolute -top-4 -left-2 z-20 flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 shadow-md border border-red-100">
                                <span className="text-xs font-semibold text-red-600">
                                    Edición limitada
                                </span>
                                <span className="text-sm">🎁</span>
                            </div>

                            <div className="overflow-hidden rounded-3xl border border-white/70 bg-white/70 shadow-2xl backdrop-blur-sm">
                                <img
                                    src="/images/products/navidad.png"
                                    alt="Arreglo navideño de Dulces Detalles ER"
                                    className="h-60 w-full object-cover md:h-72"
                                />
                            </div>

                            <div className="absolute -bottom-4 right-3 rounded-2xl bg-white/95 px-3 py-1.5 text-[10px] shadow-md flex items-center gap-2 border border-emerald-100">
                                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-[13px]">
                                    ⭐
                                </span>
                                <div className="leading-tight">
                                    <p className="font-semibold text-slate-800">
                                        Combos navideños listos
                                    </p>
                                    <p className="text-[9px] text-slate-500">
                                        Dulces, peluches y decoración 🎅
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Texto navideño */}
                    <div className="order-2 md:order-1 space-y-4 text-white">
                        <p className="inline-flex items-center rounded-full bg-white/15 text-emerald-50 text-[11px] font-semibold px-3 py-1 border border-emerald-300/40">
                            ✨ Navidad dulce en Cartagena
                        </p>

                        <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold leading-tight drop-shadow-sm">
                            Esta Navidad
                            <span className="block text-amber-300 mt-0.5">
                                regala momentos que se quedan en el corazón 💛
                            </span>
                        </h1>

                        <p className="text-sm md:text-base text-emerald-50/90 max-w-md">
                            Arreglos navideños con chocolates, galletas, peluches, tazas, luces
                            y detalles personalizados para sorprender en novenas, intercambios,
                            amigos secretos y cenas familiares.
                        </p>

                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={() => handleWhatsAppClick()}
                                className="inline-flex items-center gap-2 rounded-full bg-amber-300 hover:bg-amber-200 text-emerald-900 font-semibold px-6 py-2.5 shadow-lg shadow-amber-900/30 text-sm"
                            >
                                🎄 Pedir combo navideño
                            </button>

                            <a
                                href="#categorias"
                                className="inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-white/10 text-emerald-50 hover:bg-white/15 px-5 py-2.5 text-xs md:text-sm font-semibold"
                            >
                                Ver todos los detalles
                            </a>
                        </div>

                        <ul className="text-[11px] md:text-xs text-emerald-50/90 space-y-1.5">
                            <li className="flex items-center gap-2">
                                <span className="h-4 w-4 rounded-full bg-emerald-100/90 flex items-center justify-center text-[10px] text-emerald-900">
                                    🎁
                                </span>
                                Combos listos para personalizar con tu mensaje
                            </li>

                            <li className="flex items-center gap-2">
                                <span className="h-4 w-4 rounded-full bg-emerald-100/90 flex items-center justify-center text-[10px] text-emerald-900">
                                    🚚
                                </span>
                                Entregas a domicilio en Cartagena
                            </li>

                            <li className="flex items-center gap-2">
                                <span className="h-4 w-4 rounded-full bg-emerald-100/90 flex items-center justify-center text-[10px] text-emerald-900">
                                    ⭐
                                </span>
                                Arreglos para empresas e intercambios
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* LISTADO + BUSCADOR */}
            <section className="relative">
                <div className="max-w-6xl mx-auto">
                    {/* Buscador */}
                    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex-1">
                            <label
                                htmlFor="search-products"
                                className="block text-[11px] uppercase tracking-wide text-slate-400 font-semibold mb-1"
                            >
                                Buscar detalles
                            </label>
                            <div className="relative">
                                <input
                                    id="search-products"
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Ej: peluche, cumpleaños, aniversario..."
                                    className="w-full rounded-full border border-pink-100 bg-white/80 px-4 py-2 pl-9 text-sm 
                      focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300 
                      text-slate-700 placeholder:text-slate-300"
                                />
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-400 text-sm">
                                    🔍
                                </span>

                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery("")}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 hover:text-pink-500"
                                    >
                                        Limpiar
                                    </button>
                                )}
                            </div>
                        </div>

                        <p className="text-[11px] text-slate-400 mt-1 sm:mt-6 text-right">
                            Mostrando{" "}
                            <span className="font-semibold text-pink-600">
                                {filteredProducts.length}
                            </span>{" "}
                            de {total} detalles
                        </p>
                    </div>

                    {/* Mensajes */}
                    {!isLoadingProducts &&
                        !errorProducts &&
                        products.length > 0 &&
                        filteredProducts.length === 0 && (
                            <p className="text-sm text-slate-500 text-center py-4">
                                No encontramos detalles para{" "}
                                <span className="font-semibold">“{searchQuery}”</span>.
                            </p>
                        )}

                    {isLoadingProducts && (
                        <p className="text-sm text-slate-500 text-center py-4">
                            Cargando detalles...
                        </p>
                    )}

                    {errorProducts && !isLoadingProducts && (
                        <p className="text-sm text-red-500 text-center py-4">
                            Ocurrió un error cargando los productos.
                        </p>
                    )}

                    {!isLoadingProducts && !errorProducts && products.length === 0 && (
                        <p className="text-sm text-slate-500 text-center py-4">
                            Aún no hay productos configurados.
                        </p>
                    )}

                    {/* ⭐⭐⭐ GRID DE PRODUCTOS — MOBILE COMPACTO ⭐⭐⭐ */}
                    {!isLoadingProducts &&
                        !errorProducts &&
                        filteredProducts.length > 0 && (
                            <div
                                className="
            grid gap-4
            grid-cols-1
            sm:grid-cols-2
            md:grid-cols-2
            lg:grid-cols-3
            xl:grid-cols-4
            mx-auto
          "
                            >
                                {sortedProducts.map((product) => {
                                    const badges: any = {
                                        "Más vendido": "🔥",
                                        "Amor & amistad": "💘",
                                        "Ideal para cumpleaños": "🎂",
                                    };

                                    const badgeIcon = badges[product.tag ?? ""] || "✨";

                                    const soldCount = (product as any).soldCount ?? 0;
                                    const hasSales = soldCount > 0;
                                    const soldLabel =
                                        soldCount === 1 ? "1 vez pedido" : `${soldCount} veces pedido`;

                                    return (
                                        <article
                                            key={product.id}
                                            className="
                group flex flex-col gap-2 
                rounded-xl border border-pink-100 p-3 
                shadow-sm bg-white
                hover:shadow-md hover:border-pink-300 
                transition-all duration-200
              "
                                        >
                                            {/* Imagen compacta */}
                                            <div className="relative w-full h-32 rounded-lg overflow-hidden bg-white">
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                />

                                                {hasSales && (
                                                    <div className="
                      absolute top-1.5 left-1.5 
                      inline-flex items-center gap-1 rounded-full
                      bg-black/60 backdrop-blur-sm 
                      px-2 py-[2px] text-[9px] text-amber-200
                      shadow-sm border border-amber-400/30
                    ">
                                                        <span>✅</span>
                                                        <span className="font-semibold">{soldLabel}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Info compacta */}
                                            <div className="flex-1 flex flex-col justify-between">
                                                <div>
                                                    {product.tag && (
                                                        <span
                                                            className="
                        inline-flex items-center gap-1 
                        bg-pink-100/90 text-pink-700 
                        text-[10px] font-semibold 
                        px-2 py-[1px] rounded-full mb-1
                      "
                                                        >
                                                            {badgeIcon} {product.tag}
                                                        </span>
                                                    )}

                                                    <h3 className="text-xs font-bold text-slate-900 line-clamp-2">
                                                        {product.name}
                                                    </h3>

                                                    <p className="text-[10px] text-slate-500 mt-1 leading-snug line-clamp-2">
                                                        {product.shortDescription}
                                                    </p>
                                                </div>

                                                <div className="flex items-end justify-between mt-2">
                                                    <div>
                                                        <p className="text-[10px] text-slate-400">Desde</p>
                                                        <p className="text-sm font-extrabold text-pink-600">
                                                            {formatPrice(product.price)}
                                                        </p>
                                                    </div>

                                                    <div className="text-right space-y-1">
                                                        <Link
                                                            href={`/producto/${product.slug}`}
                                                            className="text-[10px] font-semibold text-pink-600 hover:text-pink-700"
                                                        >
                                                            Ver detalle
                                                        </Link>

                                                        <button
                                                            onClick={() =>
                                                                handleWhatsAppClick(undefined, product.name)
                                                            }
                                                            className="
                        inline-flex items-center justify-end gap-1 
                        text-[10px] font-semibold text-green-600 hover:text-green-700
                      "
                                                        >
                                                            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-green-500/10">
                                                                <img
                                                                    src="/images/whatsapp-icon.png"
                                                                    className="w-2.5 h-2.5"
                                                                />
                                                            </span>
                                                            <span>Pedir</span>
                                                        </button>

                                                        <button
                                                            onClick={() =>
                                                                addItem({
                                                                    id: product.id,
                                                                    slug: product.slug,
                                                                    name: product.name,
                                                                    price: product.price,
                                                                    image: product.image,
                                                                })
                                                            }
                                                            className="
                        inline-flex items-center justify-end gap-1 
                        text-[10px] font-semibold text-pink-600 hover:text-pink-700
                      "
                                                        >
                                                            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-pink-100">
                                                                🧺
                                                            </span>
                                                            <span>Carrito</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        )}

                    {/* Cargar más */}
                    {!isLoadingProducts && products.length < total && (
                        <div className="flex justify-center mt-6">
                            <button
                                onClick={handleLoadMore}
                                className="px-5 py-2 rounded-full bg-white border border-pink-200 text-pink-600 text-sm font-semibold hover:bg-pink-50"
                            >
                                Cargar más detalles
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* CATEGORÍAS */}
            <section id="categorias" className="space-y-6">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl md:text-2xl font-extrabold text-slate-900">
                            Categorías de detalles
                        </h2>
                        <p className="text-sm text-slate-500">
                            Elige la ocasión y nosotros te ayudamos a sorprender.
                        </p>
                    </div>
                </div>

                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {CATEGORIES.map((cat) => (
                        <div
                            key={cat.id}
                            className="bg-white/90 border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
                        >
                            <h3 className="font-semibold text-pink-600 mb-1 text-sm">
                                {cat.name}
                            </h3>
                            <p className="text-xs text-slate-500">{cat.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* DESTACADOS */}
            <section id="destacados" className="space-y-4">
                <h2 className="text-xl md:text-2xl font-extrabold text-slate-900">
                    Detalles destacados
                </h2>
                <p className="text-sm text-slate-500">
                    Muy pronto aquí estará el catálogo completo administrado desde tu
                    dashboard.
                </p>
            </section>

            {/* SUCURSALES */}
            <section id="sucursales" className="space-y-4">
                <h2 className="text-xl md:text-2xl font-extrabold text-slate-900">
                    Sucursales en Cartagena
                </h2>

                <div className="grid md:grid-cols-2 gap-4">
                    <article className="bg-white/90 border border-slate-100 rounded-2xl p-4 shadow-sm">
                        <h3 className="font-semibold text-slate-900">
                            Centro Comercial Outlet del Bosque
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">Frente a la Olímpica.</p>
                        <p className="text-sm text-slate-700 mt-2">
                            📲 Pedidos al:{" "}
                            <span className="font-semibold">+57 350 473 7628</span>
                        </p>
                        <button
                            onClick={() => handleWhatsAppClick("outlet")}
                            className="mt-3 text-xs font-semibold text-pink-600 hover:text-pink-700 underline"
                        >
                            Escribir a esta sucursal 💬
                        </button>
                    </article>

                    <article className="bg-white/90 border border-slate-100 rounded-2xl p-4 shadow-sm">
                        <h3 className="font-semibold text-slate-900">
                            Centro Comercial Supercentro Los Ejecutivos
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                            Al lado del Banco BBVA.
                        </p>
                        <p className="text-sm text-slate-700 mt-2">
                            📲 Pedidos al:{" "}
                            <span className="font-semibold">+57 320 230 4977</span>
                        </p>
                        <button
                            onClick={() => handleWhatsAppClick("supercentro")}
                            className="mt-3 text-xs font-semibold text-pink-600 hover:text-pink-700 underline"
                        >
                            Escribir a esta sucursal 💬
                        </button>
                    </article>
                </div>
            </section>

            {/* CTA FINAL */}
            <section
                id="contacto"
                className="mt-6 bg-pink-50 border border-pink-100 rounded-2xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
                <div>
                    <h2 className="text-lg md:text-xl font-extrabold text-pink-700">
                        ¡Regala emociones, endulza momentos! 💝🍭
                    </h2>
                    <p className="text-xs md:text-sm text-pink-800 mt-1 max-w-xl">
                        Cuéntanos la ocasión y nosotros nos encargamos de armar el detalle
                        perfecto.
                    </p>
                </div>

                <button
                    onClick={() => handleWhatsAppClick()}
                    className="self-start md:self-auto inline-flex items-center gap-2 rounded-full bg-pink-500 hover:bg-pink-600 text-white font-semibold px-6 py-2.5 shadow-md"
                >
                    💬 Hablar con un asesor
                </button>
            </section>

            {/* CARRITO FLOTANTE */}
            <Link
                href="/carrito"
                className={`fixed bottom-6 right-6 md:bottom-10 md:right-10 
           z-[999] w-16 h-16 rounded-full 
           bg-gradient-to-br from-pink-500 to-pink-600 
           shadow-xl shadow-pink-300/40 
           flex items-center justify-center text-3xl 
           transition-all duration-300 hover:scale-110 active:scale-95
           ${animateCart ? "cart-bounce cart-glow" : ""}`}
                aria-label="Abrir carrito"
            >
                🧺
                {totalItems > 0 && (
                    <span
                        className="absolute -top-1 -right-1 min-w-[22px] h-[22px] px-1
                 rounded-full bg-white text-pink-600 text-[11px] 
                 font-bold flex items-center justify-center shadow-md"
                    >
                        {totalItems}
                    </span>
                )}
            </Link>
        </div>
    );


}
