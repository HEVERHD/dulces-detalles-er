import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/orderNumber";

interface OrderItemInput {
  productId: string;
  name: string;
  image?: string;
  price: number;
  quantity: number;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customerName,
      customerPhone,
      deliveryAddress,
      selectedBranch,
      items,
      subtotal,
      couponId,
      couponCode,
      discountAmount,
      total,
    } = body;

    // Validaciones
    if (!customerName?.trim()) {
      return NextResponse.json(
        { ok: false, message: "El nombre es requerido" },
        { status: 400 }
      );
    }
    if (!customerPhone?.trim()) {
      return NextResponse.json(
        { ok: false, message: "El telefono es requerido" },
        { status: 400 }
      );
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { ok: false, message: "El pedido debe tener al menos un producto" },
        { status: 400 }
      );
    }
    if (!selectedBranch || !["outlet", "supercentro"].includes(selectedBranch)) {
      return NextResponse.json(
        { ok: false, message: "Sucursal invalida" },
        { status: 400 }
      );
    }

    const orderNumber = await generateOrderNumber();

    const order = await prisma.$transaction(async (tx) => {
      // Crear orden con items
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          deliveryAddress: deliveryAddress?.trim() || null,
          selectedBranch,
          subtotal: subtotal || 0,
          couponId: couponId || null,
          couponCode: couponCode || null,
          discountAmount: discountAmount || 0,
          total: total || 0,
          status: "received",
          items: {
            create: (items as OrderItemInput[]).map((item) => ({
              productId: item.productId,
              productName: item.name,
              productImage: item.image || null,
              quantity: item.quantity,
              priceAtTime: item.price,
              total: item.price * item.quantity,
            })),
          },
        },
        include: { items: true },
      });

      // Incrementar uso de cupon si aplica
      if (couponId) {
        await tx.coupon.update({
          where: { id: couponId },
          data: { usedCount: { increment: 1 } },
        });
      }

      // Decrementar stock si aplica
      for (const item of items as OrderItemInput[]) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { trackStock: true, stock: true },
        });
        if (product?.trackStock) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }

      return newOrder;
    });

    return NextResponse.json(
      { ok: true, orderNumber: order.orderNumber },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creando pedido:", error);
    return NextResponse.json(
      { ok: false, message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
