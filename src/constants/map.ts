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
