// app/api/products/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * MAPEO entre los slugs cortos del admin
 * y los slugs reales en la base de datos
 */
const CATEGORY_DB_SLUGS: Record<string, string> = {
    cumple: "cumpleanos",
    aniversario: "aniversarios",
    declaracion: "declaraciones",
    infantil: "infantil",
    dietetico: "dietetico",
};

function resolveDbCategorySlug(frontSlug: string): string {
    return CATEGORY_DB_SLUGS[frontSlug] ?? frontSlug;
}

// ──────────────────────────────────────────
// GET (lista productos o paginado)
// ──────────────────────────────────────────
export async function GET(req: Request) {
    const url = new URL(req.url);
    const pageParam = url.searchParams.get("page");
    const limitParam = url.searchParams.get("limit");

    // Helper para enriquecer productos con ventas
    async function attachSales(products: any[]) {
        if (products.length === 0) return products;

        const productIds = products.map((p) => p.id as string);

        // 👇 Usamos SOLO quantity, sin monto
        const salesAgg = await prisma.productSale.groupBy({
            by: ["productId"],
            where: {
                productId: { in: productIds },
            },
            _sum: {
                quantity: true, // nombre que ya usas en el historial
            },
        });

        const salesMap: Record<string, { soldCount: number }> = Object.fromEntries(
            salesAgg.map((row) => [
                row.productId,
                { soldCount: row._sum.quantity ?? 0 },
            ])
        );

        return products.map((p) => {
            const sales = salesMap[p.id] ?? { soldCount: 0 };
            return {
                ...p,
                soldCount: sales.soldCount,
            };
        });
    }

    // Sin paginación → devolver TODO
    if (!pageParam && !limitParam) {
        const products = await prisma.product.findMany({
            include: { category: true },
            orderBy: { createdAt: "desc" },
        });

        const enriched = await attachSales(products);

        return NextResponse.json(enriched);
    }

    // Con paginación
    const page = Math.max(1, Number(pageParam) || 1);
    const limit = Math.min(50, Math.max(1, Number(limitParam) || 20));
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
        prisma.product.findMany({
            include: { category: true },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        }),
        prisma.product.count(),
    ]);

    const enriched = await attachSales(products);

    return NextResponse.json({
        products: enriched,
        total,
        page,
        totalPages: Math.ceil(total / limit),
    });
}



// ──────────────────────────────────────────
// POST → crear producto
// ──────────────────────────────────────────
export async function POST(req: Request) {
    const body = await req.json();

    const dbSlug = resolveDbCategorySlug(body.categorySlug);

    const category = await prisma.category.findUnique({
        where: { slug: dbSlug },
    });


    if (!category) {
        return NextResponse.json(
            { error: `Categoría '${body.categorySlug}' no encontrada` },
            { status: 400 }
        );
    }

    const stock =
        typeof body.stock === "number"
            ? body.stock
            : Number.isFinite(Number(body.stock))
                ? Number(body.stock)
                : 0;

    const trackStock = typeof body.trackStock === "boolean"
        ? body.trackStock
        : Boolean(body.trackStock);

    const product = await prisma.product.create({
        data: {
            slug: body.slug,
            name: body.name,
            shortDescription: body.shortDescription,
            description: body.description,
            price: body.price,
            tag: body.tag || null,
            image: body.image,
            isFeatured: body.isFeatured,
            isActive: body.isActive,
            categoryId: category.id,

            // 🆕 nuevos campos
            stock,
            trackStock,
        },
        include: {
            category: true,
        },
    });

    return NextResponse.json(product, { status: 201 });
}

// ──────────────────────────────────────────
// PUT → editar producto
// ──────────────────────────────────────────
export async function PUT(req: Request) {
    const body = await req.json();

    const { id, categorySlug, ...rest } = body;

    if (!id) {
        return NextResponse.json(
            { error: "ID de producto requerido" },
            { status: 400 }
        );
    }

    const dbSlug = resolveDbCategorySlug(body.categorySlug);

    const category = await prisma.category.findUnique({
        where: { slug: dbSlug },
    });


    if (!category) {
        return NextResponse.json(
            { error: `Categoría '${categorySlug}' no encontrada` },
            { status: 400 }
        );
    }

    const stock =
        typeof rest.stock === "number"
            ? rest.stock
            : Number.isFinite(Number(rest.stock))
                ? Number(rest.stock)
                : 0;

    const trackStock = typeof rest.trackStock === "boolean"
        ? rest.trackStock
        : Boolean(rest.trackStock);

    const updated = await prisma.product.update({
        where: { id },
        data: {
            slug: rest.slug,
            name: rest.name,
            shortDescription: rest.shortDescription,
            description: rest.description,
            price: rest.price,
            tag: rest.tag || null,
            image: rest.image,
            isFeatured: rest.isFeatured,
            isActive: rest.isActive,
            categoryId: category.id,

            // 🆕
            stock,
            trackStock,
        },
        include: {
            category: true,
        },
    });

    return NextResponse.json(updated);
}


// ──────────────────────────────────────────
// DELETE → eliminar producto
// ──────────────────────────────────────────
export async function DELETE(req: Request) {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
        return NextResponse.json(
            { error: "Id requerido (?id=...)" },
            { status: 400 }
        );
    }

    const deleted = await prisma.product.delete({
        where: { id },
    });

    return NextResponse.json({ ok: true, deletedId: deleted.id });
}
