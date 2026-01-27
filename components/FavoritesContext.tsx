"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
} from "react";

// Tipo de producto favorito (versión ligera)
export interface FavoriteItem {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  shortDescription: string;
}

interface FavoritesContextType {
  favorites: FavoriteItem[];
  addFavorite: (item: FavoriteItem) => void;
  removeFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  totalFavorites: number;
  clearFavorites: () => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(
  undefined
);

const STORAGE_KEY = "dd-favorites";

// Generar o recuperar sessionId único
function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";

  let sessionId = localStorage.getItem("dd-session-id");
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem("dd-session-id", sessionId);
  }
  return sessionId;
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Cargar favoritos desde localStorage al montar
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          setFavorites(JSON.parse(stored));
        } catch (error) {
          console.error("Error al cargar favoritos:", error);
        }
      }
      setIsHydrated(true);
    }
  }, []);

  // Guardar favoritos en localStorage cuando cambien
  useEffect(() => {
    if (isHydrated && typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    }
  }, [favorites, isHydrated]);

  const addFavorite = (item: FavoriteItem) => {
    setFavorites((prev) => {
      // Evitar duplicados
      if (prev.some((fav) => fav.id === item.id)) {
        return prev;
      }
      return [...prev, item];
    });
  };

  const removeFavorite = (id: string) => {
    setFavorites((prev) => prev.filter((fav) => fav.id !== id));
  };

  const isFavorite = (id: string): boolean => {
    return favorites.some((fav) => fav.id === id);
  };

  const clearFavorites = () => {
    setFavorites([]);
  };

  const totalFavorites = useMemo(() => favorites.length, [favorites]);

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addFavorite,
        removeFavorite,
        isFavorite,
        totalFavorites,
        clearFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error("useFavorites debe usarse dentro de FavoritesProvider");
  }
  return context;
}
