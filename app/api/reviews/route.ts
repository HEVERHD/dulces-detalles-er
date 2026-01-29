import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/reviews?productId=xxx - Obtener reseñas aprobadas de un producto
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { error: "productId es requerido" },
        { status: 400 }
      );
    }

    // Solo devolver reseñas aprobadas
    const reviews = await prisma.review.findMany({
      where: {
        productId,
        isApproved: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        authorName: true,
        rating: true,
        comment: true,
        createdAt: true,
        images: {
          select: { id: true, url: true },
        },
      },
    });

    // Calcular estadísticas
    const stats = {
      total: reviews.length,
      averageRating: reviews.length
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0,
      ratingDistribution: {
        5: reviews.filter((r) => r.rating === 5).length,
        4: reviews.filter((r) => r.rating === 4).length,
        3: reviews.filter((r) => r.rating === 3).length,
        2: reviews.filter((r) => r.rating === 2).length,
        1: reviews.filter((r) => r.rating === 1).length,
      },
    };

    return NextResponse.json({ reviews, stats });
  } catch (error) {
    console.error("Error al obtener reseñas:", error);
    return NextResponse.json(
      { error: "Error al obtener reseñas" },
      { status: 500 }
    );
  }
}

// POST /api/reviews - Crear nueva reseña (pendiente de aprobación)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, authorName, rating, comment, imageUrls } = body;

    // Validaciones
    if (!productId || !authorName || !rating) {
      return NextResponse.json(
        { error: "productId, authorName y rating son requeridos" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "rating debe estar entre 1 y 5" },
        { status: 400 }
      );
    }

    if (authorName.trim().length < 2) {
      return NextResponse.json(
        { error: "El nombre debe tener al menos 2 caracteres" },
        { status: 400 }
      );
    }

    // Verificar que el producto existe
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    // Crear reseña (pendiente de aprobación por defecto)
    const urls: string[] = Array.isArray(imageUrls)
      ? imageUrls.filter((u: unknown) => typeof u === "string" && u.trim()).slice(0, 3)
      : [];

    const review = await prisma.review.create({
      data: {
        productId,
        authorName: authorName.trim(),
        rating: parseInt(rating),
        comment: comment ? comment.trim() : null,
        isApproved: false,
        ...(urls.length > 0 && {
          images: {
            create: urls.map((url: string) => ({ url })),
          },
        }),
      },
      include: { images: true },
    });

    return NextResponse.json(
      {
        ok: true,
        message: "Reseña enviada y pendiente de aprobación",
        review,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al crear reseña:", error);
    return NextResponse.json(
      { error: "Error al crear reseña" },
      { status: 500 }
    );
  }
}
