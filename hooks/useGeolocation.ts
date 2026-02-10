"use client";

import { useState, useCallback } from "react";

interface GeolocationState {
  position: { lat: number; lng: number } | null;
  error: string | null;
  loading: boolean;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    position: null,
    error: null,
    loading: false,
  });

  const requestPermission = useCallback(() => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setState((s) => ({
        ...s,
        error: "Tu navegador no soporta geolocalizacion",
        loading: false,
      }));
      return;
    }

    setState((s) => ({ ...s, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          position: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          error: null,
          loading: false,
        });
      },
      (err) => {
        let message = "No pudimos obtener tu ubicacion";
        if (err.code === err.PERMISSION_DENIED) {
          message = "Permiso de ubicacion denegado";
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          message = "Ubicacion no disponible";
        } else if (err.code === err.TIMEOUT) {
          message = "Tiempo de espera agotado";
        }
        setState({ position: null, error: message, loading: false });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  return { ...state, requestPermission };
}
