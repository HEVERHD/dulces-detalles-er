// lib/brand-colors.ts
// Colores oficiales de marca - Dulces Detalles ER Cartagena
// Extraídos del logo oficial

export const BRAND_COLORS = {
    // === COLORES PRIMARIOS ===
    // Rosa principal del logo "Dulces Detalles"
    pink: {
        DEFAULT: "#ec4899",
        light: "#f9a8d4",
        dark: "#db2777",
        deep: "#9d174d",
    },

    // Magenta/Fucsia del contorno del logo
    magenta: {
        DEFAULT: "#e11d74",
        light: "#f472b6",
    },

    // === COLORES SECUNDARIOS ===
    // Celeste/Cyan de "Cartagena" y copos de nieve
    cyan: {
        DEFAULT: "#67e8f9",
        light: "#a5f3fc",
        dark: "#22d3ee",
    },

    // Gris azulado del slogan
    slate: {
        DEFAULT: "#94a3b8",
        light: "#cbd5e1",
    },

    // === COLORES DE ACENTO (dulces del logo) ===
    // Dorado/Amarillo - regalos
    gold: {
        DEFAULT: "#fbbf24",
        light: "#fde68a",
        dark: "#f59e0b",
    },

    // Naranja - dulces
    orange: {
        DEFAULT: "#f97316",
        light: "#fdba74",
    },

    // Verde - dulces y hojas
    green: {
        DEFAULT: "#22c55e",
        light: "#86efac",
    },

    // Rojo - bastón de caramelo
    red: {
        DEFAULT: "#ef4444",
        light: "#fca5a5",
    },

    // Café/Chocolate
    chocolate: {
        DEFAULT: "#92400e",
        light: "#d97706",
    },
} as const;

// Gradientes de marca
export const BRAND_GRADIENTS = {
    // Gradiente principal rosa
    primary: "linear-gradient(135deg, #ec4899 0%, #e11d74 50%, #db2777 100%)",
    primaryDark: "linear-gradient(135deg, #f472b6 0%, #ec4899 50%, #22d3ee 100%)",

    // Gradiente tipo caramelo (rosa-cyan)
    candy: "linear-gradient(135deg, #ec4899 0%, #67e8f9 100%)",
    candyDark: "linear-gradient(135deg, #f472b6 0%, #67e8f9 100%)",

    // Gradiente dorado
    gold: "linear-gradient(135deg, #fbbf24 0%, #f97316 100%)",
    goldDark: "linear-gradient(135deg, #fde68a 0%, #fbbf24 100%)",

    // Gradiente de fondo hero
    hero: "linear-gradient(135deg, #ec4899 0%, #f43f5e 50%, #db2777 100%)",
    heroDark: "linear-gradient(135deg, #f472b6 0%, #ec4899 50%, #e11d74 100%)",
} as const;

// Colores para modo claro
export const THEME_LIGHT = {
    bg: {
        primary: "#fffbfe",
        secondary: "#fdf2f8",
        tertiary: "#fce7f3",
        card: "rgba(255, 255, 255, 0.9)",
        cardSolid: "#ffffff",
        cardHover: "#fff5f9",
    },
    text: {
        primary: "#1e293b",
        secondary: "#475569",
        muted: "#94a3b8",
        accent: "#ec4899",
    },
    border: {
        DEFAULT: "rgba(236, 72, 153, 0.15)",
        subtle: "#fce7f3",
        strong: "#f9a8d4",
    },
} as const;

// Colores para modo oscuro
export const THEME_DARK = {
    bg: {
        primary: "#0c0809",
        secondary: "#150f12",
        tertiary: "#1f161a",
        card: "rgba(31, 22, 26, 0.95)",
        cardSolid: "#1f161a",
        cardHover: "#2a1f24",
    },
    text: {
        primary: "#fdf2f8",
        secondary: "#f9a8d4",
        muted: "#a78b95",
        accent: "#f472b6",
    },
    border: {
        DEFAULT: "rgba(236, 72, 153, 0.25)",
        subtle: "rgba(236, 72, 153, 0.12)",
        strong: "rgba(244, 114, 182, 0.4)",
    },
} as const;

// Helper para obtener color de marca
export function getBrandColor(
    color: keyof typeof BRAND_COLORS,
    variant: "DEFAULT" | "light" | "dark" | "deep" = "DEFAULT"
): string {
    const colorGroup = BRAND_COLORS[color];
    if (variant in colorGroup) {
        return colorGroup[variant as keyof typeof colorGroup];
    }
    return colorGroup.DEFAULT;
}

// Helper para obtener gradiente
export function getBrandGradient(
    name: keyof typeof BRAND_GRADIENTS
): string {
    return BRAND_GRADIENTS[name];
}
