import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/banners - Obtener banners activos (para el home)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const includeInactive = searchParams.get("includeInactive") === "true";

    const banners = await prisma.banner.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(banners);
  } catch (error) {
    console.error("Error al obtener banners:", error);
    return NextResponse.json(
      { error: "Error al obtener banners" },
      { status: 500 }
    );
  }
}

// POST /api/banners - Crear un nuevo banner
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      subtitle,
      description,
      imageUrl,
      buttonText,
      buttonLink,
      order,
      isActive,
    } = body;

    if (!title || !imageUrl) {
      return NextResponse.json(
        { error: "Título e imagen son requeridos" },
        { status: 400 }
      );
    }

    const banner = await prisma.banner.create({
      data: {
        title,
        subtitle: subtitle || null,
        description: description || null,
        imageUrl,
        buttonText: buttonText || null,
        buttonLink: buttonLink || null,
        order: order ?? 0,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json(banner, { status: 201 });
  } catch (error) {
    console.error("Error al crear banner:", error);
    return NextResponse.json(
      { error: "Error al crear banner" },
      { status: 500 }
    );
  }
}

// PUT /api/banners - Actualizar un banner
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      title,
      subtitle,
      description,
      imageUrl,
      buttonText,
      buttonLink,
      order,
      isActive,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID del banner es requerido" },
        { status: 400 }
      );
    }

    const banner = await prisma.banner.update({
      where: { id },
      data: {
        title,
        subtitle: subtitle || null,
        description: description || null,
        imageUrl,
        buttonText: buttonText || null,
        buttonLink: buttonLink || null,
        order: order ?? 0,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json(banner);
  } catch (error) {
    console.error("Error al actualizar banner:", error);
    return NextResponse.json(
      { error: "Error al actualizar banner" },
      { status: 500 }
    );
  }
}

// DELETE /api/banners?id=xxx - Eliminar un banner
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID del banner es requerido" },
        { status: 400 }
      );
    }

    await prisma.banner.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al eliminar banner:", error);
    return NextResponse.json(
      { error: "Error al eliminar banner" },
      { status: 500 }
    );
  }
}
