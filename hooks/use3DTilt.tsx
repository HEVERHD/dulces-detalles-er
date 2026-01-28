// hooks/use3DTilt.ts
"use client";

import { useCallback, useRef } from "react";

interface TiltOptions {
    maxTilt?: number;      // Grados maximos de inclinacion
    scale?: number;        // Escala al hacer hover
    speed?: number;        // Velocidad de transicion
    glare?: boolean;       // Mostrar efecto de brillo
    glareMaxOpacity?: number;
}

export function use3DTilt(options: TiltOptions = {}) {
    const {
        maxTilt = 10,
        scale = 1.02,
        speed = 300,
        glare = true,
        glareMaxOpacity = 0.3,
    } = options;

    const elementRef = useRef<HTMLElement | null>(null);
    const glareRef = useRef<HTMLDivElement | null>(null);

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
        const element = elementRef.current;
        if (!element) return;

        const rect = element.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -maxTilt;
        const rotateY = ((x - centerX) / centerX) * maxTilt;

        element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`;

        // Actualizar brillo
        if (glare && glareRef.current) {
            const angle = Math.atan2(y - centerY, x - centerX) * (180 / Math.PI) + 90;
            const opacity = Math.min(
                (Math.abs(x - centerX) + Math.abs(y - centerY)) / (centerX + centerY) * glareMaxOpacity,
                glareMaxOpacity
            );
            glareRef.current.style.background = `linear-gradient(${angle}deg, rgba(255,255,255,${opacity}) 0%, transparent 80%)`;
            glareRef.current.style.opacity = "1";
        }
    }, [maxTilt, scale, glare, glareMaxOpacity]);

    const handleMouseLeave = useCallback(() => {
        const element = elementRef.current;
        if (!element) return;

        element.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)";
        element.style.transition = `transform ${speed}ms ease`;

        if (glare && glareRef.current) {
            glareRef.current.style.opacity = "0";
        }

        // Remover transition despues de que termine
        setTimeout(() => {
            if (element) {
                element.style.transition = "";
            }
        }, speed);
    }, [speed, glare]);

    const handleMouseEnter = useCallback(() => {
        const element = elementRef.current;
        if (element) {
            element.style.transition = "";
        }
    }, []);

    const tiltProps = {
        ref: (el: HTMLElement | null) => {
            elementRef.current = el;
        },
        onMouseMove: handleMouseMove,
        onMouseLeave: handleMouseLeave,
        onMouseEnter: handleMouseEnter,
        style: {
            transformStyle: "preserve-3d" as const,
            willChange: "transform",
        },
    };

    const glareProps = glare ? {
        ref: (el: HTMLDivElement | null) => {
            glareRef.current = el;
        },
        style: {
            position: "absolute" as const,
            inset: 0,
            pointerEvents: "none" as const,
            borderRadius: "inherit",
            opacity: 0,
            transition: `opacity ${speed}ms ease`,
        },
    } : null;

    return { tiltProps, glareProps };
}

// Componente wrapper para facilitar uso
export function Tilt3DWrapper({
    children,
    className = "",
    options = {},
}: {
    children: React.ReactNode;
    className?: string;
    options?: TiltOptions;
}) {
    const { tiltProps, glareProps } = use3DTilt(options);

    return (
        <div
            {...tiltProps}
            className={`relative ${className}`}
        >
            {children}
            {glareProps && <div {...glareProps} />}
        </div>
    );
}
