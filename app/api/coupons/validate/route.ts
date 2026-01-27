import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// POST /api/coupons/validate - Validar cupón
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, cartTotal } = body;

    if (!code || code.trim().length === 0) {
      return NextResponse.json(
        { error: "Código de cupón requerido" },
        { status: 400 }
      );
    }

    if (!cartTotal || cartTotal <= 0) {
      return NextResponse.json(
        { error: "Total del carrito inválido" },
        { status: 400 }
      );
    }

    // Buscar cupón (case insensitive)
    const coupon = await prisma.coupon.findFirst({
      where: {
        code: {
          equals: code.trim().toUpperCase(),
          mode: "insensitive",
        },
      },
    });

    if (!coupon) {
      return NextResponse.json(
        { valid: false, error: "Cupón no encontrado" },
        { status: 404 }
      );
    }

    // Validaciones
    if (!coupon.isActive) {
      return NextResponse.json({
        valid: false,
        error: "Este cupón ya no está activo",
      });
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json({
        valid: false,
        error: "Este cupón ha expirado",
      });
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({
        valid: false,
        error: "Este cupón ya alcanzó el número máximo de usos",
      });
    }

    if (coupon.minPurchase && cartTotal < coupon.minPurchase) {
      return NextResponse.json({
        valid: false,
        error: `Este cupón requiere una compra mínima de $${coupon.minPurchase.toLocaleString()} COP`,
      });
    }

    // Calcular descuento
    let discountAmount = 0;
    if (coupon.type === "percentage") {
      discountAmount = Math.round((cartTotal * coupon.value) / 100);
    } else if (coupon.type === "fixed") {
      discountAmount = coupon.value;
    }

    // El descuento no puede ser mayor que el total
    discountAmount = Math.min(discountAmount, cartTotal);

    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        discountAmount,
      },
    });
  } catch (error) {
    console.error("Error al validar cupón:", error);
    return NextResponse.json(
      { error: "Error al validar cupón" },
      { status: 500 }
    );
  }
}
