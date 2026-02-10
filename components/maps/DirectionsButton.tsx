"use client";

import { useState, useCallback } from "react";
import { BRANCHES, type Branch } from "@/config/branches";

interface DirectionsButtonProps {
  branch: Branch;
  compact?: boolean;
}

export default function DirectionsButton({
  branch,
  compact = false,
}: DirectionsButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = useCallback(() => {
    const info = BRANCHES[branch];

    if (!navigator.geolocation) {
      // Fallback: abrir sin origen
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${info.coordinates.lat},${info.coordinates.lng}&travelmode=driving`,
        "_blank"
      );
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoading(false);
        const url = `https://www.google.com/maps/dir/?api=1&origin=${pos.coords.latitude},${pos.coords.longitude}&destination=${info.coordinates.lat},${info.coordinates.lng}&travelmode=driving`;
        window.open(url, "_blank");
      },
      () => {
        setLoading(false);
        // Fallback: abrir sin origen
        window.open(
          `https://www.google.com/maps/dir/?api=1&destination=${info.coordinates.lat},${info.coordinates.lng}&travelmode=driving`,
          "_blank"
        );
      },
      { enableHighAccuracy: false, timeout: 5000 }
    );
  }, [branch]);

  if (compact) {
    return (
      <button
        onClick={handleClick}
        disabled={loading}
        className="btn-premium inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-lg transition-all disabled:opacity-60"
      >
        {loading ? (
          <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
        ) : (
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
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        )}
        <span>Como llegar</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="btn-premium w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-lg transition-all disabled:opacity-60"
    >
      {loading ? (
        <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
      ) : (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      )}
      <span>Como llegar</span>
    </button>
  );
}
