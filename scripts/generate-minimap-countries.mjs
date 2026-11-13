#!/usr/bin/env node
/**
 * Generate the countries drawn around the Amazon in the mini map, from the Natural Earth
 * 1:110m countries of world-atlas.
 *
 * Usage: yarn minimap-countries
 *
 * Only the polygons around the view of the mini map are kept, with rounded coordinates, so
 * the file stays small. The rings keep the winding order of world-atlas, which is the one
 * d3-geo expects (clockwise exterior rings).
 */

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { feature } from "topojson-client";

const require = createRequire(import.meta.url);
const topology = require("world-atlas/countries-110m.json");

const OUTPUT = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../src/app/[lang]/data/minimap_countries.json",
);

// [west, south, east, north], a bit wider than the view of the mini map (VIEW_EXTENT in
// src/app/[lang]/components/MiniMap/index.tsx), which shows more longitudes when it's wider
const EXTENT = [-100, -30, -20, 20];
const DECIMALS = 2;

const round = (value) => Number(value.toFixed(DECIMALS));

const roundRing = (ring) =>
  ring
    .map(([lng, lat]) => [round(lng), round(lat)])
    // without the points that became duplicated by the rounding
    .filter(
      ([lng, lat], i, points) =>
        i === 0 || lng !== points[i - 1][0] || lat !== points[i - 1][1],
    );

const intersectsExtent = (polygon) => {
  const [west, south, east, north] = EXTENT;
  const points = polygon[0];
  const lngs = points.map(([lng]) => lng);
  const lats = points.map(([, lat]) => lat);
  // e.g. polygons crossing the antimeridian
  if (Math.max(...lngs) - Math.min(...lngs) > 180) return false;
  return (
    Math.min(...lngs) <= east &&
    Math.max(...lngs) >= west &&
    Math.min(...lats) <= north &&
    Math.max(...lats) >= south
  );
};

const countries = feature(topology, topology.objects.countries);

const features = countries.features
  .map((country) => {
    const polygons =
      country.geometry?.type === "Polygon"
        ? [country.geometry.coordinates]
        : (country.geometry?.coordinates ?? []);
    // e.g. only French Guiana of France
    const nearbyPolygons = polygons
      .filter(intersectsExtent)
      .map((polygon) => polygon.map(roundRing))
      // rings too small to keep a shape after the rounding
      .filter((polygon) => polygon[0].length >= 4);
    if (!nearbyPolygons.length) return undefined;
    return {
      type: "Feature",
      properties: { name: country.properties.name },
      geometry: { type: "MultiPolygon", coordinates: nearbyPolygons },
    };
  })
  .filter(Boolean);

fs.writeFileSync(
  OUTPUT,
  JSON.stringify({ type: "FeatureCollection", features }) + "\n",
);
console.log(
  `Wrote ${features.length} countries to ${path.relative(process.cwd(), OUTPUT)}`,
);
