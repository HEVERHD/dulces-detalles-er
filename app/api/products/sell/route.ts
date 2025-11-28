// app/api/products/sell/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { productId, quantity } = body as {
            productId?: string;
            quantity?: number;
        };

        if (!productId) {
            return NextResponse.json(
                { error: "productId es requerido" },
                { status: 400 }
            );
        }

        const parsedQty = Number(quantity);
        if (!parsedQty || !Number.isFinite(parsedQty) || parsedQty <= 0) {
            return NextResponse.json(
                { error: "quantity debe ser un número mayor a 0" },
                { status: 400 }
            );
        }

        const product = await prisma.product.findUnique({
            where: { id: productId },
        });

        if (!product) {
            return NextResponse.json(
                { error: "Producto no encontrado" },
                { status: 404 }
            );
        }

        // Si controla stock, validamos disponibilidad
        if (product.trackStock) {
            if (product.stock <= 0) {
                return NextResponse.json(
                    { error: "Este producto está agotado" },
                    { status: 409 }
                );
            }

            if (product.stock < parsedQty) {
                return NextResponse.json(
                    {
                        error: `Solo hay ${product.stock} unidades disponibles`,
                    },
                    { status: 409 }
                );
            }
        }

        const totalPrice = product.price * parsedQty;

        // Transacción: registrar venta + actualizar stock
        const [updatedProduct, sale] = await prisma.$transaction([
            prisma.product.update({
                where: { id: productId },
                data: product.trackStock
                    ? { stock: { decrement: parsedQty } }
                    : {}, // si no controla stock, no tocamos el stock
                include: { category: true },
            }),
            prisma.productSale.create({
                data: {
                    productId: productId,
                    quantity: parsedQty,
                    totalPrice,
                },
            }),
        ]);

        return NextResponse.json(
            {
                ok: true,
                product: updatedProduct,
                sale,
            },
            { status: 201 }
        );
    } catch (err) {
        console.error("Error en /api/products/sell", err);
        return NextResponse.json(
            { error: "Error registrando la venta" },
            { status: 500 }
        );
    }
}
