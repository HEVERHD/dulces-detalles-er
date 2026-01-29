"use client";

import { useState, useEffect } from "react";
import { useGlobalLoader } from "@/components/providers/LoaderProvider";

interface Countdown {
    id: string;
    title: string;
    subtitle: string | null;
    targetDate: string;
    bgColor: string;
    emoji: string;
    buttonText: string | null;
    buttonLink: string | null;
    isActive: boolean;
    order: number;
    createdAt: string;
    updatedAt: string;
}

type FormData = {
    title: string;
    subtitle: string;
    targetDate: string;
    bgColor: string;
    emoji: string;
    buttonText: string;
    buttonLink: string;
    isActive: boolean;
    order: string;
};

const BG_COLOR_OPTIONS = [
    { value: "from-pink-500 to-rose-500", label: "Rosa", preview: "bg-gradient-to-r from-pink-500 to-rose-500" },
    { value: "from-red-500 to-pink-500", label: "Rojo", preview: "bg-gradient-to-r from-red-500 to-pink-500" },
    { value: "from-purple-500 to-indigo-500", label: "Morado", preview: "bg-gradient-to-r from-purple-500 to-indigo-500" },
    { value: "from-amber-500 to-orange-500", label: "Naranja", preview: "bg-gradient-to-r from-amber-500 to-orange-500" },
    { value: "from-emerald-500 to-teal-500", label: "Verde", preview: "bg-gradient-to-r from-emerald-500 to-teal-500" },
    { value: "from-blue-500 to-cyan-500", label: "Azul", preview: "bg-gradient-to-r from-blue-500 to-cyan-500" },
    { value: "from-slate-700 to-slate-900", label: "Oscuro", preview: "bg-gradient-to-r from-slate-700 to-slate-900" },
];

const EMOJI_OPTIONS = ["💝", "💘", "🎄", "🎃", "🎁", "🎊", "🔥", "⏰", "🎉", "❤️", "💐", "🌹"];

const INITIAL_FORM: FormData = {
    title: "",
    subtitle: "",
    targetDate: "",
    bgColor: "from-pink-500 to-rose-500",
    emoji: "💝",
    buttonText: "",
    buttonLink: "",
    isActive: true,
    order: "0",
};

