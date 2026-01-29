"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface CountdownData {
    id: string;
    title: string;
    subtitle: string | null;
    targetDate: string;
    bgColor: string;
    emoji: string;
    buttonText: string | null;
    buttonLink: string | null;
}

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

function getTimeLeft(targetDate: string): TimeLeft | null {
    const diff = new Date(targetDate).getTime() - Date.now();
    if (diff <= 0) return null;

    return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
    };
}

function padZero(n: number): string {
    return String(n).padStart(2, "0");
}

export default function CountdownBanner() {
    const [countdowns, setCountdowns] = useState<CountdownData[]>([]);
    const [timeLeftMap, setTimeLeftMap] = useState<Record<string, TimeLeft | null>>({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch("/api/countdowns");
                if (!res.ok) return;
                const data: CountdownData[] = await res.json();
                setCountdowns(data);

                // Calcular tiempo inicial
                const map: Record<string, TimeLeft | null> = {};
                for (const cd of data) {
                    map[cd.id] = getTimeLeft(cd.targetDate);
                }
                setTimeLeftMap(map);
            } catch {
                // silencioso
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, []);

    // Actualizar cada segundo
    useEffect(() => {
        if (countdowns.length === 0) return;

        const interval = setInterval(() => {
            setTimeLeftMap(() => {
                const map: Record<string, TimeLeft | null> = {};
                for (const cd of countdowns) {
                    map[cd.id] = getTimeLeft(cd.targetDate);
                }
                return map;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [countdowns]);

    if (isLoading || countdowns.length === 0) return null;

    // Filtrar solo los que aun tienen tiempo
    const active = countdowns.filter((cd) => timeLeftMap[cd.id] !== null);
    if (active.length === 0) return null;

    return (
        <div className="space-y-4 max-w-6xl mx-auto px-4 md:px-0">
            {active.map((cd) => {
                const tl = timeLeftMap[cd.id]!;
                const isExternal = cd.buttonLink?.startsWith("http");

                return (
                    <div
                        key={cd.id}
                        className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${cd.bgColor} p-5 md:p-6 shadow-premium animate-fade-in-up`}
                    >
                        {/* Decoracion */}
                        <div className="absolute inset-0 dots-pattern opacity-15"></div>
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>

                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-4 md:gap-6">
                            {/* Emoji + texto */}
                            <div className="text-center md:text-left flex-1">
                                <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                    <span className="text-2xl md:text-3xl">{cd.emoji}</span>
                                    <h3 className="font-display text-lg md:text-xl font-bold text-white">
                                        {cd.title}
                                    </h3>
                                </div>
                                {cd.subtitle && (
                                    <p className="text-sm text-white/80">{cd.subtitle}</p>
                                )}
                            </div>

                            {/* Countdown boxes */}
                            <div className="flex items-center gap-2 md:gap-3">
                                {[
                                    { value: tl.days, label: "Dias" },
                                    { value: tl.hours, label: "Hrs" },
                                    { value: tl.minutes, label: "Min" },
                                    { value: tl.seconds, label: "Seg" },
                                ].map((item, i) => (
                                    <div key={i} className="text-center">
                                        <div className="bg-white/20 backdrop-blur-sm rounded-xl px-3 py-2 md:px-4 md:py-3 min-w-[48px] md:min-w-[56px] border border-white/10">
                                            <p className="text-xl md:text-2xl font-bold text-white tabular-nums">
                                                {padZero(item.value)}
                                            </p>
                                        </div>
                                        <p className="text-[9px] md:text-[10px] font-semibold text-white/70 mt-1 uppercase tracking-wider">
                                            {item.label}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Boton CTA */}
                            {cd.buttonText && cd.buttonLink && (
                                <div className="flex-shrink-0">
                                    {isExternal ? (
                                        <a
                                            href={cd.buttonLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 bg-white text-slate-800 font-bold text-sm px-5 py-2.5 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                                        >
                                            {cd.buttonText}
                                            <span>→</span>
                                        </a>
                                    ) : (
                                        <Link
                                            href={cd.buttonLink}
                                            className="inline-flex items-center gap-2 bg-white text-slate-800 font-bold text-sm px-5 py-2.5 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                                        >
                                            {cd.buttonText}
                                            <span>→</span>
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
