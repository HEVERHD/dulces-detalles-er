"use client";

import { useFavorites } from "@/components/FavoritesContext";
import { useCart } from "@/components/CartContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function FavoritosPage() {
  const { favorites, removeFavorite, clearFavorites } = useFavorites();
  const { addItem } = useCart();
  const router = useRouter();

  const handleAddToCart = (item: any) => {
    addItem(
      {
        id: item.id,
        slug: item.slug,
        name: item.name,
        price: item.price,
        image: item.image,
      },
      1
    );
  };

  const buildWhatsAppUrl = (productName: string) => {
    const phone = "3504737638"; // Outlet del Bosque
    const text = `Hola, vengo desde la web de *Dulces Detalles ER* 💖 Quiero más información sobre el detalle: *${productName}*`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  };

  if (favorites.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
        <div className="max-w-6xl mx-auto px-3 md:px-4 lg:px-0 py-12">
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-pink-100 mb-6">
              <span className="text-5xl">💝</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-3">
              No tienes favoritos aún
            </h1>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              Explora nuestro catálogo y guarda tus detalles favoritos para
              verlos después
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full bg-pink-600 hover:bg-pink-700 text-white font-semibold px-6 py-3 shadow-lg transition-all"
            >
              ✨ Ver catálogo
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <div className="max-w-6xl mx-auto px-3 md:px-4 lg:px-0 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                <span className="text-4xl">💝</span>
                Mis Favoritos
              </h1>
              <p className="text-slate-600 mt-1">
                Tienes {favorites.length} {favorites.length === 1 ? "detalle guardado" : "detalles guardados"}
              </p>
            </div>
            {favorites.length > 0 && (
              <button
                onClick={() => {
                  if (confirm("¿Seguro que quieres eliminar todos tus favoritos?")) {
                    clearFavorites();
                  }
                }}
                className="text-sm text-slate-500 hover:text-red-600 transition-colors"
              >
                Limpiar todo
              </button>
            )}
          </div>
        </div>

        {/* Grid de favoritos */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((item) => (
            <div
              key={item.id}
              className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100"
            >
              {/* Botón remover */}
              <button
                onClick={() => removeFavorite(item.id)}
                className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 hover:bg-red-50 shadow-md flex items-center justify-center transition-all"
                title="Quitar de favoritos"
              >
                <span className="text-red-500 text-xl">×</span>
              </button>

              {/* Imagen */}
              <Link href={`/producto/${item.slug}`} className="block">
                <div className="relative h-48 bg-gradient-to-br from-pink-100 to-purple-100 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
              </Link>

              {/* Info */}
              <div className="p-4">
                <Link href={`/producto/${item.slug}`}>
                  <h3 className="font-semibold text-slate-800 mb-1 line-clamp-2 hover:text-pink-600 transition-colors">
                    {item.name}
                  </h3>
                </Link>
                <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                  {item.shortDescription}
                </p>

                <div className="flex items-center justify-between mb-3">
                  <p className="text-xl font-bold text-pink-600">
                    ${item.price.toLocaleString()} COP
                  </p>
                </div>

                {/* Acciones */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="flex-1 bg-pink-600 hover:bg-pink-700 text-white text-sm font-semibold py-2 px-4 rounded-full transition-all"
                  >
                    🛒 Agregar
                  </button>
                  <a
                    href={buildWhatsAppUrl(item.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold py-2 px-4 rounded-full transition-all text-center"
                  >
                    💬 Pedir
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA de ver más productos */}
        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-700 font-semibold"
          >
            ← Seguir explorando detalles
          </Link>
        </div>
      </div>
    </div>
  );
}
