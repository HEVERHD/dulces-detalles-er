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

    // Sin paginación → devolver TODO
    if (!pageParam && !limitParam) {
        const products = await prisma.product.findMany({
            include: { category: true },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(products);
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

    return NextResponse.json({
        products,
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
        },
    });

    return NextResponse.json(product);
}

// ──────────────────────────────────────────
// PUT → editar producto
// ──────────────────────────────────────────
export async function PUT(req: Request) {
    const body = await req.json();

    if (!body.id) {
        return NextResponse.json(
            { error: "Id de producto requerido" },
            { status: 400 }
        );
    }

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

    const product = await prisma.product.update({
        where: { id: body.id },
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
        },
    });

    return NextResponse.json(product);
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
