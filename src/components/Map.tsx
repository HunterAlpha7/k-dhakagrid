"use client";
import { MapContainer, TileLayer, Popup, useMapEvents, Marker, Polygon } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const reportIcon = L.divIcon({
  className: 'report-pin',
  html: '<div style="background-color: #ef4444; width: 12px; height: 12px; border-radius: 50%; box-shadow: 0 0 10px rgba(239, 68, 68, 0.8);"></div>',
  iconSize: [12, 12],
  iconAnchor: [6, 6]
});

const myLocationIcon = L.divIcon({
  className: 'custom-pin',
  html: '<div style="background-color: #3b82f6; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 15px rgba(0,0,0,0.8); cursor: grab;"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

// Calculate convex hull using Monotone Chain
function getConvexHull(points: [number, number][]): [number, number][] {
  if (points.length <= 3) return points;
  const sorted = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o: [number, number], a: [number, number], b: [number, number]) => 
    (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower = [];
  for (let i = 0; i < sorted.length; i++) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], sorted[i]) <= 0) lower.pop();
    lower.push(sorted[i]);
  }
  const upper = [];
  for (let i = sorted.length - 1; i >= 0; i--) {
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], sorted[i]) <= 0) upper.pop();
    upper.push(sorted[i]);
  }
  upper.pop();
  lower.pop();
  return lower.concat(upper);
}

// Cluster points based on Euclidean distance threshold
function clusterPoints(reports: any[], threshold: number) {
  const clusters: any[][] = [];
  const visited = new Set();
  for (let i = 0; i < reports.length; i++) {
    if (visited.has(i)) continue;
    const cluster = [reports[i]];
    visited.add(i);
    for (let j = 0; j < cluster.length; j++) {
      const p1 = cluster[j];
      for (let k = 0; k < reports.length; k++) {
        if (visited.has(k)) continue;
        const p2 = reports[k];
        const dist = Math.sqrt(Math.pow(p1.lat - p2.lat, 2) + Math.pow(p1.lng - p2.lng, 2));
        if (dist <= threshold) {
          cluster.push(p2);
          visited.add(k);
        }
      }
    }
    clusters.push(cluster);
  }
  return clusters;
}

function LocationPin({ selectedLocation, setSelectedLocation, allowManualPin }: any) {
  useMapEvents({
    click(e) {
      if (allowManualPin && setSelectedLocation) {
        setSelectedLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    },
  });

  return selectedLocation ? (
    <Marker position={[selectedLocation.lat, selectedLocation.lng]} icon={myLocationIcon}>
      <Popup>Your Selected Location</Popup>
    </Marker>
  ) : null;
}

export default function Map({ reports = [], selectedLocation, setSelectedLocation, allowManualPin = true }: any) {
  // Generate clusters with a threshold of roughly ~1.5km (0.015 degrees)
  const clusters = clusterPoints(reports, 0.015);
  const hulls = clusters.filter(c => c.length >= 3).map(c => getConvexHull(c.map(p => [p.lat, p.lng])));

  return (
    <MapContainer 
      center={[23.8103, 90.4125]} 
      zoom={12} 
      style={{ height: "100%", width: "100%", zIndex: 0, backgroundColor: "#020617" }} 
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        keepBuffer={2}
        updateWhenZooming={false}
      />
      
      {hulls.map((hull, i) => (
        <Polygon 
          key={`hull-${i}`} 
          positions={hull} 
          pathOptions={{ 
            color: '#ef4444', 
            fillColor: '#ef4444', 
            fillOpacity: 0.2,
            weight: 2,
            dashArray: "5, 5"
          }} 
        />
      ))}

      {reports.map((report: any) => (
        <Marker 
          key={report.id} 
          position={[report.lat, report.lng]} 
          icon={reportIcon}
        >
          <Popup>
            <div className="font-semibold text-slate-800">
              {report.utility_type} Outage
            </div>
            <div className="text-sm text-slate-500">
              {new Date(report.created_at).toLocaleString()}
            </div>
          </Popup>
        </Marker>
      ))}

      <LocationPin selectedLocation={selectedLocation} setSelectedLocation={setSelectedLocation} allowManualPin={allowManualPin} />
    </MapContainer>
  );
}
