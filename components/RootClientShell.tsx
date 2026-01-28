// components/RootClientShell.tsx
"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import SiteHeader from "./SiteHeader";

export default function RootClientShell({
    children,
}: {
    children: ReactNode;
}) {
    const pathname = usePathname();
    const isAdminRoute = pathname.startsWith("/admin");

    // Para rutas /admin NO mostramos el header ni el contenedor público,
    // dejamos que el layout de admin controle todo.
    if (isAdminRoute) {
        return <>{children}</>;
    }

    // Sitio público: header + contenido centrado con max-width
    return (
        <>
            <SiteHeader />

            <main className="min-h-screen">
                <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-6">
                    {children}
                </div>
            </main>
        </>
    );
}
