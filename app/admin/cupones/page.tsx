"use client";

import { useState, useEffect } from "react";

interface Coupon {
  id: string;
  code: string;
  type: string;
  value: number;
  minPurchase: number | null;
  maxUses: number | null;
  usedCount: number;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
}

interface CouponForm {
  code: string;
  type: "percentage" | "fixed";
  value: string;
  minPurchase: string;
  maxUses: string;
  isActive: boolean;
  expiresAt: string;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, expired: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCouponId, setEditingCouponId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState<CouponForm>({
    code: "",
    type: "percentage",
    value: "",
    minPurchase: "",
    maxUses: "",
    isActive: true,
    expiresAt: "",
  });

  const [feedbackModal, setFeedbackModal] = useState<{
    isOpen: boolean;
    type: "success" | "error";
    message: string;
  }>({ isOpen: false, type: "success", message: "" });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/coupons");
      const data = await res.json();
      setCoupons(data.coupons || []);
      setStats(data.stats || { total: 0, active: 0, expired: 0 });
    } catch (error) {
      console.error("Error al cargar cupones:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      code: "",
      type: "percentage",
      value: "",
      minPurchase: "",
      maxUses: "",
      isActive: true,
      expiresAt: "",
    });
    setEditingCouponId(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (coupon: Coupon) => {
    setForm({
      code: coupon.code,
      type: coupon.type as "percentage" | "fixed",
      value: coupon.value.toString(),
      minPurchase: coupon.minPurchase?.toString() || "",
      maxUses: coupon.maxUses?.toString() || "",
      isActive: coupon.isActive,
      expiresAt: coupon.expiresAt
        ? new Date(coupon.expiresAt).toISOString().split("T")[0]
        : "",
    });
    setEditingCouponId(coupon.id);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const payload = {
        code: form.code.trim().toUpperCase(),
        type: form.type,
        value: parseInt(form.value),
        minPurchase: form.minPurchase ? parseInt(form.minPurchase) : null,
        maxUses: form.maxUses ? parseInt(form.maxUses) : null,
        isActive: form.isActive,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
      };

      let res;
      if (editingCouponId) {
        res = await fetch(`/api/admin/coupons?id=${editingCouponId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/admin/coupons", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();

      if (res.ok) {
        setFeedbackModal({
          isOpen: true,
          type: "success",
          message: editingCouponId
            ? "Cupón actualizado correctamente"
            : "Cupón creado correctamente",
        });
        setIsModalOpen(false);
        resetForm();
        fetchCoupons();
      } else {
        setFeedbackModal({
          isOpen: true,
          type: "error",
          message: data.error || "Error al guardar cupón",
        });
      }
    } catch (error) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        message: "Error al guardar cupón",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`¿Eliminar el cupón "${code}"?`)) return;

    try {
      const res = await fetch(`/api/admin/coupons?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setFeedbackModal({
          isOpen: true,
          type: "success",
          message: "Cupón eliminado correctamente",
        });
        fetchCoupons();
      } else {
        const data = await res.json();
        setFeedbackModal({
          isOpen: true,
          type: "error",
          message: data.error || "Error al eliminar cupón",
        });
      }
    } catch (error) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        message: "Error al eliminar cupón",
      });
    }
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Cupones de Descuento</h1>
          <p className="text-sm text-slate-600 mt-1">
            Gestiona códigos de descuento para tus clientes
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-full bg-pink-600 hover:bg-pink-700 text-white font-semibold px-5 py-2.5 shadow-md transition-all"
        >
          <span>+</span>
          Crear cupón
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
          <p className="text-sm text-blue-700 font-medium">Total</p>
          <p className="text-3xl font-bold text-blue-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border border-green-200">
          <p className="text-sm text-green-700 font-medium">Activos</p>
          <p className="text-3xl font-bold text-green-900 mt-1">{stats.active}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-5 border border-amber-200">
          <p className="text-sm text-amber-700 font-medium">Expirados</p>
          <p className="text-3xl font-bold text-amber-900 mt-1">{stats.expired}</p>
        </div>
      </div>

      {/* Lista de cupones */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-pink-600 border-t-transparent"></div>
        </div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200">
          <p className="text-slate-600">No hay cupones creados aún</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left text-xs font-semibold text-slate-700 px-4 py-3">
                    Código
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-700 px-4 py-3">
                    Tipo
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-700 px-4 py-3">
                    Valor
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-700 px-4 py-3">
                    Usos
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-700 px-4 py-3">
                    Expira
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-700 px-4 py-3">
                    Estado
                  </th>
                  <th className="text-right text-xs font-semibold text-slate-700 px-4 py-3">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {coupons.map((coupon) => {
                  const expired = isExpired(coupon.expiresAt);
                  const reachedMaxUses =
                    coupon.maxUses && coupon.usedCount >= coupon.maxUses;

                  return (
                    <tr key={coupon.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <span className="font-mono font-bold text-sm text-pink-600">
                          {coupon.code}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-slate-700">
                          {coupon.type === "percentage" ? "Porcentaje" : "Fijo"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-semibold text-slate-800">
                          {coupon.type === "percentage"
                            ? `${coupon.value}%`
                            : `$${coupon.value.toLocaleString()}`}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-slate-700">
                          {coupon.usedCount}
                          {coupon.maxUses ? ` / ${coupon.maxUses}` : ""}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {coupon.expiresAt ? (
                          <span
                            className={`text-xs ${
                              expired ? "text-red-600" : "text-slate-600"
                            }`}
                          >
                            {new Date(coupon.expiresAt).toLocaleDateString("es-ES")}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">Sin límite</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {!coupon.isActive ? (
                          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 text-xs font-semibold px-2 py-1 rounded-full">
                            Inactivo
                          </span>
                        ) : expired ? (
                          <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 text-xs font-semibold px-2 py-1 rounded-full">
                            Expirado
                          </span>
                        ) : reachedMaxUses ? (
                          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-1 rounded-full">
                            Agotado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">
                            ✓ Activo
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(coupon)}
                            className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(coupon.id, coupon.code)}
                            className="text-xs text-red-600 hover:text-red-700 font-semibold"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de formulario */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4">
              <h2 className="text-xl font-bold text-slate-800">
                {editingCouponId ? "Editar Cupón" : "Crear Cupón"}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Código */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Código del cupón *
                </label>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) =>
                    setForm({ ...form, code: e.target.value.toUpperCase() })
                  }
                  required
                  maxLength={20}
                  placeholder="VERANO2026"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent font-mono"
                />
              </div>

              {/* Tipo */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Tipo de descuento *
                </label>
                <select
                  value={form.type}
                  onChange={(e) =>
                    setForm({ ...form, type: e.target.value as "percentage" | "fixed" })
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="percentage">Porcentaje (%)</option>
                  <option value="fixed">Monto fijo (COP)</option>
                </select>
              </div>

              {/* Valor */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Valor del descuento *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={form.value}
                    onChange={(e) => setForm({ ...form, value: e.target.value })}
                    required
                    min="1"
                    max={form.type === "percentage" ? "100" : undefined}
                    placeholder={form.type === "percentage" ? "10" : "50000"}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                    {form.type === "percentage" ? "%" : "COP"}
                  </span>
                </div>
              </div>

              {/* Compra mínima */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Compra mínima (opcional)
                </label>
                <input
                  type="number"
                  value={form.minPurchase}
                  onChange={(e) => setForm({ ...form, minPurchase: e.target.value })}
                  min="0"
                  placeholder="100000"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Total mínimo del carrito para aplicar el cupón
                </p>
              </div>

              {/* Límite de usos */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Límite de usos (opcional)
                </label>
                <input
                  type="number"
                  value={form.maxUses}
                  onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                  min="1"
                  placeholder="100"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Número máximo de veces que se puede usar el cupón
                </p>
              </div>

              {/* Fecha de expiración */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Fecha de expiración (opcional)
                </label>
                <input
                  type="date"
                  value={form.expiresAt}
                  onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              {/* Estado */}
              <div>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="rounded border-slate-300"
                  />
                  <span className="text-sm text-slate-700">Cupón activo</span>
                </label>
              </div>

              {/* Botones */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="px-5 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-pink-600 hover:bg-pink-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isSaving ? "Guardando..." : "Guardar cupón"}
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
