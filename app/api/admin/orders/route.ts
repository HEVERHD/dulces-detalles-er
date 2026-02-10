import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const branch = searchParams.get("branch");
    const search = searchParams.get("search");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = 20;
    const skip = (page - 1) * limit;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (status) where.status = status;
    if (branch) where.selectedBranch = branch;
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        where.createdAt.lte = to;
      }
    }
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: "insensitive" } },
        { customerName: { contains: search, mode: "insensitive" } },
        { customerPhone: { contains: search } },
      ];
    }

    const [orders, totalCount, stats] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
      Promise.all([
        prisma.order.count(),
        prisma.order.count({ where: { status: "received" } }),
        prisma.order.count({ where: { status: "confirmed" } }),
        prisma.order.count({ where: { status: "preparing" } }),
        prisma.order.count({ where: { status: "delivered" } }),
      ]),
    ]);

    return NextResponse.json({
      ok: true,
      orders,
      stats: {
        total: stats[0],
        received: stats[1],
        confirmed: stats[2],
        preparing: stats[3],
        delivered: stats[4],
      },
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error listando pedidos:", error);
    return NextResponse.json(
      { ok: false, message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
