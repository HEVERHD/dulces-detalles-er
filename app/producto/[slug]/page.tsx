// app/producto/[slug]/page.tsx
"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const WHATSAPP_OUTLET_BOSQUE = "573504737628";

function buildWhatsAppUrl(productName: string) {
    const base = `https://wa.me/${WHATSAPP_OUTLET_BOSQUE}`;
    const text = `Hola, vengo desde la web de *Dulces Detalles ER* 💖
Me interesa el detalle: *${productName}*.
¿Me pueden dar más información?`;
    return `${base}?text=${encodeURIComponent(text)}`;
}

type ProductFromApi = {
    id: string;
    slug: string;
    name: string;
    shortDescription: string;
    description: string;
    price: number;
    tag?: string | null;
    image: string;
    isFeatured: boolean;
    isActive: boolean;
};

export default function ProductPage() {
    const params = useParams<{ slug: string | string[] }>();

    // normalizamos el slug
    const slug = typeof params.slug === "string" ? params.slug : params.slug?.[0];

    const [product, setProduct] = useState<ProductFromApi | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        if (!slug) return;

        console.log("🟣 slug en ProductPage:", slug);

        const fetchProduct = async () => {
            try {
                setIsLoading(true);
                setErrorMsg(null);

                // 👇 AHORA USAMOS EL SEGMENTO /by-slug/{slug}
                const res = await fetch(`/api/products/by-slug/${encodeURIComponent(slug)}`);

                if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    console.error("❌ Error fetch detalle:", res.status, data);
                    if (res.status === 404) {
                        setProduct(null);
                        setErrorMsg("No encontramos este detalle. 😢");
                        return;
                    }
                    throw new Error(data?.error || "Error cargando el detalle");
                }

                const data = (await res.json()) as ProductFromApi;
                setProduct(data);
            } catch (err: any) {
                console.error("🔥 Error cargando producto:", err);
                setErrorMsg("Ocurrió un error cargando este detalle.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchProduct();
    }, [slug]);

    // Volver al inicio
    const backLink = (
        <a
            href="/"
            className="inline-flex items-center text-sm text-slate-500 hover:text-pink-600"
        >
            ← Volver al inicio
        </a>
    );

    if (isLoading) {
        return (
            <div className="py-10 space-y-4">
                {backLink}
                <p className="mt-6 text-slate-500 text-sm">Cargando detalle...</p>
            </div>
        );
    }

    if (errorMsg || !product) {
        return (
            <div className="py-10 space-y-4">
                {backLink}
                <p className="mt-6 text-pink-600 font-semibold">
                    {errorMsg ?? "No encontramos este detalle. 😢"}
                </p>
            </div>
        );
    }

    const whatsappUrl = buildWhatsAppUrl(product.name);
    const priceFormatted = product.price.toLocaleString("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0,
    });

    return (
        <div className="py-10 space-y-10">
            {backLink}

            <div className="grid md:grid-cols-[2fr,1fr] gap-10 items-start">
                {/* Información principal */}
                <div className="space-y-5">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full rounded-2xl shadow-lg object-cover max-h-[420px]"
                    />

                    <span className="inline-flex items-center rounded-full bg-pink-50 text-pink-600 text-xs font-semibold px-3 py-1">
                        Detalle especial
                    </span>

                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">
                        {product.name}
                    </h1>

                    <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                        {product.description}
                    </p>

                    <ul className="mt-4 text-sm text-slate-600 space-y-1">
                        <li>✅ Personalizable con nombre y tarjeta</li>
                        <li>✅ Entrega a domicilio en Cartagena</li>
                        <li>✅ También puedes recoger en nuestros puntos físicos</li>
                    </ul>
                </div>

                {/* Lado derecho: Card */}
                <aside className="bg-white/90 border border-pink-100 rounded-2xl p-6 shadow-lg space-y-4">
                    <div className="space-y-1">
                        <p className="text-xs font-semibold text-pink-600 uppercase tracking-wide">
                            Detalle
                        </p>
                        <p className="text-lg font-semibold text-slate-900">
                            {product.name}
                        </p>
                        <p className="text-xs text-slate-500">
                            {product.shortDescription}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-slate-500 mb-1">Precio desde:</p>
                        <p className="text-3xl font-extrabold text-pink-600">
                            {priceFormatted}
                        </p>
                        <p className="text-[11px] text-slate-400">
                            *El precio puede variar según personalización.
                        </p>
                    </div>

                    <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-center rounded-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 text-sm shadow-lg"
                    >
                        💬 Pedir este detalle por WhatsApp
                    </a>

                    <p className="text-[11px] text-slate-400 text-center">
                        Te atenderemos por WhatsApp.
                    </p>
                </aside>
            </div>
        </div>
    );
}
