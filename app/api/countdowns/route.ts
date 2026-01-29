// app/api/countdowns/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET -> countdowns activos cuya fecha aun no ha pasado
export async function GET() {
    const now = new Date();

    const countdowns = await prisma.countdown.findMany({
        where: {
            isActive: true,
            targetDate: { gt: now },
        },
        orderBy: { targetDate: "asc" },
    });

    return NextResponse.json(countdowns);
}
