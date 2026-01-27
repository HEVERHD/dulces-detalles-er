"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  imageUrl: string;
  buttonText: string | null;
  buttonLink: string | null;
  order: number;
  isActive: boolean;
}

export default function HeroCarousel() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const res = await fetch("/api/banners");
      if (!res.ok) throw new Error("Error al cargar banners");
      const data = await res.json();
      setBanners(data);
    } catch (error) {
      console.error("Error cargando banners:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-play carousel
  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000); // Cambia cada 5 segundos

    return () => clearInterval(interval);
  }, [banners.length]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  if (isLoading) {
    return (
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-pink-600 via-rose-500 to-fuchsia-600 px-4 py-16 shadow-lg">
        <div className="text-center text-white">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent"></div>
          <p className="mt-3 text-sm">Cargando...</p>
        </div>
      </section>
    );
  }

  if (banners.length === 0) {
    // Si no hay banners, mostrar el banner por defecto (el que ya estaba)
    return (
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-pink-600 via-rose-500 to-fuchsia-600 px-4 py-8 md:px-8 md:py-10 shadow-lg">
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-1 shadow-md border border-pink-100">
            <span className="text-sm">💝</span>
            <p className="text-[11px] md:text-xs font-semibold text-pink-800">
              Detalles únicos · Hechos con amor
            </p>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-16 -right-10 w-40 h-40 bg-pink-400/40 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -left-10 w-48 h-48 bg-fuchsia-500/40 rounded-full blur-3xl" />
        </div>

        <div className="relative grid gap-8 md:grid-cols-2 md:items-center">
          <div className="order-1 md:order-2 flex justify-center">
            <div className="relative w-full max-w-xs md:max-w-sm">
              <div className="absolute -top-4 -left-2 z-20 flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 shadow-md border border-pink-100">
                <span className="text-xs font-semibold text-pink-600">Más populares</span>
                <span className="text-sm">🌟</span>
              </div>

              <div className="overflow-hidden rounded-3xl border border-white/70 bg-white/70 shadow-2xl backdrop-blur-sm">
                <img
                  src="/images/products/navidad.png"
                  alt="Arreglos personalizados"
                  className="h-60 w-full object-cover md:h-72"
                />
              </div>

              <div className="absolute -bottom-4 right-3 rounded-2xl bg-white/95 px-3 py-1.5 text-[10px] shadow-md flex items-center gap-2 border border-pink-100">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-pink-100 text-[13px]">
                  ⭐
                </span>
                <div className="leading-tight">
                  <p className="font-semibold text-slate-800">Arreglos personalizados</p>
                  <p className="text-[9px] text-slate-500">Dulces, peluches, flores y más 🎀</p>
                </div>
              </div>
            </div>
          </div>

          <div className="order-2 md:order-1 space-y-4 text-white">
            <p className="inline-flex items-center rounded-full bg-white/15 text-pink-50 text-[11px] font-semibold px-3 py-1 border border-pink-300/40">
              ✨ Detalles con amor en Cartagena
            </p>

            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold leading-tight drop-shadow-sm">
              Regalos que crean
              <span className="block text-amber-300 mt-0.5">momentos inolvidables 💛</span>
            </h1>

            <p className="text-sm md:text-base text-pink-50/90 max-w-md">
              Arreglos únicos con chocolates, flores, peluches, tazas y detalles personalizados para cumpleaños, aniversarios, declaraciones y toda ocasión especial que quieras celebrar.
            </p>

            <div className="flex flex-wrap gap-3">
              <a
                href="#productos"
                className="inline-flex items-center gap-2 rounded-full bg-amber-300 hover:bg-amber-200 text-pink-900 font-semibold px-6 py-2.5 shadow-lg shadow-amber-900/30 text-sm"
              >
                💝 Ver detalles
              </a>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const currentBanner = banners[currentIndex];

  return (
    <section className="relative overflow-hidden rounded-3xl shadow-lg group">
      {/* Imagen de fondo */}
      <div className="relative aspect-[16/7] md:aspect-[21/9] bg-gradient-to-b from-slate-900 to-slate-800">
        <img
          src={currentBanner.imageUrl}
          alt={currentBanner.title}
          className="w-full h-full object-cover"
        />

        {/* Overlay oscuro para mejor legibilidad del texto */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>

        {/* Contenido del banner */}
        <div className="absolute inset-0 flex items-center">
          <div className="w-full max-w-6xl mx-auto px-6 md:px-8">
            <div className="max-w-xl space-y-4">
              {/* Badge superior */}
              <div className="inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-1.5 shadow-md border border-pink-100">
                <span className="text-sm">💝</span>
                <p className="text-xs font-semibold text-pink-800">
                  Detalles únicos · Hechos con amor
                </p>
              </div>

              {/* Título */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight drop-shadow-lg">
                {currentBanner.title}
              </h1>

              {/* Subtítulo */}
              {currentBanner.subtitle && (
                <p className="text-xl md:text-2xl font-bold text-amber-300 drop-shadow-md">
                  {currentBanner.subtitle}
                </p>
              )}

              {/* Descripción */}
              {currentBanner.description && (
                <p className="text-sm md:text-base text-white/90 max-w-lg drop-shadow-md">
                  {currentBanner.description}
                </p>
              )}

              {/* Botón */}
              {currentBanner.buttonText && currentBanner.buttonLink && (
                <div>
                  {currentBanner.buttonLink.startsWith("http") ? (
                    <a
                      href={currentBanner.buttonLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-pink-600 hover:bg-pink-700 text-white font-semibold px-6 py-3 shadow-lg transition-all text-sm"
                    >
                      {currentBanner.buttonText}
                    </a>
                  ) : (
                    <Link
                      href={currentBanner.buttonLink}
                      className="inline-flex items-center gap-2 rounded-full bg-pink-600 hover:bg-pink-700 text-white font-semibold px-6 py-3 shadow-lg transition-all text-sm"
                    >
                      {currentBanner.buttonText}
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Botones de navegación */}
        {banners.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center text-slate-700 hover:text-pink-600 transition-all opacity-0 group-hover:opacity-100"
              aria-label="Anterior"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center text-slate-700 hover:text-pink-600 transition-all opacity-0 group-hover:opacity-100"
              aria-label="Siguiente"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Indicadores (dots) */}
        {banners.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? "bg-white w-6"
                    : "bg-white/50 hover:bg-white/75"
                }`}
                aria-label={`Ir al slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
