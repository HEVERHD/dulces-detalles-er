import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/products/:id  (opcional)
export async function GET(
    _req: Request,
    { params }: { params: { id: string } }
) {
    const { id } = params;

    try {
        const product = await prisma.product.findUnique({
            where: { id },
            include: { category: true },
        });

        if (!product) {
            return NextResponse.json(
                { error: "Producto no encontrado" },
                { status: 404 }
            );
        }

        return NextResponse.json(product);
    } catch (error) {
        console.error("❌ Error GET /api/products/[id]", error);
        return NextResponse.json(
            { error: "Error al obtener producto" },
            { status: 500 }
        );
    }
}

// PUT /api/products/:id → actualizar
export async function PUT(
    req: Request,
    { params }: { params: { id: string } }
) {
    const { id } = params;

    try {
        const body = await req.json();

        const {
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

        console.log("🔵 PUT /api/products/[id]", {
            urlId: id,
            bodyId: body.id,
            slug,
            categorySlug,
        });

        // Buscar categoría por slug (igual que en tu POST)
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
            where: { id }, // id viene de la URL y en tu schema es String
            data: {
                slug,
                name,
                shortDescription,
                description,
                price: Number(price),
                tag: tag || null,
                image,
                isFeatured,
                isActive,
                categoryId: category.id,
            },
        });

        return NextResponse.json(product);
    } catch (error: any) {
        console.error("❌ Error PUT /api/products/[id]", error);

        // Prisma: registro no encontrado
        if (error.code === "P2025") {
            return NextResponse.json(
                { error: "Producto no encontrado (P2025)" },
                { status: 404 }
            );
        }

        // Prisma: unique constraint (por ejemplo, slug repetido)
        if (error.code === "P2002") {
            return NextResponse.json(
                { error: "Ya existe un producto con ese slug (P2002)" },
                { status: 400 }
            );
        }

        return NextResponse.json(
            {
                error: error?.message || "Error al actualizar producto",
            },
            { status: 500 }
        );
    }
}

// DELETE /api/products/:id
export async function DELETE(
    _req: Request,
    { params }: { params: { id: string } }
) {
    const { id } = params;

    try {
        const deleted = await prisma.product.delete({
            where: { id },
        });

        return NextResponse.json({ ok: true, deletedId: deleted.id });
    } catch (error: any) {
        console.error("❌ Error DELETE /api/products/[id]", error);

        if (error.code === "P2025") {
            return NextResponse.json(
                { error: "Producto no encontrado al eliminar (P2025)" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                error: error?.message || "Error al eliminar producto",
            },
            { status: 500 }
        );
    }
}
