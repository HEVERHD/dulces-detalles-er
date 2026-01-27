"use client";

import { useState, useEffect } from "react";

interface ProductImage {
  id: string;
  url: string;
  alt: string | null;
  order: number;
}

interface ProductImageGalleryProps {
  productId: string;
  mainImage: string;
  productName: string;
}

export default function ProductImageGallery({
  productId,
  mainImage,
  productName,
}: ProductImageGalleryProps) {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Combinar imagen principal con imágenes adicionales
  const allImages = [
    { id: "main", url: mainImage, alt: productName, order: -1 },
    ...images,
  ];

  useEffect(() => {
    fetchImages();
  }, [productId]);

  const fetchImages = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/products/images?productId=${productId}`);
      const data = await res.json();
      setImages(data.images || []);
    } catch (error) {
      console.error("Error al cargar imágenes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevious = () => {
    setSelectedIndex((prev) =>
      prev === 0 ? allImages.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setSelectedIndex((prev) =>
      prev === allImages.length - 1 ? 0 : prev + 1
    );
  };

  // Si solo hay una imagen (la principal), mostrar vista simple
  if (!isLoading && allImages.length === 1) {
    return (
      <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-pink-100 to-purple-100">
        <img
          src={mainImage}
          alt={productName}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Imagen principal con navegación */}
      <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-pink-100 to-purple-100 group">
        <img
          src={allImages[selectedIndex].url}
          alt={allImages[selectedIndex].alt || productName}
          className="w-full h-full object-cover transition-transform duration-300"
        />

        {/* Controles de navegación (solo si hay más de 1 imagen) */}
        {allImages.length > 1 && (
          <>
            {/* Botón anterior */}
            <button
              onClick={handlePrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
              aria-label="Imagen anterior"
            >
              <span className="text-slate-800 text-xl">‹</span>
            </button>

            {/* Botón siguiente */}
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
              aria-label="Imagen siguiente"
            >
              <span className="text-slate-800 text-xl">›</span>
            </button>

            {/* Indicador de posición */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1.5">
              {allImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === selectedIndex
                      ? "bg-white w-6"
                      : "bg-white/50 hover:bg-white/75"
                  }`}
                  aria-label={`Ver imagen ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}

        {/* Badge de cantidad */}
        {allImages.length > 1 && (
          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full">
            {selectedIndex + 1} / {allImages.length}
          </div>
        )}
      </div>

      {/* Miniaturas (si hay más de 1 imagen) */}
      {allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {allImages.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setSelectedIndex(index)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                index === selectedIndex
                  ? "border-pink-500 ring-2 ring-pink-200"
                  : "border-slate-200 hover:border-pink-300"
              }`}
            >
              <img
                src={image.url}
                alt={image.alt || `Vista ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Navegación con teclado */}
      {allImages.length > 1 && (
        <p className="text-xs text-slate-500 text-center">
          Usa las flechas ← → del teclado para navegar
        </p>
      )}
    </div>
  );
}
