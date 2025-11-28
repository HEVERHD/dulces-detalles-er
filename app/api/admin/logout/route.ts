// app/api/admin/logout/route.ts
import { NextResponse } from "next/server";

export async function POST() {
    const res = NextResponse.json({ ok: true });

    // Eliminar la MISMA cookie que crea el login: "dd_admin"
    res.cookies.set("dd_admin", "", {
        httpOnly: true,
        secure: true,
        path: "/",
        sameSite: "lax",
        maxAge: 0,        // expira inmediatamente
    });

    return res;
}
