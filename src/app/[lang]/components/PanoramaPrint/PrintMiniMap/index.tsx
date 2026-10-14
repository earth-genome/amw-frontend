import React from "react";
import * as d3 from "d3";
import geojson from "@/app/[lang]/data/amazon_aca.json";

interface PrintMiniMapProps {
  bbox: [number, number, number, number];
  width?: number;
  height?: number;
}

const PADDING = 8;
// the marker stays visible when the area is tiny
const MIN_MARKER_SIZE = 7;

// d3 expects clockwise exterior rings, unlike GeoJSON, otherwise it fills the whole globe
// except the polygon
const amazon: GeoJSON.FeatureCollection = {
  ...(geojson as GeoJSON.FeatureCollection),
  features: (geojson as GeoJSON.FeatureCollection).features.map((feature) =>
    feature.geometry.type === "Polygon"
      ? {
          ...feature,
          geometry: {
            ...feature.geometry,
            coordinates: feature.geometry.coordinates.map((ring) =>
              [...ring].reverse(),
            ),
          },
        }
      : feature,
  ),
};

// the Amazon with a marker at the area, a static version of the minimap, so it doesn't
// need a WebGL context
const PrintMiniMap = ({
  bbox,
  width = 112,
  height = 76,
}: PrintMiniMapProps) => {
  const projection = d3.geoNaturalEarth1().fitExtent(
    [
      [PADDING, PADDING],
      [width - PADDING, height - PADDING],
    ],
    amazon,
  );
  const path = d3.geoPath(projection);
  const [west, south, east, north] = bbox;
  const topLeft = projection([west, north]);
  const bottomRight = projection([east, south]);

  const marker =
    topLeft && bottomRight
      ? (() => {
          const markerWidth = Math.max(
            bottomRight[0] - topLeft[0],
            MIN_MARKER_SIZE,
          );
          const markerHeight = Math.max(
            bottomRight[1] - topLeft[1],
            MIN_MARKER_SIZE,
          );
          const centerX = (topLeft[0] + bottomRight[0]) / 2;
          const centerY = (topLeft[1] + bottomRight[1]) / 2;
          return {
            x: centerX - markerWidth / 2,
            y: centerY - markerHeight / 2,
            width: markerWidth,
            height: markerHeight,
          };
        })()
      : undefined;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <rect
        x={0.5}
        y={0.5}
        width={width - 1}
        height={height - 1}
        rx={6}
        fill="#dddddd"
        stroke="rgba(0, 0, 0, 0.15)"
      />
      {amazon.features.map((feature, i) => (
        <path key={i} d={path(feature) ?? undefined} fill="#22B573" />
      ))}
      {marker && (
        <rect
          {...marker}
          fill="rgba(255, 179, 1, 0.6)"
          stroke="#ffb301"
          strokeWidth={1.5}
        />
      )}
    </svg>
  );
};

export default PrintMiniMap;
