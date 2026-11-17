import { LAYER_YEARS } from "@/constants/map";

// shared configuration between the main map and the scrollytelling map

export const INITIAL_VIEW = {
  longitude: -67.78320182377449,
  latitude: -5.871455584726869,
  zoom: 3.7,
};

export const MAP_MIN_ZOOM = 3.5;

export const MAP_PROJECTION: {
  name: "naturalEarth";
  center: [number, number];
  parallels: [number, number];
} = {
  name: "naturalEarth",
  center: [183, 40],
  parallels: [30, 30],
};

export const SATELLITE_LAYERS = {
  yearly: "mapbox://styles/earthrise/clvwchqxi06gh01pe1huv70id",
  hiRes: "mapbox://styles/earthrise/cmdxgrceq014x01s22jfm5muv", // Mapbox satellite
};

export const LAYER_ORDER = [
  // bottom to top
  ...LAYER_YEARS.map((d) => `sentinel-layer-${d}`),
  "hole-layer",
  "country-boundaries",
  "areas-layer",
  "areas-layer-fill",
  "mines-layer",
  "selected-area-layer",
  "selected-area-layer-fill",
  // "hotspots-fill",
  // "hotspots-outline",
  // "hotspots-circle",
  // "hotspots-dot",
  // "hotspots-labels",
];
