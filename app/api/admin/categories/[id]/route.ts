// app/api/admin/categories/[id]/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

function slugify(value: string) {
    return value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
}

// 👇 tipo que encaja con lo que Next está esperando
type RouteContext = {
    params: Promise<{ id: string }>;
};

// PUT -> actualizar categoría
export async function PUT(req: NextRequest, context: RouteContext) {
    // 🔑 ahora params es una Promise
    const { id } = await context.params;

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

        const updated = await prisma.category.update({
            where: { id },
            data: {
                name,
                slug,
                description: description || null,
            },
        });

        return NextResponse.json(updated);
    } catch (error: any) {
        if (error?.code === "P2002") {
            return NextResponse.json(
                { error: "Ya existe una categoría con ese slug." },
                { status: 409 }
            );
        }

        console.error("Error actualizando categoría", error);
        return NextResponse.json(
            { error: "Error actualizando la categoría." },
            { status: 500 }
        );
    }
}

// DELETE -> eliminar categoría
export async function DELETE(_req: NextRequest, context: RouteContext) {
    const { id } = await context.params;

    try {
        await prisma.category.delete({
            where: { id },
        });

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("Error eliminando categoría", error);
        return NextResponse.json(
            { error: "No se pudo eliminar la categoría." },
            { status: 500 }
        );
    }
}
