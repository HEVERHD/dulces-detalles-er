import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// POST /api/newsletter/subscribe - Suscribirse al newsletter
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name } = body;

    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: "El email es requerido" },
        { status: 400 }
      );
    }

    // Validación básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { error: "Email inválido" },
        { status: 400 }
      );
    }

    // Verificar si ya existe
    const existing = await prisma.emailSubscriber.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (existing) {
      if (existing.isActive) {
        return NextResponse.json(
          { error: "Este email ya está suscrito" },
          { status: 409 }
        );
      } else {
        // Reactivar suscripción
        await prisma.emailSubscriber.update({
          where: { email: email.trim().toLowerCase() },
          data: { isActive: true, name: name?.trim() || null },
        });

        return NextResponse.json({
          ok: true,
          message: "Tu suscripción ha sido reactivada",
        });
      }
    }

    // Crear nueva suscripción
    await prisma.emailSubscriber.create({
      data: {
        email: email.trim().toLowerCase(),
        name: name?.trim() || null,
        isActive: true,
      },
    });

    return NextResponse.json(
      {
        ok: true,
        message: "¡Gracias por suscribirte! Te mantendremos informado.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al suscribir:", error);
    return NextResponse.json(
      { error: "Error al procesar suscripción" },
      { status: 500 }
    );
  }
}
