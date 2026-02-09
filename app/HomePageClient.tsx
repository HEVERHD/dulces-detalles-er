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
import CountdownBanner from "@/components/CountdownBanner";
import TimeGreeting from "@/components/TimeGreeting";
import Confetti, { useConfetti } from "@/components/Confetti";
import DirectionsButton from "@/components/maps/DirectionsButton";

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
    const [categoryFilter, setCategoryFilter] = useState<string>("all");
    const [categories, setCategories] = useState<{ id: string; slug: string; name: string }[]>([]);

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

    // Comparador
    const [compareList, setCompareList] = useState<Product[]>([]);
    const [showCompareModal, setShowCompareModal] = useState(false);
    const MAX_COMPARE = 3;

    const toggleCompare = (product: Product) => {
        setCompareList(prev => {
            const exists = prev.find(p => p.id === product.id);
            if (exists) return prev.filter(p => p.id !== product.id);
            if (prev.length >= MAX_COMPARE) return prev;
            return [...prev, product];
        });
    };

    const isInCompare = (id: string) => compareList.some(p => p.id === id);

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

    // Contar filtros activos
    const activeFilterCount = [
        categoryFilter !== "all",
        priceFilter !== "all",
        onlyAvailable,
        sortBy !== "relevance",
    ].filter(Boolean).length;

    const clearAllFilters = () => {
        setCategoryFilter("all");
        setPriceFilter("all");
        setOnlyAvailable(false);
        setSortBy("relevance");
        setSearchQuery("");
    };

    // Filtrado combinado
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

        // 2. Filtro por categoría
        if (categoryFilter !== "all") {
            const productCatSlug = (product as any).category?.slug;
            if (productCatSlug !== categoryFilter) return false;
        }

        // 3. Solo disponibles
        if (onlyAvailable) {
            const isTrackingStock = product.trackStock;
            const stock = product.stock ?? 0;
            if (isTrackingStock && stock <= 0) return false;
        }

        // 4. Filtro por rango de precio
        if (priceFilter === "low" && price > 80000) return false;
        if (priceFilter === "mid" && (price < 80000 || price > 150000)) return false;
        if (priceFilter === "high" && price < 150000) return false;

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


    // ✔ Leer sucursal del storage + escuchar cambios del header
    useEffect(() => {
        if (typeof window === "undefined") return;
        const stored = window.localStorage.getItem(BRANCH_STORAGE_KEY);
        if (stored === "outlet" || stored === "supercentro") {
            setDefaultBranch(stored);
        }

        const handleBranchChange = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            if (detail === "outlet" || detail === "supercentro") {
                setDefaultBranch(detail);
            }
        };
        window.addEventListener("branch-change", handleBranchChange);
        return () => window.removeEventListener("branch-change", handleBranchChange);
    }, []);

    // ✔ Guardar sucursal
    useEffect(() => {
        if (typeof window === "undefined") return;
        window.localStorage.setItem(BRANCH_STORAGE_KEY, defaultBranch);
    }, [defaultBranch]);

    // ✔ Cargar PRIMERA página + categorías
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

        const loadCategories = async () => {
            try {
                const res = await fetch("/api/admin/categories");
                if (res.ok) {
                    const data = await res.json();
                    setCategories(data);
                }
            } catch { /* silencioso */ }
        };

        loadInitialProducts();
        loadCategories();
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

                {/* SALUDO DINAMICO POR HORA */}
                <div className="max-w-6xl mx-auto px-4 md:px-0">
                    <TimeGreeting />
                </div>

                {/* COUNTDOWN - Cuenta regresiva */}
                <CountdownBanner />

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

                        {/* Buscador + filtros premium */}
                        <div className="mb-8 space-y-3">
                            {/* Barra de busqueda */}
                            <div className="glass-card rounded-2xl p-4 shadow-premium">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
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

                                    <div className="flex items-center gap-2 text-sm flex-shrink-0">
                                        <span className="text-slate-500">Mostrando</span>
                                        <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-xs">
                                            {filteredProducts.length}
                                        </span>
                                        <span className="text-slate-500">de {total}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Chips de filtros */}
                            <div className="flex flex-wrap items-center gap-2 px-1">
                                {/* Ordenar */}
                                {([
                                    { value: "relevance", label: "Relevancia" },
                                    { value: "top", label: "Mas pedidos" },
                                    { value: "priceAsc", label: "Menor precio" },
                                    { value: "priceDesc", label: "Mayor precio" },
                                ] as const).map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setSortBy(opt.value)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border
                                            ${sortBy === opt.value
                                                ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white border-transparent shadow-md"
                                                : "bg-white text-slate-600 border-slate-200 hover:border-pink-300 hover:text-pink-600"
                                            }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}

                                {/* Separador visual */}
                                <div className="w-px h-5 bg-slate-200 mx-1 hidden sm:block"></div>

                                {/* Rango de precio */}
                                {([
                                    { value: "all", label: "Todo precio" },
                                    { value: "low", label: "Hasta $80K" },
                                    { value: "mid", label: "$80K - $150K" },
                                    { value: "high", label: "+$150K" },
                                ] as const).map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setPriceFilter(prev => prev === opt.value ? "all" : opt.value)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border
                                            ${priceFilter === opt.value && opt.value !== "all"
                                                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white border-transparent shadow-md"
                                                : priceFilter === "all" && opt.value === "all"
                                                    ? "bg-white text-slate-400 border-slate-200"
                                                    : "bg-white text-slate-600 border-slate-200 hover:border-amber-300 hover:text-amber-600"
                                            }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}

                                {/* Separador */}
                                <div className="w-px h-5 bg-slate-200 mx-1 hidden sm:block"></div>

                                {/* Solo disponibles */}
                                <button
                                    onClick={() => setOnlyAvailable(prev => !prev)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border flex items-center gap-1.5
                                        ${onlyAvailable
                                            ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-transparent shadow-md"
                                            : "bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:text-emerald-600"
                                        }`}
                                >
                                    <span className={`w-2 h-2 rounded-full ${onlyAvailable ? "bg-white" : "bg-emerald-400"}`}></span>
                                    Disponibles
                                </button>

                                {/* Limpiar filtros */}
                                {activeFilterCount > 0 && (
                                    <button
                                        onClick={clearAllFilters}
                                        className="px-3 py-1.5 rounded-full text-xs font-semibold text-slate-500 hover:text-red-500 border border-dashed border-slate-300 hover:border-red-300 transition-all flex items-center gap-1"
                                    >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        Limpiar ({activeFilterCount})
                                    </button>
                                )}
                            </div>

                            {/* Chips de categorias - scroll horizontal */}
                            {categories.length > 0 && (
                                <div className="flex gap-2 overflow-x-auto pb-1 px-1 scrollbar-hide">
                                    <button
                                        onClick={() => setCategoryFilter("all")}
                                        className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border
                                            ${categoryFilter === "all"
                                                ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-transparent shadow-md"
                                                : "bg-white text-slate-600 border-slate-200 hover:border-purple-300 hover:text-purple-600"
                                            }`}
                                    >
                                        Todas
                                    </button>
                                    {categories.map((cat) => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setCategoryFilter(prev => prev === cat.slug ? "all" : cat.slug)}
                                            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border
                                                ${categoryFilter === cat.slug
                                                    ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-transparent shadow-md"
                                                    : "bg-white text-slate-600 border-slate-200 hover:border-purple-300 hover:text-purple-600"
                                                }`}
                                        >
                                            {cat.name}
                                        </button>
                                    ))}
                                </div>
                            )}
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

                                        const categoryName = (product as any).category?.name;

                                        return (
                                            <Link
                                                key={product.id}
                                                href={`/producto/${product.slug}`}
                                                className="block"
                                            >
                                                <article
                                                    className={`
                                                        group relative flex flex-col
                                                        rounded-2xl bg-white
                                                        shadow-premium hover-lift
                                                        overflow-hidden cursor-pointer
                                                        animate-fade-in-up
                                                        ${isOutOfStock ? "opacity-75" : ""}
                                                    `}
                                                    style={{ animationDelay: `${index * 0.05}s` }}
                                                >
                                                    {/* Imagen */}
                                                    <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-pink-50 to-rose-50">
                                                        <img
                                                            src={product.image}
                                                            alt={product.name}
                                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                        />

                                                        {/* Overlay gradiente */}
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>

                                                        {/* Favorito */}
                                                        <button
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
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
                                                                    confetti.trigger(e);
                                                                }
                                                                setHeartAnimating(product.id);
                                                                setTimeout(() => setHeartAnimating(null), 800);
                                                            }}
                                                            className={`
                                                                absolute top-3 right-3 z-10
                                                                w-9 h-9 rounded-full shadow-lg
                                                                flex items-center justify-center
                                                                transition-all duration-300 hover:scale-110
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

                                                        {/* Badge ventas */}
                                                        {hasSales && (
                                                            <div className="absolute top-3 left-3 glass-card-dark rounded-full px-3 py-1.5 flex items-center gap-1.5">
                                                                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                                                                <span className="text-[10px] font-semibold text-white">{soldLabel}</span>
                                                            </div>
                                                        )}

                                                        {/* Badge stock bajo */}
                                                        {isLowStock && !hasSales && (
                                                            <div className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-lg">
                                                                <span className="text-[10px] font-bold text-white">{lowStockLabel}</span>
                                                            </div>
                                                        )}

                                                        {/* Boton comparar */}
                                                        <button
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                toggleCompare(product);
                                                            }}
                                                            className={`
                                                                absolute bottom-14 right-3 z-10
                                                                w-8 h-8 rounded-full shadow-lg
                                                                flex items-center justify-center
                                                                transition-all duration-300 hover:scale-110
                                                                ${isInCompare(product.id)
                                                                    ? 'bg-indigo-500 text-white ring-2 ring-indigo-300'
                                                                    : 'bg-white/95 text-indigo-400 hover:text-indigo-600 hover:bg-white'}
                                                            `}
                                                            title={isInCompare(product.id) ? "Quitar de comparacion" : "Agregar a comparacion"}
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                                                            </svg>
                                                        </button>

                                                        {/* Overlay agotado */}
                                                        {isOutOfStock && (
                                                            <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                                                                <span className="bg-white/95 text-slate-700 text-xs font-bold px-4 py-2 rounded-full">
                                                                    Agotado temporalmente
                                                                </span>
                                                            </div>
                                                        )}

                                                        {/* Categoria + precio sobre la imagen */}
                                                        <div className="absolute bottom-0 left-0 right-0 p-3 flex items-end justify-between">
                                                            {categoryName && (
                                                                <span className="backdrop-blur-md bg-white/20 text-white text-[10px] font-semibold px-2.5 py-1 rounded-lg border border-white/20">
                                                                    {categoryName}
                                                                </span>
                                                            )}
                                                            <span className="backdrop-blur-md bg-white/20 text-white text-sm font-bold px-3 py-1 rounded-lg border border-white/20">
                                                                {formatPrice(product.price)}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Info del producto */}
                                                    <div className="p-4 flex-1 flex flex-col gap-2">
                                                        {/* Tag */}
                                                        {product.tag && (
                                                            <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-pink-50 to-rose-50 text-pink-600 text-[11px] font-semibold px-2.5 py-1 rounded-full w-fit border border-pink-100">
                                                                <span dangerouslySetInnerHTML={{ __html: badgeIcon }}></span>
                                                                <span>{product.tag}</span>
                                                            </span>
                                                        )}

                                                        {/* Nombre */}
                                                        <h3 className="font-display text-sm font-bold text-slate-800 line-clamp-2 group-hover:text-pink-600 transition-colors">
                                                            {product.name}
                                                        </h3>

                                                        {/* Descripcion */}
                                                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                                                            {product.shortDescription}
                                                        </p>

                                                        {/* Footer: stock + acciones */}
                                                        <div className="mt-auto pt-2 flex items-center justify-between border-t border-slate-100">
                                                            {/* Stock info */}
                                                            <div className="text-[10px]">
                                                                {isTrackingStock && !isOutOfStock && (
                                                                    <span className="text-emerald-600 font-medium">
                                                                        {product.stock} disponibles
                                                                    </span>
                                                                )}
                                                                {isOutOfStock && (
                                                                    <span className="text-slate-400 font-medium">
                                                                        Sin stock
                                                                    </span>
                                                                )}
                                                                {!isTrackingStock && (
                                                                    <span className="text-emerald-600 font-medium">
                                                                        Disponible
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {/* Botones de accion */}
                                                            {!isOutOfStock && (
                                                                <div className="flex items-center gap-1.5">
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            e.stopPropagation();
                                                                            handleWhatsAppClick(undefined, product.name);
                                                                        }}
                                                                        className="w-8 h-8 rounded-lg bg-green-500 hover:bg-green-600 text-white flex items-center justify-center transition-colors shadow-sm"
                                                                        title="Pedir por WhatsApp"
                                                                    >
                                                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                                                        </svg>
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            e.stopPropagation();
                                                                            addItem({
                                                                                id: product.id,
                                                                                slug: product.slug,
                                                                                name: product.name,
                                                                                price: product.price,
                                                                                image: product.image,
                                                                            });
                                                                            confetti.trigger(e);
                                                                        }}
                                                                        className="w-8 h-8 rounded-lg bg-pink-500 hover:bg-pink-600 text-white flex items-center justify-center transition-colors shadow-sm"
                                                                        title="Agregar al carrito"
                                                                    >
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                                                        </svg>
                                                                    </button>
                                                                </div>
                                                            )}

                                                            {/* Boton disponibilidad para agotados */}
                                                            {isOutOfStock && (
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        handleWhatsAppAvailabilityClick(product.name);
                                                                    }}
                                                                    className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 hover:text-pink-600 transition-colors"
                                                                >
                                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                                    </svg>
                                                                    <span>Consultar</span>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </article>
                                            </Link>
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
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                onClick={() => handleWhatsAppClick("outlet")}
                                                className="btn-premium inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-lg transition-all"
                                            >
                                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                                </svg>
                                                <span>WhatsApp</span>
                                            </button>
                                            <DirectionsButton branch="outlet" compact />
                                        </div>
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
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                onClick={() => handleWhatsAppClick("supercentro")}
                                                className="btn-premium inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-lg transition-all"
                                            >
                                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                                </svg>
                                                <span>WhatsApp</span>
                                            </button>
                                            <DirectionsButton branch="supercentro" compact />
                                        </div>
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

                {/* BARRA FLOTANTE DE COMPARACION */}
                {compareList.length > 0 && (
                    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[998] animate-fade-in-up">
                        <div className="glass-card rounded-2xl px-4 py-3 shadow-xl border border-indigo-200/50 flex items-center gap-3">
                            {/* Miniaturas */}
                            <div className="flex items-center gap-2">
                                {compareList.map((p) => (
                                    <div key={p.id} className="relative group/thumb">
                                        <img
                                            src={p.image}
                                            alt={p.name}
                                            className="w-10 h-10 rounded-lg object-cover ring-2 ring-indigo-300 shadow-sm"
                                        />
                                        <button
                                            onClick={() => toggleCompare(p)}
                                            className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity"
                                        >
                                            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                                {/* Slots vacios */}
                                {Array.from({ length: MAX_COMPARE - compareList.length }).map((_, i) => (
                                    <div key={`empty-${i}`} className="w-10 h-10 rounded-lg border-2 border-dashed border-indigo-200 flex items-center justify-center">
                                        <span className="text-indigo-300 text-xs">+</span>
                                    </div>
                                ))}
                            </div>

                            {/* Separador */}
                            <div className="w-px h-8 bg-indigo-200"></div>

                            {/* Boton comparar */}
                            <button
                                onClick={() => compareList.length >= 2 && setShowCompareModal(true)}
                                disabled={compareList.length < 2}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                    compareList.length >= 2
                                        ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg hover:shadow-xl hover:scale-105"
                                        : "bg-slate-100 text-slate-400 cursor-not-allowed"
                                }`}
                            >
                                Comparar ({compareList.length})
                            </button>

                            {/* Boton limpiar */}
                            <button
                                onClick={() => setCompareList([])}
                                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-500 flex items-center justify-center transition-colors"
                                title="Limpiar comparacion"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

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

            {/* MODAL DE COMPARACION */}
            {showCompareModal && compareList.length >= 2 && (
                <div className="fixed inset-0 z-[9999] flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-8 px-4 animate-fade-in">
                    <div className="relative w-full max-w-5xl glass-card rounded-3xl shadow-2xl p-6 md:p-8 animate-fade-in-up">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="font-display text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2">
                                    <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                                    </svg>
                                    Comparar productos
                                </h2>
                                <p className="text-sm text-slate-500 mt-1">Compara las caracteristicas lado a lado</p>
                            </div>
                            <button
                                onClick={() => setShowCompareModal(false)}
                                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-500 flex items-center justify-center transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Grid de comparacion */}
                        <div className="overflow-x-auto">
                            <div className={`grid gap-4 min-w-[600px] ${compareList.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
                                {compareList.map((product) => {
                                    const isTrackingStock = product.trackStock;
                                    const isOutOfStock = isTrackingStock && product.stock === 0;
                                    const categoryName = (product as any).category?.name;
                                    const soldCount = (product as any).soldCount ?? 0;

                                    return (
                                        <div key={product.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                                            {/* Imagen */}
                                            <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-pink-50 to-rose-50">
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover"
                                                />
                                                {isOutOfStock && (
                                                    <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                                                        <span className="bg-white/95 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-full">
                                                            Agotado
                                                        </span>
                                                    </div>
                                                )}
                                                {/* Quitar de comparacion */}
                                                <button
                                                    onClick={() => {
                                                        const newList = compareList.filter(p => p.id !== product.id);
                                                        setCompareList(newList);
                                                        if (newList.length < 2) setShowCompareModal(false);
                                                    }}
                                                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 hover:bg-red-50 text-slate-400 hover:text-red-500 flex items-center justify-center transition-colors shadow-sm"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>

                                            {/* Detalles */}
                                            <div className="p-4 space-y-3">
                                                {/* Nombre */}
                                                <h3 className="font-display font-bold text-slate-800 text-sm leading-tight line-clamp-2">
                                                    {product.name}
                                                </h3>

                                                {/* Atributos */}
                                                <div className="space-y-2">
                                                    {/* Precio */}
                                                    <div className="flex items-center justify-between py-2 border-b border-slate-50">
                                                        <span className="text-xs text-slate-400 font-medium">Precio</span>
                                                        <span className="text-sm font-bold text-pink-600">{formatPrice(product.price)}</span>
                                                    </div>

                                                    {/* Categoria */}
                                                    <div className="flex items-center justify-between py-2 border-b border-slate-50">
                                                        <span className="text-xs text-slate-400 font-medium">Categoria</span>
                                                        <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                                                            {categoryName || "Sin categoria"}
                                                        </span>
                                                    </div>

                                                    {/* Disponibilidad */}
                                                    <div className="flex items-center justify-between py-2 border-b border-slate-50">
                                                        <span className="text-xs text-slate-400 font-medium">Disponibilidad</span>
                                                        {isOutOfStock ? (
                                                            <span className="text-xs font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded-md">Agotado</span>
                                                        ) : isTrackingStock ? (
                                                            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">{product.stock} disponibles</span>
                                                        ) : (
                                                            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Disponible</span>
                                                        )}
                                                    </div>

                                                    {/* Ventas */}
                                                    <div className="flex items-center justify-between py-2 border-b border-slate-50">
                                                        <span className="text-xs text-slate-400 font-medium">Ventas</span>
                                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                                                            soldCount > 0 ? "text-amber-700 bg-amber-50" : "text-slate-400 bg-slate-50"
                                                        }`}>
                                                            {soldCount > 0 ? `${soldCount} pedidos` : "Sin ventas"}
                                                        </span>
                                                    </div>

                                                    {/* Tag */}
                                                    <div className="flex items-center justify-between py-2 border-b border-slate-50">
                                                        <span className="text-xs text-slate-400 font-medium">Etiqueta</span>
                                                        <span className="text-xs font-semibold text-slate-600">
                                                            {product.tag || "—"}
                                                        </span>
                                                    </div>

                                                    {/* Descripcion */}
                                                    <div className="py-2">
                                                        <span className="text-xs text-slate-400 font-medium block mb-1">Descripcion</span>
                                                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                                                            {product.shortDescription || "Sin descripcion"}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Acciones */}
                                                <div className="flex gap-2 pt-1">
                                                    {!isOutOfStock && (
                                                        <button
                                                            onClick={() => handleWhatsAppClick(undefined, product.name)}
                                                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white text-xs font-semibold transition-colors shadow-sm"
                                                        >
                                                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                                            </svg>
                                                            WhatsApp
                                                        </button>
                                                    )}
                                                    <Link
                                                        href={`/producto/${product.slug}`}
                                                        onClick={() => setShowCompareModal(false)}
                                                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-100 hover:bg-pink-50 text-slate-700 hover:text-pink-600 text-xs font-semibold transition-colors"
                                                    >
                                                        Ver detalle
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </>
    );


}
