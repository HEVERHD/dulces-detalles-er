"use client";

import { CircleF } from "@react-google-maps/api";
import { BRANCHES, DELIVERY_RADIUS_METERS } from "@/config/branches";

interface DeliveryZonesProps {
  userPosition?: { lat: number; lng: number } | null;
}

export default function DeliveryZones({ userPosition }: DeliveryZonesProps) {
  const isInsideZone = (branchCoords: { lat: number; lng: number }) => {
    if (!userPosition || typeof google === "undefined") return false;
    const distance = google.maps.geometry.spherical.computeDistanceBetween(
      new google.maps.LatLng(userPosition.lat, userPosition.lng),
      new google.maps.LatLng(branchCoords.lat, branchCoords.lng)
    );
    return distance <= DELIVERY_RADIUS_METERS;
  };

  const outletInside = isInsideZone(BRANCHES.outlet.coordinates);
  const supercentroInside = isInsideZone(BRANCHES.supercentro.coordinates);
  const isInAnyZone = outletInside || supercentroInside;

  return (
    <>
      <CircleF
        center={BRANCHES.outlet.coordinates}
        radius={DELIVERY_RADIUS_METERS}
        options={{
          fillColor: "#ec4899",
          fillOpacity: 0.08,
          strokeColor: "#ec4899",
          strokeOpacity: 0.4,
          strokeWeight: 2,
        }}
      />
      <CircleF
        center={BRANCHES.supercentro.coordinates}
        radius={DELIVERY_RADIUS_METERS}
        options={{
          fillColor: "#f59e0b",
          fillOpacity: 0.08,
          strokeColor: "#f59e0b",
          strokeOpacity: 0.4,
          strokeWeight: 2,
        }}
      />

      {userPosition && (
        <div className="absolute bottom-4 left-4 z-10">
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold shadow-lg ${
              isInAnyZone
                ? "bg-green-500 text-white"
                : "bg-white text-slate-700 border border-slate-200"
            }`}
          >
            <span>{isInAnyZone ? "\u2705" : "\u26A0\uFE0F"}</span>
            <span>
              {isInAnyZone
                ? "Estas dentro de nuestra zona de delivery"
                : "Estas fuera de la zona de delivery"}
            </span>
          </div>
        </div>
      )}
    </>
  );
}
