// app/admin/login/AdminLoginClient.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type Props = {
    redirectTo: string;
};

export default function AdminLoginClient({ redirectTo }: Props) {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");
        setIsSubmitting(true);

        try {
            const res = await fetch("/api/admin/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                setErrorMsg(data?.message || "Error al iniciar sesión.");
                return;
            }

            router.push(redirectTo);
        } catch (err) {
            console.error(err);
            setErrorMsg("Ocurrió un error inesperado.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-pink-100 flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-pink-100 p-6 md:p-8">
                {/* Logo + título */}
                <div className="flex flex-col items-center gap-2 mb-6">
                    <div className="relative w-16 h-16">
                        <Image
                            src="/images/logo.png"
                            alt="Dulces Detalles ER"
                            fill
                            className="rounded-full object-cover border border-pink-100 shadow-sm"
                        />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-semibold text-pink-700">
                            Dulces Detalles Cartagena ER
                        </p>
                        <p className="text-[12px] text-slate-400">
                            Acceso al panel administrativo
                        </p>
                    </div>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label
                            htmlFor="email"
                            className="block text-xs font-semibold text-slate-500 uppercase tracking-wide"
                        >
                            Correo de administrador
                        </label>
                        <input
                            id="email"
                            type="email"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-xl border border-pink-100 bg-pink-50/40 px-3 py-2 text-sm text-slate-700 
                         focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300"
                            placeholder="admin@dulcesdetallescartagenaer.com"
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <label
                            htmlFor="password"
                            className="block text-xs font-semibold text-slate-500 uppercase tracking-wide"
                        >
                            Contraseña
                        </label>
                        <input
                            id="password"
                            type="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-xl border border-pink-100 bg-pink-50/40 px-3 py-2 text-sm text-slate-700 
                         focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300"
                            placeholder="••••••••••"
                            required
                        />
                    </div>

                    {errorMsg && (
                        <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                            {errorMsg}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-full 
                       bg-pink-500 hover:bg-pink-600 text-white text-sm font-semibold px-4 py-2.5
                       shadow-md shadow-pink-300/40 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? "Ingresando..." : "Entrar al panel"}
                    </button>
                </form>

                <p className="mt-4 text-[11px] text-center text-slate-400">
                    Solo para uso interno. Hevert David · Analista profesional Frontend
                </p>
            </div>
        </div>
    );
}
