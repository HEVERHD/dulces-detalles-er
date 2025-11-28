import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { email, password } = await req.json();

    const validEmail = process.env.ADMIN_EMAIL;
    const validPassword = process.env.ADMIN_PASSWORD;

    if (!validEmail || !validPassword) {
        console.error("Faltan ADMIN_EMAIL o ADMIN_PASSWORD en el .env");
        return NextResponse.json(
            { ok: false, message: "Configuración del servidor incompleta." },
            { status: 500 }
        );
    }

    const isValid =
        email === validEmail &&
        password === validPassword;

    if (!isValid) {
        return NextResponse.json(
            { ok: false, message: "Correo o contraseña incorrectos." },
            { status: 401 }
        );
    }

    const res = NextResponse.json({ ok: true });

    // Cookie sencilla para admin
    res.cookies.set("dd_admin", "1", {
        httpOnly: true,
        secure: true,
        path: "/",
        sameSite: "lax",
        maxAge: 60 * 60 * 8, // 8 horas
    });

    return res;
}
