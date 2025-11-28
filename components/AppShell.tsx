// components/AppShell.tsx
"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Footer from "./Footer";
import SiteHeader from "./SiteHeader";


export function AppShell({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const isAdminRoute = pathname.startsWith("/admin");

    return (
        <>
            {/* Header solo en el sitio público */}
            {!isAdminRoute && <SiteHeader />}

            {/* El contenido de cada página */}
            <main>{children}</main>

            {/* Footer solo en el sitio público */}
            {!isAdminRoute && <Footer />}
        </>
    );
}
