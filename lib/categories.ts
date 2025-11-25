// lib/categories.ts
export const CATEGORIES = [
    { id: "cumple", label: "Cumpleaños", description: "Detalles para cumpleaños." },
    { id: "aniversario", label: "Aniversarios", description: "Sorpresas románticas." },
    { id: "declaracion", label: "Declaraciones", description: "Para declarar amor o amistad." },
    { id: "infantil", label: "Infantil", description: "Detalles para niños y niñas." },
    { id: "dietetico", label: "Sin azúcar / especiales", description: "Opciones especiales y sin azúcar." },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export const CATEGORY_LABELS: Record<CategoryId, string> = CATEGORIES.reduce(
    (acc, cat) => {
        acc[cat.id] = cat.label;
        return acc;
    },
    {} as Record<CategoryId, string>
);
