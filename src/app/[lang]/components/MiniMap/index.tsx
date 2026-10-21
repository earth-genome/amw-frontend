import "./style.css";
import React from "react";
import * as d3 from "d3";
import geojson from "@/app/[lang]/data/amazon_aca.json";
// generated with `yarn minimap-countries`
import countriesGeojson from "@/app/[lang]/data/minimap_countries.json";
import { GeoJSONType } from "@/app/[lang]/components/Map/helpers";

interface MiniMapProps {
  bounds?: GeoJSONType;
  showMinimapBounds: boolean;
  width?: number;
  height?: number;
  // a circle at the center of the bounds stays visible when the bounds are tiny
  boundsMarker?: "rectangle" | "circle";
}

const DEFAULT_WIDTH = 165;
const DEFAULT_HEIGHT = 100;
// the rectangle stays visible when the bounds are tiny
const MIN_RECTANGLE_SIZE = 7;
const CIRCLE_RADIUS = 5;
const BACKGROUND_COLOR = "#f8f8f8";
const COUNTRY_COLOR = "#e4e4e4";
const COUNTRY_BORDER_COLOR = "#999999";
const AMAZON_COLOR = "#22B573";
const MARKER_COLOR = "#ffb301";

// the view of the mini map, around the Amazon with its neighbouring countries, as the
// corners of a [west, south, east, north] extent
const VIEW_EXTENT: GeoJSON.MultiPoint = {
  type: "MultiPoint",
  coordinates: [
    [-89, -23],
    [-35, 13],
  ],
};

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

// already with the winding order of d3
const countries = countriesGeojson as GeoJSON.FeatureCollection;

// the Amazon and its neighbouring countries with a marker at the bounds of a map, drawn as
// an SVG, so it doesn't need a map of its own, e.g. a WebGL context
const MiniMap: React.FC<MiniMapProps> = ({
  bounds,
  showMinimapBounds,
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
  boundsMarker = "rectangle",
}) => {
  const projection = d3
    .geoNaturalEarth1()
    .fitSize([width, height], VIEW_EXTENT);
  const path = d3.geoPath(projection);

  // southwest and northeast corners of the bounds polygon
  const ring = bounds?.geometry?.coordinates?.[0];
  const southWest = ring && projection(ring[0] as [number, number]);
  const northEast = ring && projection(ring[2] as [number, number]);
  const marker =
    showMinimapBounds && southWest && northEast
      ? {
          centerX: (southWest[0] + northEast[0]) / 2,
          centerY: (southWest[1] + northEast[1]) / 2,
          width: Math.max(northEast[0] - southWest[0], MIN_RECTANGLE_SIZE),
          height: Math.max(southWest[1] - northEast[1], MIN_RECTANGLE_SIZE),
        }
      : undefined;

  return (
    <div className="mini-map">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <rect width={width} height={height} fill={BACKGROUND_COLOR} />
        {countries.features.map((feature, i) => (
          <path
            key={i}
            d={path(feature) ?? undefined}
            fill={COUNTRY_COLOR}
            stroke={COUNTRY_BORDER_COLOR}
            strokeWidth={0.5}
            strokeLinejoin="round"
          />
        ))}
        {amazon.features.map((feature, i) => (
          <path key={i} d={path(feature) ?? undefined} fill={AMAZON_COLOR} />
        ))}
        {marker && boundsMarker === "circle" && (
          <circle
            cx={marker.centerX}
            cy={marker.centerY}
            r={CIRCLE_RADIUS}
            fill={MARKER_COLOR}
            fillOpacity={0.5}
            stroke={MARKER_COLOR}
            strokeWidth={2}
            strokeOpacity={0.9}
          />
        )}
        {marker && boundsMarker === "rectangle" && (
          <rect
            x={marker.centerX - marker.width / 2}
            y={marker.centerY - marker.height / 2}
            width={marker.width}
            height={marker.height}
            fill={MARKER_COLOR}
            fillOpacity={0.5}
            stroke={MARKER_COLOR}
            strokeWidth={1.5}
            strokeOpacity={0.9}
          />
        )}
      </svg>
    </div>
  );
};

export default MiniMap;
