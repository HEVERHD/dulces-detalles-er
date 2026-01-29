import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/admin/reviews - Obtener TODAS las reseñas (para moderación)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status"); // "pending" | "approved" | "all"

    const where: any = {};

    if (status === "pending") {
      where.isApproved = false;
    } else if (status === "approved") {
      where.isApproved = true;
    }
    // "all" no filtra

    const reviews = await prisma.review.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            image: true,
          },
        },
        images: {
          select: { id: true, url: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const stats = {
      total: await prisma.review.count(),
      pending: await prisma.review.count({ where: { isApproved: false } }),
      approved: await prisma.review.count({ where: { isApproved: true } }),
    };

    return NextResponse.json({ reviews, stats });
  } catch (error) {
    console.error("Error al obtener reseñas (admin):", error);
    return NextResponse.json(
      { error: "Error al obtener reseñas" },
      { status: 500 }
    );
  }
}
