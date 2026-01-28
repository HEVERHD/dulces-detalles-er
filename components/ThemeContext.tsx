// components/ThemeContext.tsx
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = "dd-theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<Theme>("light");
    const [mounted, setMounted] = useState(false);

    // Leer preferencia guardada o del sistema
    useEffect(() => {
        const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;

        if (stored) {
            setTheme(stored);
        } else {
            // Respetar preferencia del sistema
            const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            setTheme(prefersDark ? "dark" : "light");
        }

        setMounted(true);
    }, []);

    // Aplicar clase al document
    useEffect(() => {
        if (!mounted) return;

        const root = document.documentElement;

        if (theme === "dark") {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }

        localStorage.setItem(THEME_STORAGE_KEY, theme);
    }, [theme, mounted]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === "light" ? "dark" : "light"));
    };

    // Evitar flash de tema incorrecto
    if (!mounted) {
        return (
            <ThemeContext.Provider value={{ theme: "light", toggleTheme, isDark: false }}>
                {children}
            </ThemeContext.Provider>
        );
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === "dark" }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}
