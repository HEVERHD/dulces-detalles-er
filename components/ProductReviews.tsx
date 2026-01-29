"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

interface ReviewImage {
  id: string;
  url: string;
}

interface Review {
  id: string;
  authorName: string;
  rating: number;
  comment: string | null;
  images?: ReviewImage[];
  createdAt: string;
}

interface ReviewStats {
  total: number;
  averageRating: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

interface ProductReviewsProps {
  productId: string;
  productName: string;
}

export default function ProductReviews({
  productId,
  productName,
}: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [authorName, setAuthorName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Photo upload state
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lightbox state
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/reviews?productId=${productId}`);
      const data = await res.json();
      setReviews(data.reviews || []);
      setStats(data.stats || null);
    } catch (error) {
      console.error("Error al cargar reseñas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remaining = 3 - uploadedPhotos.length;
    if (remaining <= 0) return;

    const filesToUpload = Array.from(files).slice(0, remaining);
    setIsUploading(true);

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    for (const file of filesToUpload) {
      if (file.size > 8 * 1024 * 1024) continue; // max 8MB
      if (!file.type.startsWith("image/")) continue;

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", uploadPreset || "dulces_unsigned");

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName || "dmfcu3tnj"}/image/upload`,
          { method: "POST", body: formData }
        );
        const data = await res.json();

        if (data.secure_url) {
          setUploadedPhotos((prev) => [...prev, data.secure_url]);
        }
      } catch (err) {
        console.error("Error subiendo foto:", err);
      }
    }

    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removePhoto = (index: number) => {
    setUploadedPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          authorName: authorName.trim(),
          rating,
          comment: comment.trim(),
          imageUrls: uploadedPhotos,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSubmitMessage({
          type: "success",
          text: "¡Gracias por tu reseña! Será visible una vez aprobada.",
        });
        setAuthorName("");
        setRating(5);
        setComment("");
        setUploadedPhotos([]);
        setShowForm(false);
      } else {
        setSubmitMessage({
          type: "error",
          text: data.error || "Error al enviar reseña",
        });
      }
    } catch (error) {
      setSubmitMessage({
        type: "error",
        text: "Error al enviar reseña. Intenta de nuevo.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating: number, size: "sm" | "md" | "lg" = "md") => {
    const sizeClass = {
      sm: "text-sm",
      md: "text-lg",
      lg: "text-2xl",
    }[size];

    return (
      <div className={`flex items-center gap-0.5 ${sizeClass}`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={star <= rating ? "text-amber-400" : "text-slate-300"}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="py-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-pink-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header y stats */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span>⭐</span>
          Reseñas y Calificaciones
        </h2>

        {stats && stats.total > 0 ? (
          <div className="bg-gradient-to-r from-amber-50 to-pink-50 rounded-xl p-6 border border-amber-100">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Promedio */}
              <div className="text-center">
                <div className="text-5xl font-bold text-slate-800 mb-2">
                  {stats.averageRating.toFixed(1)}
                </div>
                {renderStars(Math.round(stats.averageRating), "lg")}
                <p className="text-sm text-slate-600 mt-2">
                  Basado en {stats.total}{" "}
                  {stats.total === 1 ? "reseña" : "reseñas"}
                </p>
              </div>

              {/* Distribución */}
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = stats.ratingDistribution[stars as keyof typeof stats.ratingDistribution];
                  const percentage =
                    stats.total > 0 ? (count / stats.total) * 100 : 0;

                  return (
                    <div key={stars} className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-700 w-8">
                        {stars}★
                      </span>
                      <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-600 w-8 text-right">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 rounded-xl p-6 text-center">
            <p className="text-slate-600">
              Este producto aún no tiene reseñas. ¡Sé el primero en opinar!
            </p>
          </div>
        )}
      </div>

      {/* Botón para mostrar formulario */}
      {submitMessage?.type === "success" && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
          {submitMessage.text}
        </div>
      )}

      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-pink-600 hover:bg-pink-700 text-white font-semibold px-6 py-3 shadow-md transition-all"
        >
          ✍️ Escribir reseña
        </button>
      )}

      {/* Formulario */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl border border-slate-200 p-6 space-y-4"
        >
          <h3 className="text-lg font-semibold text-slate-800">
            Comparte tu experiencia
          </h3>

          {submitMessage?.type === "error" && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
              {submitMessage.text}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tu nombre *
            </label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              required
              minLength={2}
              maxLength={50}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="Escribe tu nombre"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Calificación *
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="text-3xl transition-all hover:scale-110"
                >
                  <span
                    className={
                      star <= rating ? "text-amber-400" : "text-slate-300"
                    }
                  >
                    ★
                  </span>
                </button>
              ))}
              <span className="ml-2 text-sm text-slate-600">
                {rating === 5 && "Excelente"}
                {rating === 4 && "Muy bueno"}
                {rating === 3 && "Bueno"}
                {rating === 2 && "Regular"}
                {rating === 1 && "Malo"}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tu opinión (opcional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={500}
              rows={4}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
              placeholder="Cuéntanos qué te pareció este detalle..."
            />
            <p className="text-xs text-slate-500 mt-1">
              {comment.length}/500 caracteres
            </p>
          </div>

          {/* Subida de fotos */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Fotos del producto (opcional, máx. 3)
            </label>

            {/* Previews */}
            {uploadedPhotos.length > 0 && (
              <div className="flex gap-3 mb-3 flex-wrap">
                {uploadedPhotos.map((url, i) => (
                  <div key={i} className="relative group">
                    <div className="w-20 h-20 rounded-lg overflow-hidden border border-slate-200">
                      <Image
                        src={url}
                        alt={`Foto ${i + 1}`}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {uploadedPhotos.length < 3 && (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-4 py-2 border-2 border-dashed border-slate-300 rounded-lg text-sm text-slate-600 hover:border-pink-400 hover:text-pink-600 transition-colors disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <span className="inline-block animate-spin h-4 w-4 border-2 border-pink-500 border-t-transparent rounded-full"></span>
                      Subiendo...
                    </>
                  ) : (
                    <>
                      📷 Agregar fotos
                    </>
                  )}
                </button>
                <p className="text-xs text-slate-400 mt-1">
                  JPG, PNG o WebP. Máximo 8MB por foto.
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="flex-1 bg-pink-600 hover:bg-pink-700 disabled:bg-slate-400 text-white font-semibold py-2 px-4 rounded-lg transition-all"
            >
              {isSubmitting ? "Enviando..." : "Enviar reseña"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setSubmitMessage(null);
                setUploadedPhotos([]);
              }}
              className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-all"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Lista de reseñas */}
      {reviews.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-800">
            Todas las reseñas ({reviews.length})
          </h3>

          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-xl border border-slate-200 p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-slate-800">
                    {review.authorName}
                  </p>
                  {renderStars(review.rating, "sm")}
                </div>
                <p className="text-xs text-slate-500">
                  {new Date(review.createdAt).toLocaleDateString("es-ES", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              {review.comment && (
                <p className="text-sm text-slate-700 leading-relaxed">
                  {review.comment}
                </p>
              )}

              {/* Fotos de la reseña */}
              {review.images && review.images.length > 0 && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  {review.images.map((img) => (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => setLightboxUrl(img.url)}
                      className="w-16 h-16 rounded-lg overflow-hidden border border-slate-200 hover:border-pink-400 transition-colors cursor-pointer"
                    >
                      <Image
                        src={img.url}
                        alt="Foto de reseña"
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh] w-full">
            <button
              type="button"
              onClick={() => setLightboxUrl(null)}
              className="absolute -top-10 right-0 text-white text-sm hover:underline"
            >
              ✕ Cerrar
            </button>
            <Image
              src={lightboxUrl}
              alt="Foto ampliada"
              width={800}
              height={800}
              className="w-full h-auto max-h-[85vh] object-contain rounded-xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
