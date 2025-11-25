import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const products = await prisma.product.findMany({
        include: { category: true },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(products);
}

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
