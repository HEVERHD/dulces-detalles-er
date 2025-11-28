// app/api/products/sales/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const productId = url.searchParams.get("productId");
        const limitParam = url.searchParams.get("limit");

        if (!productId) {
            return NextResponse.json(
                { error: "productId es requerido (?productId=...)" },
                { status: 400 }
            );
        }

        const limit = Math.min(100, Math.max(1, Number(limitParam) || 20));

        const [sales, aggregate] = await Promise.all([
            prisma.productSale.findMany({
                where: { productId },
                orderBy: { createdAt: "desc" },
                take: limit,
            }),
            prisma.productSale.aggregate({
                _sum: { quantity: true, totalPrice: true },
                where: { productId },
            }),
        ]);

        return NextResponse.json({
            sales,
            totalQuantity: aggregate._sum.quantity ?? 0,
            totalAmount: aggregate._sum.totalPrice ?? 0,
        });
    } catch (err) {
        console.error("Error en GET /api/products/sales", err);
        return NextResponse.json(
            { error: "Error obteniendo el historial de ventas" },
            { status: 500 }
        );
    }
}
