import { LngLatBounds } from "mapbox-gl";

// This function converts map bounds to a GeoJSON Polygon representation.
export function convertBoundsToGeoJSON(
  bounds: LngLatBounds,
): GeoJSON.Feature<GeoJSON.Polygon> {
  // Extract the southwest and northeast points of the bounds
  const sw = bounds.getSouthWest();
  const ne = bounds.getNorthEast();

  // Create a polygon representation of the bounds
  // Note: The last coordinate must be the same as the first to close the polygon.
  const coordinates: GeoJSON.Position[][] = [
    [
      [sw.lng, sw.lat], // Southwest
      [sw.lng, ne.lat], // Northwest
      [ne.lng, ne.lat], // Northeast
      [ne.lng, sw.lat], // Southeast
      [sw.lng, sw.lat], // Close the polygon
    ],
  ];

  // Construct the GeoJSON feature

  /* @ts-ignore */
  const geojson: GeoJSON.Feature<GeoJSON.Polygon> = {
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: coordinates,
    },
  };
  return geojson;
}
