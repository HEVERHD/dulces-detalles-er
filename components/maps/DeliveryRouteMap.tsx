"use client";

import { GoogleMap, DirectionsRenderer, MarkerF } from "@react-google-maps/api";
import { useState, useEffect, useCallback } from "react";
import { useTheme } from "@/components/ThemeContext";
import { useGoogleMaps } from "./GoogleMapsProvider";
import { lightMapStyle, darkMapStyle } from "./mapStyles";

interface DeliveryRouteMapProps {
  branchName: string;
  branchCoordinates: { lat: number; lng: number };
  deliveryAddress: string;
  status: string;
}

const STATUS_MESSAGES: Record<string, string> = {
  received: "Pedido recibido en tienda",
  confirmed: "Pedido confirmado, preparando pronto",
  preparing: "Tu pedido se esta preparando",
  delivered: "Pedido entregado!",
};

export default function DeliveryRouteMap({
  branchName,
  branchCoordinates,
  deliveryAddress,
  status,
}: DeliveryRouteMapProps) {
  const { isLoaded } = useGoogleMaps();
  const { isDark } = useTheme();
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [duration, setDuration] = useState("");
  const [distance, setDistance] = useState("");
  const [error, setError] = useState(false);

  const calculateRoute = useCallback(() => {
    if (!isLoaded || !deliveryAddress) return;

    const directionsService = new google.maps.DirectionsService();
    directionsService.route(
      {
        origin: branchCoordinates,
        destination: deliveryAddress,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, routeStatus) => {
        if (routeStatus === google.maps.DirectionsStatus.OK && result) {
          setDirections(result);
          const leg = result.routes[0]?.legs[0];
          if (leg) {
            setDuration(leg.duration?.text || "");
            setDistance(leg.distance?.text || "");
          }
        } else {
          setError(true);
        }
      }
    );
  }, [isLoaded, branchCoordinates, deliveryAddress]);

  useEffect(() => {
    calculateRoute();
  }, [calculateRoute]);

  if (!isLoaded) {
    return (
      <div className="rounded-2xl overflow-hidden h-[300px] bg-pink-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-4 border-pink-200 border-t-pink-500 animate-spin" />
          <p className="text-xs text-slate-500">Cargando mapa...</p>
        </div>
      </div>
    );
  }

  if (error) return null;

  return (
    <div className="glass-card rounded-2xl overflow-hidden shadow-premium">
      {/* Info bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span className="text-xs font-semibold">
            {STATUS_MESSAGES[status] || "En proceso"}
          </span>
        </div>
        {duration && distance && (
          <span className="text-xs font-medium opacity-90">
            {distance} &middot; ~{duration}
          </span>
        )}
      </div>

      {/* Map */}
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "280px" }}
        center={branchCoordinates}
        zoom={13}
        options={{
          styles: isDark ? darkMapStyle : lightMapStyle,
          disableDefaultUI: true,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        }}
      >
        {directions ? (
          <DirectionsRenderer
            directions={directions}
            options={{
              polylineOptions: {
                strokeColor: "#ec4899",
                strokeWeight: 5,
                strokeOpacity: 0.8,
              },
              suppressMarkers: true,
            }}
          />
        ) : null}

        {/* Branch marker (origin) */}
        <MarkerF
          position={branchCoordinates}
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: "#ec4899",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 3,
          }}
          title={branchName}
        />

        {/* Destination marker */}
        {directions && directions.routes[0]?.legs[0]?.end_location && (
          <MarkerF
            position={directions.routes[0].legs[0].end_location}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: "#10b981",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 3,
            }}
            title="Destino de entrega"
          />
        )}
      </GoogleMap>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 px-4 py-2.5 bg-white/80 dark:bg-slate-900/80 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-pink-500 border-2 border-white shadow-sm" />
          <span className="text-slate-600 dark:text-slate-400">{branchName}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow-sm" />
          <span className="text-slate-600 dark:text-slate-400">Tu direccion</span>
        </div>
      </div>
    </div>
  );
}
