// app/admin/categorias/page.tsx
"use client";

import { useEffect, useMemo, useState, FormEvent } from "react";
import { useGlobalLoader } from "@/components/providers/LoaderProvider";

type CategoryStat = {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    total: number;
    featured: number;
    inactive: number;
};

type CategoryForm = {
    name: string;
    slug: string;
    description: string;
};

type FeedbackType = "success" | "error";

function slugify(value: string) {
    return value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
}

export default function AdminCategoriesPage() {
    const [stats, setStats] = useState<CategoryStat[]>([]);

    // error de validación dentro del modal
    const [formError, setFormError] = useState<string | null>(null);

    // modal de crear/editar
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<CategoryStat | null>(null);
    const [form, setForm] = useState<CategoryForm>({
        name: "",
        slug: "",
        description: "",
    });

    // loader global
    const { showLoader, hideLoader } = useGlobalLoader();

    // modal de feedback (mismo patrón que productos)
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
    const [feedbackType, setFeedbackType] = useState<FeedbackType>("success");
    const [feedbackTitle, setFeedbackTitle] = useState("");
    const [feedbackMessage, setFeedbackMessage] = useState("");

    const openFeedback = (
        type: FeedbackType,
        title: string,
        message: string
    ) => {
        setFeedbackType(type);
        setFeedbackTitle(title);
        setFeedbackMessage(message);
        setIsFeedbackOpen(true);
    };

    const modalTitle = useMemo(
        () => (editing ? "Editar categoría" : "Nueva categoría"),
        [editing]
    );

    // ──────────────────────────────
    // Cargar categorías desde la API
    // ──────────────────────────────
    const loadCategories = async () => {
        try {
            showLoader();

            const res = await fetch("/api/admin/categories");
            if (!res.ok) {
                const text = await res.text().catch(() => "");
                console.error("Error /api/admin/categories:", res.status, text);
                openFeedback(
                    "error",
                    "Error al cargar categorías",
                    "No se pudo obtener la lista de categorías. Intenta nuevamente."
                );
                return;
            }

            const data: CategoryStat[] = await res.json();
            setStats(data);
        } catch (err) {
            console.error("Error cargando categorías:", err);
            openFeedback(
                "error",
                "Error al cargar categorías",
                "Ocurrió un problema inesperado al consultar las categorías."
            );
        } finally {
            hideLoader();
        }
    };

    useEffect(() => {
        loadCategories();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ──────────────────────────────
    // UI helpers
    // ──────────────────────────────

    const openCreateModal = () => {
        setEditing(null);
        setForm({
            name: "",
            slug: "",
            description: "",
        });
        setFormError(null);
        setShowForm(true);
    };

    const openEditModal = (cat: CategoryStat) => {
        setEditing(cat);
        setForm({
            name: cat.name,
            slug: cat.slug,
            description: cat.description ?? "",
        });
        setFormError(null);
        setShowForm(true);
    };

    const closeModal = () => {
        setShowForm(false);
        setEditing(null);
        setFormError(null);
    };

    const handleChange = (field: keyof CategoryForm, value: string) => {
        setForm((prev) => {
            if (field === "name" && !editing) {
                // autogenerar slug solo cuando estamos creando
                return {
                    ...prev,
                    name: value,
                    slug: value ? slugify(value) : "",
                };
            }
            return { ...prev, [field]: value };
        });
    };

    // ──────────────────────────────
    // Guardar (crear / editar)
    // ──────────────────────────────

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setFormError(null);

        if (!form.name.trim()) {
            setFormError("El nombre de la categoría es obligatorio.");
            return;
        }

        try {
            showLoader();

            const payload = {
                name: form.name.trim(),
                slug: form.slug.trim(),
                description: form.description.trim(),
            };

            const url = editing
                ? `/api/admin/categories/${editing.id}`
                : "/api/admin/categories";
            const method = editing ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const contentType = res.headers.get("content-type") || "";
                let errorBody: any = null;

                if (contentType.includes("application/json")) {
                    errorBody = await res.json().catch(() => null);
                } else {
                    const text = await res.text().catch(() => "");
                    errorBody = { raw: text };
                }

                console.error("❌ Error guardando categoría", {
                    status: res.status,
                    body: errorBody,
                });

                const msg =
                    errorBody?.error ||
                    (editing
                        ? "No se pudo actualizar la categoría."
                        : "No se pudo crear la categoría.");

                openFeedback("error", "Error al guardar categoría", msg);
                return;
            }

            // Éxito
            openFeedback(
                "success",
                editing ? "Categoría actualizada" : "Categoría creada",
                editing
                    ? "La categoría se actualizó correctamente."
                    : "La nueva categoría se creó correctamente."
            );

            await loadCategories();
            closeModal();
        } catch (err) {
            console.error("🔥 Error guardando categoría:", err);
            openFeedback(
                "error",
                "Error al guardar categoría",
                "Ocurrió un error inesperado al guardar. Intenta nuevamente."
            );
        } finally {
            hideLoader();
        }
    };

    // ──────────────────────────────
    // Eliminar
    // ──────────────────────────────

    const handleDelete = async (cat: CategoryStat) => {
        const ok = window.confirm(
            `¿Seguro que quieres eliminar la categoría "${cat.name}"?`
        );
        if (!ok) return;

        try {
            showLoader();

            const res = await fetch(`/api/admin/categories/${cat.id}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                const contentType = res.headers.get("content-type") || "";
                let errorBody: any = null;

                if (contentType.includes("application/json")) {
                    errorBody = await res.json().catch(() => null);
                } else {
                    const text = await res.text().catch(() => "");
                    errorBody = { raw: text };
                }

                console.error("❌ Error eliminando categoría", {
                    status: res.status,
                    body: errorBody,
                });

                const msg =
                    errorBody?.error ||
                    "No se pudo eliminar la categoría. Verifica si tiene productos asociados.";
                openFeedback("error", "Error al eliminar categoría", msg);
                return;
            }

            openFeedback(
                "success",
                "Categoría eliminada",
                `La categoría "${cat.name}" se eliminó correctamente.`
            );

            await loadCategories();
        } catch (err) {
            console.error("🔥 Error eliminando categoría:", err);
            openFeedback(
                "error",
                "Error al eliminar categoría",
                "Ocurrió un error inesperado al eliminar. Intenta nuevamente."
            );
        } finally {
            hideLoader();
        }
    };

    // ──────────────────────────────
    // Render
    // ──────────────────────────────

    return (
        <div className="space-y-6">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                    <h1 className="text-xl md:text-2xl font-extrabold text-slate-900">
                        Categorías
                    </h1>
                    <p className="text-sm text-slate-500">
                        Agrupa y organiza los detalles por tipo de ocasión.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={openCreateModal}
                    className="inline-flex items-center justify-center rounded-full bg-pink-500 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-pink-600 transition-colors"
                >
                    + Nueva categoría
                </button>
            </header>

            {/* Lista */}
            <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="hidden md:grid grid-cols-[2fr,1fr,1fr,1fr,auto] gap-3 px-4 py-2 text-[11px] font-semibold text-slate-500 border-b border-slate-100 uppercase tracking-wide">
                    <span>Categoría</span>
                    <span className="text-right">Productos</span>
                    <span className="text-right">Destacados</span>
                    <span className="text-right">Ocultos</span>
                    <span className="text-right">Acciones</span>
                </div>

                <div className="divide-y divide-slate-100">
                    {stats.length === 0 ? (
                        <div className="px-4 py-6 text-sm text-slate-500 text-center">
                            No hay categorías definidas todavía. Crea la primera con el botón
                            &quot;Nueva categoría&quot;.
                        </div>
                    ) : (
                        stats.map((cat) => (
                            <div
                                key={cat.id}
                                className="grid md:grid-cols-[2fr,1fr,1fr,1fr,auto] gap-3 px-4 py-3 items-center hover:bg-pink-50/40 transition-colors"
                            >
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">
                                        {cat.name}
                                    </p>
                                    {cat.description && (
                                        <p className="text-xs text-slate-500">
                                            {cat.description}
                                        </p>
                                    )}
                                    <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                                        slug: {cat.slug}
                                    </p>
                                </div>

                                <div className="text-right text-sm text-slate-800">
                                    {cat.total}
                                </div>
                                <div className="text-right text-sm text-pink-600">
                                    {cat.featured}
                                </div>
                                <div className="text-right text-sm text-slate-600">
                                    {cat.inactive}
                                </div>

                                <div className="flex justify-end gap-2 text-xs">
                                    <button
                                        type="button"
                                        onClick={() => openEditModal(cat)}
                                        className="rounded-full border border-slate-200 px-3 py-1 text-[11px] text-slate-700 hover:bg-slate-50"
                                    >
                                        Editar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(cat)}
                                        className="rounded-full border border-rose-200 px-3 py-1 text-[11px] text-rose-600 hover:bg-rose-50"
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* Modal Crear / Editar */}
            {showForm && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-5 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-slate-900">
                                {modalTitle}
                            </h2>
                            <button
                                type="button"
                                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
                                onClick={closeModal}
                            >
                                ×
                            </button>
                        </div>

                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-700">
                                    Nombre
                                </label>
                                <input
                                    type="text"
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-400"
                                    value={form.name}
                                    onChange={(e) => handleChange("name", e.target.value)}
                                    placeholder="Ej: Bebés, Globos, Flores románticas..."
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-700 flex items-center justify-between">
                                    <span>Slug</span>
                                    {!editing && (
                                        <span className="text-[10px] text-slate-400">
                                            Se genera a partir del nombre (puedes ajustarlo)
                                        </span>
                                    )}
                                </label>
                                <input
                                    type="text"
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-400"
                                    value={form.slug}
                                    onChange={(e) => handleChange("slug", e.target.value)}
                                    placeholder="ej: bebes, globos, flores-romanticas"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-700">
                                    Descripción (opcional)
                                </label>
                                <textarea
                                    rows={3}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-400 resize-none"
                                    value={form.description}
                                    onChange={(e) =>
                                        handleChange("description", e.target.value)
                                    }
                                    placeholder="Texto corto para explicar cuándo usar esta categoría."
                                />
                            </div>

                            {formError && (
                                <p className="text-[11px] text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
                                    {formError}
                                </p>
                            )}

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="rounded-full border border-slate-200 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-full bg-pink-500 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-pink-600"
                                >
                                    {editing ? "Guardar cambios" : "Crear categoría"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de feedback (mismo estilo que productos) */}
            {isFeedbackOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 text-center">
                        <div className="mb-3 flex justify-center">
                            <div
                                className={`h-12 w-12 rounded-full flex items-center justify-center text-2xl
          ${feedbackType === "success"
                                        ? "bg-emerald-100 text-emerald-600"
                                        : "bg-rose-100 text-rose-600"
                                    }`}
                            >
                                {feedbackType === "success" ? "✓" : "!"}
                            </div>
                        </div>

                        <h3 className="text-lg font-extrabold text-slate-900">
                            {feedbackTitle}
                        </h3>
                        <p className="mt-2 text-sm text-slate-600">{feedbackMessage}</p>

                        <button
                            type="button"
                            onClick={() => setIsFeedbackOpen(false)}
                            className="mt-4 inline-flex items-center justify-center px-4 py-2 rounded-full text-sm font-semibold text-white bg-pink-500 hover:bg-pink-600 shadow-md"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
