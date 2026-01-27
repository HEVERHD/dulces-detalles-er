import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/admin/subscribers - Listar suscriptores
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status"); // "active" | "inactive" | "all"

    const where: any = {};

    if (status === "active") {
      where.isActive = true;
    } else if (status === "inactive") {
      where.isActive = false;
    }

    const subscribers = await prisma.emailSubscriber.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    const stats = {
      total: await prisma.emailSubscriber.count(),
      active: await prisma.emailSubscriber.count({ where: { isActive: true } }),
      inactive: await prisma.emailSubscriber.count({
        where: { isActive: false },
      }),
    };

    return NextResponse.json({ subscribers, stats });
  } catch (error) {
    console.error("Error al obtener suscriptores:", error);
    return NextResponse.json(
      { error: "Error al obtener suscriptores" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/subscribers?id=xxx - Eliminar suscriptor
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID de suscriptor requerido" },
        { status: 400 }
      );
    }

    await prisma.emailSubscriber.delete({
      where: { id },
    });

    return NextResponse.json({ ok: true, deletedId: id });
  } catch (error) {
    console.error("Error al eliminar suscriptor:", error);
    return NextResponse.json(
      { error: "Error al eliminar suscriptor" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/subscribers?id=xxx - Actualizar estado de suscriptor
export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID de suscriptor requerido" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { isActive } = body;

    if (typeof isActive !== "boolean") {
      return NextResponse.json(
        { error: "isActive debe ser boolean" },
        { status: 400 }
      );
    }

    const subscriber = await prisma.emailSubscriber.update({
      where: { id },
      data: { isActive },
    });

    return NextResponse.json({ ok: true, subscriber });
  } catch (error) {
    console.error("Error al actualizar suscriptor:", error);
    return NextResponse.json(
      { error: "Error al actualizar suscriptor" },
      { status: 500 }
    );
  }
}
