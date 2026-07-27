"use client";
import { MapContainer, TileLayer, Polygon, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

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
      style={{ height: "100%", width: "100%", zIndex: 0, backgroundColor: "#020617" }} 
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      
      {zones.map(zone => {
        const positions = JSON.parse(zone.boundary);
        
        return (
          <Polygon 
            key={zone.id} 
            positions={positions}
            pathOptions={{ 
              color: getColor(zone.current_status), 
              fillColor: getColor(zone.current_status), 
              fillOpacity: 0.4,
              weight: 3,
              className: "radar-circle"
            }}
          >
            <Popup>
              <div className="font-semibold text-slate-800">
                {zone.zone_name}
              </div>
              <div className="text-sm">Status: {zone.current_status}</div>
            </Popup>
          </Polygon>
        );
      })}
    </MapContainer>
  );
}
