"use client";

import { useState, useEffect } from "react";

interface Review {
  id: string;
  authorName: string;
  rating: number;
  comment: string | null;
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

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-pink-600 hover:bg-pink-700 disabled:bg-slate-400 text-white font-semibold py-2 px-4 rounded-lg transition-all"
            >
              {isSubmitting ? "Enviando..." : "Enviar reseña"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setSubmitMessage(null);
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
