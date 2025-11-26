// app/api/products/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET  -> lista productos (simple o paginado)
export async function GET(req: Request) {
    const url = new URL(req.url);
    const pageParam = url.searchParams.get("page");
    const limitParam = url.searchParams.get("limit");

    // 🔹 Modo legacy: sin page/limit -> devolver TODO como antes (array simple)
    if (!pageParam && !limitParam) {
        const products = await prisma.product.findMany({
            include: { category: true },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(products);
    }

    // 🔹 Modo paginado
    const page = Math.max(1, Number(pageParam) || 1);
    const limitRaw = Number(limitParam) || 20;
    // límite de seguridad (entre 1 y 50)
    const limit = Math.min(50, Math.max(1, limitRaw));
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

// POST -> crear producto
export async function POST(req: Request) {
    const body = await req.json();

    const category = await prisma.category.findUnique({
        where: { slug: body.categorySlug },
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

// PUT -> editar producto (usando body.id)
export async function PUT(req: Request) {
    const body = await req.json();

    const {
        id,
        slug,
        name,
        shortDescription,
        description,
        price,
        tag,
        image,
        isFeatured,
        isActive,
        categorySlug,
    } = body;

    if (!id) {
        return NextResponse.json(
            { error: "Id de producto requerido en el body" },
            { status: 400 }
        );
    }

    const category = await prisma.category.findUnique({
        where: { slug: categorySlug },
    });

    if (!category) {
        return NextResponse.json(
            { error: `Categoría '${categorySlug}' no encontrada` },
            { status: 400 }
        );
    }

    const product = await prisma.product.update({
        where: { id },
        data: {
            slug,
            name,
            shortDescription,
            description,
            price,
            tag: tag || null,
            image,
            isFeatured,
            isActive,
            categoryId: category.id,
        },
    });

    return NextResponse.json(product);
}

// DELETE -> eliminar producto (usando ?id= en la query)
export async function DELETE(req: Request) {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
        return NextResponse.json(
            { error: "Id de producto requerido en la query (?id=...)" },
            { status: 400 }
        );
    }

    const deleted = await prisma.product.delete({
        where: { id },
    });

    return NextResponse.json({ ok: true, deletedId: deleted.id });
}
