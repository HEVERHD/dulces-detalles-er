// app/lib/products.ts

// Categorías válidas para los productos (versión corta del front)
export type ProductCategory =
    | "cumple"
    | "aniversario"
    | "declaracion"
    | "infantil"
    | "dietetico";

// --------------------------------------------------------
// 🟣 Tipo que usa el FRONT (respuesta real del API):
// incluye la relación con Category desde Prisma.
// --------------------------------------------------------
export type Product = {
    id: string;
    slug: string;
    name: string;
    shortDescription: string;
    description: string;
    price: number;
    tag?: string | null;
    image: string;
    isFeatured: boolean;
    isActive: boolean;

    // Campos nuevos
    stock: number;
    trackStock: boolean;

    // Relación Prisma → Category
    categoryId?: string;
    category?: {
        id: string;
        slug: string;
        name: string;
    };

    createdAt: string;
    updatedAt?: string;
};

// --------------------------------------------------------
// 🟣 Tipo para SEED (lo que se inserta manualmente en BD)
// NO incluye categorías con objeto, sino el slug corto
// --------------------------------------------------------
export type ProductSeed = {
    slug: string;
    name: string;
    shortDescription: string;
    description: string;
    price: number;
    tag?: string | null;
    category: ProductCategory; // versión corta
    image: string;
    isFeatured: boolean;
    isActive: boolean;

    // Nuevos campos obligatorios
    stock: number;
    trackStock: boolean;
};

// --------------------------------------------------------
// 🟣 Datos iniciales para seed (puedes ajustarlos libremente)
// --------------------------------------------------------
export const PRODUCTS: ProductSeed[] = [
    {
        slug: "caja-sorpresa-rosada",
        name: "Caja sorpresa rosada",
        shortDescription:
            "Incluye peluche, chocolates importados, globo y tarjeta personalizada.",
        description:
            "Nuestra caja sorpresa rosada es perfecta para cumpleaños, aniversarios o para demostrar cariño. Incluye peluche de tamaño mediano, chocolates importados, globo metálico y tarjeta personalizada.",
        price: 120000,
        tag: "Más vendido",
        category: "cumple",
        image: "/images/products/bouquet-dulces.jpg",
        isFeatured: true,
        isActive: true,

        // Nuevos campos
        stock: 0,
        trackStock: false,
    },
    {
        slug: "desayuno-sorpresa-amor",
        name: "Desayuno sorpresa amor",
        shortDescription:
            "Bandeja con jugo, sándwich, frutas, dulces y globo metálico.",
        description:
            "Un desayuno sorpresa preparado con amor. Incluye bandeja decorada, jugo, sándwich, frutas, dulces seleccionados y globo metálico temático. Ideal para sorprender en fechas especiales.",
        price: 135000,
        tag: "Amor & amistad",
        category: "aniversario",
        image: "/images/products/desa.jpg",
        isFeatured: true,
        isActive: true,

        stock: 0,
        trackStock: false,
    },
    {
        slug: "bouquet-de-dulces",
        name: "Bouquet de dulces",
        shortDescription:
            "Ramo de chocolates y gomitas nacionales e importadas.",
        description:
            "Bouquet de dulces con chocolates, gomitas y snacks seleccionados. Una forma diferente y divertida de regalar dulces.",
        price: 90000,
        tag: "Ideal para cumpleaños",
        category: "cumple",
        image: "/images/products/peluche.jpg",
        isFeatured: false,
        isActive: true,

        stock: 0,
        trackStock: false,
    },
];
