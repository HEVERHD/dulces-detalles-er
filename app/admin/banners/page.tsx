"use client";

import { useState, useEffect } from "react";
import ImageUploader from "@/components/admin/ImageUploader";
import { useGlobalLoader } from "@/components/providers/LoaderProvider";

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
  createdAt: string;
  updatedAt: string;
}

type FormData = {
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  buttonText: string;
  buttonLink: string;
  order: string;
  isActive: boolean;
};

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { showLoader, hideLoader } = useGlobalLoader();

  const [form, setForm] = useState<FormData>({
    title: "",
    subtitle: "",
    description: "",
    imageUrl: "",
    buttonText: "",
    buttonLink: "",
    order: "0",
    isActive: true,
  });

  const [feedbackModal, setFeedbackModal] = useState<{
    isOpen: boolean;
    type: "success" | "error";
    message: string;
  }>({ isOpen: false, type: "success", message: "" });

  const openFeedback = (type: "success" | "error", message: string) => {
    setFeedbackModal({ isOpen: true, type, message });
  };

  const fetchBanners = async () => {
    try {
      showLoader();
      setIsLoading(true);
      const res = await fetch("/api/banners?includeInactive=true");
      if (!res.ok) throw new Error("Error al cargar banners");
      const data = await res.json();
      setBanners(data);
    } catch (error) {
      console.error("Error:", error);
      openFeedback("error", "Error al cargar los banners");
    } finally {
      setIsLoading(false);
      hideLoader();
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const resetForm = () => {
    setForm({
      title: "",
      subtitle: "",
      description: "",
      imageUrl: "",
      buttonText: "",
      buttonLink: "",
      order: "0",
      isActive: true,
    });
    setEditingBanner(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (banner: Banner) => {
    setForm({
      title: banner.title,
      subtitle: banner.subtitle || "",
      description: banner.description || "",
      imageUrl: banner.imageUrl,
      buttonText: banner.buttonText || "",
      buttonLink: banner.buttonLink || "",
      order: String(banner.order),
      isActive: banner.isActive,
    });
    setEditingBanner(banner);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim() || !form.imageUrl.trim()) {
      openFeedback("error", "Título e imagen son obligatorios");
      return;
    }

    try {
      showLoader();
      setIsSaving(true);

      const payload = {
        ...(editingBanner && { id: editingBanner.id }),
        title: form.title.trim(),
        subtitle: form.subtitle.trim() || null,
        description: form.description.trim() || null,
        imageUrl: form.imageUrl.trim(),
        buttonText: form.buttonText.trim() || null,
        buttonLink: form.buttonLink.trim() || null,
        order: parseInt(form.order) || 0,
        isActive: form.isActive,
      };

      const res = await fetch("/api/banners", {
        method: editingBanner ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Error al guardar banner");

      openFeedback(
        "success",
        editingBanner ? "Banner actualizado correctamente" : "Banner creado correctamente"
      );

      await fetchBanners();
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error:", error);
      openFeedback("error", "Error al guardar el banner");
    } finally {
      setIsSaving(false);
      hideLoader();
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`¿Eliminar el banner "${title}"?`)) return;

    try {
      showLoader();
      const res = await fetch(`/api/banners?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar banner");

      openFeedback("success", "Banner eliminado correctamente");
      await fetchBanners();
    } catch (error) {
      console.error("Error:", error);
      openFeedback("error", "Error al eliminar el banner");
    } finally {
      hideLoader();
    }
  };

  const handleMoveUp = async (banner: Banner, currentIndex: number) => {
    if (currentIndex === 0) return;

    const prevBanner = banners[currentIndex - 1];

    try {
      showLoader();

      await fetch("/api/banners", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...banner, order: banner.order - 1 }),
      });

      await fetch("/api/banners", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...prevBanner, order: prevBanner.order + 1 }),
      });

      await fetchBanners();
    } catch (error) {
      console.error("Error:", error);
      openFeedback("error", "Error al reordenar banners");
    } finally {
      hideLoader();
    }
  };

  const handleMoveDown = async (banner: Banner, currentIndex: number) => {
    if (currentIndex === banners.length - 1) return;

    const nextBanner = banners[currentIndex + 1];

    try {
      showLoader();

      await fetch("/api/banners", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...banner, order: banner.order + 1 }),
      });

      await fetch("/api/banners", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...nextBanner, order: nextBanner.order - 1 }),
      });

      await fetchBanners();
    } catch (error) {
      console.error("Error:", error);
      openFeedback("error", "Error al reordenar banners");
    } finally {
      hideLoader();
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Banners del Home</h1>
          <p className="text-sm text-slate-600 mt-1">
            Gestiona los slides del carousel principal
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-full bg-pink-600 hover:bg-pink-700 text-white font-semibold px-5 py-2.5 shadow-md transition-all text-sm"
        >
          ➕ Nuevo Banner
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
          <p className="text-sm text-blue-700 font-medium">Total</p>
          <p className="text-3xl font-bold text-blue-900 mt-1">{banners.length}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border border-green-200">
          <p className="text-sm text-green-700 font-medium">Activos</p>
          <p className="text-3xl font-bold text-green-900 mt-1">
            {banners.filter((b) => b.isActive).length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-5 border border-slate-200">
          <p className="text-sm text-slate-700 font-medium">Inactivos</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">
            {banners.filter((b) => !b.isActive).length}
          </p>
        </div>
      </div>

      {/* Listado de banners */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-pink-600 border-t-transparent"></div>
          <p className="mt-3 text-sm text-slate-500">Cargando banners...</p>
        </div>
      ) : banners.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200">
          <div className="text-5xl mb-3">📸</div>
          <p className="text-slate-600">No hay banners creados</p>
          <p className="text-sm text-slate-400 mt-1">Crea el primer banner para el carousel</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all overflow-hidden"
            >
              {/* Imagen */}
              <div className="relative aspect-video bg-slate-100">
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                />
                {!banner.isActive && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="bg-slate-900/90 text-white text-xs font-bold px-3 py-1 rounded-full">
                      INACTIVO
                    </span>
                  </div>
                )}
                <div className="absolute top-2 left-2 bg-white/90 text-xs font-bold px-2 py-1 rounded-md">
                  Orden: {banner.order}
                </div>
              </div>

              {/* Contenido */}
              <div className="p-4">
                <h3 className="text-sm font-bold text-slate-900 line-clamp-1 mb-1">
                  {banner.title}
                </h3>
                {banner.subtitle && (
                  <p className="text-xs text-slate-600 line-clamp-1 mb-2">
                    {banner.subtitle}
                  </p>
                )}
                {banner.description && (
                  <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                    {banner.description}
                  </p>
                )}

                {/* Botones */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => handleMoveUp(banner, index)}
                    disabled={index === 0}
                    className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Mover arriba"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>

                  <button
                    onClick={() => handleMoveDown(banner, index)}
                    disabled={index === banners.length - 1}
                    className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Mover abajo"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  <div className="flex-1"></div>

                  <button
                    onClick={() => openEditModal(banner)}
                    className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
                    title="Editar"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>

                  <button
                    onClick={() => handleDelete(banner.id, banner.title)}
                    className="p-2 rounded-lg text-red-600 hover:bg-red-50"
                    title="Eliminar"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Crear/Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">
                {editingBanner ? "Editar Banner" : "Nuevo Banner"}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Título *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-pink-300 focus:border-pink-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Subtítulo
                </label>
                <input
                  type="text"
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-pink-300 focus:border-pink-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-pink-300 focus:border-pink-400 resize-none"
                />
              </div>

              <ImageUploader
                value={form.imageUrl}
                onChange={(url) => setForm({ ...form, imageUrl: url })}
                label="Imagen del banner *"
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Texto del botón
                  </label>
                  <input
                    type="text"
                    value={form.buttonText}
                    onChange={(e) => setForm({ ...form, buttonText: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-pink-300 focus:border-pink-400"
                    placeholder="Ej: Ver más"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Link del botón
                  </label>
                  <input
                    type="text"
                    value={form.buttonLink}
                    onChange={(e) => setForm({ ...form, buttonLink: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-pink-300 focus:border-pink-400"
                    placeholder="/productos"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Orden
                  </label>
                  <input
                    type="number"
                    value={form.order}
                    onChange={(e) => setForm({ ...form, order: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-pink-300 focus:border-pink-400"
                  />
                </div>

                <div className="flex items-end">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                      className="rounded border-slate-300"
                    />
                    Banner activo
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-pink-600 hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? "Guardando..." : editingBanner ? "Guardar Cambios" : "Crear Banner"}
                </button>
              </div>
            </form>
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
              <span className="text-3xl">{feedbackModal.type === "success" ? "✓" : "!"}</span>
            </div>
            <p className="text-slate-800 font-medium mb-4">{feedbackModal.message}</p>
            <button
              onClick={() => setFeedbackModal({ isOpen: false, type: "success", message: "" })}
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
