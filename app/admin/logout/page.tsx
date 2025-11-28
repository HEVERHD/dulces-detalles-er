// app/admin/logout/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogoutPage() {
    const router = useRouter();

    useEffect(() => {
        const doLogout = async () => {
            try {
                // Llamamos a la API que borra la cookie
                await fetch("/api/admin/logout", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                });

                // Si usas algo en localStorage para el admin, lo puedes limpiar aquí:
                // localStorage.removeItem("dd_admin_session");
            } catch (error) {
                console.error("Error cerrando sesión:", error);
            } finally {
                // Redirigir siempre al login del admin
                router.replace("/admin/login");
            }
        };

        doLogout();
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="bg-white border border-slate-200 rounded-xl px-6 py-4 shadow-sm text-center">
                <p className="text-sm text-slate-600 font-medium">
                    Cerrando sesión…
                </p>
                <p className="mt-1 text-xs text-slate-400">
                    Te redirigiremos al login en un momento.
                </p>
            </div>
        </div>
    );
}
