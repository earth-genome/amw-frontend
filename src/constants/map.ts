import { scaleSequential } from "d3-scale";
import { interpolateRgbBasis } from "d3-interpolate";

export const MAP_COLOR_SCALE = [
  "#F7E4BC",
  "#F5CD7E",
  "#F1B53F",
  "#ED9E00",
  "#F37D00",
  "#F95D00",
  "#FF3C00",
];

export const MAP_MISSING_DATA_COLOR = "#ccc";

export const createYearsColorScale = (years: number[]) => {
  return scaleSequential()
    .domain([0, years.length - 1])
    .interpolator(interpolateRgbBasis(MAP_COLOR_SCALE));
};

export interface AreaType {
  key: string;
  dictionaryKey: string;
  dictionaryKeySingular: string;
  file: string;
  isDefault?: boolean;
}

export const AREA_TYPES = [
  {
    key: "indigenous-territory",
    dictionaryKey: "indigenous_territories",
    dictionaryKeySingular: "indigenous_territory",
    file: "indigenous_territories.geojson",
    isDefault: true,
  },
  {
    key: "protected-area",
    dictionaryKey: "protected_areas",
    dictionaryKeySingular: "protected_area",
    file: "protected_areas.geojson",
  },
] as const;
