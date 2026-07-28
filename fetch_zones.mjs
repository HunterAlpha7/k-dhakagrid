
import osmtogeojson from 'osmtogeojson';
import fs from 'fs';

async function run() {
  console.log("Fetching data from Overpass API...");
  // Query to fetch some administrative boundaries in Dhaka (admin_level 10 usually corresponds to Wards/Mahallas)
  // We'll limit it to a bounding box around Mirpur to keep it small for now.
  // BBox: south, west, north, east
  const query = `
    [out:json][timeout:90];
    area["name:en"="Dhaka"]->.searchArea;
    (
      relation["boundary"="administrative"]["admin_level"="9"](area.searchArea);
    );
    out body;
    >;
    out skel qt;
  `;

  try {
    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'DhakaGridApp/1.0'
      },
      body: 'data=' + encodeURIComponent(query)
    });
    
    if (!res.ok) {
      console.error("Overpass API error:", res.statusText);
      return;
    }

    const data = await res.json();
    console.log("Parsing to GeoJSON...");
    const geojson = osmtogeojson(data);
    
    // Filter out points, we only want polygons
    const polygons = geojson.features.filter(f => f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon');
    
    console.log(`Found ${polygons.length} micro-zones.`);
    
    const zones = polygons.map((p, i) => {
      // OSM sometimes doesn't have English names, fallback to local name or generic
      let name = p.properties.name || p.properties['name:en'] || `Mirpur Zone ${i+1}`;
      
      // Convert GeoJSON geometry to a simple array of [lat, lng] for react-leaflet Polygon
      // GeoJSON is [lng, lat], Leaflet is [lat, lng]
      let coords = [];
      if (p.geometry.type === 'Polygon') {
        coords = p.geometry.coordinates[0].map(c => [c[1], c[0]]);
      } else if (p.geometry.type === 'MultiPolygon') {
        coords = p.geometry.coordinates[0][0].map(c => [c[1], c[0]]);
      }

      return {
        zone_name: name,
        boundary: JSON.stringify(coords),
        current_status: 'Green'
      };
    });

    fs.writeFileSync('micro-zones.json', JSON.stringify(zones, null, 2));
    console.log("Successfully wrote micro-zones.json");
    
  } catch (e) {
    console.error("Error:", e);
  }
}

run();
