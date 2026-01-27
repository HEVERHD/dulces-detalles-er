import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/admin/coupons - Listar todos los cupones
export async function GET() {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
    });

    const stats = {
      total: coupons.length,
      active: coupons.filter((c) => c.isActive).length,
      expired: coupons.filter(
        (c) => c.expiresAt && new Date(c.expiresAt) < new Date()
      ).length,
    };

    return NextResponse.json({ coupons, stats });
  } catch (error) {
    console.error("Error al obtener cupones:", error);
    return NextResponse.json(
      { error: "Error al obtener cupones" },
      { status: 500 }
    );
  }
}

// POST /api/admin/coupons - Crear cupón
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, type, value, minPurchase, maxUses, isActive, expiresAt } =
      body;

    // Validaciones
    if (!code || !type || value === undefined) {
      return NextResponse.json(
        { error: "Código, tipo y valor son requeridos" },
        { status: 400 }
      );
    }

    if (!["percentage", "fixed"].includes(type)) {
      return NextResponse.json(
        { error: 'El tipo debe ser "percentage" o "fixed"' },
        { status: 400 }
      );
    }

    if (type === "percentage" && (value < 1 || value > 100)) {
      return NextResponse.json(
        { error: "El porcentaje debe estar entre 1 y 100" },
        { status: 400 }
      );
    }

    if (value < 0) {
      return NextResponse.json(
        { error: "El valor debe ser positivo" },
        { status: 400 }
      );
    }

    // Crear cupón
    const coupon = await prisma.coupon.create({
      data: {
        code: code.trim().toUpperCase(),
        type,
        value: parseInt(value),
        minPurchase: minPurchase ? parseInt(minPurchase) : null,
        maxUses: maxUses ? parseInt(maxUses) : null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    return NextResponse.json({ ok: true, coupon }, { status: 201 });
  } catch (error: any) {
    console.error("Error al crear cupón:", error);

    // Código duplicado
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Ya existe un cupón con ese código" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Error al crear cupón" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/coupons?id=xxx - Actualizar cupón
export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID de cupón requerido" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { code, type, value, minPurchase, maxUses, isActive, expiresAt } =
      body;

    // Validaciones (mismas que POST)
    if (!code || !type || value === undefined) {
      return NextResponse.json(
        { error: "Código, tipo y valor son requeridos" },
        { status: 400 }
      );
    }

    if (!["percentage", "fixed"].includes(type)) {
      return NextResponse.json(
        { error: 'El tipo debe ser "percentage" o "fixed"' },
        { status: 400 }
      );
    }

    if (type === "percentage" && (value < 1 || value > 100)) {
      return NextResponse.json(
        { error: "El porcentaje debe estar entre 1 y 100" },
        { status: 400 }
      );
    }

    if (value < 0) {
      return NextResponse.json(
        { error: "El valor debe ser positivo" },
        { status: 400 }
      );
    }

    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        code: code.trim().toUpperCase(),
        type,
        value: parseInt(value),
        minPurchase: minPurchase ? parseInt(minPurchase) : null,
        maxUses: maxUses ? parseInt(maxUses) : null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    return NextResponse.json({ ok: true, coupon });
  } catch (error: any) {
    console.error("Error al actualizar cupón:", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Ya existe otro cupón con ese código" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Error al actualizar cupón" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/coupons?id=xxx - Eliminar cupón
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID de cupón requerido" },
        { status: 400 }
      );
    }

    await prisma.coupon.delete({
      where: { id },
    });

    return NextResponse.json({ ok: true, deletedId: id });
  } catch (error) {
    console.error("Error al eliminar cupón:", error);
    return NextResponse.json(
      { error: "Error al eliminar cupón" },
      { status: 500 }
    );
  }
}
