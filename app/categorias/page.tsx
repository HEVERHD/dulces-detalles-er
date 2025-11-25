export default function CategoriasPage() {
    return (
        <div className="space-y-8 py-4">
            <h1 className="text-3xl font-extrabold text-pink-600">
                Categorías de detalles 🎁
            </h1>

            <p className="text-slate-600">
                Explora nuestras categorías y encuentra el detalle perfecto para cada ocasión.
            </p>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[
                    { name: "Cumpleaños 🎂", desc: "Tortas, sorpresas y globos." },
                    { name: "Aniversarios 💘", desc: "Detalles románticos." },
                    { name: "Declaraciones 💍", desc: "Momentos inolvidables." },
                    { name: "Infantil 🎈", desc: "Detalles para niños." },
                    { name: "Sin azúcar / especiales 🌱", desc: "Opciones especiales." },
                ].map((cat) => (
                    <div
                        key={cat.name}
                        className="bg-white/90 border border-slate-100 rounded-xl p-5 shadow hover:shadow-md transition-all"
                    >
                        <h3 className="font-semibold text-pink-600">{cat.name}</h3>
                        <p className="text-sm text-slate-500">{cat.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
