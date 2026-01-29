// app/api/admin/countdowns/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET -> lista todos los countdowns
export async function GET() {
    const countdowns = await prisma.countdown.findMany({
        orderBy: { targetDate: "asc" },
    });

    const now = new Date();
    const total = countdowns.length;
    const active = countdowns.filter((c) => c.isActive && c.targetDate > now).length;
    const expired = countdowns.filter((c) => c.targetDate <= now).length;

    return NextResponse.json({ countdowns, total, active, expired });
}

// POST -> crear countdown
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const title = (body.title ?? "").trim();
        const subtitle = (body.subtitle ?? "").trim() || null;
        const targetDate = body.targetDate;
        const bgColor = (body.bgColor ?? "from-pink-500 to-rose-500").trim();
        const emoji = (body.emoji ?? "💝").trim();
        const buttonText = (body.buttonText ?? "").trim() || null;
        const buttonLink = (body.buttonLink ?? "").trim() || null;
        const isActive = body.isActive ?? true;
        const order = Number(body.order) || 0;

        if (!title) {
            return NextResponse.json(
                { error: "El titulo es obligatorio." },
                { status: 400 }
            );
        }

        if (!targetDate) {
            return NextResponse.json(
                { error: "La fecha objetivo es obligatoria." },
                { status: 400 }
            );
        }

        const countdown = await prisma.countdown.create({
            data: {
                title,
                subtitle,
                targetDate: new Date(targetDate),
                bgColor,
                emoji,
                buttonText,
                buttonLink,
                isActive,
                order,
            },
        });

        return NextResponse.json(countdown, { status: 201 });
    } catch (error: any) {
        console.error("Error creando countdown:", error);
        return NextResponse.json(
            { error: "Error creando la cuenta regresiva." },
            { status: 500 }
        );
    }
}

// PUT -> actualizar countdown
export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const { id, ...rest } = body;

        if (!id) {
            return NextResponse.json(
                { error: "ID requerido." },
                { status: 400 }
            );
        }

        const title = (rest.title ?? "").trim();
        const subtitle = (rest.subtitle ?? "").trim() || null;
        const targetDate = rest.targetDate;
        const bgColor = (rest.bgColor ?? "from-pink-500 to-rose-500").trim();
        const emoji = (rest.emoji ?? "💝").trim();
        const buttonText = (rest.buttonText ?? "").trim() || null;
        const buttonLink = (rest.buttonLink ?? "").trim() || null;
        const isActive = rest.isActive ?? true;
        const order = Number(rest.order) || 0;

        if (!title) {
            return NextResponse.json(
                { error: "El titulo es obligatorio." },
                { status: 400 }
            );
        }

        if (!targetDate) {
            return NextResponse.json(
                { error: "La fecha objetivo es obligatoria." },
                { status: 400 }
            );
        }

        const updated = await prisma.countdown.update({
            where: { id },
            data: {
                title,
                subtitle,
                targetDate: new Date(targetDate),
                bgColor,
                emoji,
                buttonText,
                buttonLink,
                isActive,
                order,
            },
        });

        return NextResponse.json(updated);
    } catch (error: any) {
        console.error("Error actualizando countdown:", error);
        return NextResponse.json(
            { error: "Error actualizando la cuenta regresiva." },
            { status: 500 }
        );
    }
}

// DELETE -> eliminar countdown
export async function DELETE(req: Request) {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
        return NextResponse.json(
            { error: "ID requerido (?id=...)" },
            { status: 400 }
        );
    }

    try {
        await prisma.countdown.delete({ where: { id } });
        return NextResponse.json({ ok: true });
    } catch (error: any) {
        console.error("Error eliminando countdown:", error);
        return NextResponse.json(
            { error: "Error eliminando la cuenta regresiva." },
            { status: 500 }
        );
    }
}
