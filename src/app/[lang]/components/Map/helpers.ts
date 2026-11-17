import { LngLatBounds } from "mapbox-gl";

export type GeoJSONType = GeoJSON.Feature<GeoJSON.Polygon>;

// This function converts a [west, south, east, north] bounding box to a GeoJSON Polygon
// representation, e.g. the bbox of an area.
export function convertBboxToGeoJSON([west, south, east, north]: [
  number,
  number,
  number,
  number,
]): GeoJSONType {
  // Create a polygon representation of the bounds
  // Note: The last coordinate must be the same as the first to close the polygon.
  const coordinates: GeoJSON.Position[][] = [
    [
      [west, south], // Southwest
      [west, north], // Northwest
      [east, north], // Northeast
      [east, south], // Southeast
      [west, south], // Close the polygon
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

// This function converts map bounds to a GeoJSON Polygon representation.
export function convertBoundsToGeoJSON(bounds: LngLatBounds): GeoJSONType {
  // Extract the southwest and northeast points of the bounds
  const sw = bounds.getSouthWest();
  const ne = bounds.getNorthEast();
  return convertBboxToGeoJSON([sw.lng, sw.lat, ne.lng, ne.lat]);
}
