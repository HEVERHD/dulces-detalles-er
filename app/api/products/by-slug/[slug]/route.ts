// app/api/products/by-slug/[slug]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PRODUCTS } from "@/lib/products";

export async function GET(
    _req: NextRequest,
    { params }: { params: { slug: string } }
) {
    const slug = params.slug; // 👈 viene del segmento [slug]

    if (!slug) {
        return NextResponse.json({ error: "Slug requerido" }, { status: 400 });
    }

    const product = PRODUCTS.find((p) => p.slug === slug);

    if (!product) {
        return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    return NextResponse.json(product);
}
