import { scaleSequential } from "d3-scale";
import { interpolateRgbBasis } from "d3-interpolate";
import { HOTSPOTS_GEOJSON_URL } from "@/utils/hotspots";

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
  url: string;
  timeseriesUrl: string;
  isDefault?: boolean;
  renderLabel: (properties: Record<string, any>) => string;
  renderTitle: (properties: Record<string, any>) => string;
  renderStatus: (properties: Record<string, any>) => string;
  showCountry: boolean;
}

export const MINING_DATA_URL = `https://raw.githubusercontent.com/earthrise-media/mining-detector/8a076bf0d6fdc3dde16b9abed68087fa40ee8c92/data/outputs/48px_v3.2-3.7ensemble/difference/amazon_basin_48px_v3.2-3.7ensemble_dissolved-0.6_2018-2024_all_differences.geojson`;

const AREA_TYPES_BASE_URL =
  // "/test-data";
  "https://raw.githubusercontent.com/earthrise-media/mining-detector/standardize-it-and-pa-areas/data/boundaries";

export const AREA_TYPES = [
  {
    key: "countries",
    dictionaryKey: "countries",
    dictionaryKeySingular: "country",
    url: `${AREA_TYPES_BASE_URL}/national_admin/out/national_admin_impacts.geojson`,
    timeseriesUrl: `${AREA_TYPES_BASE_URL}/national_admin/out/national_admin_yearly.json`,
    isDefault: true,
    renderLabel: (properties: Record<string, any>) => properties.country,
    renderTitle: (properties: Record<string, any>) => properties.country,
    renderStatus: () => "",
    showCountry: false,
  },
  {
    key: "subnational-areas",
    dictionaryKey: "subnational_jurisdictions",
    dictionaryKeySingular: "subnational_jurisdiction",
    url: `${AREA_TYPES_BASE_URL}/subnational_admin/out/admin_areas_display_impacts_unfiltered.geojson`,
    timeseriesUrl: `${AREA_TYPES_BASE_URL}/subnational_admin/out/admin_areas_display_yearly.json`,
    isDefault: true,
    renderLabel: (properties: Record<string, any>) =>
      `${properties.name_field || "N/A"} ${
        properties.country ? `- ${properties.country}` : ""
      }`,
    renderTitle: (properties: Record<string, any>) =>
      properties.name_field || "N/A",
    renderStatus: () => "",
    showCountry: true,
  },
  {
    key: "indigenous-territory",
    dictionaryKey: "indigenous_territories",
    dictionaryKeySingular: "indigenous_territory",
    url: `${AREA_TYPES_BASE_URL}/protected_areas_and_indigenous_territories/out/indigenous_territories_impacts.geojson`,
    timeseriesUrl: `${AREA_TYPES_BASE_URL}/protected_areas_and_indigenous_territories/out/indigenous_territories_yearly.json`,
    isDefault: false,
    renderLabel: (properties: Record<string, any>) =>
      `${properties.name_field || "N/A"} ${
        properties.status_field ? `- ${properties.status_field}` : ""
      } ${properties.country ? `- ${properties.country}` : ""}`,
    renderTitle: (properties: Record<string, any>) =>
      properties.name_field || "N/A",
    renderStatus: (properties: Record<string, any>) => properties.status_field,
    showCountry: true,
  },
  {
    key: "protected-area",
    dictionaryKey: "protected_areas",
    dictionaryKeySingular: "protected_area",
    url: `${AREA_TYPES_BASE_URL}/protected_areas_and_indigenous_territories/out/protected_areas_impacts.geojson`,
    timeseriesUrl: `${AREA_TYPES_BASE_URL}/protected_areas_and_indigenous_territories/out/protected_areas_yearly.json`,
    isDefault: false,
    renderLabel: (properties: Record<string, any>) =>
      `${properties.name_field || "N/A"} ${
        properties.status_field ? `- ${properties.status_field}` : ""
      } ${properties.country ? `- ${properties.country}` : ""}`,
    renderTitle: (properties: Record<string, any>) =>
      properties.name_field || "N/A",
    renderStatus: (properties: Record<string, any>) => properties.status_field,
    showCountry: true,
  },
  {
    key: "hotspots",
    dictionaryKey: "hotspots",
    dictionaryKeySingular: "hotspot",
    url: HOTSPOTS_GEOJSON_URL,
    // FIXME:
    timeseriesUrl: "",
    isDefault: false,
    renderLabel: (properties: Record<string, any>) => properties.title,
    renderTitle: (properties: Record<string, any>) => properties.title,
    renderStatus: (properties: Record<string, any>) => "",
    showCountry: false,
  },
] as const;

export type PERMITTED_AREA_TYPES_KEYS = (typeof AREA_TYPES)[number]["key"];
