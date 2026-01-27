// app/producto/[slug]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Product } from "@/lib/products";
import ProductReviews from "@/components/ProductReviews";
import ProductImageGallery from "@/components/ProductImageGallery";

// Números en formato internacional para WhatsApp (con 57 incluido)
const WHATSAPP_OUTLET_BOSQUE = "573504737628";
const WHATSAPP_SUPERCENTRO = "573202304977";

type Branch = "outlet" | "supercentro";
const BRANCH_STORAGE_KEY = "dd-default-branch";

type ProductDetail = Product & {
    category?: {
        id?: number;
        name?: string;
        slug?: string;
    };
};

function buildWhatsAppUrl(phone: string, productName?: string) {
    const text = `Hola, vengo desde la web de *Dulces Detalles ER* 💖 Me interesa el detalle: *${productName ?? ""}*. ¿Podrían darme más información?`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

// 🆕 texto especial para preguntar disponibilidad
function buildWhatsAppAvailabilityUrl(phone: string, productName?: string) {
    const text = `Hola, vengo desde la web de *Dulces Detalles ER* 💖 Quisiera saber cuándo volverá a estar disponible el detalle *${productName ?? ""}* 🕒`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

function getBranchLabel(branch: Branch) {
    return branch === "outlet"
        ? "Outlet del Bosque"
        : "Supercentro Los Ejecutivos";
}

export default function ProductPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params?.slug as string;

    const [product, setProduct] = useState<ProductDetail | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [defaultBranch, setDefaultBranch] = useState<Branch>("outlet");

    // 🔁 botón normal de pedir (cuando hay stock)
    const handleWhatsAppClick = () => {
        if (typeof window === "undefined" || !product) return;

        const phone =
            defaultBranch === "supercentro"
                ? WHATSAPP_SUPERCENTRO
                : WHATSAPP_OUTLET_BOSQUE;

        window.open(buildWhatsAppUrl(phone, product.name), "_blank");
    };

    // 🆕 botón para preguntar disponibilidad (cuando está agotado)
    const handleWhatsAppAvailabilityClick = () => {
        if (typeof window === "undefined" || !product) return;

        const phone =
            defaultBranch === "supercentro"
                ? WHATSAPP_SUPERCENTRO
                : WHATSAPP_OUTLET_BOSQUE;

        window.open(
            buildWhatsAppAvailabilityUrl(phone, product.name),
            "_blank"
        );
    };

    // Leer sucursal guardada
    useEffect(() => {
        if (typeof window === "undefined") return;
        const stored = window.localStorage.getItem(BRANCH_STORAGE_KEY);
        if (stored === "outlet" || stored === "supercentro") {
            setDefaultBranch(stored);
        }
    }, []);

    useEffect(() => {
        if (!slug) return;

        const fetchProduct = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // IMPORTANTE: usamos query ?slug=
                const res = await fetch(
                    `/api/products/by-slug?slug=${encodeURIComponent(slug)}`
                );

                if (!res.ok) {
                    throw new Error(
                        `No se pudo cargar el producto (${res.status})`
                    );
                }

                const data = await res.json();
                setProduct(data);
            } catch (err: any) {
                console.error("❌ Error cargando producto:", err);
                setError(err?.message ?? "Error cargando producto");
            } finally {
                setIsLoading(false);
            }
        };

        fetchProduct();
    }, [slug]);

    const formatPrice = (value: number) =>
        value.toLocaleString("es-CO", {
            style: "currency",
            currency: "COP",
            maximumFractionDigits: 0,
        });

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <p className="text-sm text-slate-500">Cargando detalle...</p>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 px-4 text-center">
                <p className="text-sm text-slate-500">
                    {error ?? "No encontramos este detalle."}
                </p>
                <button
                    onClick={() => router.push("/")}
                    className="mt-1 text-xs font-semibold text-pink-600 underline"
                >
                    Volver al inicio
                </button>
            </div>
        );
    }

    // 🆕 lógica de stock (ya con product asegurado)
    const isTrackingStock = product.trackStock;
    const stock = product.stock ?? 0;
    const isOutOfStock = isTrackingStock && stock === 0;
    const isLowStock = isTrackingStock && !isOutOfStock && stock <= 2;

    const lowStockLabel =
        stock === 1 ? "¡Última unidad!" : "¡Solo 2 unidades!";

    return (
        <div className="pb-24 space-y-6">
            {/* Migas / volver */}
            <div className="mt-2 px-4 flex items-center justify-between gap-2">
                <button
                    onClick={() => router.back()}
                    className="text-[11px] md:text-xs text-slate-500 hover:text-slate-700"
                >
                    ← Volver
                </button>

                <p className="text-[11px] md:text-xs text-slate-400">
                    Estás escribiendo a:{" "}
                    <span className="font-semibold text-pink-600">
                        {getBranchLabel(defaultBranch)}
                    </span>
                </p>
            </div>

            {/* HERO DEL DETALLE */}
            <section className="mx-4 rounded-3xl bg-gradient-to-b from-pink-50 via-pink-100 to-rose-50 overflow-hidden shadow-sm">
                <div className="relative">
                    {/* Decoraciones */}
                    <div className="pointer-events-none absolute inset-0">
                        <div className="absolute -top-10 -right-6 w-32 h-32 bg-pink-200/60 rounded-full blur-3xl" />
                        <div className="absolute -bottom-12 -left-10 w-40 h-40 bg-rose-200/60 rounded-full blur-3xl" />
                    </div>

                    {/* Galería de imágenes */}
                    <div className="relative p-4">
                        <ProductImageGallery
                            productId={product.id}
                            mainImage={product.image}
                            productName={product.name}
                        />

                        {/* Badges flotantes sobre la galería */}
                        <div className="absolute top-7 left-7 inline-flex items-center gap-2 rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-[11px] font-semibold text-pink-700 shadow-md">
                            🎁 Detalle personalizado
                        </div>

                        {product.tag && (
                            <div className="absolute top-7 right-7 inline-flex items-center gap-2 rounded-full bg-pink-600 text-white text-[11px] px-3 py-1 shadow-md">
                                <span>{product.tag}</span>
                            </div>
                        )}

                        {/* Badge de stock bajo */}
                        {isLowStock && (
                            <div className="absolute bottom-7 left-7 inline-flex items-center gap-2 rounded-full bg-amber-500 text-white text-[11px] px-3 py-1 shadow-md z-10">
                                ⚠️ {lowStockLabel}
                            </div>
                        )}

                        {/* Badge de agotado */}
                        {isOutOfStock && (
                            <div className="absolute bottom-7 left-7 right-7 bg-red-600/90 text-center text-[11px] font-semibold text-white py-2 rounded-lg shadow-lg z-10">
                                Agotado temporalmente
                            </div>
                        )}
                    </div>

                    {/* Info principal */}
                    <div className="relative px-4 pt-4 pb-5 space-y-3 bg-gradient-to-t from-white/95 via-white/90 to-white/60 backdrop-blur-sm">
                        {product.category && (
                            <p className="text-[11px] text-pink-600 font-semibold">
                                {product.category.name ?? "Detalle especial"}
                            </p>
                        )}

                        <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 leading-snug">
                            {product.name}
                        </h1>

                        <p className="text-xs md:text-sm text-slate-600">
                            {product.shortDescription}
                        </p>

                        <div className="flex items-end justify-between mt-2">
                            <div>
                                <p className="text-[11px] text-slate-400">
                                    Desde
                                </p>
                                <p className="text-2xl font-extrabold text-pink-600">
                                    {formatPrice(product.price)}
                                </p>

                                {/* 🆕 mensajes según stock */}
                                {isTrackingStock && !isOutOfStock && (
                                    <p className="text-[11px] text-amber-600 mt-0.5">
                                        {stock} unidades disponibles
                                    </p>
                                )}
                                {isOutOfStock && (
                                    <p className="text-[11px] text-slate-500 mt-0.5">
                                        Sin unidades disponibles por el momento
                                    </p>
                                )}

                                <p className="text-[11px] text-slate-400 mt-0.5">
                                    Precio puede variar según personalización ✨
                                </p>
                            </div>

                            {/* 🔁 CTA cambia según si hay stock o no */}
                            {isOutOfStock ? (
                                <button
                                    onClick={handleWhatsAppAvailabilityClick}
                                    className="inline-flex items-center gap-2 rounded-full bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 text-xs shadow-lg shadow-green-300/60"
                                >
                                    💬 Preguntar disponibilidad
                                </button>
                            ) : (
                                <button
                                    onClick={handleWhatsAppClick}
                                    className="inline-flex items-center gap-2 rounded-full bg-pink-500 hover:bg-pink-600 text-white font-semibold px-4 py-2 text-xs shadow-lg shadow-pink-300/60"
                                >
                                    💬 Pedir este detalle
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* DESCRIPCIÓN / DETALLES */}
            <section className="px-4 space-y-4">
                <div>
                    <h2 className="text-sm font-semibold text-slate-900 mb-1">
                        ¿Qué incluye este detalle?
                    </h2>
                    <p className="text-xs md:text-sm text-slate-600 whitespace-pre-line">
                        {product.description}
                    </p>
                </div>

                <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-2">
                    <h3 className="text-sm font-semibold text-slate-900">
                        Información importante 📌
                    </h3>
                    <ul className="text-[11px] md:text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                        <li>
                            Las fotos son referencia, podemos ajustar colores y
                            dulces según tu gusto.
                        </li>
                        <li>
                            Te confirmamos disponibilidad de peluches, globos y
                            chocolates al momento del pedido.
                        </li>
                        <li>
                            Hacemos entregas a domicilio en Cartagena o puedes
                            recoger en nuestras sucursales.
                        </li>
                    </ul>
                </div>
            </section>

            {/* RESEÑAS Y CALIFICACIONES */}
            <section className="px-4">
                <ProductReviews
                    productId={product.id}
                    productName={product.name}
                />
            </section>

            {/* SUCURSALES RESUMEN */}
            <section className="px-4 space-y-3">
                <h2 className="text-sm font-semibold text-slate-900">
                    Pide este detalle en nuestras sucursales
                </h2>
                <div className="grid gap-3 md:grid-cols-2">
                    <article className="bg-white/90 border border-slate-100 rounded-2xl p-3 shadow-sm">
                        <p className="text-xs font-semibold text-slate-900">
                            Outlet del Bosque
                        </p>
                        <p className="text-[11px] text-slate-500">
                            Centro Comercial Outlet del Bosque, frente a la
                            Olímpica.
                        </p>
                        <p className="text-[11px] text-slate-700 mt-1">
                            📲 +57 350 473 7628
                        </p>
                    </article>

                    <article className="bg-white/90 border border-slate-100 rounded-2xl p-3 shadow-sm">
                        <p className="text-xs font-semibold text-slate-900">
                            Supercentro Los Ejecutivos
                        </p>
                        <p className="text-[11px] text-slate-500">
                            Al lado del Banco BBVA.
                        </p>
                        <p className="text-[11px] text-slate-700 mt-1">
                            📲 +57 320 230 4977
                        </p>
                    </article>
                </div>
            </section>

            {/* BOTÓN FLOTANTE WHATSAPP */}
            <button
                onClick={
                    isOutOfStock
                        ? handleWhatsAppAvailabilityClick
                        : handleWhatsAppClick
                }
                className="fixed bottom-6 right-6 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-xl w-14 h-14 flex items-center justify-center text-2xl"
                aria-label="Abrir WhatsApp para este detalle"
            >
                💬
            </button>
        </div>
    );
}
