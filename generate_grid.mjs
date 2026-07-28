import fs from 'fs';

const LAT_MIN = 23.70;
const LAT_MAX = 23.85;
const LNG_MIN = 90.35;
const LNG_MAX = 90.45;
const ROWS = 6;
const COLS = 6;

const latStep = (LAT_MAX - LAT_MIN) / ROWS;
const lngStep = (LNG_MAX - LNG_MIN) / COLS;

let sql = `INSERT INTO public.zones (zone_name, boundary, current_status) VALUES \n`;
let values = [];

let id = 1;
for (let r = 0; r < ROWS; r++) {
  for (let c = 0; c < COLS; c++) {
    const sLat = LAT_MIN + r * latStep;
    const nLat = sLat + latStep;
    const wLng = LNG_MIN + c * lngStep;
    const eLng = wLng + lngStep;
    
    // Polygon: SW, SE, NE, NW, SW
    const coords = [
      [sLat, wLng],
      [sLat, eLng],
      [nLat, eLng],
      [nLat, wLng],
      [sLat, wLng]
    ];
    
    values.push(`('Sector MZ-${id}', '${JSON.stringify(coords)}', 'Green')`);
    id++;
  }
}

sql += values.join(",\n") + ";";
fs.writeFileSync('insert_grid.sql', sql);
console.log("Wrote insert_grid.sql");