export default function AdminCountdownsPage() {
    const [countdowns, setCountdowns] = useState<Countdown[]>([]);
    const [stats, setStats] = useState({ total: 0, active: 0, expired: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCountdown, setEditingCountdown] = useState<Countdown | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [form, setForm] = useState<FormData>(INITIAL_FORM);

    const { showLoader, hideLoader } = useGlobalLoader();

    const [feedbackModal, setFeedbackModal] = useState<{
        isOpen: boolean;
        type: "success" | "error";
        message: string;
    }>({ isOpen: false, type: "success", message: "" });

    const openFeedback = (type: "success" | "error", message: string) => {
        setFeedbackModal({ isOpen: true, type, message });
    };

    const fetchCountdowns = async () => {
        try {
            showLoader();
            setIsLoading(true);
            const res = await fetch("/api/admin/countdowns");
            if (!res.ok) throw new Error("Error al cargar");
            const data = await res.json();
            setCountdowns(data.countdowns);
            setStats({ total: data.total, active: data.active, expired: data.expired });
        } catch (error) {
            console.error("Error:", error);
            openFeedback("error", "Error al cargar las cuentas regresivas");
        } finally {
            setIsLoading(false);
            hideLoader();
        }
    };

    useEffect(() => {
        fetchCountdowns();
    }, []);

    const resetForm = () => {
        setForm(INITIAL_FORM);
        setEditingCountdown(null);
    };

    const openCreateModal = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const openEditModal = (cd: Countdown) => {
        const date = new Date(cd.targetDate);
        const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16);

        setForm({
            title: cd.title,
            subtitle: cd.subtitle || "",
            targetDate: localDate,
            bgColor: cd.bgColor,
            emoji: cd.emoji,
            buttonText: cd.buttonText || "",
            buttonLink: cd.buttonLink || "",
            isActive: cd.isActive,
            order: String(cd.order),
        });
        setEditingCountdown(cd);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.title.trim() || !form.targetDate) {
            openFeedback("error", "Titulo y fecha objetivo son obligatorios");
            return;
        }

        try {
            showLoader();
            setIsSaving(true);

            const payload = {
                ...(editingCountdown && { id: editingCountdown.id }),
                title: form.title.trim(),
                subtitle: form.subtitle.trim() || null,
                targetDate: new Date(form.targetDate).toISOString(),
                bgColor: form.bgColor,
                emoji: form.emoji,
                buttonText: form.buttonText.trim() || null,
                buttonLink: form.buttonLink.trim() || null,
                isActive: form.isActive,
                order: parseInt(form.order) || 0,
            };

            const res = await fetch("/api/admin/countdowns", {
                method: editingCountdown ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Error al guardar");
            }

            openFeedback(
                "success",
                editingCountdown ? "Cuenta regresiva actualizada" : "Cuenta regresiva creada"
            );

            await fetchCountdowns();
            setIsModalOpen(false);
            resetForm();
        } catch (error: any) {
            console.error("Error:", error);
            openFeedback("error", error.message || "Error al guardar");
        } finally {
            setIsSaving(false);
            hideLoader();
        }
    };

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`¿Eliminar la cuenta regresiva "${title}"?`)) return;

        try {
            showLoader();
            const res = await fetch(`/api/admin/countdowns?id=${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Error al eliminar");

            openFeedback("success", "Cuenta regresiva eliminada");
            await fetchCountdowns();
        } catch (error) {
            console.error("Error:", error);
            openFeedback("error", "Error al eliminar");
        } finally {
            hideLoader();
        }
    };

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString("es-CO", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const isExpired = (dateStr: string) => new Date(dateStr) <= new Date();

    const getDaysUntil = (dateStr: string) => {
        const diff = new Date(dateStr).getTime() - Date.now();
        if (diff <= 0) return "Vencido";
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return days === 1 ? "1 dia" : `${days} dias`;
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Cuenta Regresiva</h1>
                    <p className="text-sm text-slate-600 mt-1">
                        Banners con countdown para fechas especiales
                    </p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="inline-flex items-center gap-2 rounded-full bg-pink-600 hover:bg-pink-700 text-white font-semibold px-5 py-2.5 shadow-md transition-all text-sm"
                >
                    + Nueva Cuenta Regresiva
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
                    <p className="text-sm text-amber-700 font-medium">Vencidos</p>
                    <p className="text-3xl font-bold text-amber-900 mt-1">{stats.expired}</p>
                </div>
            </div>

            {/* Listado */}
            {isLoading ? (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-pink-600 border-t-transparent"></div>
                    <p className="mt-3 text-sm text-slate-500">Cargando...</p>
                </div>
            ) : countdowns.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="text-5xl mb-3">⏳</div>
                    <p className="text-slate-600">No hay cuentas regresivas</p>
                    <p className="text-sm text-slate-400 mt-1">Crea la primera para una fecha especial</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {countdowns.map((cd) => {
                        const expired = isExpired(cd.targetDate);

                        return (
                            <div
                                key={cd.id}
                                className={`bg-white rounded-2xl border shadow-sm hover:shadow-lg transition-all overflow-hidden ${
                                    expired ? "border-slate-200 opacity-60" : "border-slate-200"
                                }`}
                            >
                                <div className="flex flex-col md:flex-row">
                                    {/* Preview del gradiente */}
                                    <div className={`w-full md:w-48 h-24 md:h-auto bg-gradient-to-br ${cd.bgColor} flex items-center justify-center flex-shrink-0`}>
                                        <span className="text-4xl">{cd.emoji}</span>
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 p-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="text-sm font-bold text-slate-900">
                                                        {cd.emoji} {cd.title}
                                                    </h3>
                                                    {!cd.isActive && (
                                                        <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                                                            INACTIVO
                                                        </span>
                                                    )}
                                                    {expired && (
                                                        <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                                                            VENCIDO
                                                        </span>
                                                    )}
                                                </div>
                                                {cd.subtitle && (
                                                    <p className="text-xs text-slate-500 mb-2">{cd.subtitle}</p>
                                                )}
                                                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                                                    <span>
                                                        Fecha: <strong>{formatDate(cd.targetDate)}</strong>
                                                    </span>
                                                    <span className={`font-semibold ${expired ? "text-amber-600" : "text-emerald-600"}`}>
                                                        {getDaysUntil(cd.targetDate)}
                                                    </span>
                                                    {cd.buttonText && (
                                                        <span>
                                                            Boton: <strong>{cd.buttonText}</strong> → {cd.buttonLink}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Acciones */}
                                            <div className="flex items-center gap-1 flex-shrink-0">
                                                <button
                                                    onClick={() => openEditModal(cd)}
                                                    className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
                                                    title="Editar"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(cd.id, cd.title)}
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
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal Crear/Editar */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-slate-900">
                                {editingCountdown ? "Editar Cuenta Regresiva" : "Nueva Cuenta Regresiva"}
                            </h2>
                            <button
                                onClick={() => { setIsModalOpen(false); resetForm(); }}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Preview */}
                        <div className={`rounded-xl bg-gradient-to-r ${form.bgColor} p-4 mb-4 text-white text-center`}>
                            <span className="text-2xl">{form.emoji}</span>
                            <p className="font-bold text-sm mt-1">{form.title || "Titulo del evento"}</p>
                            {form.subtitle && <p className="text-xs text-white/80 mt-0.5">{form.subtitle}</p>}
                            <div className="flex justify-center gap-2 mt-2">
                                {["00", "00", "00", "00"].map((v, i) => (
                                    <div key={i} className="bg-white/20 rounded-lg px-2 py-1 text-center min-w-[36px]">
                                        <p className="text-sm font-bold">{v}</p>
                                        <p className="text-[8px] uppercase">{["Dias", "Hrs", "Min", "Seg"][i]}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Titulo *
                                </label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-pink-300 focus:border-pink-400"
                                    placeholder="Ej: San Valentin"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Subtitulo
                                </label>
                                <input
                                    type="text"
                                    value={form.subtitle}
                                    onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-pink-300 focus:border-pink-400"
                                    placeholder="Ej: Encuentra el regalo perfecto"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Fecha y hora objetivo *
                                </label>
                                <input
                                    type="datetime-local"
                                    value={form.targetDate}
                                    onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-pink-300 focus:border-pink-400"
                                    required
                                />
                            </div>

                            {/* Color de fondo */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-2">
                                    Color de fondo
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {BG_COLOR_OPTIONS.map((opt) => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setForm({ ...form, bgColor: opt.value })}
                                            className={`${opt.preview} w-10 h-10 rounded-xl transition-all ${
                                                form.bgColor === opt.value
                                                    ? "ring-2 ring-offset-2 ring-pink-500 scale-110"
                                                    : "hover:scale-105"
                                            }`}
                                            title={opt.label}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Emoji */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-2">
                                    Emoji
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {EMOJI_OPTIONS.map((em) => (
                                        <button
                                            key={em}
                                            type="button"
                                            onClick={() => setForm({ ...form, emoji: em })}
                                            className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border-2 transition-all ${
                                                form.emoji === em
                                                    ? "border-pink-500 bg-pink-50 scale-110"
                                                    : "border-slate-200 hover:border-pink-300"
                                            }`}
                                        >
                                            {em}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Texto del boton
                                    </label>
                                    <input
                                        type="text"
                                        value={form.buttonText}
                                        onChange={(e) => setForm({ ...form, buttonText: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-pink-300 focus:border-pink-400"
                                        placeholder="Ej: Ver ofertas"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Link del boton
                                    </label>
                                    <input
                                        type="text"
                                        value={form.buttonLink}
                                        onChange={(e) => setForm({ ...form, buttonLink: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-pink-300 focus:border-pink-400"
                                        placeholder="/categorias o https://..."
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
                                        Activo
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <button
                                    type="button"
                                    onClick={() => { setIsModalOpen(false); resetForm(); }}
                                    className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-pink-600 hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSaving ? "Guardando..." : editingCountdown ? "Guardar Cambios" : "Crear"}
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
