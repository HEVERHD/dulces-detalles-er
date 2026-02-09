"use client";

import { MarkerF } from "@react-google-maps/api";
import type { BranchInfo } from "@/config/branches";

interface BranchMarkerProps {
  branch: BranchInfo;
  onClick?: () => void;
}

function createMarkerIcon(color: string): google.maps.Symbol {
  return {
    path: "M12 0C7.03 0 3 4.03 3 9c0 6.75 9 15 9 15s9-8.25 9-15c0-4.97-4.03-9-9-9zm0 12.75c-2.07 0-3.75-1.68-3.75-3.75S9.93 5.25 12 5.25s3.75 1.68 3.75 3.75S14.07 12.75 12 12.75z",
    fillColor: color,
    fillOpacity: 1,
    strokeColor: "#ffffff",
    strokeWeight: 2,
    scale: 1.8,
    anchor: new google.maps.Point(12, 24),
  };
}

export default function BranchMarker({ branch, onClick }: BranchMarkerProps) {
  return (
    <MarkerF
      position={branch.coordinates}
      onClick={onClick}
      icon={createMarkerIcon(branch.colorHex)}
      title={branch.name}
      animation={google.maps.Animation.DROP}
    />
  );
}
