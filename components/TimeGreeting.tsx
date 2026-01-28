// components/TimeGreeting.tsx
"use client";

import { useState, useEffect } from "react";
import { useTheme } from "./ThemeContext";

interface GreetingData {
    greeting: string;
    icon: string;
    message: string;
    gradientLight: string;
    gradientDark: string;
}

function getGreetingData(hour: number): GreetingData {
    if (hour >= 6 && hour < 12) {
        return {
            greeting: "Buenos dias",
            icon: "&#9728;&#65039;", // Sol
            message: "Comienza tu dia con un detalle especial",
            gradientLight: "from-amber-400 via-orange-400 to-yellow-500",
            gradientDark: "from-amber-500/90 via-orange-500/90 to-yellow-600/90",
        };
    } else if (hour >= 12 && hour < 19) {
        return {
            greeting: "Buenas tardes",
            icon: "&#127774;", // Sol con cara
            message: "El momento perfecto para sorprender a alguien",
            gradientLight: "from-orange-400 via-rose-400 to-pink-500",
            gradientDark: "from-orange-500/90 via-rose-500/90 to-pink-600/90",
        };
    } else {
        return {
            greeting: "Buenas noches",
            icon: "&#127769;", // Luna
            message: "Un detalle nocturno lleno de amor",
            gradientLight: "from-indigo-500 via-purple-500 to-pink-500",
            gradientDark: "from-indigo-600/90 via-purple-600/90 to-pink-600/90",
        };
    }
}

export default function TimeGreeting() {
    const [greetingData, setGreetingData] = useState<GreetingData | null>(null);
    const [currentTime, setCurrentTime] = useState<string>("");
    const { isDark } = useTheme();

    useEffect(() => {
        // Obtener hora actual
        const updateGreeting = () => {
            const now = new Date();
            const hour = now.getHours();
            setGreetingData(getGreetingData(hour));

            // Formatear hora
            const timeString = now.toLocaleTimeString("es-CO", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            });
            setCurrentTime(timeString);
        };

        updateGreeting();

        // Actualizar cada minuto
        const interval = setInterval(updateGreeting, 60000);

        return () => clearInterval(interval);
    }, []);

    if (!greetingData) {
        return null;
    }

    const gradient = isDark ? greetingData.gradientDark : greetingData.gradientLight;

    return (
        <div className="relative overflow-hidden rounded-2xl shadow-premium animate-fade-in">
            {/* Fondo con gradiente animado */}
            <div className={`absolute inset-0 bg-gradient-to-r ${gradient} animate-gradient opacity-90`}></div>

            {/* Decoracion */}
            <div className="absolute inset-0 dots-pattern opacity-20"></div>
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>

            <div className="relative px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    {/* Icono animado */}
                    <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl sm:text-3xl shadow-lg animate-float flex-shrink-0">
                        <span dangerouslySetInnerHTML={{ __html: greetingData.icon }}></span>
                    </div>

                    <div className="text-white min-w-0">
                        <h2 className="font-display text-base sm:text-xl md:text-2xl font-bold drop-shadow-md">
                            {greetingData.greeting}
                        </h2>
                        <p className="text-xs sm:text-sm text-white/80 drop-shadow-sm truncate">
                            {greetingData.message}
                        </p>
                    </div>
                </div>

                {/* Hora actual */}
                <div className="flex items-center gap-1.5 sm:gap-2 bg-white/15 backdrop-blur-sm rounded-lg sm:rounded-xl px-2.5 sm:px-4 py-1.5 sm:py-2 border border-white/20 flex-shrink-0">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xs sm:text-sm font-semibold text-white">
                        {currentTime}
                    </span>
                </div>
            </div>
        </div>
    );
}
