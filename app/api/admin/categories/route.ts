// app/api/admin/categories/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function slugify(value: string) {
    return value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
}

// GET -> lista categorías con stats
export async function GET() {
    const categories = await prisma.category.findMany({
        include: {
            products: {
                select: {
                    isFeatured: true,
                    isActive: true,
                },
            },
        },
        orderBy: {
            createdAt: "asc",
        },
    });

    const payload = categories.map((cat) => {
        const total = cat.products.length;
        const featured = cat.products.filter((p) => p.isFeatured).length;
        const inactive = cat.products.filter((p) => !p.isActive).length;

        return {
            id: cat.id,
            slug: cat.slug,
            name: cat.name,
            description: cat.description,
            total,
            featured,
            inactive,
        };
    });

    return NextResponse.json(payload);
}

// POST -> crear categoría
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const name = (body.name ?? "").trim();
        const description = (body.description ?? "").trim();
        const manualSlug = (body.slug ?? "").trim();

        if (!name) {
            return NextResponse.json(
                { error: "El nombre es obligatorio." },
                { status: 400 }
            );
        }

        const slug = manualSlug || slugify(name);

        const category = await prisma.category.create({
            data: {
                name,
                slug,
                description: description || null,
            },
        });

        return NextResponse.json(category, { status: 201 });
    } catch (error: any) {
        // slug duplicado
        if (error?.code === "P2002") {
            return NextResponse.json(
                { error: "Ya existe una categoría con ese slug." },
                { status: 409 }
            );
        }

        console.error("Error creando categoría", error);
        return NextResponse.json(
            { error: "Error creando la categoría." },
            { status: 500 }
        );
    }
}
