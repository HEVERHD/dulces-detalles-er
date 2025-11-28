"use client";

type GlobalLoaderProps = {
    show: boolean;
};

export default function GlobalLoader({ show }: GlobalLoaderProps) {
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
            <div className="relative flex flex-col items-center gap-4 rounded-2xl bg-white/95 px-8 py-6 shadow-2xl border border-pink-100">
                {/* Aro exterior */}
                <div className="relative">
                    <div className="h-16 w-16 rounded-full border-[3px] border-pink-200 border-t-pink-500 border-r-rose-400 animate-spin" />

                    {/* puntico en el centro */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-4 w-4 rounded-full bg-pink-500 shadow-md" />
                    </div>
                </div>

                {/* Texto */}
                <div className="text-center">
                    <p className="text-sm font-semibold text-slate-800">
                        Cargando Dulces Detalles ER…
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                        Preparamos algo bonito para ti 🎀
                    </p>
                </div>

                {/* Punticos animados */}
                <div className="flex gap-2 mt-1">
                    <span className="h-2 w-2 rounded-full bg-pink-400 animate-bounce [animation-delay:-0.2s]" />
                    <span className="h-2 w-2 rounded-full bg-rose-400 animate-bounce [animation-delay:-0.1s]" />
                    <span className="h-2 w-2 rounded-full bg-pink-500 animate-bounce" />
                </div>
            </div>
        </div>
    );
}
