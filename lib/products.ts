// app/lib/products.ts

// Categorías válidas para los productos
export type ProductCategory =
    | "cumple"
    | "aniversario"
    | "declaracion"
    | "infantil"
    | "dietetico";

// Tipo que usa el FRONT (lo que devuelve el API)
export type Product = {
    id: string;
    slug: string;
    name: string;
    shortDescription: string;
    description: string;
    price: number;
    tag?: string;
    category: ProductCategory;
    image: string;
    isFeatured: boolean;
    isActive: boolean;
    createdAt: string;
};

// Tipo para SEED (lo que vamos a insertar en la BD inicialmente)
export type ProductSeed = Omit<Product, "id" | "createdAt">;

// Datos iniciales (puedes ajustar categorías y flags a tu gusto)
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
    },
];
