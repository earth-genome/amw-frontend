import { LngLatBounds } from "mapbox-gl";

export type GeoJSONType = GeoJSON.Feature<GeoJSON.Polygon>;

// This function converts map bounds to a GeoJSON Polygon representation.
export function convertBoundsToGeoJSON(bounds: LngLatBounds): GeoJSONType {
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

  const geojson: GeoJSON.Feature<GeoJSON.Polygon> = {
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: coordinates,
    },
    properties: {},
  };
  return geojson;
}
