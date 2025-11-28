// app/admin/productos/page.tsx
"use client";

import {
    useMemo,
    useState,
    useEffect,
    ChangeEvent,
    FormEvent,
} from "react";
import type { Product, ProductCategory } from "@/lib/products";
import ImageUploader from "@/components/admin/ImageUploader";
import { useGlobalLoader } from "@/components/providers/LoaderProvider";

const CATEGORY_LABELS: Record<ProductCategory, string> = {
    cumple: "Cumpleaños",
    aniversario: "Aniversarios",
    declaracion: "Declaraciones",
    infantil: "Infantil",
    dietetico: "Sin azúcar / especiales",
};

// 👇 mapear slug de BD -> categoría corta del front
const DB_TO_APP_CATEGORY: Record<string, ProductCategory> = {
    cumpleanos: "cumple",
    aniversarios: "aniversario",
    declaraciones: "declaracion",
    infantil: "infantil",
    dietetico: "dietetico",
};

// Lee la categoría de un Product que puede venir como string u objeto { slug, name... }
function getCategoryKeyFromProduct(p: Product): ProductCategory | undefined {
    const cat: any = (p as any).category;

    if (!cat) return undefined;

    // Por si en algún lugar llega como string (legacy)
    if (typeof cat === "string") {
        return cat as ProductCategory;
    }

    const dbSlug: string | undefined = cat.slug;
    if (!dbSlug) return undefined;

    return DB_TO_APP_CATEGORY[dbSlug] ?? (dbSlug as ProductCategory);
}

// Etiquetas predefinidas para los badges
const TAG_OPTIONS = [
    { value: "", label: "Sin etiqueta" },
    { value: "Más vendido", label: "🔥 Más vendido" },
    { value: "Amor & amistad", label: "💘 Amor & amistad" },
    { value: "Ideal para cumpleaños", label: "🎂 Ideal para cumpleaños" },
    // puedes sumar más aquí…
] as const;

type ProductTagOption = (typeof TAG_OPTIONS)[number]["value"];

type NewProductForm = {
    name: string;
    slug: string;
    price: string;
    category: ProductCategory | "";
    shortDescription: string;
    description: string;
    image: string;
    isFeatured: boolean;
    isActive: boolean;
    tag: ProductTagOption;
};

type FormErrors = Partial<Record<keyof NewProductForm, string>>;

function slugify(value: string) {
    return value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
}

