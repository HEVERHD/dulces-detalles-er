"use client";

import { useRef, useCallback } from "react";
import { Autocomplete } from "@react-google-maps/api";
import { useGoogleMaps } from "./GoogleMapsProvider";
import { CARTAGENA_CENTER } from "@/config/branches";

interface AddressAutocompleteProps {
  value: string;
  onChange: (address: string) => void;
}

export default function AddressAutocomplete({
  value,
  onChange,
}: AddressAutocompleteProps) {
  const { isLoaded } = useGoogleMaps();
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const onLoad = useCallback(
    (autocomplete: google.maps.places.Autocomplete) => {
      autocompleteRef.current = autocomplete;
    },
    []
  );

  const onPlaceChanged = useCallback(() => {
    if (!autocompleteRef.current) return;
    const place = autocompleteRef.current.getPlace();
    if (place?.formatted_address) {
      onChange(place.formatted_address);
    } else if (place?.name) {
      onChange(place.name);
    }
  }, [onChange]);

  if (!isLoaded) {
    return (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Escribe tu direccion de entrega..."
        className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition-all"
      />
    );
  }

  return (
    <Autocomplete
      onLoad={onLoad}
      onPlaceChanged={onPlaceChanged}
      options={{
        componentRestrictions: { country: "co" },
        bounds: new google.maps.LatLngBounds(
          new google.maps.LatLng(
            CARTAGENA_CENTER.lat - 0.15,
            CARTAGENA_CENTER.lng - 0.15
          ),
          new google.maps.LatLng(
            CARTAGENA_CENTER.lat + 0.15,
            CARTAGENA_CENTER.lng + 0.15
          )
        ),
        fields: ["formatted_address", "name", "geometry"],
      }}
    >
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Escribe tu direccion de entrega..."
        className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition-all"
      />
    </Autocomplete>
  );
}
