"use client";

import {
    createContext,
    useContext,
    useMemo,
    useState,
    ReactNode,
} from "react";

export type CartItem = {
    id: string; // 👈 ahora string (match con Prisma/Product)
    slug: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
};

type CartContextValue = {
    items: CartItem[];
    totalItems: number;
    totalAmount: number;
    addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
    removeItem: (id: string) => void;              // 👈 string
    clearCart: () => void;
    updateQuantity: (id: string, quantity: number) => void; // 👈 string
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);

    const addItem = (item: Omit<CartItem, "quantity">, quantity: number = 1) => {
        setItems((prev) => {
            const existing = prev.find((p) => p.id === item.id);

            if (existing) {
                return prev.map((p) =>
                    p.id === item.id ? { ...p, quantity: p.quantity + quantity } : p
                );
            }

            return [...prev, { ...item, quantity }];
        });
    };

    const removeItem = (id: string) => {
        setItems((prev) => prev.filter((p) => p.id !== id));
    };

    const clearCart = () => setItems([]);

    const updateQuantity = (id: string, quantity: number) => {
        if (quantity <= 0) {
            setItems((prev) => prev.filter((p) => p.id !== id));
            return;
        }

        setItems((prev) =>
            prev.map((p) => (p.id === id ? { ...p, quantity } : p))
        );
    };

    const totalItems = useMemo(
        () => items.reduce((acc, it) => acc + it.quantity, 0),
        [items]
    );

    const totalAmount = useMemo(
        () => items.reduce((acc, it) => acc + it.price * it.quantity, 0),
        [items]
    );

    const value: CartContextValue = {
        items,
        totalItems,
        totalAmount,
        addItem,
        removeItem,
        clearCart,
        updateQuantity,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) {
        throw new Error("useCart debe usarse dentro de CartProvider");
    }
    return ctx;
}
