import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// POST /api/coupons/use - Incrementar uso de cupón
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { couponId } = body;

    if (!couponId) {
      return NextResponse.json(
        { error: "couponId es requerido" },
        { status: 400 }
      );
    }

    // Incrementar usedCount
    const coupon = await prisma.coupon.update({
      where: { id: couponId },
      data: {
        usedCount: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({ ok: true, coupon });
  } catch (error) {
    console.error("Error al registrar uso de cupón:", error);
    return NextResponse.json(
      { error: "Error al registrar uso de cupón" },
      { status: 500 }
    );
  }
}
