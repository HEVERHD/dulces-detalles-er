"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

interface Product {
  id: string;
  name: string;
  slug: string;
  image: string;
}

interface ReviewImage {
  id: string;
  url: string;
}

interface Review {
  id: string;
  authorName: string;
  rating: number;
  comment: string | null;
  isApproved: boolean;
  createdAt: string;
  product: Product;
  images?: ReviewImage[];
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0 });
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("pending");
  const [isLoading, setIsLoading] = useState(true);
  const [feedbackModal, setFeedbackModal] = useState<{
    isOpen: boolean;
    type: "success" | "error";
    message: string;
  }>({ isOpen: false, type: "success", message: "" });
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
  }, [filter]);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/admin/reviews?status=${filter}`);
      const data = await res.json();
      setReviews(data.reviews || []);
      setStats(data.stats || { total: 0, pending: 0, approved: 0 });
    } catch (error) {
      console.error("Error al cargar reseñas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: true }),
      });

      if (res.ok) {
        setFeedbackModal({
          isOpen: true,
          type: "success",
          message: "Reseña aprobada correctamente",
        });
        fetchReviews();
      } else {
        setFeedbackModal({
          isOpen: true,
          type: "error",
          message: "Error al aprobar reseña",
        });
      }
    } catch (error) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        message: "Error al aprobar reseña",
      });
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm("¿Rechazar esta reseña? Se marcará como no aprobada.")) return;

    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: false }),
      });

      if (res.ok) {
        setFeedbackModal({
          isOpen: true,
          type: "success",
          message: "Reseña rechazada",
        });
        fetchReviews();
      } else {
        setFeedbackModal({
          isOpen: true,
          type: "error",
          message: "Error al rechazar reseña",
        });
      }
    } catch (error) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        message: "Error al rechazar reseña",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta reseña permanentemente?")) return;

    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setFeedbackModal({
          isOpen: true,
          type: "success",
          message: "Reseña eliminada correctamente",
        });
        fetchReviews();
      } else {
        setFeedbackModal({
          isOpen: true,
          type: "error",
          message: "Error al eliminar reseña",
        });
      }
    } catch (error) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        message: "Error al eliminar reseña",
      });
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-lg ${
              star <= rating ? "text-amber-400" : "text-slate-300"
            }`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Moderación de Reseñas</h1>
        <p className="text-sm text-slate-600 mt-1">
          Aprueba o rechaza reseñas de clientes
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
          <p className="text-sm text-blue-700 font-medium">Total</p>
          <p className="text-3xl font-bold text-blue-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-5 border border-amber-200">
          <p className="text-sm text-amber-700 font-medium">Pendientes</p>
          <p className="text-3xl font-bold text-amber-900 mt-1">{stats.pending}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border border-green-200">
          <p className="text-sm text-green-700 font-medium">Aprobadas</p>
          <p className="text-3xl font-bold text-green-900 mt-1">{stats.approved}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter("pending")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            filter === "pending"
              ? "bg-amber-100 text-amber-800"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          Pendientes ({stats.pending})
        </button>
        <button
          onClick={() => setFilter("approved")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            filter === "approved"
              ? "bg-green-100 text-green-800"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          Aprobadas ({stats.approved})
        </button>
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            filter === "all"
              ? "bg-blue-100 text-blue-800"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          Todas ({stats.total})
        </button>
      </div>

      {/* Lista de reseñas */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-pink-600 border-t-transparent"></div>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200">
          <p className="text-slate-600">No hay reseñas {filter === "pending" ? "pendientes" : filter === "approved" ? "aprobadas" : ""}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex gap-4">
                {/* Imagen del producto */}
                <Link
                  href={`/producto/${review.product.slug}`}
                  target="_blank"
                  className="flex-shrink-0"
                >
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-100 hover:ring-2 hover:ring-pink-500 transition-all">
                    <img
                      src={review.product.image}
                      alt={review.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </Link>

                {/* Contenido */}
                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <Link
                        href={`/producto/${review.product.slug}`}
                        target="_blank"
                        className="text-sm font-semibold text-slate-800 hover:text-pink-600 line-clamp-1"
                      >
                        {review.product.name}
                      </Link>
                      <p className="text-xs text-slate-500 mt-1">
                        Por: <span className="font-semibold">{review.authorName}</span> ·{" "}
                        {new Date(review.createdAt).toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>

                    {/* Estado */}
                    {review.isApproved ? (
                      <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                        ✓ Aprobada
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1 rounded-full">
                        ⏳ Pendiente
                      </span>
                    )}
                  </div>

                  {/* Calificación */}
                  <div className="mb-3">{renderStars(review.rating)}</div>

                  {/* Comentario */}
                  {review.comment && (
                    <div className="bg-slate-50 rounded-lg p-3 mb-3">
                      <p className="text-sm text-slate-700 leading-relaxed">
                        "{review.comment}"
                      </p>
                    </div>
                  )}

                  {/* Fotos adjuntas */}
                  {review.images && review.images.length > 0 && (
                    <div className="flex gap-2 mb-3 flex-wrap">
                      <span className="text-xs text-slate-500 self-center mr-1">📷 Fotos:</span>
                      {review.images.map((img) => (
                        <button
                          key={img.id}
                          type="button"
                          onClick={() => setLightboxUrl(img.url)}
                          className="w-14 h-14 rounded-lg overflow-hidden border border-slate-200 hover:border-pink-400 hover:ring-2 hover:ring-pink-200 transition-all cursor-pointer"
                        >
                          <Image
                            src={img.url}
                            alt="Foto de reseña"
                            width={56}
                            height={56}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Acciones */}
                  <div className="flex items-center gap-3">
                    {!review.isApproved ? (
                      <button
                        onClick={() => handleApprove(review.id)}
                        className="text-sm text-green-600 hover:text-green-700 font-semibold"
                      >
                        ✓ Aprobar
                      </button>
                    ) : (
                      <button
                        onClick={() => handleReject(review.id)}
                        className="text-sm text-amber-600 hover:text-amber-700 font-semibold"
                      >
                        Rechazar
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="text-sm text-red-600 hover:text-red-700 font-semibold"
                    >
                      Eliminar
                    </button>
                    <Link
                      href={`/producto/${review.product.slug}`}
                      target="_blank"
                      className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      Ver producto →
                    </Link>
                  </div>
                </div>
              </div>
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

      {/* Modal de feedback */}
      {feedbackModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center">
            <div
              className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                feedbackModal.type === "success"
                  ? "bg-green-100 text-green-600"
                  : "bg-red-100 text-red-600"
              }`}
            >
              <span className="text-3xl">
                {feedbackModal.type === "success" ? "✓" : "!"}
              </span>
            </div>
            <p className="text-slate-800 font-medium mb-4">{feedbackModal.message}</p>
            <button
              onClick={() =>
                setFeedbackModal({ isOpen: false, type: "success", message: "" })
              }
              className="px-6 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
