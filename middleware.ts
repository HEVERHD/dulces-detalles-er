import { NextRequest, NextResponse } from "next/server";

const ADMIN_COOKIE = "dd_admin";

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    const isAdminRoute = pathname.startsWith("/admin");
    const isLoginRoute = pathname === "/admin/login";

    if (!isAdminRoute) {
        return NextResponse.next();
    }

    const cookie = req.cookies.get(ADMIN_COOKIE);
    const isLoggedIn = cookie?.value === "1";

    // Si intenta ver login estando logueado → lo mando al panel
    if (isLoginRoute && isLoggedIn) {
        return NextResponse.redirect(
            new URL("/admin/productos", req.url)
        );
    }

    // Si entra a cualquier /admin/* sin sesión → redirigir a login
    if (!isLoginRoute && !isLoggedIn) {
        const loginUrl = new URL("/admin/login", req.url);
        loginUrl.searchParams.set("from", pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*"],
};
