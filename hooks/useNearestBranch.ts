"use client";

import { useState, useEffect, useCallback } from "react";
import { useGeolocation } from "./useGeolocation";
import {
  BRANCHES,
  BRANCH_STORAGE_KEY,
  type Branch,
} from "@/config/branches";

function haversineDistance(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h =
    sinLat * sinLat +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      sinLng *
      sinLng;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

interface NearestBranchResult {
  nearest: Branch | null;
  distanceKm: number | null;
  estimatedMinutes: number | null;
  loading: boolean;
  error: string | null;
  detect: () => void;
}

export function useNearestBranch(): NearestBranchResult {
  const { position, loading, error, requestPermission } = useGeolocation();
  const [nearest, setNearest] = useState<Branch | null>(null);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);

  useEffect(() => {
    if (!position) return;

    const distOutlet = haversineDistance(position, BRANCHES.outlet.coordinates);
    const distSuper = haversineDistance(
      position,
      BRANCHES.supercentro.coordinates
    );

    const closer: Branch = distOutlet <= distSuper ? "outlet" : "supercentro";
    const minDist = Math.min(distOutlet, distSuper);

    setNearest(closer);
    setDistanceKm(Math.round(minDist * 10) / 10);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(BRANCH_STORAGE_KEY, closer);
      window.dispatchEvent(
        new CustomEvent("branch-change", { detail: closer })
      );
    }
  }, [position]);

  const detect = useCallback(() => {
    requestPermission();
  }, [requestPermission]);

  return {
    nearest,
    distanceKm,
    estimatedMinutes:
      distanceKm !== null ? Math.max(3, Math.round((distanceKm / 25) * 60)) : null,
    loading,
    error,
    detect,
  };
}
