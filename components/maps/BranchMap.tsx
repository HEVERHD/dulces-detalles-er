"use client";

import { GoogleMap, InfoWindowF } from "@react-google-maps/api";
import { useState, useCallback } from "react";
import { useTheme } from "@/components/ThemeContext";
import { useGoogleMaps } from "./GoogleMapsProvider";
import { BRANCHES, CARTAGENA_CENTER, type Branch } from "@/config/branches";
import BranchMarker from "./BranchMarker";
import DeliveryZones from "./DeliveryZones";
import { lightMapStyle, darkMapStyle } from "./mapStyles";

interface BranchMapProps {
  userPosition?: { lat: number; lng: number } | null;
}

export default function BranchMap({ userPosition }: BranchMapProps) {
  const { isLoaded } = useGoogleMaps();
  const { isDark } = useTheme();
  const [activeMarker, setActiveMarker] = useState<Branch | null>(null);

  const handleWhatsApp = useCallback((branch: Branch) => {
    const info = BRANCHES[branch];
    const url = `https://wa.me/${info.whatsapp}?text=${encodeURIComponent(
      "Hola, vengo desde la web de Dulces Detalles ER"
    )}`;
    window.open(url, "_blank");
  }, []);

  const handleDirections = useCallback((branch: Branch) => {
    const info = BRANCHES[branch];
    const url = `https://www.google.com/maps/dir/?api=1&destination=${info.coordinates.lat},${info.coordinates.lng}&destination_place_id&travelmode=driving`;
    window.open(url, "_blank");
  }, []);

  if (!isLoaded) {
    return (
      <div className="rounded-3xl overflow-hidden shadow-premium h-[400px] md:h-[500px] bg-pink-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-pink-200 border-t-pink-500 animate-spin" />
          <p className="text-sm text-slate-500">Cargando mapa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-3xl overflow-hidden shadow-premium">
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "500px" }}
        center={CARTAGENA_CENTER}
        zoom={13}
        options={{
          styles: isDark ? darkMapStyle : lightMapStyle,
          disableDefaultUI: true,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        }}
      >
        <DeliveryZones userPosition={userPosition} />

        {(Object.keys(BRANCHES) as Branch[]).map((key) => (
          <BranchMarker
            key={key}
            branch={BRANCHES[key]}
            onClick={() =>
              setActiveMarker(activeMarker === key ? null : key)
            }
          />
        ))}

        {activeMarker && (
          <InfoWindowF
            position={BRANCHES[activeMarker].coordinates}
            onCloseClick={() => setActiveMarker(null)}
            options={{ pixelOffset: new google.maps.Size(0, -35) }}
          >
            <div className="p-2 min-w-[220px] max-w-[280px]">
              <h3 className="font-bold text-slate-900 text-sm mb-1">
                {BRANCHES[activeMarker].name}
              </h3>
              <p className="text-xs text-slate-500 mb-1">
                {BRANCHES[activeMarker].address}
              </p>
              <p className="text-xs text-slate-400 mb-2">
                {BRANCHES[activeMarker].reference}
              </p>
              <p className="text-xs font-semibold text-pink-600 mb-3">
                {BRANCHES[activeMarker].phone}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleWhatsApp(activeMarker)}
                  className="flex-1 inline-flex items-center justify-center gap-1 bg-green-500 hover:bg-green-600 text-white text-[11px] font-semibold px-3 py-2 rounded-lg transition-colors"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp
                </button>
                <button
                  onClick={() => handleDirections(activeMarker)}
                  className="flex-1 inline-flex items-center justify-center gap-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-[11px] font-semibold px-3 py-2 rounded-lg transition-colors"
                >
                  <svg
                    className="w-3.5 h-3.5"
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
                  Como llegar
                </button>
              </div>
            </div>
          </InfoWindowF>
        )}
      </GoogleMap>
    </div>
  );
}
