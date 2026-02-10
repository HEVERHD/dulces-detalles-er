"use client";

import { useNearestBranch } from "@/hooks/useNearestBranch";
import { BRANCHES } from "@/config/branches";

export default function NearestBranchDetector() {
  const { nearest, distanceKm, estimatedMinutes, loading, error, detect } =
    useNearestBranch();

  return (
    <div className="glass-card rounded-2xl p-5 shadow-premium">
      {!nearest && !loading && !error && (
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-xl shadow-lg flex-shrink-0">
            <span>&#128205;</span>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="font-display font-bold text-slate-900 text-sm mb-1">
              Encuentra tu sucursal mas cercana
            </h3>
            <p className="text-xs text-slate-500">
              Detectamos cual de nuestras tiendas esta mas cerca de ti
            </p>
          </div>
          <button
            onClick={detect}
            className="btn-premium inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-lg transition-all"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4"
              />
            </svg>
            Detectar ubicacion
          </button>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center gap-3 py-2">
          <div className="w-5 h-5 rounded-full border-2 border-pink-200 border-t-pink-500 animate-spin" />
          <span className="text-sm text-slate-500">
            Detectando tu ubicacion...
          </span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 py-2">
          <span className="text-lg">&#9888;&#65039;</span>
          <span className="text-sm text-slate-500">{error}</span>
          <button
            onClick={detect}
            className="ml-auto text-xs font-semibold text-pink-600 hover:text-pink-700 underline"
          >
            Reintentar
          </button>
        </div>
      )}

      {nearest && !loading && (
        <div className="flex flex-col sm:flex-row items-center gap-4 animate-fade-in-up">
          <div
            className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${BRANCHES[nearest].gradientClass} flex items-center justify-center text-xl shadow-lg flex-shrink-0`}
          >
            <span>&#127978;</span>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <p className="text-xs text-slate-500 mb-0.5">
              Tu sucursal mas cercana
            </p>
            <h3 className="font-display font-bold text-slate-900 text-base">
              {BRANCHES[nearest].name}
            </h3>
            <div className="flex items-center justify-center sm:justify-start gap-3 mt-1">
              {distanceKm !== null && (
                <span className="inline-flex items-center gap-1 text-xs text-pink-600 font-semibold">
                  <span>&#128207;</span> {distanceKm} km
                </span>
              )}
              {estimatedMinutes !== null && (
                <span className="inline-flex items-center gap-1 text-xs text-pink-600 font-semibold">
                  <span>&#9201;</span> ~{estimatedMinutes} min
                </span>
              )}
            </div>
          </div>
          <div className="flex-shrink-0">
            <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full">
              <span>&#10004;</span> Seleccionada
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
