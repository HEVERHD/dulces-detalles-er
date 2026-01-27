import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/products/images?productId=xxx - Obtener imágenes de un producto
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

    const images = await prisma.productImage.findMany({
      where: { productId },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ images });
  } catch (error) {
    console.error("Error al obtener imágenes:", error);
    return NextResponse.json(
      { error: "Error al obtener imágenes" },
      { status: 500 }
    );
  }
}

// POST /api/products/images - Agregar imagen a producto
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, url, alt, order } = body;

    if (!productId || !url) {
      return NextResponse.json(
        { error: "productId y url son requeridos" },
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

    const image = await prisma.productImage.create({
      data: {
        productId,
        url,
        alt: alt || null,
        order: order !== undefined ? parseInt(order) : 0,
      },
    });

    return NextResponse.json({ ok: true, image }, { status: 201 });
  } catch (error) {
    console.error("Error al crear imagen:", error);
    return NextResponse.json(
      { error: "Error al crear imagen" },
      { status: 500 }
    );
  }
}

// DELETE /api/products/images?id=xxx - Eliminar imagen
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "id es requerido" },
        { status: 400 }
      );
    }

    await prisma.productImage.delete({
      where: { id },
    });

    return NextResponse.json({ ok: true, deletedId: id });
  } catch (error) {
    console.error("Error al eliminar imagen:", error);
    return NextResponse.json(
      { error: "Error al eliminar imagen" },
      { status: 500 }
    );
  }
}
