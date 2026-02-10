"use client";

import { useState, useEffect, useCallback } from "react";
import { BRANCHES } from "@/config/branches";

const STATUSES = [
  { key: "received", label: "Recibido", color: "bg-amber-100 text-amber-700" },
  { key: "confirmed", label: "Confirmado", color: "bg-blue-100 text-blue-700" },
  { key: "preparing", label: "En preparación", color: "bg-pink-100 text-pink-700" },
  { key: "delivered", label: "Entregado", color: "bg-green-100 text-green-700" },
] as const;

const STATUS_NEXT: Record<string, string> = {
  received: "confirmed",
  confirmed: "preparing",
  preparing: "delivered",
};

const STATUS_NEXT_LABEL: Record<string, string> = {
  received: "Confirmar pedido",
  confirmed: "Marcar en preparación",
  preparing: "Marcar como entregado",
};

interface OrderItem {
  id: string;
  productName: string;
  productImage: string | null;
  quantity: number;
  priceAtTime: number;
  total: number;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string | null;
  selectedBranch: string;
  subtotal: number;
  couponCode: string | null;
  discountAmount: number;
  total: number;
  status: string;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

interface Stats {
  total: number;
  received: number;
  confirmed: number;
  preparing: number;
  delivered: number;
}

interface Pagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

function formatPrice(value: number) {
  return value.toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });
}

function getStatusBadge(status: string) {
  const s = STATUSES.find((st) => st.key === status);
  if (!s) return { label: status, color: "bg-slate-100 text-slate-700" };
  return s;
}

