import { scaleSequential } from "d3-scale";
import { interpolateRgbBasis } from "d3-interpolate";
import { HOTSPOTS_GEOJSON_URL } from "@/cms/hotspots";

export const MAP_COLOR_SCALE = [
  "#F7E4BC",
  "#F5CD7E",
  "#F1B53F",
  "#ED9E00",
  // "#F37D00",
  // "#F95D00",
  // "#FF3C00",
];

// we use a different, more contrasting color for the latest year
export const MAP_LATEST_YEAR_COLOR = "#f50505";
export const MAP_COLOR_SCALE_WITH_LATEST_YEAR = [
  ...MAP_COLOR_SCALE,
  MAP_LATEST_YEAR_COLOR,
];

export const MAP_MISSING_DATA_COLOR = "#ccc";

export const createYearsColorScale = (years: number[]) => {
  return scaleSequential()
    .domain([0, years.length - 1])
    .interpolator(interpolateRgbBasis(MAP_COLOR_SCALE));
};

export const getColorsForYears = (years: number[]) => {
  const colorScale = createYearsColorScale(years.slice(0, -1));
  return years.map((_, index) =>
    index === years.length - 1 ? MAP_LATEST_YEAR_COLOR : colorScale(index)
  );
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
  useLocale: boolean;
}

const DATA_BASE_URL =
  // "/test-data";
  process.env.NEXT_PUBLIC_DATA_URL;

if (!DATA_BASE_URL) {
  throw new Error(
    "NEXT_PUBLIC_DATA_URL environment variable is not set. Please add it to your .env file."
  );
}

export const MINING_DATA_URL = `${DATA_BASE_URL}/outputs/test-data/amazon_basin_48px_v3.2-3.7ensemble_dissolved-0.6_2018-2025Q3_all_differences_simplified.json`;

export const AREA_TYPES = [
  {
    key: "countries",
    dictionaryKey: "countries",
    dictionaryKeySingular: "country",
    url: `${DATA_BASE_URL}/boundaries/national_admin/out/national_admin_impacts.json`,
    timeseriesUrl: `${DATA_BASE_URL}/boundaries/national_admin/out/national_admin_yearly.json`,
    isDefault: true,
    renderLabel: (properties: Record<string, any>) => properties.country,
    renderTitle: (properties: Record<string, any>) => properties.country,
    renderStatus: () => "",
    showCountry: false,
    useLocale: false,
  },
  {
    key: "subnational-areas",
    dictionaryKey: "subnational_jurisdictions",
    dictionaryKeySingular: "subnational_jurisdiction",
    url: `${DATA_BASE_URL}/boundaries/subnational_admin/out/admin_areas_display_impacts_unfiltered.json`,
    timeseriesUrl: `${DATA_BASE_URL}/boundaries/subnational_admin/out/admin_areas_display_yearly.json`,
    isDefault: true,
    renderLabel: (properties: Record<string, any>) =>
      `${properties.name_field || "N/A"} ${
        properties.country ? `- ${properties.country}` : ""
      }`,
    renderTitle: (properties: Record<string, any>) =>
      properties.name_field || "N/A",
    renderStatus: () => "",
    showCountry: true,
    useLocale: false,
  },
  {
    key: "indigenous-territory",
    dictionaryKey: "indigenous_territories",
    dictionaryKeySingular: "indigenous_territory",
    url: `${DATA_BASE_URL}/boundaries/protected_areas_and_indigenous_territories/out/indigenous_territories_impacts.json`,
    timeseriesUrl: `${DATA_BASE_URL}/boundaries/protected_areas_and_indigenous_territories/out/indigenous_territories_yearly.json`,
    isDefault: false,
    renderLabel: (properties: Record<string, any>) =>
      `${properties.name_field || "N/A"} ${
        properties.status_field ? `- ${properties.status_field}` : ""
      } ${properties.country ? `- ${properties.country}` : ""}`,
    renderTitle: (properties: Record<string, any>) =>
      properties.name_field || "N/A",
    renderStatus: (properties: Record<string, any>) => properties.status_field,
    showCountry: true,
    useLocale: false,
  },
  {
    key: "protected-area",
    dictionaryKey: "protected_areas",
    dictionaryKeySingular: "protected_area",
    url: `${DATA_BASE_URL}/boundaries/protected_areas_and_indigenous_territories/out/protected_areas_impacts.json`,
    timeseriesUrl: `${DATA_BASE_URL}/boundaries/protected_areas_and_indigenous_territories/out/protected_areas_yearly.json`,
    isDefault: false,
    renderLabel: (properties: Record<string, any>) =>
      `${properties.name_field || "N/A"} ${
        properties.status_field ? `- ${properties.status_field}` : ""
      } ${properties.country ? `- ${properties.country}` : ""}`,
    renderTitle: (properties: Record<string, any>) =>
      properties.name_field || "N/A",
    renderStatus: (properties: Record<string, any>) => properties.status_field,
    showCountry: true,
    useLocale: false,
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
    useLocale: true,
  },
] as const;

export type PERMITTED_AREA_TYPES_KEYS = (typeof AREA_TYPES)[number]["key"];

export const ILLEGALITY_KEYS = {
  0: "na",
  1: "low",
  2: "medium",
  3: "high",
  4: "very_high",
} as const;

export const ILLEGALITY_COLORS = {
  0: "#abababff",
  1: "#feebe2",
  2: "#fbb4b9",
  3: "#f768a1",
  4: "#ae017e",
} as const;

export type PERMITTED_ILLEGALITY_KEYS = keyof typeof ILLEGALITY_KEYS;

export const AREA_SIGNIFICANT_DIGITS = 2;
export const ECONOMIC_COST_SIGNIFICANT_DIGITS = 2;
