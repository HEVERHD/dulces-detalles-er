// app/api/products/by-slug/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    if (!slug) {
        return NextResponse.json(
            { error: "Slug requerido" },
            { status: 400 }
        );
    }

    const product = await prisma.product.findUnique({
        where: { slug },
        include: { category: true },
    });

    if (!product) {
        return NextResponse.json(
            { error: "Producto no encontrado" },
            { status: 404 }
        );
    }

    return NextResponse.json(product);
}
