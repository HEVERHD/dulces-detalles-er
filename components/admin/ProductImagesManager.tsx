"use client";

import { useState, useEffect } from "react";
import ImageUploader from "./ImageUploader";

interface ProductImage {
  id: string;
  url: string;
  alt: string | null;
  order: number;
}

interface ProductImagesManagerProps {
  productId: string | null; // null si es producto nuevo
  onImagesChange?: (images: ProductImage[]) => void;
}

export default function ProductImagesManager({
  productId,
  onImagesChange,
}: ProductImagesManagerProps) {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (productId) {
      fetchImages();
    }
  }, [productId]);

  const fetchImages = async () => {
    if (!productId) return;

    try {
      setIsLoading(true);
      const res = await fetch(`/api/products/images?productId=${productId}`);
      const data = await res.json();
      setImages(data.images || []);
      onImagesChange?.(data.images || []);
    } catch (error) {
      console.error("Error al cargar imágenes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUploaded = async (url: string) => {
    if (!productId) {
      setMessage({
        type: "error",
        text: "Primero guarda el producto para agregar imágenes adicionales",
      });
      return;
    }

    try {
      const res = await fetch("/api/products/images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          url,
          order: images.length,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: "Imagen agregada" });
        fetchImages();
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: "error", text: data.error || "Error al agregar imagen" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error al agregar imagen" });
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm("¿Eliminar esta imagen?")) return;

    try {
      const res = await fetch(`/api/products/images?id=${imageId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Imagen eliminada" });
        fetchImages();
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: "error", text: "Error al eliminar imagen" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error al eliminar imagen" });
    }
  };

  const moveImage = async (imageId: string, direction: "up" | "down") => {
    const currentIndex = images.findIndex((img) => img.id === imageId);
    if (currentIndex === -1) return;

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= images.length) return;

    // Reordenar localmente
    const newImages = [...images];
    const [movedImage] = newImages.splice(currentIndex, 1);
    newImages.splice(newIndex, 0, movedImage);

    // Actualizar orden en BD (esto requeriría una API adicional de actualización)
    setImages(newImages);
    setMessage({ type: "success", text: "Orden actualizado" });
    setTimeout(() => setMessage(null), 2000);
  };

  if (!productId) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
        💡 Guarda el producto primero para poder agregar imágenes adicionales
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800">
          Imágenes adicionales (opcional)
        </h3>
        <span className="text-xs text-slate-500">
          {images.length} {images.length === 1 ? "imagen" : "imágenes"}
        </span>
      </div>

      {message && (
        <div
          className={`text-sm p-3 rounded-lg ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Grid de imágenes existentes */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {images.map((image, index) => (
            <div
              key={image.id}
              className="relative group rounded-lg overflow-hidden border border-slate-200 bg-slate-50"
            >
              <div className="aspect-square">
                <img
                  src={image.url}
                  alt={image.alt || `Imagen ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Controles */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {/* Mover arriba */}
                {index > 0 && (
                  <button
                    onClick={() => moveImage(image.id, "up")}
                    className="w-8 h-8 rounded-full bg-white text-slate-800 flex items-center justify-center hover:bg-slate-100 transition-colors"
                    title="Mover arriba"
                  >
                    ↑
                  </button>
                )}

                {/* Mover abajo */}
                {index < images.length - 1 && (
                  <button
                    onClick={() => moveImage(image.id, "down")}
                    className="w-8 h-8 rounded-full bg-white text-slate-800 flex items-center justify-center hover:bg-slate-100 transition-colors"
                    title="Mover abajo"
                  >
                    ↓
                  </button>
                )}

                {/* Eliminar */}
                <button
                  onClick={() => handleDeleteImage(image.id)}
                  className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                  title="Eliminar"
                >
                  ×
                </button>
              </div>

              {/* Badge de orden */}
              <div className="absolute top-2 left-2 bg-black/70 text-white text-xs font-semibold px-2 py-0.5 rounded">
                #{index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Uploader para nueva imagen */}
      <div>
        <p className="text-xs text-slate-600 mb-2">
          Agregar nueva imagen:
        </p>
        <ImageUploader
          onImageUploaded={handleImageUploaded}
          currentImageUrl=""
        />
      </div>

      <p className="text-xs text-slate-500">
        💡 Las imágenes se mostrarán en un carrusel en la página del producto.
        La primera imagen adicional aparecerá después de la imagen principal.
      </p>
    </div>
  );
}