export default function AdminProductsPage() {
    // 🔹 Estado con productos (ahora vienen de la API)
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // 🔹 filtros
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] =
        useState<ProductCategory | "all">("all");
    const { showLoader, hideLoader } = useGlobalLoader();
    // 🔹 modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProductId, setEditingProductId] = useState<string | null>(null);

    // 🔹 formulario
    const [form, setForm] = useState<NewProductForm>({
        name: "",
        slug: "",
        price: "",
        category: "",
        tag: "" as ProductTagOption,
        shortDescription: "",
        description: "",
        image: "",
        isFeatured: false,
        isActive: true,
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [slugTouched, setSlugTouched] = useState(false);

    type FeedbackType = "success" | "error";

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

    // ──────────────────────────────
    // Cargar productos desde la API
    // ──────────────────────────────

    async function fetchProducts() {
        try {
            showLoader();                // ⬅️ mostramos loader global
            setIsLoading(true);

            const res = await fetch("/api/products");
            console.log("status productos", res.status);

            if (!res.ok) {
                const text = await res.text();
                console.error("Respuesta /api/products:", text);
                throw new Error("Error al cargar productos");
            }

            const data = await res.json();
            setProducts(data);
        } catch (err) {
            console.error("Error cargando productos:", err);
            openFeedback(
                "error",
                "Error al cargar productos",
                "No se pudieron cargar los productos. Intenta de nuevo."
            );
        } finally {
            setIsLoading(false);
            hideLoader();                // ⬅️ ocultamos loader global
        }
    }


    useEffect(() => {
        fetchProducts();
    }, []);

    // ──────────────────────────────
    // Derivados / métricas / filtros
    // ──────────────────────────────

    const filteredProducts = useMemo(() => {
        return products.filter((p) => {
            const matchSearch =
                p.name.toLowerCase().includes(search.toLowerCase()) ||
                p.shortDescription.toLowerCase().includes(search.toLowerCase());

            const categoryKey = getCategoryKeyFromProduct(p);
            const matchCategory =
                categoryFilter === "all" || categoryKey === categoryFilter;

            return matchSearch && matchCategory;
        });
    }, [products, search, categoryFilter]);


    const totalProducts = products.length;
    const featuredCount = products.filter((p) => p.isFeatured).length;
    const inactiveCount = products.filter((p) => !p.isActive).length;
    const activeCount = totalProducts - inactiveCount;

    // ──────────────────────────────
    // Handlers formulario
    // ──────────────────────────────

    const handleChange =
        (field: keyof NewProductForm) =>
            (
                e: ChangeEvent<
                    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
                >
            ) => {
                const value =
                    e.target.type === "checkbox"
                        ? (e.target as HTMLInputElement).checked
                        : e.target.value;

                setForm((prev) => {
                    let next = { ...prev, [field]: value };

                    // autogenerar slug desde el nombre si el usuario no lo tocó
                    if (field === "name" && !slugTouched) {
                        next.slug = slugify(value as string);
                    }

                    return next;
                });
            };

    const validate = (data: NewProductForm): FormErrors => {
        const newErrors: FormErrors = {};

        if (!data.name.trim()) newErrors.name = "El nombre es obligatorio.";
        if (!data.slug.trim()) newErrors.slug = "El slug es obligatorio.";
        if (!data.category) newErrors.category = "Selecciona una categoría.";
        if (!data.shortDescription.trim())
            newErrors.shortDescription = "Agrega una descripción corta.";
        if (!data.description.trim())
            newErrors.description = "Agrega una descripción completa.";
        if (!data.image.trim())
            newErrors.image = "La URL de la imagen es obligatoria.";

        const priceNumber = Number(data.price);
        if (!data.price.trim() || Number.isNaN(priceNumber) || priceNumber <= 0) {
            newErrors.price = "Ingresa un precio válido mayor a 0.";
        }

        return newErrors;
    };

    const resetForm = () => {
        setForm({
            name: "",
            slug: "",
            price: "",
            category: "",
            tag: "" as ProductTagOption,
            shortDescription: "",
            description: "",
            image: "",
            isFeatured: false,
            isActive: true,
        });
        setErrors({});
        setSlugTouched(false);
        setEditingProductId(null);
    };

    const openCreateModal = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const openEditModal = (product: Product) => {
        const categoryKey = getCategoryKeyFromProduct(product);

        setForm({
            name: product.name,
            slug: product.slug,
            price: String(product.price),
            category: categoryKey ?? "",
            tag: (product.tag as any) ?? "",
            shortDescription: product.shortDescription,
            description: product.description,
            image: product.image,
            isFeatured: product.isFeatured ?? false,
            isActive: product.isActive ?? true,
        });
        setEditingProductId(product.id);
        setErrors({});
        setSlugTouched(true);
        setIsModalOpen(true);
    };


    const handleDelete = async (productId: string) => {
        const product = products.find((p) => p.id === productId);
        if (!product) return;

        const ok = window.confirm(
            `¿Seguro que quieres eliminar "${product.name}"?`
        );
        if (!ok) return;

        try {
            showLoader();   // ⬅️ aquí
            const res = await fetch(`/api/products?id=${productId}`, {
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

                console.error("❌ Error DELETE /api/products", {
                    status: res.status,
                    statusText: res.statusText,
                    body: errorBody,
                });

                throw new Error(
                    errorBody?.error ||
                    `Error al eliminar producto (status ${res.status})`
                );
            }

            setProducts((prev) => prev.filter((p) => p.id !== productId));

            openFeedback(
                "success",
                "Producto eliminado",
                `El producto "${product.name}" se eliminó correctamente.`
            );
        } catch (err: any) {
            console.error("Error eliminando producto:", err);

            openFeedback(
                "error",
                "Error al eliminar",
                err?.message || "No se pudo eliminar el producto. Intenta de nuevo."
            );
        } finally {
            hideLoader();   // ⬅️ y aquí lo apagamos
        }
    };



    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        const validation = validate(form);
        setErrors(validation);

        if (Object.keys(validation).length > 0) return;

        const priceNumber = Number(form.price);
        const payload = {
            id: editingProductId ?? undefined,
            slug: form.slug,
            name: form.name,
            shortDescription: form.shortDescription,
            description: form.description,
            price: priceNumber,
            tag: form.tag || null,
            image: form.image,
            isFeatured: form.isFeatured,
            isActive: form.isActive,
            categorySlug: form.category,
        };

        console.log("🟦 handleSubmit → payload", {
            mode: editingProductId ? "edit" : "create",
            editingProductId,
            payload,
        });

        try {
            showLoader();           // ⬅️ loader global
            setIsSaving(true);

            if (editingProductId) {
                const res = await fetch(`/api/products`, {
                    method: "PUT",
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

                    console.error("❌ Error PUT /api/products/:id", {
                        status: res.status,
                        statusText: res.statusText,
                        body: errorBody,
                    });

                    throw new Error(
                        errorBody?.error ||
                        `Error al actualizar producto (status ${res.status})`
                    );
                }

                console.log("✅ Producto actualizado correctamente");
                openFeedback(
                    "success",
                    "Producto actualizado",
                    "El producto se guardó correctamente."
                );
            } else {
                const res = await fetch("/api/products", {
                    method: "POST",
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

                    console.error("❌ Error POST /api/products", {
                        status: res.status,
                        statusText: res.statusText,
                        body: errorBody,
                    });

                    throw new Error(
                        errorBody?.error ||
                        `Error al crear producto (status ${res.status})`
                    );
                }

                console.log("✅ Producto creado correctamente");
                openFeedback(
                    "success",
                    "Producto creado",
                    "El nuevo producto se guardó correctamente."
                );
            }

            await fetchProducts();
            resetForm();
            setIsModalOpen(false);
        } catch (err: any) {
            console.error("🔥 Error guardando producto:", err);
            openFeedback(
                "error",
                "Error al guardar",
                err?.message || "No se pudo guardar el producto. Intenta de nuevo."
            );
        } finally {
            setIsSaving(false);
            hideLoader();          // ⬅️ importantísimo
        }
    };


    // ──────────────────────────────
    // Render
    // ──────────────────────────────

    return (
        <div className="space-y-6">
            {/* Header de la página */}
            <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                    <h1 className="text-xl md:text-2xl font-extrabold text-slate-900">
                        Productos
                    </h1>
                    <p className="text-sm text-slate-500">
                        Administra los detalles que aparecen en la web.
                    </p>
                </div>

                <button
                    onClick={openCreateModal}
                    className="inline-flex items-center gap-2 rounded-full bg-pink-500 hover:bg-pink-600 text-white text-sm font-semibold px-4 py-2 shadow-md"
                >
                    ➕ Nuevo producto
                </button>
            </header>

            {/* Filtros */}
            <section className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm">
                <div className="flex-1 flex items-center gap-2">
                    <input
                        type="text"
                        placeholder="Buscar por nombre o descripción..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400"
                    />
                </div>

                <div className="flex gap-2 text-sm">
                    <select
                        value={categoryFilter}
                        onChange={(e) =>
                            setCategoryFilter(e.target.value as ProductCategory | "all")
                        }
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400"
                    >
                        <option value="all">Todas las categorías</option>
                        <option value="cumple">Cumpleaños</option>
                        <option value="aniversario">Aniversarios</option>
                        <option value="declaracion">Declaraciones</option>
                        <option value="infantil">Infantil</option>
                        <option value="dietetico">Sin azúcar / especiales</option>
                    </select>
                </div>
            </section>

            {/* Métricas rápidas */}
            <section className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="rounded-2xl bg-white border border-slate-200 px-4 py-3 shadow-sm">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                        Productos totales
                    </p>
                    <p className="mt-1 text-2xl font-extrabold text-slate-900">
                        {totalProducts}
                    </p>
                </div>

                <div className="rounded-2xl bg-white border border-slate-200 px-4 py-3 shadow-sm">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                        Activos
                    </p>
                    <p className="mt-1 text-2xl font-extrabold text-emerald-600">
                        {activeCount}
                    </p>
                </div>

                <div className="rounded-2xl bg-white border border-slate-200 px-4 py-3 shadow-sm">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                        Destacados
                    </p>
                    <p className="mt-1 text-2xl font-extrabold text-pink-600">
                        {featuredCount}
                    </p>
                </div>

                <div className="rounded-2xl bg-white border border-slate-200 px-4 py-3 shadow-sm">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                        Ocultos
                    </p>
                    <p className="mt-1 text-2xl font-extrabold text-slate-700">
                        {inactiveCount}
                    </p>
                </div>
            </section>

            {/* Tabla / listado */}
            <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="hidden md:grid grid-cols-[80px,2fr,1fr,1fr,100px,110px] gap-3 px-4 py-2 text-[11px] font-semibold text-slate-500 border-b border-slate-100 uppercase tracking-wide">
                    <span>Foto</span>
                    <span>Producto</span>
                    <span>Categoría</span>
                    <span>Etiqueta</span>
                    <span className="text-right">Precio</span>
                    <span className="text-right">Acciones</span>
                </div>

                <div className="divide-y divide-slate-100">
                    {isLoading ? (
                        <div className="px-4 py-6 text-sm text-slate-500 text-center">
                            Cargando productos...
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="px-4 py-6 text-sm text-slate-500 text-center">
                            No se encontraron productos con esos filtros.
                        </div>
                    ) : (
                        filteredProducts.map((p) => (
                            <div
                                key={p.id}
                                className="grid md:grid-cols-[80px,2.2fr,1fr,1fr,0.8fr,0.9fr] 
             gap-3 px-4 py-4 
             items-start md:items-center
             hover:bg-pink-50/40 transition-colors"
                            >
                                {/* Imagen */}
                                <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100">
                                    <img
                                        src={p.image}
                                        alt={p.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Nombre + descripción corta */}
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">
                                        {p.name}
                                    </p>
                                    <p className="text-xs text-slate-500 truncate">
                                        {p.shortDescription}
                                    </p>
                                    <p className="text-[11px] text-slate-400 mt-0.5">
                                        slug: <span className="font-mono">{p.slug}</span>
                                    </p>

                                    {/* Estado visible / destacado */}
                                    <div className="mt-1 flex flex-wrap gap-1">
                                        {!p.isActive && (
                                            <span className="inline-flex items-center rounded-full bg-slate-200 text-slate-600 text-[10px] px-2 py-[2px]">
                                                Oculto
                                            </span>
                                        )}
                                        {p.isFeatured && (
                                            <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-700 text-[10px] px-2 py-[2px]">
                                                ⭐ Destacado
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Categoría */}
                                <div className="text-xs text-slate-600">
                                    {(() => {
                                        const categoryKey = getCategoryKeyFromProduct(p);
                                        return categoryKey ? CATEGORY_LABELS[categoryKey] : "Sin categoría";
                                    })()}
                                </div>


                                {/* Tag */}
                                <div>
                                    {p.tag ? (
                                        <span className="inline-flex items-center rounded-full bg-pink-100 text-pink-700 text-[11px] font-semibold px-2 py-0.5">
                                            {p.tag}
                                        </span>
                                    ) : (
                                        <span className="text-[11px] text-slate-400">
                                            Sin etiqueta
                                        </span>
                                    )}
                                </div>

                                {/* Precio */}
                                <div className="text-right text-sm font-semibold text-pink-600">
                                    {p.price.toLocaleString("es-CO", {
                                        style: "currency",
                                        currency: "COP",
                                        maximumFractionDigits: 0,
                                    })}
                                </div>

                                {/* Acciones */}
                                <div className="flex md:justify-end gap-2 text-xs">
                                    <button
                                        type="button"
                                        onClick={() => openEditModal(p)}
                                        className="px-3 py-1 rounded-full border border-slate-200 text-slate-700 hover:bg-slate-50"
                                    >
                                        Editar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(p.id)}
                                        className="px-3 py-1 rounded-full border border-red-100 text-red-600 hover:bg-red-50"
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* MODAL NUEVO / EDITAR PRODUCTO */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-start justify-between gap-3 mb-4">
                            <div>
                                <h2 className="text-lg font-extrabold text-slate-900">
                                    {editingProductId ? "Editar producto" : "Nuevo producto"}
                                </h2>
                                <p className="text-xs text-slate-500">
                                    {editingProductId
                                        ? "Actualiza la información de este detalle."
                                        : "Crea un nuevo detalle para Dulces Detalles ER."}
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    resetForm();
                                    setIsModalOpen(false);
                                }}
                                className="text-slate-400 hover:text-slate-600 text-lg"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
                            {/* Nombre */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Nombre *
                                </label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={handleChange("name")}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400"
                                />
                                {errors.name && (
                                    <p className="text-[11px] text-red-500 mt-1">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            {/* Slug */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Slug (URL) *
                                </label>
                                <input
                                    type="text"
                                    value={form.slug}
                                    onChange={(e) => {
                                        setSlugTouched(true);
                                        handleChange("slug")(e);
                                    }}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 font-mono text-xs"
                                />
                                {errors.slug && (
                                    <p className="text-[11px] text-red-500 mt-1">
                                        {errors.slug}
                                    </p>
                                )}
                            </div>

                            {/* Precio + categoría */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Precio (COP) *
                                    </label>
                                    <input
                                        type="number"
                                        min={0}
                                        step="1000"
                                        value={form.price}
                                        onChange={handleChange("price")}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400"
                                    />
                                    {errors.price && (
                                        <p className="text-[11px] text-red-500 mt-1">
                                            {errors.price}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Categoría *
                                    </label>
                                    <select
                                        value={form.category}
                                        onChange={handleChange("category")}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none bg-white focus:ring-2 focus:ring-pink-300 focus:border-pink-400"
                                    >
                                        <option value="">Selecciona una opción</option>
                                        <option value="cumple">Cumpleaños</option>
                                        <option value="aniversario">Aniversarios</option>
                                        <option value="declaracion">Declaraciones</option>
                                        <option value="infantil">Infantil</option>
                                        <option value="dietetico">Sin azúcar / especiales</option>
                                    </select>
                                    {errors.category && (
                                        <p className="text-[11px] text-red-500 mt-1">
                                            {errors.category}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Tag como SELECT */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Etiqueta (badge)
                                </label>
                                <select
                                    value={form.tag}
                                    onChange={handleChange("tag")}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none bg-white focus:ring-2 focus:ring-pink-300 focus:border-pink-400 text-sm"
                                >
                                    {TAG_OPTIONS.map((opt) => (
                                        <option key={opt.value || "none"} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                                <p className="mt-1 text-[11px] text-slate-400">
                                    Esto controla el chip que se ve arriba del producto (🔥, 💘,
                                    etc.).
                                </p>
                            </div>

                            {/* Descripción corta */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Descripción corta *
                                </label>
                                <input
                                    type="text"
                                    value={form.shortDescription}
                                    onChange={handleChange("shortDescription")}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400"
                                />
                                {errors.shortDescription && (
                                    <p className="text-[11px] text-red-500 mt-1">
                                        {errors.shortDescription}
                                    </p>
                                )}
                            </div>

                            {/* Descripción larga */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Descripción completa *
                                </label>
                                <textarea
                                    rows={3}
                                    value={form.description}
                                    onChange={handleChange("description")}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 resize-none"
                                />
                                {errors.description && (
                                    <p className="text-[11px] text-red-500 mt-1">
                                        {errors.description}
                                    </p>
                                )}
                            </div>

                            {/* Imagen */}
                            <ImageUploader
                                value={form.image}
                                onChange={(url) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        image: url,
                                    }))
                                }
                                error={errors.image}
                            />

                            {/* Checks */}
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                                <label className="inline-flex items-center gap-2 text-xs text-slate-700">
                                    <input
                                        type="checkbox"
                                        checked={form.isFeatured}
                                        onChange={handleChange("isFeatured")}
                                        className="rounded border-slate-300"
                                    />
                                    Marcar como destacado en el home
                                </label>

                                <label className="inline-flex items-center gap-2 text-xs text-slate-700">
                                    <input
                                        type="checkbox"
                                        checked={form.isActive}
                                        onChange={handleChange("isActive")}
                                        className="rounded border-slate-300"
                                    />
                                    Producto visible en la web
                                </label>
                            </div>

                            {/* Botones */}
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        resetForm();
                                        setIsModalOpen(false);
                                    }}
                                    className="px-4 py-2 rounded-full text-xs font-semibold text-slate-600 hover:bg-slate-100"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-4 py-2 rounded-full text-xs font-semibold text-white bg-pink-500 hover:bg-pink-600 shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {isSaving
                                        ? "Guardando..."
                                        : editingProductId
                                            ? "Guardar cambios"
                                            : "Guardar producto"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
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
