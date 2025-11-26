"use client";

import { createContext, useContext, useMemo, useState, ReactNode } from "react";

type CartItem = {
    id: number;
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
    removeItem: (id: number) => void;
    clearCart: () => void;
    updateQuantity: (id: number, quantity: number) => void;
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

    const removeItem = (id: number) => {
        setItems((prev) => prev.filter((p) => p.id !== id));
    };

    const clearCart = () => setItems([]);

    const updateQuantity = (id: number, quantity: number) => {
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
