"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type Therapist = {
  id: string;
  name: string;
  location?: {
    lat: number;
    lng: number;
  };
};

type Props = {
  userLocation?: {
    lat: number;
    lng: number;
  };
  therapists: Therapist[];
};

/* FIX INVALID LEAFLET ICON ISSUE */
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

export default function TherapistMap({
  userLocation,
  therapists,
}: Props) {
  /* 🚨 HARD GUARDS — NO MAP UNTIL SAFE */
  if (!userLocation) return null;
  if (!userLocation.lat || !userLocation.lng) return null;
  if (!therapists || therapists.length === 0) return null;

  return (
    <MapContainer
      center={[userLocation.lat, userLocation.lng]}
      zoom={12}
      className="h-full w-full rounded-lg"
    >
      <TileLayer
        attribution="© OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {therapists.map(
        (t) =>
          t.location && (
            <Marker
              key={t.id}
              position={[t.location.lat, t.location.lng]}
            >
              <Popup>{t.name}</Popup>
            </Marker>
          )
      )}
    </MapContainer>
  );
}
