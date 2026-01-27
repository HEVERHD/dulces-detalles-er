"use client";

import { useState, useEffect } from "react";

interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function AdminSubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("active");
  const [isLoading, setIsLoading] = useState(true);
  const [feedbackModal, setFeedbackModal] = useState<{
    isOpen: boolean;
    type: "success" | "error";
    message: string;
  }>({ isOpen: false, type: "success", message: "" });

  useEffect(() => {
    fetchSubscribers();
  }, [filter]);

  const fetchSubscribers = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/admin/subscribers?status=${filter}`);
      const data = await res.json();
      setSubscribers(data.subscribers || []);
      setStats(data.stats || { total: 0, active: 0, inactive: 0 });
    } catch (error) {
      console.error("Error al cargar suscriptores:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/subscribers?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (res.ok) {
        setFeedbackModal({
          isOpen: true,
          type: "success",
          message: `Suscriptor ${!currentStatus ? "activado" : "desactivado"} correctamente`,
        });
        fetchSubscribers();
      } else {
        setFeedbackModal({
          isOpen: true,
          type: "error",
          message: "Error al actualizar suscriptor",
        });
      }
    } catch (error) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        message: "Error al actualizar suscriptor",
      });
    }
  };

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`¿Eliminar al suscriptor "${email}"?`)) return;

    try {
      const res = await fetch(`/api/admin/subscribers?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setFeedbackModal({
          isOpen: true,
          type: "success",
          message: "Suscriptor eliminado correctamente",
        });
        fetchSubscribers();
      } else {
        setFeedbackModal({
          isOpen: true,
          type: "error",
          message: "Error al eliminar suscriptor",
        });
      }
    } catch (error) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        message: "Error al eliminar suscriptor",
      });
    }
  };

  const handleExportCSV = () => {
    const csv = [
      ["Email", "Nombre", "Estado", "Fecha de suscripción"].join(","),
      ...subscribers.map((sub) =>
        [
          sub.email,
          sub.name || "",
          sub.isActive ? "Activo" : "Inactivo",
          new Date(sub.createdAt).toLocaleDateString("es-ES"),
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `suscriptores-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Suscriptores del Newsletter
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Gestiona los suscriptores de email marketing
          </p>
        </div>
        {subscribers.length > 0 && (
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 shadow-md transition-all text-sm"
          >
            📥 Exportar CSV
          </button>
        )}
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
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-5 border border-slate-200">
          <p className="text-sm text-slate-700 font-medium">Inactivos</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{stats.inactive}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter("active")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            filter === "active"
              ? "bg-green-100 text-green-800"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          Activos ({stats.active})
        </button>
        <button
          onClick={() => setFilter("inactive")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            filter === "inactive"
              ? "bg-slate-100 text-slate-800"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          Inactivos ({stats.inactive})
        </button>
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            filter === "all"
              ? "bg-blue-100 text-blue-800"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          Todos ({stats.total})
        </button>
      </div>

      {/* Lista de suscriptores */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-pink-600 border-t-transparent"></div>
        </div>
      ) : subscribers.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200">
          <p className="text-slate-600">
            No hay suscriptores{" "}
            {filter === "active"
              ? "activos"
              : filter === "inactive"
              ? "inactivos"
              : ""}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left text-xs font-semibold text-slate-700 px-4 py-3">
                    Email
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-700 px-4 py-3">
                    Nombre
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-700 px-4 py-3">
                    Fecha
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
                {subscribers.map((subscriber) => (
                  <tr key={subscriber.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-800 font-medium">
                        {subscriber.email}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-600">
                        {subscriber.name || "-"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-600">
                        {new Date(subscriber.createdAt).toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {subscriber.isActive ? (
                        <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">
                          ✓ Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 text-xs font-semibold px-2 py-1 rounded-full">
                          Inactivo
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() =>
                            handleToggleStatus(subscriber.id, subscriber.isActive)
                          }
                          className={`text-xs font-semibold ${
                            subscriber.isActive
                              ? "text-amber-600 hover:text-amber-700"
                              : "text-green-600 hover:text-green-700"
                          }`}
                        >
                          {subscriber.isActive ? "Desactivar" : "Activar"}
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(subscriber.id, subscriber.email)
                          }
                          className="text-xs text-red-600 hover:text-red-700 font-semibold"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {subscribers.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          <p className="font-semibold mb-1">💡 Próximos pasos:</p>
          <ul className="text-xs space-y-1 list-disc list-inside">
            <li>
              Integra un servicio de email marketing como SendGrid, Resend o
              Mailchimp
            </li>
            <li>Crea campañas automatizadas para nuevos productos y ofertas</li>
            <li>Exporta los emails a CSV para usarlos en tu plataforma preferida</li>
          </ul>
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
            <p className="text-slate-800 font-medium mb-4">
              {feedbackModal.message}
            </p>
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
