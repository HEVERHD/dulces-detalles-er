// app/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Product } from "../lib/products";
import { useCart } from "@/components/CartContext";
import { useFavorites } from "@/components/FavoritesContext";
import { useGlobalLoader } from "@/components/providers/LoaderProvider";

import Footer from "@/components/Footer";
import HeroCarousel from "@/components/HeroCarousel";
import TimeGreeting from "@/components/TimeGreeting";
import Confetti, { useConfetti } from "@/components/Confetti";

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
    // Orden y filtros avanzados
    const [sortBy, setSortBy] = useState<"relevance" | "top" | "priceAsc" | "priceDesc">("relevance");
    const [onlyAvailable, setOnlyAvailable] = useState(false);
    const [priceFilter, setPriceFilter] = useState<"all" | "low" | "mid" | "high">("all");

    // Paginación
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const LIMIT = 6;

    // 🧺 Carrito
    const { addItem, totalItems } = useCart();
    const [animateCart, setAnimateCart] = useState(false);

    // 💝 Favoritos
    const { addFavorite, removeFavorite, isFavorite } = useFavorites();

    // 🎉 Confetti para celebraciones
    const confetti = useConfetti();

    // 💗 Animacion del corazon
    const [heartAnimating, setHeartAnimating] = useState<string | null>(null);

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
    // ✔ Filtro buscador + stock + rango de precios
    const filteredProducts = products.filter((product) => {
        const q = searchQuery.trim().toLowerCase();
        const price = product.price ?? 0;

        // 1. Buscar por texto
        if (q) {
            const matchesText =
                product.name.toLowerCase().includes(q) ||
                (product.tag ?? "").toLowerCase().includes(q) ||
                (product.shortDescription ?? "").toLowerCase().includes(q);

            if (!matchesText) return false;
        }

        // 2. Solo disponibles (si trackea stock)
        if (onlyAvailable) {
            const isTrackingStock = product.trackStock;
            const stock = product.stock ?? 0;
            if (isTrackingStock && stock <= 0) return false;
        }

        // 3. Filtro por rango de precio
        if (priceFilter === "low" && price > 80000) return false;          // hasta 80k
        if (priceFilter === "mid" && (price < 80000 || price > 150000)) return false; // 80k - 150k
        if (priceFilter === "high" && price < 150000) return false;        // +150k

        return true;
    });


    // Productos ordenados: primero los que tienen ventas
    // Productos ordenados según sort seleccionado
    const sortedProducts = [...filteredProducts].sort((a, b) => {
        const aSales = (a as any).soldCount ?? 0;
        const bSales = (b as any).soldCount ?? 0;
        const aPrice = a.price ?? 0;
        const bPrice = b.price ?? 0;

        switch (sortBy) {
            case "top":
                // Más vendidos primero
                if (bSales !== aSales) return bSales - aSales;
                return aPrice - bPrice;
            case "priceAsc":
                return aPrice - bPrice;
            case "priceDesc":
                return bPrice - aPrice;
            case "relevance":
            default:
                // Igual a como lo tenías: priorizar vendidos pero sin romper orden natural
                if (bSales !== aSales) return bSales - aSales;
                return 0;
        }
    });



    // ✔ Acción WhatsApp
    const handleWhatsAppClick = (branch?: Branch, productName?: string) => {
        if (typeof window === "undefined") return;

        const effectiveBranch: Branch = branch ?? defaultBranch;
        const phone = effectiveBranch === "supercentro" ? WHATSAPP_SUPERCENTRO : WHATSAPP_OUTLET_BOSQUE;

        window.open(buildWhatsAppUrl(phone, productName), "_blank");
    };

    // ✔ Preguntar disponibilidad por WhatsApp cuando está agotado
    const handleWhatsAppAvailabilityClick = (productName: string, branch?: Branch) => {
        if (typeof window === "undefined") return;

        const effectiveBranch: Branch = branch ?? defaultBranch;
        const phone =
            effectiveBranch === "supercentro"
                ? WHATSAPP_SUPERCENTRO
                : WHATSAPP_OUTLET_BOSQUE;

        const text = `Hola, vengo desde la web de *Dulces Detalles ER* 💖 Quisiera saber cuándo volverá a estar disponible el detalle *${productName}* 🕒`;
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;

        window.open(url, "_blank");
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
        <>
            <div className="space-y-8 md:space-y-16 pb-20">
                {/* BANNER FULL WIDTH */}
                <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen">
                    {/* Carousel de banners */}
                    <HeroCarousel />
                </div>

                {/* SWITCH DE SUCURSAL - Separado del banner en mobile */}
                <div className="max-w-xl mx-auto px-4">
                    <div className="glass-card rounded-2xl p-3 shadow-premium animate-fade-in backdrop-blur-md bg-white/95">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <span className="w-7 h-7 rounded-full bg-pink-100 flex items-center justify-center text-sm flex-shrink-0">
                                    <span>&#128205;</span>
                                </span>
                                <span className="font-medium">Quiero escribir a:</span>
                            </div>
                            <div className="flex items-center">
                                <div className="inline-flex rounded-xl bg-slate-100 p-1 w-full sm:w-auto">
                                    <button
                                        type="button"
                                        onClick={() => setDefaultBranch("outlet")}
                                        className={`flex-1 sm:flex-none px-3 py-2 rounded-lg text-xs font-semibold transition-all ${defaultBranch === "outlet"
                                            ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md"
                                            : "text-slate-600 hover:text-slate-800 hover:bg-white"
                                            }`}
                                    >
                                        Outlet del Bosque
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setDefaultBranch("supercentro")}
                                        className={`flex-1 sm:flex-none px-3 py-2 rounded-lg text-xs font-semibold transition-all ${defaultBranch === "supercentro"
                                            ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md"
                                            : "text-slate-600 hover:text-slate-800 hover:bg-white"
                                            }`}
                                    >
                                        Supercentro Ejecutivos
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SALUDO DINAMICO POR HORA */}
                <div className="max-w-6xl mx-auto px-4 md:px-0">
                    <TimeGreeting />
                </div>

                {/* LISTADO + BUSCADOR PREMIUM */}
                <section id="productos" className="relative max-w-6xl mx-auto">
                        {/* Header de seccion */}
                        <div className="text-center mb-8">
                            <span className="inline-flex items-center gap-2 bg-pink-100 text-pink-600 text-xs font-semibold px-4 py-1.5 rounded-full mb-4">
                                <span>&#128142;</span>
                                <span>Catalogo</span>
                            </span>
                            <h2 className="font-display text-2xl md:text-3xl font-bold text-slate-900 mb-3">
                                Nuestros detalles especiales
                            </h2>
                            <p className="text-slate-500 max-w-xl mx-auto">
                                Encuentra el regalo perfecto para sorprender a esa persona especial.
                            </p>
                        </div>

                        {/* Buscador premium */}
                        <div className="mb-8 glass-card rounded-2xl p-4 shadow-premium">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                <div className="flex-1 relative">
                                    <input
                                        id="search-products"
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Buscar por nombre, categoria, ocasion..."
                                        className="w-full rounded-xl border-2 border-pink-100 bg-white px-5 py-3 pl-12 text-sm
                                            focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300
                                            text-slate-700 placeholder:text-slate-400 transition-all"
                                    />
                                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>

                                    {searchQuery && (
                                        <button
                                            type="button"
                                            onClick={() => setSearchQuery("")}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 hover:text-pink-500 transition-colors"
                                        >
                                            Limpiar
                                        </button>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 text-sm">
                                    <span className="text-slate-500">Mostrando</span>
                                    <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-xs">
                                        {filteredProducts.length}
                                    </span>
                                    <span className="text-slate-500">de {total}</span>
                                </div>
                            </div>
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

                        {/* GRID DE PRODUCTOS PREMIUM */}
                        {!isLoadingProducts &&
                            !errorProducts &&
                            filteredProducts.length > 0 && (
                                <div
                                    className="
                                        grid gap-5
                                        grid-cols-1
                                        sm:grid-cols-2
                                        lg:grid-cols-3
                                        xl:grid-cols-4
                                        mx-auto
                                    "
                                >
                                    {sortedProducts.map((product, index) => {
                                        const badges: any = {
                                            "Más vendido": "&#128293;",
                                            "Amor & amistad": "&#128152;",
                                            "Ideal para cumpleaños": "&#127874;",
                                        };

                                        const badgeIcon = badges[product.tag ?? ""] || "&#10024;";

                                        const soldCount = (product as any).soldCount ?? 0;
                                        const hasSales = soldCount > 0;
                                        const soldLabel =
                                            soldCount === 1 ? "1 vez pedido" : `${soldCount} veces pedido`;

                                        const isTrackingStock = product.trackStock;
                                        const isOutOfStock = isTrackingStock && product.stock === 0;
                                        const isLowStock =
                                            isTrackingStock && !isOutOfStock && product.stock !== undefined && product.stock <= 2;

                                        const lowStockLabel =
                                            product.stock === 1 ? "Ultima unidad" : "Solo 2 unidades";

                                        return (
                                            <article
                                                key={product.id}
                                                className={`
                                                    group relative flex flex-col
                                                    rounded-2xl bg-white
                                                    shadow-premium hover-lift
                                                    overflow-hidden
                                                    animate-fade-in-up
                                                    ${isOutOfStock ? "opacity-75" : ""}
                                                `}
                                                style={{ animationDelay: `${index * 0.05}s` }}
                                            >
                                                {/* Imagen con overlay */}
                                                <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-pink-50 to-rose-50">
                                                    <img
                                                        src={product.image}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                    />

                                                    {/* Overlay gradiente en hover */}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                                    {/* Boton de favorito premium con animacion */}
                                                    <button
                                                        onClick={(e) => {
                                                            if (isFavorite(product.id)) {
                                                                removeFavorite(product.id);
                                                            } else {
                                                                addFavorite({
                                                                    id: product.id,
                                                                    slug: product.slug,
                                                                    name: product.name,
                                                                    price: product.price,
                                                                    image: product.image,
                                                                    shortDescription: product.shortDescription,
                                                                });
                                                                // Disparar confetti al agregar favorito
                                                                confetti.trigger(e);
                                                            }
                                                            // Animar el corazon
                                                            setHeartAnimating(product.id);
                                                            setTimeout(() => setHeartAnimating(null), 800);
                                                        }}
                                                        className={`
                                                            absolute top-3 right-3 z-10
                                                            w-9 h-9 rounded-full
                                                            shadow-lg
                                                            flex items-center justify-center
                                                            transition-all duration-300
                                                            hover:scale-110
                                                            ${isFavorite(product.id)
                                                                ? 'bg-pink-500 text-white'
                                                                : 'bg-white/95 text-pink-400 hover:text-pink-600 hover:bg-white'}
                                                            ${heartAnimating === product.id ? 'animate-heart-explode' : ''}
                                                        `}
                                                        title={isFavorite(product.id) ? "Quitar de favoritos" : "Agregar a favoritos"}
                                                    >
                                                        <svg
                                                            className={`w-5 h-5 ${heartAnimating === product.id ? 'animate-heart-beat' : ''}`}
                                                            fill={isFavorite(product.id) ? "currentColor" : "none"}
                                                            stroke="currentColor"
                                                            strokeWidth={2}
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                        </svg>
                                                    </button>

                                                    {/* Badge de ventas */}
                                                    {hasSales && (
                                                        <div className="absolute top-3 left-3 glass-card-dark rounded-full px-3 py-1.5 flex items-center gap-1.5">
                                                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                                                            <span className="text-[10px] font-semibold text-white">{soldLabel}</span>
                                                        </div>
                                                    )}

                                                    {/* Badge de stock bajo */}
                                                    {isLowStock && !hasSales && (
                                                        <div className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-lg">
                                                            <span className="text-[10px] font-bold text-white">{lowStockLabel}</span>
                                                        </div>
                                                    )}

                                                    {/* Overlay de agotado */}
                                                    {isOutOfStock && (
                                                        <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                                                            <span className="bg-white/95 text-slate-700 text-xs font-bold px-4 py-2 rounded-full">
                                                                Agotado temporalmente
                                                            </span>
                                                        </div>
                                                    )}

                                                    {/* Quick actions en hover */}
                                                    {!isOutOfStock && (
                                                        <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                                                            <button
                                                                onClick={() => handleWhatsAppClick(undefined, product.name)}
                                                                className="flex-1 btn-premium btn-ripple bg-green-500 hover:bg-green-600 text-white text-xs font-semibold py-2.5 rounded-xl shadow-lg flex items-center justify-center gap-1.5"
                                                            >
                                                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                                                </svg>
                                                                <span>Pedir</span>
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    addItem({
                                                                        id: product.id,
                                                                        slug: product.slug,
                                                                        name: product.name,
                                                                        price: product.price,
                                                                        image: product.image,
                                                                    });
                                                                    // Confetti al agregar al carrito
                                                                    confetti.trigger(e);
                                                                }}
                                                                className="w-11 h-11 btn-premium btn-ripple btn-ripple-pink bg-pink-500 hover:bg-pink-600 text-white rounded-xl shadow-lg flex items-center justify-center"
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Info del producto */}
                                                <div className="p-4 flex-1 flex flex-col">
                                                    {/* Tag */}
                                                    {product.tag && (
                                                        <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-pink-50 to-rose-50 text-pink-600 text-[11px] font-semibold px-2.5 py-1 rounded-full mb-2 w-fit border border-pink-100">
                                                            <span dangerouslySetInnerHTML={{ __html: badgeIcon }}></span>
                                                            <span>{product.tag}</span>
                                                        </span>
                                                    )}

                                                    {/* Nombre */}
                                                    <h3 className="font-display text-sm font-bold text-slate-800 line-clamp-2 mb-1 group-hover:text-pink-600 transition-colors">
                                                        {product.name}
                                                    </h3>

                                                    {/* Descripcion */}
                                                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-3">
                                                        {product.shortDescription}
                                                    </p>

                                                    {/* Footer de la card */}
                                                    <div className="mt-auto flex items-end justify-between">
                                                        <div>
                                                            <p className="text-[10px] text-slate-400 uppercase tracking-wide">Desde</p>
                                                            <p className="text-lg font-bold text-gradient">
                                                                {formatPrice(product.price)}
                                                            </p>
                                                            {isTrackingStock && !isOutOfStock && (
                                                                <p className="text-[10px] text-emerald-600 font-medium mt-0.5">
                                                                    {product.stock} disponibles
                                                                </p>
                                                            )}
                                                        </div>

                                                        <Link
                                                            href={`/producto/${product.slug}`}
                                                            className="inline-flex items-center gap-1 text-xs font-semibold text-pink-600 hover:text-pink-700 transition-colors group/link"
                                                        >
                                                            <span>Ver detalle</span>
                                                            <svg className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                            </svg>
                                                        </Link>
                                                    </div>

                                                    {/* Boton de disponibilidad para agotados */}
                                                    {isOutOfStock && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleWhatsAppAvailabilityClick(product.name)}
                                                            className="mt-3 w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold py-2.5 rounded-xl transition-colors"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                            </svg>
                                                            <span>Preguntar disponibilidad</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </article>
                                        );
                                    })}

                                </div>
                            )}

                        {/* Cargar mas premium */}
                        {!isLoadingProducts && products.length < total && (
                            <div className="flex justify-center mt-10">
                                <button
                                    onClick={handleLoadMore}
                                    className="btn-premium inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white border-2 border-pink-200 text-pink-600 text-sm font-bold hover:bg-pink-50 hover:border-pink-300 shadow-lg hover:shadow-xl transition-all"
                                >
                                    <span>Ver mas detalles</span>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                            </div>
                        )}
                </section>

                {/* CATEGORIAS PREMIUM */}
                <section id="categorias" className="space-y-8 max-w-6xl mx-auto">
                    <div className="text-center max-w-2xl mx-auto">
                        <span className="inline-flex items-center gap-2 bg-pink-100 text-pink-600 text-xs font-semibold px-4 py-1.5 rounded-full mb-4">
                            <span>&#127873;</span>
                            <span>Para cada ocasion</span>
                        </span>
                        <h2 className="font-display text-2xl md:text-3xl font-bold text-slate-900 mb-3">
                            Categorias de detalles
                        </h2>
                        <p className="text-slate-500">
                            Elige la ocasion y nosotros te ayudamos a sorprender con el regalo perfecto.
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                        {CATEGORIES.map((cat, index) => {
                            const categoryIcons: Record<string, string> = {
                                cumple: "&#127874;",
                                aniversario: "&#128152;",
                                declaracion: "&#128141;",
                                infantil: "&#127880;",
                                dietetico: "&#127793;",
                            };
                            const categoryColors: Record<string, string> = {
                                cumple: "from-pink-500 to-rose-500",
                                aniversario: "from-red-500 to-pink-500",
                                declaracion: "from-purple-500 to-pink-500",
                                infantil: "from-amber-500 to-orange-500",
                                dietetico: "from-emerald-500 to-teal-500",
                            };
                            return (
                                <div
                                    key={cat.id}
                                    className="group relative bg-white rounded-2xl p-5 shadow-premium hover-lift cursor-pointer overflow-hidden animate-fade-in-up"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    {/* Fondo gradiente en hover */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${categoryColors[cat.id] || 'from-pink-500 to-rose-500'} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>

                                    <div className="relative z-10">
                                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${categoryColors[cat.id] || 'from-pink-500 to-rose-500'} flex items-center justify-center text-2xl mb-3 shadow-lg group-hover:bg-white/20 group-hover:shadow-none transition-all`}>
                                            <span className="text-white group-hover:scale-110 transition-transform" dangerouslySetInnerHTML={{ __html: categoryIcons[cat.id] || "&#10024;" }}></span>
                                        </div>
                                        <h3 className="font-display font-bold text-slate-800 group-hover:text-white mb-1 transition-colors">
                                            {cat.name.replace(/[^\w\sáéíóúñÁÉÍÓÚÑ]/g, '')}
                                        </h3>
                                        <p className="text-xs text-slate-500 group-hover:text-white/80 transition-colors leading-relaxed">
                                            {cat.description}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* SECCION DE VALOR / CONFIANZA */}
                <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 md:p-12 max-w-6xl mx-auto">
                    {/* Decoracion */}
                    <div className="absolute inset-0 dots-pattern opacity-10"></div>
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl"></div>

                    <div className="relative z-10">
                        <div className="text-center mb-10">
                            <span className="inline-flex items-center gap-2 bg-white/10 text-pink-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-4 border border-white/10">
                                <span>&#10024;</span>
                                <span>Por que elegirnos</span>
                            </span>
                            <h2 className="font-display text-2xl md:text-3xl font-bold text-white">
                                La experiencia Dulces Detalles
                            </h2>
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { icon: "&#127873;", title: "Personalizados", desc: "Cada detalle es unico y hecho a tu medida" },
                                { icon: "&#128666;", title: "Entrega rapida", desc: "Llevamos tu regalo el mismo dia" },
                                { icon: "&#128156;", title: "Hecho con amor", desc: "Cuidamos cada detalle con dedicacion" },
                                { icon: "&#11088;", title: "+500 entregas", desc: "Clientes satisfechos en Cartagena" },
                            ].map((item, i) => (
                                <div key={i} className="text-center group">
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-3xl shadow-lg shadow-pink-500/30 group-hover:scale-110 transition-transform">
                                        <span dangerouslySetInnerHTML={{ __html: item.icon }}></span>
                                    </div>
                                    <h3 className="font-display font-bold text-white mb-1">{item.title}</h3>
                                    <p className="text-sm text-slate-400">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* SUCURSALES PREMIUM */}
                <section id="sucursales" className="space-y-8 max-w-6xl mx-auto">
                    <div className="text-center max-w-2xl mx-auto">
                        <span className="inline-flex items-center gap-2 bg-pink-100 text-pink-600 text-xs font-semibold px-4 py-1.5 rounded-full mb-4">
                            <span>&#128205;</span>
                            <span>Visitanos</span>
                        </span>
                        <h2 className="font-display text-2xl md:text-3xl font-bold text-slate-900 mb-3">
                            Nuestras sucursales en Cartagena
                        </h2>
                        <p className="text-slate-500">
                            Dos ubicaciones estrategicas para estar mas cerca de ti.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Sucursal 1 */}
                        <article className="group relative bg-white rounded-3xl overflow-hidden shadow-premium hover-lift">
                            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-pink-500 to-rose-500"></div>
                            <div className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-2xl shadow-lg flex-shrink-0">
                                        <span>&#127978;</span>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-display font-bold text-slate-900 text-lg mb-1">
                                            Outlet del Bosque
                                        </h3>
                                        <p className="text-sm text-slate-500 mb-3">
                                            Centro Comercial Outlet del Bosque, frente a la Olimpica
                                        </p>
                                        <div className="flex items-center gap-2 text-sm text-slate-700 mb-4">
                                            <span>&#128222;</span>
                                            <span className="font-semibold">+57 350 473 7638</span>
                                        </div>
                                        <button
                                            onClick={() => handleWhatsAppClick("outlet")}
                                            className="btn-premium inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-lg transition-all"
                                        >
                                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                            </svg>
                                            <span>Escribir por WhatsApp</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </article>

                        {/* Sucursal 2 */}
                        <article className="group relative bg-white rounded-3xl overflow-hidden shadow-premium hover-lift">
                            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 to-orange-500"></div>
                            <div className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-2xl shadow-lg flex-shrink-0">
                                        <span>&#127978;</span>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-display font-bold text-slate-900 text-lg mb-1">
                                            Supercentro Los Ejecutivos
                                        </h3>
                                        <p className="text-sm text-slate-500 mb-3">
                                            Centro Comercial Supercentro, al lado del Banco BBVA
                                        </p>
                                        <div className="flex items-center gap-2 text-sm text-slate-700 mb-4">
                                            <span>&#128222;</span>
                                            <span className="font-semibold">+57 320 230 4977</span>
                                        </div>
                                        <button
                                            onClick={() => handleWhatsAppClick("supercentro")}
                                            className="btn-premium inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-lg transition-all"
                                        >
                                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                            </svg>
                                            <span>Escribir por WhatsApp</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </article>
                    </div>
                </section>

                {/* CTA FINAL PREMIUM */}
                <section
                    id="contacto"
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-pink-500 via-rose-500 to-fuchsia-500 animate-gradient p-8 md:p-12 max-w-6xl mx-auto"
                >
                    {/* Decoracion */}
                    <div className="absolute inset-0 dots-pattern opacity-20"></div>
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-2xl"></div>
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-amber-400/30 rounded-full blur-2xl"></div>

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div className="text-white">
                            <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">
                                Regala emociones, endulza momentos
                            </h2>
                            <p className="text-pink-100 max-w-xl">
                                Cuentanos la ocasion y nosotros nos encargamos de armar el detalle perfecto. Personalizamos cada regalo con amor.
                            </p>
                        </div>

                        <button
                            onClick={() => handleWhatsAppClick()}
                            className="btn-premium self-start md:self-auto inline-flex items-center gap-3 rounded-2xl bg-white text-pink-600 font-bold px-8 py-4 shadow-xl hover:shadow-2xl hover:bg-pink-50 transition-all text-base"
                        >
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                            </svg>
                            <span>Hablar con un asesor</span>
                        </button>
                    </div>
                </section>

                {/* CARRITO FLOTANTE PREMIUM */}
                <Link
                    href="/carrito"
                    className={`fixed bottom-6 right-6 md:bottom-10 md:right-10
                        z-[999] w-16 h-16 rounded-2xl
                        bg-gradient-to-br from-pink-500 via-rose-500 to-fuchsia-500
                        shadow-xl shadow-pink-400/40
                        flex items-center justify-center
                        transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-pink-500/50 active:scale-95
                        ${animateCart ? "cart-bounce cart-glow" : ""}`}
                    aria-label="Abrir carrito"
                >
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {totalItems > 0 && (
                        <span
                            className="absolute -top-2 -right-2 min-w-[24px] h-[24px] px-1.5
                                rounded-full bg-white text-pink-600 text-xs
                                font-bold flex items-center justify-center shadow-lg border-2 border-pink-100"
                        >
                            {totalItems}
                        </span>
                    )}
                </Link>

                {/* Confetti para celebraciones */}
                <Confetti
                    active={confetti.isActive}
                    origin={confetti.origin}
                    onComplete={confetti.reset}
                    particleCount={25}
                    duration={1800}
                />
            </div>
            <Footer />
        </>
    );


}
