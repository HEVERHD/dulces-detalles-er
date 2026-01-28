// components/Confetti.tsx
"use client";

import { useEffect, useState, useCallback } from "react";

interface Particle {
    id: number;
    x: number;
    y: number;
    rotation: number;
    scale: number;
    type: "heart" | "star" | "circle" | "candy";
    color: string;
    delay: number;
}

const COLORS = [
    "#ec4899", // pink
    "#f472b6", // pink-light
    "#f9a8d4", // pink-lighter
    "#fbbf24", // gold
    "#f97316", // orange
    "#22d3ee", // cyan
    "#a855f7", // purple
    "#ef4444", // red
];

const PARTICLE_TYPES: Particle["type"][] = ["heart", "star", "circle", "candy"];

function getRandomColor() {
    return COLORS[Math.floor(Math.random() * COLORS.length)];
}

function getRandomType(): Particle["type"] {
    return PARTICLE_TYPES[Math.floor(Math.random() * PARTICLE_TYPES.length)];
}

interface ConfettiProps {
    active: boolean;
    onComplete?: () => void;
    particleCount?: number;
    duration?: number;
    origin?: { x: number; y: number };
}

export default function Confetti({
    active,
    onComplete,
    particleCount = 30,
    duration = 2000,
    origin,
}: ConfettiProps) {
    const [particles, setParticles] = useState<Particle[]>([]);

    const generateParticles = useCallback(() => {
        const newParticles: Particle[] = [];
        const centerX = origin?.x ?? 50;
        const centerY = origin?.y ?? 50;

        for (let i = 0; i < particleCount; i++) {
            newParticles.push({
                id: i,
                x: centerX + (Math.random() - 0.5) * 40,
                y: centerY + (Math.random() - 0.5) * 20,
                rotation: Math.random() * 360,
                scale: 0.5 + Math.random() * 0.8,
                type: getRandomType(),
                color: getRandomColor(),
                delay: Math.random() * 0.3,
            });
        }
        return newParticles;
    }, [particleCount, origin]);

    useEffect(() => {
        if (active) {
            setParticles(generateParticles());

            const timer = setTimeout(() => {
                setParticles([]);
                onComplete?.();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [active, duration, generateParticles, onComplete]);

    if (!active || particles.length === 0) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
            {particles.map((particle) => (
                <div
                    key={particle.id}
                    className="absolute animate-confetti-fall"
                    style={{
                        left: `${particle.x}%`,
                        top: `${particle.y}%`,
                        transform: `rotate(${particle.rotation}deg) scale(${particle.scale})`,
                        animationDelay: `${particle.delay}s`,
                        color: particle.color,
                    }}
                >
                    <ParticleShape type={particle.type} color={particle.color} />
                </div>
            ))}
        </div>
    );
}

function ParticleShape({ type, color }: { type: Particle["type"]; color: string }) {
    switch (type) {
        case "heart":
            return (
                <svg width="20" height="20" viewBox="0 0 24 24" fill={color}>
                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
            );
        case "star":
            return (
                <svg width="18" height="18" viewBox="0 0 24 24" fill={color}>
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
            );
        case "candy":
            return (
                <div
                    className="w-4 h-4 rounded-full"
                    style={{
                        background: `linear-gradient(135deg, ${color} 0%, white 50%, ${color} 100%)`,
                    }}
                />
            );
        case "circle":
        default:
            return (
                <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: color }}
                />
            );
    }
}

// Hook para usar confetti facilmente
export function useConfetti() {
    const [isActive, setIsActive] = useState(false);
    const [origin, setOrigin] = useState<{ x: number; y: number } | undefined>();

    const trigger = useCallback((e?: React.MouseEvent | { x: number; y: number }) => {
        if (e && "clientX" in e) {
            // Es un MouseEvent
            const x = (e.clientX / window.innerWidth) * 100;
            const y = (e.clientY / window.innerHeight) * 100;
            setOrigin({ x, y });
        } else if (e && "x" in e) {
            // Es un objeto con coordenadas
            setOrigin(e);
        } else {
            setOrigin({ x: 50, y: 30 });
        }
        setIsActive(true);
    }, []);

    const reset = useCallback(() => {
        setIsActive(false);
    }, []);

    return { isActive, origin, trigger, reset };
}
