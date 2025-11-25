// prisma/seed.ts
import { prisma } from "../lib/prisma";
import { PRODUCTS, ProductSeed } from "../lib/products"; // 👈 aquí el cambio


const CATEGORY_SEED = [
    {
        slug: "cumple",
        name: "Cumpleaños",
        description: "Detalles para celebrar cumpleaños.",
    },
    {
        slug: "aniversario",
        name: "Aniversarios",
        description: "Sorpresas para celebrar aniversarios.",
    },
    {
        slug: "declaracion",
        name: "Declaraciones",
        description: "Detalles para declarar amor o amistad.",
    },
    {
        slug: "infantil",
        name: "Infantil",
        description: "Detalles para niños y niñas.",
    },
    {
        slug: "dietetico",
        name: "Sin azúcar / especiales",
        description: "Opciones especiales y sin azúcar.",
    },
];

async function main() {
    console.log("🌸 Seeding categorías...");

    // 1. Crear / actualizar categorías
    const categoryMap: Record<string, string> = {};

    for (const cat of CATEGORY_SEED) {
        const created = await prisma.category.upsert({
            where: { slug: cat.slug },
            update: {
                name: cat.name,
                description: cat.description,
            },
            create: {
                slug: cat.slug,
                name: cat.name,
                description: cat.description,
            },
        });

        categoryMap[created.slug] = created.id;
    }

    console.log("✅ Categorías listas");

    console.log("🍬 Seeding productos...");

    for (const p of PRODUCTS) {
        const categoryId = categoryMap[p.category];

        if (!categoryId) {
            console.warn(
                `⚠️ No existe categoría para el producto "${p.name}" (${p.category}), saltando...`
            );
            continue;
        }

        await prisma.product.upsert({
            where: { slug: p.slug },
            update: {
                name: p.name,
                shortDescription: p.shortDescription,
                description: p.description,
                price: p.price,
                tag: p.tag ?? null,
                image: p.image,
                isFeatured: p.isFeatured,
                isActive: p.isActive,
                categoryId,
            },
            create: {
                slug: p.slug,
                name: p.name,
                shortDescription: p.shortDescription,
                description: p.description,
                price: p.price,
                tag: p.tag ?? null,
                image: p.image,
                isFeatured: p.isFeatured,
                isActive: p.isActive,
                categoryId,
            },
        });
    }

    console.log("✅ Productos listos");
}

main()
    .catch((e) => {
        console.error("❌ Error en el seed", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
