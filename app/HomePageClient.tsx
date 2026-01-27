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

                {/* CAROUSEL DE BANNERS */}
                <HeroCarousel />

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

                                        // 👇 Lógica de stock
                                        const isTrackingStock = product.trackStock;
                                        const isOutOfStock = isTrackingStock && product.stock === 0;
                                        const isLowStock =
                                            isTrackingStock && !isOutOfStock && product.stock <= 2;

                                        const lowStockLabel =
                                            product.stock === 1 ? "¡Última unidad!" : "¡Solo 2 unidades!";

                                        return (
                                            <article
                                                key={product.id}
                                                className={`
        group flex flex-col gap-2 
        rounded-xl border p-3 shadow-sm bg-white
        hover:shadow-md hover:border-pink-300 
        transition-all duration-200
        ${isOutOfStock ? "border-slate-200 opacity-70" : "border-pink-100"}
      `}
                                            >
                                                {/* Imagen compacta */}
                                                <div className="relative w-full h-32 rounded-lg overflow-hidden bg-white">
                                                    <img
                                                        src={product.image}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                    />

                                                    {/* Botón de favorito */}
                                                    <button
                                                        onClick={() => {
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
                                                            }
                                                        }}
                                                        className="
                                                            absolute top-2 right-2 z-10
                                                            w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm
                                                            shadow-md hover:shadow-lg
                                                            flex items-center justify-center
                                                            transition-all duration-200
                                                            hover:scale-110
                                                        "
                                                        title={isFavorite(product.id) ? "Quitar de favoritos" : "Agregar a favoritos"}
                                                    >
                                                        <span className={`text-base transition-all ${isFavorite(product.id) ? 'text-red-500' : 'text-slate-400'}`}>
                                                            {isFavorite(product.id) ? '❤️' : '🤍'}
                                                        </span>
                                                    </button>

                                                    {hasSales && (
                                                        <div
                                                            className="
              absolute top-1.5 left-1.5 
              inline-flex items-center gap-1 rounded-full
              bg-black/60 backdrop-blur-sm 
              px-2 py-[2px] text-[9px] text-amber-200
              shadow-sm border border-amber-400/30
            "
                                                        >
                                                            <span>✅</span>
                                                            <span className="font-semibold">{soldLabel}</span>
                                                        </div>
                                                    )}

                                                    {/* 🧃 Badge de stock bajo */}
                                                    {isLowStock && (
                                                        <div
                                                            className="
              absolute top-1.5 right-1.5 
              inline-flex items-center gap-1 rounded-full
              bg-amber-500/90 px-2 py-[2px]
              text-[9px] font-semibold text-white shadow-sm
            "
                                                        >
                                                            <span>⚠️</span>
                                                            <span>{lowStockLabel}</span>
                                                        </div>
                                                    )}

                                                    {/* ❌ Badge de agotado */}
                                                    {isOutOfStock && (
                                                        <div
                                                            className="
              absolute inset-x-0 bottom-0
              bg-red-600/90 text-[11px] font-semibold
              text-white text-center py-1
            "
                                                        >
                                                            Agotado temporalmente
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

                                                            {/* Texto de stock */}
                                                            {isTrackingStock && !isOutOfStock && (
                                                                <p className="text-[10px] text-amber-600 mt-0.5">
                                                                    {product.stock} unidades disponibles
                                                                </p>
                                                            )}
                                                            {isOutOfStock && (
                                                                <p className="text-[10px] text-slate-500 mt-0.5">
                                                                    Sin unidades disponibles
                                                                </p>
                                                            )}
                                                        </div>

                                                        <div className="text-right space-y-1">
                                                            <Link
                                                                href={`/producto/${product.slug}`}
                                                                className="text-[10px] font-semibold text-pink-600 hover:text-pink-700"
                                                            >
                                                                Ver detalle
                                                            </Link>

                                                            {/* Acciones normales si HAY stock */}
                                                            {!isOutOfStock ? (
                                                                <>
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
                                                                </>
                                                            ) : (
                                                                // Vista cuando está agotado
                                                                // Vista cuando está agotado
                                                                <div className="flex flex-col items-end gap-1">
                                                                    <p className="text-[10px] font-semibold text-slate-400">
                                                                        Producto agotado
                                                                    </p>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleWhatsAppAvailabilityClick(product.name)}
                                                                        className="
            inline-flex items-center justify-end gap-1 
            text-[10px] font-semibold text-green-600 hover:text-green-700
        "
                                                                    >
                                                                        <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-green-500/10">
                                                                            💬
                                                                        </span>
                                                                        <span>Preguntar disponibilidad</span>
                                                                    </button>
                                                                </div>

                                                            )}
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
            <Footer />
        </>
    );


}
