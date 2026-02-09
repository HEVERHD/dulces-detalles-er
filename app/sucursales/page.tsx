"use client";

import { useState } from "react";
import { BRANCHES, type Branch } from "@/config/branches";
import BranchMap from "@/components/maps/BranchMap";
import NearestBranchDetector from "@/components/maps/NearestBranchDetector";
import DirectionsButton from "@/components/maps/DirectionsButton";
import { useGeolocation } from "@/hooks/useGeolocation";

export default function SucursalesPage() {
    const { position, requestPermission } = useGeolocation();
    const [mapVisible, setMapVisible] = useState(true);

    const handleWhatsApp = (branch: Branch) => {
        const info = BRANCHES[branch];
        const url = `https://wa.me/${info.whatsapp}?text=${encodeURIComponent(
            "Hola, vengo desde la web de Dulces Detalles ER"
        )}`;
        window.open(url, "_blank");
    };

    return (
        <div className="space-y-8 py-4">
            {/* Header */}
            <div className="text-center max-w-2xl mx-auto">
                <span className="inline-flex items-center gap-2 bg-pink-100 text-pink-600 text-xs font-semibold px-4 py-1.5 rounded-full mb-4">
                    <span>&#128205;</span>
                    <span>Nuestras tiendas</span>
                </span>
                <h1 className="font-display text-3xl md:text-4xl font-bold text-slate-900 mb-3">
                    Sucursales en Cartagena
                </h1>
                <p className="text-slate-500">
                    Dos ubicaciones estrategicas para estar mas cerca de ti.
                    Visitanos o haz tu pedido por WhatsApp.
                </p>
            </div>

            {/* Detector de sucursal cercana */}
            <NearestBranchDetector />

            {/* Mapa interactivo */}
            <div>
                <button
                    onClick={() => {
                        setMapVisible(!mapVisible);
                        if (!position) requestPermission();
                    }}
                    className="md:hidden mb-3 inline-flex items-center gap-2 text-sm font-semibold text-pink-600 hover:text-pink-700 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    {mapVisible ? "Ocultar mapa" : "Ver mapa"}
                </button>

                <div className={`${mapVisible ? "block" : "hidden"} md:block`}>
                    <BranchMap userPosition={position} />
                </div>
            </div>

            {/* Leyenda zonas de delivery */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-pink-400 opacity-60"></span>
                    <span>Zona delivery Outlet del Bosque</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-400 opacity-60"></span>
                    <span>Zona delivery Supercentro</span>
                </div>
            </div>

            {/* Tarjetas de sucursales */}
            <div className="grid md:grid-cols-2 gap-6">
                {(Object.keys(BRANCHES) as Branch[]).map((key) => {
                    const branch = BRANCHES[key];
                    return (
                        <article
                            key={key}
                            className="group relative bg-white rounded-3xl overflow-hidden shadow-premium hover-lift"
                        >
                            <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${branch.gradientClass}`}></div>
                            <div className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${branch.gradientClass} flex items-center justify-center text-2xl shadow-lg flex-shrink-0`}>
                                        <span>&#127978;</span>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-display font-bold text-slate-900 text-lg mb-1">
                                            {branch.name}
                                        </h3>
                                        <p className="text-sm text-slate-500 mb-1">
                                            {branch.address}
                                        </p>
                                        <p className="text-xs text-slate-400 mb-3">
                                            {branch.reference}
                                        </p>
                                        <div className="flex items-center gap-2 text-sm text-slate-700 mb-4">
                                            <span>&#128222;</span>
                                            <span className="font-semibold">{branch.phone}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                onClick={() => handleWhatsApp(key)}
                                                className="btn-premium inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-lg transition-all"
                                            >
                                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                                </svg>
                                                <span>WhatsApp</span>
                                            </button>
                                            <DirectionsButton branch={key} compact />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </article>
                    );
                })}
            </div>
        </div>
    );
}
