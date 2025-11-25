// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Product, PRODUCTS } from "../lib/products";


const CATEGORIES = [
  { id: "cumple", name: "Cumpleaños 🎂", description: "Tortas, cajas sorpresa, globos y más." },
  { id: "aniversario", name: "Aniversarios 💘", description: "Detalles románticos para celebrar el amor." },
  { id: "declaracion", name: "Declaraciones 💍", description: "Momentos inolvidables para decir lo que sientes." },
  { id: "infantil", name: "Infantil 🎈", description: "Detalles para los más pequeños y sus héroes favoritos." },
  { id: "dietetico", name: "Sin azúcar / especiales 🌱", description: "Opciones especiales según tu necesidad." },
];


const WHATSAPP_OUTLET_BOSQUE = "573504737628";
const WHATSAPP_SUPERCENTRO = "573202304977";

function buildWhatsAppUrl(productName?: string) {
  const base = `https://wa.me/${WHATSAPP_OUTLET_BOSQUE}`;
  const text = `Hola, vengo desde la web de *Dulces Detalles ER* 💖 Quiero más información sobre${productName ? ` el detalle: *${productName}*` : " sus arreglos y detalles."
    }`;
  return `${base}?text=${encodeURIComponent(text)}`;
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [errorProducts, setErrorProducts] = useState<string | null>(null);
  const handleWhatsAppClick = (productName?: string) => {
    if (typeof window === "undefined") return;
    window.open(buildWhatsAppUrl(productName), "_blank");
  };


  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoadingProducts(true);
        setErrorProducts(null);

        const res = await fetch("/api/products");

        if (!res.ok) {
          throw new Error(`Error cargando productos (${res.status})`);
        }

        const data = await res.json();
        setProducts(data);
      } catch (err: any) {
        console.error("❌ Error cargando productos en Home:", err);
        setErrorProducts(err?.message ?? "Error cargando productos");
      } finally {
        setIsLoadingProducts(false);
      }
    };

    loadProducts();
  }, []);

  const formatPrice = (value: number) =>
    value.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });

  return (
    <div className="space-y-16">
      {/* HERO */}
      <section className="grid md:grid-cols-2 gap-10 items-center">
        <div className="space-y-6">
          <p className="inline-flex items-center rounded-full bg-pink-100 text-pink-700 text-xs font-semibold px-3 py-1">
            🎁 Regalos personalizados · Cartagena
          </p>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight">
            ¿Buscas el regalo perfecto?
            <span className="block text-pink-600 mt-1">
              Nosotros lo preparamos por ti 💖
            </span>
          </h1>

          <p className="text-slate-600 text-sm md:text-base max-w-xl">
            Arreglos personalizados, peluches adorables, dulces nacionales e importados
            y sorpresas para cumpleaños, aniversarios, declaraciones y cualquier ocasión especial.
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleWhatsAppClick()}
              className="inline-flex items-center gap-2 rounded-full bg-pink-500 hover:bg-pink-600 text-white font-semibold px-6 py-2.5 shadow-lg shadow-pink-300/50"
            >
              💬 Pedir por WhatsApp
            </button>
            <a
              href="#categorias"
              className="inline-flex items-center gap-2 rounded-full border border-pink-200 text-pink-600 hover:bg-pink-50 px-5 py-2.5 text-sm font-semibold"
            >
              Ver categorías
            </a>
          </div>

          <ul className="text-xs md:text-sm text-slate-500 space-y-1">
            <li>✅ Arreglos personalizados</li>
            <li>✅ Servicio a domicilio en Cartagena</li>
            <li>✅ Dos puntos físicos para retirar tus detalles</li>
          </ul>
        </div>

        {/* Lado derecho: productos */}
        <div className="relative">
          <div className="absolute -top-6 -right-4 w-24 h-24 bg-pink-200 rounded-full blur-2xl opacity-70" />
          <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-sky-200 rounded-full blur-2xl opacity-70" />

          <div className="relative grid gap-5">

            {/* Loader */}
            {isLoadingProducts && (
              <p className="text-sm text-slate-500 text-center py-4">
                Cargando detalles...
              </p>
            )}

            {/* Error */}
            {errorProducts && !isLoadingProducts && (
              <p className="text-sm text-red-500 text-center py-4">
                Ocurrió un error cargando los productos.
              </p>
            )}

            {/* Vacío */}
            {!isLoadingProducts && !errorProducts && products.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">
                Aún no hay productos configurados.
              </p>
            )}

            {/* Productos backend */}
            {!isLoadingProducts &&
              !errorProducts &&
              products.map((product) => {
                const badges: any = {
                  "Más vendido": "🔥",
                  "Amor & amistad": "💘",
                  "Ideal para cumpleaños": "🎂",
                };

                const badgeIcon = badges[product.tag ?? ""] || "✨";

                return (
                  <article
                    key={product.id}
                    className="group flex gap-4 rounded-2xl border border-pink-100 p-4 shadow-md 
                  bg-gradient-to-r from-white via-pink-50/40 to-white
                  hover:shadow-xl hover:border-pink-300 hover:bg-gradient-to-br 
                  hover:-translate-y-1 transform transition-all duration-300 cursor-pointer"
                  >
                    {/* Imagen */}
                    <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-xl overflow-hidden shadow-sm bg-white">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 border border-white"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        {product.tag && (
                          <span className="inline-flex items-center gap-1 bg-pink-100/90 text-pink-700 
                          text-[11px] font-semibold px-2 py-0.5 rounded-full mb-1">
                            {badgeIcon} {product.tag}
                          </span>
                        )}

                        <h3 className="text-sm md:text-base font-bold text-slate-900">
                          {product.name}
                        </h3>

                        <p className="text-xs text-slate-500 mt-1 leading-snug">
                          {product.shortDescription}
                        </p>
                      </div>

                      <div className="flex items-end justify-between mt-3">
                        <div>
                          <p className="text-[11px] text-slate-400">Desde</p>
                          <p className="text-sm md:text-base font-extrabold text-pink-600">
                            {product.price.toLocaleString("es-CO", {
                              style: "currency",
                              currency: "COP",
                              maximumFractionDigits: 0,
                            })}
                          </p>
                        </div>

                        <div className="text-right space-y-1">
                          <a
                            href={`/producto/${product.slug}`}
                            className="text-[11px] md:text-xs font-semibold text-pink-600 hover:text-pink-700"
                          >
                            Ver detalle
                          </a>

                          <button
                            onClick={() =>
                              window.open(
                                `https://wa.me/573504737628?text=${encodeURIComponent(
                                  `Hola, vengo desde la web de Dulces Detalles ER 💖. Me interesa el detalle: *${product.name}*.`
                                )}`,
                                "_blank"
                              )
                            }
                            className="inline-flex items-center justify-end gap-2 text-[11px] md:text-xs 
                            text-green-600 hover:text-green-700 font-semibold mt-1"
                          >
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-500/10">
                              <img src="/images/whatsapp-icon.png" className="w-3 h-3" />
                            </span>
                            <span>Pedir este</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
          </div>
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
              <h3 className="font-semibold text-pink-600 mb-1 text-sm">{cat.name}</h3>
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
          Muy pronto aquí estará el catálogo completo administrado desde tu dashboard.
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
              📲 Pedidos al: <span className="font-semibold">+57 350 473 7628</span>
            </p>
            <button
              onClick={() => handleWhatsAppClick()}
              className="mt-3 text-xs font-semibold text-pink-600 hover:text-pink-700 underline"
            >
              Escribir a esta sucursal 💬
            </button>
          </article>

          <article className="bg-white/90 border border-slate-100 rounded-2xl p-4 shadow-sm">
            <h3 className="font-semibold text-slate-900">
              Centro Comercial Supercentro Los Ejecutivos
            </h3>
            <p className="text-xs text-slate-500 mt-1">Al lado del Banco BBVA.</p>
            <p className="text-sm text-slate-700 mt-2">
              📲 Pedidos al: <span className="font-semibold">+57 320 230 4977</span>
            </p>
            <button
              onClick={() => handleWhatsAppClick()}
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
            Cuéntanos la ocasión y nosotros nos encargamos de armar el detalle perfecto:
            cumpleaños, aniversarios, graduaciones, declaraciones y más.
          </p>
        </div>

        <button
          onClick={() => handleWhatsAppClick()}
          className="self-start md:self-auto inline-flex items-center gap-2 rounded-full bg-pink-500 hover:bg-pink-600 text-white font-semibold px-6 py-2.5 shadow-md"
        >
          💬 Hablar con un asesor
        </button>
      </section>

      {/* BOTÓN FLOTANTE WHATSAPP */}
      <button
        onClick={() => handleWhatsAppClick()}
        className="fixed bottom-6 right-6 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-xl w-14 h-14 flex items-center justify-center text-2xl"
        aria-label="Abrir WhatsApp Dulces Detalles ER"
      >
        💬
      </button>
    </div>
  );

}
