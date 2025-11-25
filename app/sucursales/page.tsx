export default function SucursalesPage() {
    return (
        <div className="space-y-8 py-4">
            <h1 className="text-3xl font-extrabold text-pink-600">
                Sucursales en Cartagena 📍
            </h1>

            <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white/90 border border-slate-100 rounded-xl p-5 shadow-sm">
                    <h3 className="font-semibold text-slate-900">
                        Centro Comercial Outlet del Bosque
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">Frente a la Olímpica.</p>
                    <p className="text-pink-600 mt-2 font-bold">
                        📲 +57 350 473 7628
                    </p>
                </div>

                <div className="bg-white/90 border border-slate-100 rounded-xl p-5 shadow-sm">
                    <h3 className="font-semibold text-slate-900">
                        Centro Comercial Supercentro Los Ejecutivos
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">Al lado del BBVA.</p>
                    <p className="text-pink-600 mt-2 font-bold">
                        📲 +57 320 230 4977
                    </p>
                </div>
            </div>
        </div>
    );
}
