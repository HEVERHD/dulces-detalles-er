import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// PUT /api/admin/reviews/[id] - Aprobar/rechazar reseña
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const { isApproved } = body;

    if (typeof isApproved !== "boolean") {
      return NextResponse.json(
        { error: "isApproved debe ser boolean" },
        { status: 400 }
      );
    }

    const review = await prisma.review.update({
      where: { id },
      data: { isApproved },
    });

    return NextResponse.json({ ok: true, review });
  } catch (error) {
    console.error("Error al actualizar reseña:", error);
    return NextResponse.json(
      { error: "Error al actualizar reseña" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/reviews/[id] - Eliminar reseña
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    await prisma.review.delete({
      where: { id },
    });

    return NextResponse.json({ ok: true, deletedId: id });
  } catch (error) {
    console.error("Error al eliminar reseña:", error);
    return NextResponse.json(
      { error: "Error al eliminar reseña" },
      { status: 500 }
    );
  }
}
