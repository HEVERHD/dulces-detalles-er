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
    }, 5000);

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
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-pink-600 via-rose-500 to-fuchsia-600 animate-gradient px-4 py-16 shadow-premium-lg">
        <div className="text-center text-white">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent"></div>
          <p className="mt-3 text-sm font-medium">Cargando...</p>
        </div>
      </section>
    );
  }

  if (banners.length === 0) {
    // Banner por defecto premium
    return (
      <section className="relative overflow-hidden rounded-3xl shadow-premium-lg">
        {/* Fondo con gradiente animado */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-600 via-rose-500 to-fuchsia-600 animate-gradient"></div>

        {/* Patrón de puntos decorativo */}
        <div className="absolute inset-0 dots-pattern opacity-30"></div>

        {/* Elementos decorativos flotantes */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-pink-400/30 rounded-full blur-3xl animate-float"></div>
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-fuchsia-500/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-400/20 rounded-full blur-3xl"></div>
        </div>

        {/* Badge superior */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
          <div className="glass-card inline-flex items-center gap-2 rounded-full px-4 py-1.5 shadow-lg animate-fade-in-up">
            <span className="text-lg">💝</span>
            <p className="text-xs font-semibold text-pink-800">
              Detalles con amor en Cartagena
            </p>
          </div>
        </div>

        <div className="relative px-6 py-12 md:px-10 md:py-16">
          <div className="grid gap-10 md:grid-cols-2 md:items-center max-w-6xl mx-auto">
            {/* Imagen */}
            <div className="order-1 md:order-2 flex justify-center animate-slide-in-right">
              <div className="relative w-full max-w-sm">
                {/* Badge flotante */}
                <div className="absolute -top-3 -left-3 z-20 glass-card flex items-center gap-2 rounded-full px-4 py-2 shadow-lg animate-float">
                  <span className="text-amber-500 text-lg">&#9733;</span>
                  <span className="text-xs font-bold text-slate-800">Favorito de clientes</span>
                </div>

                {/* Contenedor de imagen con efecto */}
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-pink-400 via-rose-400 to-amber-400 rounded-3xl blur opacity-40 group-hover:opacity-60 transition-opacity"></div>
                  <div className="relative overflow-hidden rounded-3xl bg-white/90 shadow-2xl">
                    <img
                      src="/images/products/navidad.png"
                      alt="Arreglos personalizados"
                      className="h-64 w-full object-cover md:h-80 transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                </div>

                {/* Badge inferior */}
                <div className="absolute -bottom-4 right-4 glass-card rounded-2xl px-4 py-2 shadow-lg animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-500 text-white text-lg shadow-md">
                      &#127873;
                    </span>
                    <div className="leading-tight">
                      <p className="font-bold text-slate-800 text-sm">+500 detalles</p>
                      <p className="text-[11px] text-slate-500">entregados con amor</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contenido de texto */}
            <div className="order-2 md:order-1 space-y-6 text-white animate-slide-in-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-sm text-pink-50 text-xs font-semibold px-4 py-2 border border-white/20">
                <span className="animate-pulse-soft">&#10024;</span>
                <span>El regalo perfecto existe</span>
              </div>

              <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                Regalos que crean
                <span className="block text-gradient-gold mt-1">momentos inolvidables</span>
              </h1>

              <p className="text-base md:text-lg text-pink-50/90 max-w-lg leading-relaxed">
                Arreglos personalizados con chocolates, flores, peluches y detalles
                para cada ocasión especial. Hacemos realidad tus ideas.
              </p>

              {/* Características */}
              <div className="flex flex-wrap gap-3 pt-2">
                {[
                  { icon: '&#127873;', text: 'Personalizado' },
                  { icon: '&#128666;', text: 'Envío rápido' },
                  { icon: '&#128156;', text: 'Hecho con amor' },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs font-medium border border-white/10"
                  >
                    <span dangerouslySetInnerHTML={{ __html: item.icon }}></span>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 pt-4">
                <a
                  href="#productos"
                  className="btn-premium inline-flex items-center gap-2 rounded-full bg-white text-pink-600 font-bold px-7 py-3.5 shadow-lg hover:shadow-xl hover:bg-pink-50 transition-all text-sm"
                >
                  <span>&#128142;</span>
                  <span>Ver detalles</span>
                </a>
                <a
                  href="https://wa.me/573504737638?text=Hola,%20vengo%20desde%20la%20web%20de%20Dulces%20Detalles%20ER"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-green-500 hover:bg-green-600 text-white font-bold px-7 py-3.5 shadow-lg transition-all text-sm"
                >
                  <span>&#128172;</span>
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const currentBanner = banners[currentIndex];

  return (
    <section className="relative overflow-hidden shadow-premium-lg group">
      {/* Imagen de fondo con overlay premium */}
      <div className="relative aspect-4/3 sm:aspect-video md:aspect-21/9 bg-slate-900">
        <img
          src={currentBanner.imageUrl}
          alt={currentBanner.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Overlay con gradiente mejorado */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>

        {/* Contenido del banner */}
        <div className="absolute inset-0 flex items-end sm:items-center pb-16 sm:pb-0">
          <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-10">
            <div className="max-w-xl space-y-2 sm:space-y-4 animate-fade-in-up">
              {/* Badge superior - oculto en mobile muy pequeño */}
              <div className="glass-card hidden sm:inline-flex items-center gap-2 rounded-full px-4 py-2 shadow-lg">
                <span className="text-lg">&#128157;</span>
                <p className="text-xs font-semibold text-pink-800">
                  Detalles con amor
                </p>
              </div>

              {/* Título */}
              <h1 className="font-display text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight drop-shadow-lg">
                {currentBanner.title}
              </h1>

              {/* Subtítulo */}
              {currentBanner.subtitle && (
                <p className="text-sm sm:text-xl md:text-2xl font-bold text-gradient-gold drop-shadow-md line-clamp-2">
                  {currentBanner.subtitle}
                </p>
              )}

              {/* Descripción - oculta en mobile muy pequeño */}
              {currentBanner.description && (
                <p className="hidden sm:block text-sm md:text-base text-white/90 max-w-lg drop-shadow-md leading-relaxed line-clamp-2">
                  {currentBanner.description}
                </p>
              )}

              {/* Botón */}
              {currentBanner.buttonText && currentBanner.buttonLink && (
                <div className="pt-2">
                  {currentBanner.buttonLink.startsWith("http") ? (
                    <a
                      href={currentBanner.buttonLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-premium inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold px-7 py-3.5 shadow-lg transition-all text-sm"
                    >
                      {currentBanner.buttonText}
                      <span>&#8594;</span>
                    </a>
                  ) : (
                    <Link
                      href={currentBanner.buttonLink}
                      className="btn-premium inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold px-7 py-3.5 shadow-lg transition-all text-sm"
                    >
                      {currentBanner.buttonText}
                      <span>&#8594;</span>
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Botones de navegación premium */}
        {banners.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full glass-card shadow-lg flex items-center justify-center text-slate-700 hover:text-pink-600 transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
              aria-label="Anterior"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full glass-card shadow-lg flex items-center justify-center text-slate-700 hover:text-pink-600 transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
              aria-label="Siguiente"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Indicadores premium */}
        {banners.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 glass-card rounded-full px-4 py-2 flex gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all duration-300 ${index === currentIndex
                    ? "bg-pink-500 w-8"
                    : "bg-slate-300 w-2 hover:bg-pink-300"
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
