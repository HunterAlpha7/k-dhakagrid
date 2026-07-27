"use client";
import { MapContainer, TileLayer, Polygon, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Example Dhaka zones for MVP
const mockZones = [
  {
    id: "zone-1",
    name: "Uttara",
    status: "Green",
    positions: [[23.8759, 90.3980], [23.8759, 90.4100], [23.8650, 90.4100], [23.8650, 90.3980]]
  },
  {
    id: "zone-2",
    name: "Mirpur",
    status: "Red",
    positions: [[23.8223, 90.3654], [23.8223, 90.3750], [23.8000, 90.3750], [23.8000, 90.3654]]
  },
  {
    id: "zone-3",
    name: "Dhanmondi",
    status: "Yellow",
    positions: [[23.7461, 90.3742], [23.7461, 90.3850], [23.7350, 90.3850], [23.7350, 90.3742]]
  }
];

const getColor = (status: string) => {
  if (status === "Green") return "#22c55e"; // green-500
  if (status === "Yellow") return "#eab308"; // yellow-500
  if (status === "Red") return "#ef4444"; // red-500
  return "#94a3b8";
}

export default function Map({ zones }: { zones: any[] }) {
  return (
    <MapContainer 
      center={[23.8103, 90.4125]} 
      zoom={11} 
      style={{ height: "100%", width: "100%", zIndex: 0 }} 
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      
      {zones.map(zone => (
        <Polygon 
          key={zone.id} 
          positions={JSON.parse(zone.boundary)} 
          pathOptions={{ 
            color: getColor(zone.current_status), 
            fillColor: getColor(zone.current_status), 
            fillOpacity: 0.4,
            weight: 2
          }}
        >
          <Popup>
            <div className="font-semibold text-slate-800">
              {zone.zone_name}
            </div>
            <div className="text-sm">Status: {zone.current_status}</div>
          </Popup>
        </Polygon>
      ))}
    </MapContainer>
  );
}