export default function AdminPedidosPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, received: 0, confirmed: 0, preparing: 0, delivered: 0 });
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, totalCount: 0, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Filtros
  const [filterStatus, setFilterStatus] = useState("");
  const [filterBranch, setFilterBranch] = useState("");
  const [filterSearch, setFilterSearch] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal detalle
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const [feedbackModal, setFeedbackModal] = useState<{
    isOpen: boolean;
    type: "success" | "error";
    message: string;
  }>({ isOpen: false, type: "success", message: "" });

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (filterStatus) params.set("status", filterStatus);
      if (filterBranch) params.set("branch", filterBranch);
      if (filterSearch) params.set("search", filterSearch);
      if (filterDateFrom) params.set("dateFrom", filterDateFrom);
      if (filterDateTo) params.set("dateTo", filterDateTo);
      params.set("page", currentPage.toString());

      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      const data = await res.json();

      if (data.ok) {
        setOrders(data.orders || []);
        setStats(data.stats || { total: 0, received: 0, confirmed: 0, preparing: 0, delivered: 0 });
        setPagination(data.pagination || { page: 1, limit: 20, totalCount: 0, totalPages: 0 });
      }
    } catch (error) {
      console.error("Error cargando pedidos:", error);
    } finally {
      setIsLoading(false);
    }
  }, [filterStatus, filterBranch, filterSearch, filterDateFrom, filterDateTo, currentPage]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const openDetail = async (order: Order) => {
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`);
      const data = await res.json();
      if (data.ok) {
        setSelectedOrder(data.order);
        setAdminNotes(data.order.adminNotes || "");
      } else {
        setSelectedOrder(order);
        setAdminNotes(order.adminNotes || "");
      }
    } catch {
      setSelectedOrder(order);
      setAdminNotes(order.adminNotes || "");
    }
    setIsDetailOpen(true);
    setCopiedLink(false);
  };

  const handleAdvanceStatus = async () => {
    if (!selectedOrder) return;
    const nextStatus = STATUS_NEXT[selectedOrder.status];
    if (!nextStatus) return;

    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (data.ok) {
        setSelectedOrder(data.order);
        setFeedbackModal({ isOpen: true, type: "success", message: "Estado actualizado correctamente" });
        fetchOrders();
      } else {
        setFeedbackModal({ isOpen: true, type: "error", message: data.message || "Error al actualizar" });
      }
    } catch {
      setFeedbackModal({ isOpen: true, type: "error", message: "Error de conexión" });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedOrder) return;
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNotes }),
      });
      const data = await res.json();
      if (data.ok) {
        setSelectedOrder(data.order);
        setFeedbackModal({ isOpen: true, type: "success", message: "Notas guardadas" });
        fetchOrders();
      } else {
        setFeedbackModal({ isOpen: true, type: "error", message: "Error al guardar notas" });
      }
    } catch {
      setFeedbackModal({ isOpen: true, type: "error", message: "Error de conexión" });
    } finally {
      setIsUpdating(false);
    }
  };

  const copyTrackingLink = (orderNumber: string) => {
    const link = `${window.location.origin}/pedido/${orderNumber}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const openWhatsApp = (order: Order) => {
    const branch = order.selectedBranch as "outlet" | "supercentro";
    const branchInfo = BRANCHES[branch] || BRANCHES.outlet;
    const phone = order.customerPhone.replace(/[^0-9]/g, "");
    const fullPhone = phone.startsWith("57") ? phone : `57${phone}`;
    const text = `Hola ${order.customerName}, te escribimos desde *Dulces Detalles ER* (${branchInfo.name}) sobre tu pedido *${order.orderNumber}*.`;
    window.open(`https://wa.me/${fullPhone}?text=${encodeURIComponent(text)}`, "_blank");
  };

  const clearFilters = () => {
    setFilterStatus("");
    setFilterBranch("");
    setFilterSearch("");
    setFilterDateFrom("");
    setFilterDateTo("");
    setCurrentPage(1);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Pedidos</h1>
        <p className="text-sm text-slate-600 mt-1">
          Gestiona y da seguimiento a los pedidos de tus clientes
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-5 border border-slate-200">
          <p className="text-sm text-slate-700 font-medium">Total</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-5 border border-amber-200">
          <p className="text-sm text-amber-700 font-medium">Recibidos</p>
          <p className="text-3xl font-bold text-amber-900 mt-1">{stats.received}</p>
        </div>
        <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-5 border border-pink-200">
          <p className="text-sm text-pink-700 font-medium">En preparación</p>
          <p className="text-3xl font-bold text-pink-900 mt-1">{stats.preparing}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border border-green-200">
          <p className="text-sm text-green-700 font-medium">Entregados</p>
          <p className="text-3xl font-bold text-green-900 mt-1">{stats.delivered}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          >
            <option value="">Todos los estados</option>
            {STATUSES.map((s) => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>

          <select
            value={filterBranch}
            onChange={(e) => { setFilterBranch(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          >
            <option value="">Todas las sucursales</option>
            <option value="outlet">Outlet del Bosque</option>
            <option value="supercentro">Supercentro</option>
          </select>

          <input
            type="text"
            value={filterSearch}
            onChange={(e) => { setFilterSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Buscar pedido, cliente..."
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />

          <input
            type="date"
            value={filterDateFrom}
            onChange={(e) => { setFilterDateFrom(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />

          <div className="flex gap-2">
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => { setFilterDateTo(e.target.value); setCurrentPage(1); }}
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
              title="Limpiar filtros"
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* Tabla */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-pink-600 border-t-transparent"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200">
          <p className="text-slate-600">No se encontraron pedidos</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left text-xs font-semibold text-slate-700 px-4 py-3"># Pedido</th>
                  <th className="text-left text-xs font-semibold text-slate-700 px-4 py-3">Cliente</th>
                  <th className="text-left text-xs font-semibold text-slate-700 px-4 py-3 hidden md:table-cell">Teléfono</th>
                  <th className="text-left text-xs font-semibold text-slate-700 px-4 py-3">Total</th>
                  <th className="text-left text-xs font-semibold text-slate-700 px-4 py-3 hidden lg:table-cell">Sucursal</th>
                  <th className="text-left text-xs font-semibold text-slate-700 px-4 py-3">Estado</th>
                  <th className="text-left text-xs font-semibold text-slate-700 px-4 py-3 hidden md:table-cell">Fecha</th>
                  <th className="text-right text-xs font-semibold text-slate-700 px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => {
                  const badge = getStatusBadge(order.status);
                  const branch = order.selectedBranch as "outlet" | "supercentro";
                  const branchName = BRANCHES[branch]?.name || order.selectedBranch;

                  return (
                    <tr key={order.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <span className="font-mono font-bold text-sm text-pink-600">{order.orderNumber}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-semibold text-slate-800">{order.customerName}</span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-sm text-slate-600">{order.customerPhone}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-semibold text-slate-800">{formatPrice(order.total)}</span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-xs text-slate-600">{branchName}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center text-xs font-semibold px-2 py-1 rounded-full ${badge.color}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-xs text-slate-500">
                          {new Date(order.createdAt).toLocaleDateString("es-CO", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => openDetail(order)}
                          className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                        >
                          Ver detalle
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
              <p className="text-xs text-slate-500">
                Mostrando {(pagination.page - 1) * pagination.limit + 1}-{Math.min(pagination.page * pagination.limit, pagination.totalCount)} de {pagination.totalCount}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg disabled:opacity-40"
                >
                  Anterior
                </button>
                <span className="px-3 py-1 text-xs font-semibold text-slate-700">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={currentPage >= pagination.totalPages}
                  className="px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg disabled:opacity-40"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal detalle */}
      {isDetailOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header modal */}
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Pedido {selectedOrder.orderNumber}
                </h2>
                <p className="text-xs text-slate-500">
                  {new Date(selectedOrder.createdAt).toLocaleDateString("es-CO", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <button
                onClick={() => setIsDetailOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Estado actual + botón avanzar */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">Estado:</span>
                  <span className={`inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-full ${getStatusBadge(selectedOrder.status).color}`}>
                    {getStatusBadge(selectedOrder.status).label}
                  </span>
                </div>
                {STATUS_NEXT[selectedOrder.status] && (
                  <button
                    onClick={handleAdvanceStatus}
                    disabled={isUpdating}
                    className="inline-flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-pink-600 hover:bg-pink-700 disabled:bg-slate-400 shadow-md"
                  >
                    {isUpdating ? (
                      <div className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    ) : (
                      STATUS_NEXT_LABEL[selectedOrder.status]
                    )}
                  </button>
                )}
              </div>

              {/* Datos del cliente */}
              <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                <h3 className="text-sm font-bold text-slate-800">Datos del cliente</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-xs text-slate-400">Nombre</span>
                    <p className="font-semibold text-slate-800">{selectedOrder.customerName}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400">Teléfono</span>
                    <p className="font-semibold text-slate-800">{selectedOrder.customerPhone}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400">Sucursal</span>
                    <p className="font-semibold text-slate-800">
                      {BRANCHES[selectedOrder.selectedBranch as "outlet" | "supercentro"]?.name || selectedOrder.selectedBranch}
                    </p>
                  </div>
                  {selectedOrder.deliveryAddress && (
                    <div>
                      <span className="text-xs text-slate-400">Dirección</span>
                      <p className="font-semibold text-slate-800">{selectedOrder.deliveryAddress}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-2">Productos</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 bg-slate-50 rounded-lg p-3">
                      {item.productImage && (
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-200 flex-shrink-0">
                          <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{item.productName}</p>
                        <p className="text-xs text-slate-400">{item.quantity} x {formatPrice(item.priceAtTime)}</p>
                      </div>
                      <span className="text-sm font-bold text-slate-700">{formatPrice(item.total)}</span>
                    </div>
                  ))}
                </div>

                {/* Resumen */}
                <div className="border-t border-slate-200 mt-3 pt-3 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="font-semibold text-slate-700">{formatPrice(selectedOrder.subtotal)}</span>
                  </div>
                  {selectedOrder.discountAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">Descuento {selectedOrder.couponCode && `(${selectedOrder.couponCode})`}</span>
                      <span className="font-semibold text-green-600">-{formatPrice(selectedOrder.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base pt-1">
                    <span className="font-bold text-slate-900">Total</span>
                    <span className="font-extrabold text-pink-700">{formatPrice(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>

              {/* Notas admin */}
              <div>
                <label className="text-sm font-bold text-slate-800 mb-2 block">Notas internas</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  placeholder="Notas visibles solo para administradores..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                />
                <button
                  onClick={handleSaveNotes}
                  disabled={isUpdating}
                  className="mt-2 px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-slate-700 hover:bg-slate-800 disabled:bg-slate-400"
                >
                  Guardar notas
                </button>
              </div>

              {/* Acciones */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200">
                <button
                  onClick={() => openWhatsApp(selectedOrder)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-green-500 hover:bg-green-600"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp al cliente
                </button>

                <button
                  onClick={() => copyTrackingLink(selectedOrder.orderNumber)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200"
                >
                  {copiedLink ? "Copiado!" : "Copiar link de seguimiento"}
                </button>

                <a
                  href={`/pedido/${selectedOrder.orderNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-semibold text-pink-600 bg-pink-50 hover:bg-pink-100"
                >
                  Ver tracking
                </a>
              </div>
            </div>
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
