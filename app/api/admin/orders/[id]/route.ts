import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const VALID_STATUSES = ["received", "confirmed", "preparing", "delivered"];

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true, coupon: true },
    });

    if (!order) {
      return NextResponse.json(
        { ok: false, message: "Pedido no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, order });
  } catch (error) {
    console.error("Error obteniendo pedido:", error);
    return NextResponse.json(
      { ok: false, message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, adminNotes } = body;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = {};

    if (status) {
      if (!VALID_STATUSES.includes(status)) {
        return NextResponse.json(
          { ok: false, message: "Estado invalido" },
          { status: 400 }
        );
      }
      data.status = status;
    }

    if (adminNotes !== undefined) {
      data.adminNotes = adminNotes;
    }

    const order = await prisma.order.update({
      where: { id },
      data,
      include: { items: true },
    });

    return NextResponse.json({ ok: true, order });
  } catch (error) {
    console.error("Error actualizando pedido:", error);
    return NextResponse.json(
      { ok: false, message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
