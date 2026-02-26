import { scaleSequential } from "d3-scale";
import { interpolateRgbBasis } from "d3-interpolate";
import { HOTSPOTS_GEOJSON_URL } from "@/cms/hotspots";

const DATA_UPDATED_AT = "20260224";
const DATA_BASE_URL =
  // "/website";
  `${process.env.NEXT_PUBLIC_DATA_URL}/${DATA_UPDATED_AT}`;
const TILES_BASE_URL =
  // "/website";
  `${process.env.NEXT_PUBLIC_TILES_URL}/amw/${DATA_UPDATED_AT}`;

if (!DATA_BASE_URL) {
  throw new Error(
    "NEXT_PUBLIC_DATA_URL environment variable is not set. Please add it to your .env file.",
  );
}

const SENTINEL2_TEMPORAL = "v1/tiles/sentinel2-temporal-mosaics";
const SENTINEL2_YEARLY = "v1/tiles/sentinel2-yearly-mosaics";
const SENTINEL2_SEMIANNUAL = "v1/tiles/sentinel2-semiannual-mosaics";
const SENTINEL2_QUARTERLY = "v1/tiles/sentinel2-quarterly-mosaics";

export const MINING_LAYERS = [
  {
    yearQuarter: 201800,
    satelliteEndpoint: SENTINEL2_TEMPORAL,
    satelliteDates: "2018-01-01/2019-01-01",
  },
  {
    yearQuarter: 201900,
    satelliteEndpoint: SENTINEL2_TEMPORAL,
    satelliteDates: "2019-01-01/2020-01-01",
  },
  {
    yearQuarter: 202000,
    satelliteEndpoint: SENTINEL2_TEMPORAL,
    satelliteDates: "2020-01-01/2021-01-01",
  },
  {
    yearQuarter: 202100,
    satelliteEndpoint: SENTINEL2_TEMPORAL,
    satelliteDates: "2021-01-01/2022-01-01",
  },
  {
    yearQuarter: 202200,
    satelliteEndpoint: SENTINEL2_TEMPORAL,
    satelliteDates: "2022-01-01/2023-01-01",
  },
  {
    yearQuarter: 202300,
    satelliteEndpoint: SENTINEL2_YEARLY,
    satelliteDates: "2023-01-01/2024-01-01",
  },
  {
    yearQuarter: 202400,
    satelliteEndpoint: SENTINEL2_YEARLY,
    satelliteDates: "2024-01-01/2025-01-01",
  },
  {
    yearQuarter: 202502,
    satelliteEndpoint: SENTINEL2_SEMIANNUAL,
    satelliteDates: "2025-02-15/2025-08-15",
  },
  {
    yearQuarter: 202503,
    satelliteEndpoint: SENTINEL2_QUARTERLY,
    satelliteDates: "2025-07-01/2025-10-01",
  },
  {
    yearQuarter: 202504,
    satelliteEndpoint: SENTINEL2_QUARTERLY,
    satelliteDates: "2025-10-01/2026-01-01",
  },
];

export const MINING_VECTOR_TILES_LAYER = "mining_combined_full";
export const MINING_VECTOR_TILES_URL = `${TILES_BASE_URL}/mining_combined_full/{z}/{x}/{y}.pbf`;

export const LAYER_YEARS = MINING_LAYERS.map((d) => d.yearQuarter).sort(
  (a, b) => a - b,
);

// generates satellite tiles for a react-map-gl raster source, using 4 different subdmonains
// for faster loading
export const generateSatelliteTiles = (endpoint: string, dates: string) => [
  `${process.env.NEXT_PUBLIC_SENTINEL2_DOMAIN_1}/${endpoint}/${dates}/rgb/{z}/{x}/{y}.webp`,
  `${process.env.NEXT_PUBLIC_SENTINEL2_DOMAIN_2}/${endpoint}/${dates}/rgb/{z}/{x}/{y}.webp`,
  `${process.env.NEXT_PUBLIC_SENTINEL2_DOMAIN_3}/${endpoint}/${dates}/rgb/{z}/{x}/{y}.webp`,
  `${process.env.NEXT_PUBLIC_SENTINEL2_DOMAIN_4}/${endpoint}/${dates}/rgb/{z}/{x}/{y}.webp`,
];

export const MAP_COLOR_SCALE = [
  "#F7E4BC",
  "#F5CD7E",
  "#F1B53F",
  "#ED9E00",
  "#F37D00",
  // "#F95D00",
  // "#FF3C00",
];

// we use a different, more contrasting color for the latest year
const MAP_LATEST_YEAR_COLOR = "#f50505";
export const MAP_COLOR_SCALE_WITH_LATEST_YEAR = [
  ...MAP_COLOR_SCALE,
  MAP_LATEST_YEAR_COLOR,
];

export const MAP_MISSING_DATA_COLOR = "#ccc";

const createYearsColorScale = (years: number[]) => {
  return scaleSequential()
    .domain([0, years.length - 1])
    .interpolator(interpolateRgbBasis(MAP_COLOR_SCALE));
};

export const getColorsForYears = (years: number[]) => {
  const colorScale = createYearsColorScale(years.slice(0, -1));
  return years.map((_, index) =>
    index === years.length - 1 ? MAP_LATEST_YEAR_COLOR : colorScale(index),
  );
};

export interface AreaType {
  key: string;
  dictionaryKey: string;
  dictionaryKeySingular: string;
  url: string;
  tilesUrl: string;
  tilesLayer: string;
  timeseriesUrl: string;
  isDefault?: boolean;
  renderLabel: (_properties: Record<string, any>) => string;
  renderTitle: (_properties: Record<string, any>) => string;
  renderStatus: (_properties: Record<string, any>) => string;
  showCountry: boolean;
  useLocale: boolean;
}

export const AREA_TYPES = [
  {
    key: "countries",
    dictionaryKey: "countries",
    dictionaryKeyDescription: undefined,
    dictionaryKeySingular: "country",
    url: `${DATA_BASE_URL}/data/boundaries/national_admin/out/national_admin_impacts_unfiltered_dict.json`,
    tilesUrl: `${TILES_BASE_URL}/national_admin_impacts_unfiltered/{z}/{x}/{y}.pbf`,
    tilesLayer: `national_admin_impacts_unfiltered`,
    timeseriesUrl: `${DATA_BASE_URL}/data/boundaries/national_admin/out/national_admin_yearly.json`,
    isDefault: true,
    renderLabel: (properties: Record<string, any>) => properties.country,
    renderTitle: (properties: Record<string, any>) => properties.country,
    renderStatus: () => "",
    showCountry: false,
    useLocale: false,
    allowInEmbed: false,
    allowSelect: true,
  },
  {
    key: "subnational-areas",
    dictionaryKey: "subnational_jurisdictions",
    dictionaryKeyDescription: undefined,
    dictionaryKeySingular: "subnational_jurisdiction",
    url: `${DATA_BASE_URL}/data/boundaries/subnational_admin/out/admin_areas_display_impacts_unfiltered_dict.json`,
    tilesUrl: `${TILES_BASE_URL}/admin_areas_display_impacts_unfiltered/{z}/{x}/{y}.pbf`,
    tilesLayer: `admin_areas_display_impacts_unfiltered`,
    timeseriesUrl: `${DATA_BASE_URL}/data/boundaries/subnational_admin/out/admin_areas_display_yearly.json`,
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
    allowInEmbed: true,
    allowSelect: true,
  },
  {
    key: "indigenous-territory",
    dictionaryKey: "indigenous_territories",
    dictionaryKeyDescription: "indigenous_territories_description",
    dictionaryKeySingular: "indigenous_territory",
    url: `${DATA_BASE_URL}/data/boundaries/protected_areas_and_indigenous_territories/out/indigenous_territories_impacts_unfiltered_dict.json`,
    tilesUrl: `${TILES_BASE_URL}/indigenous_territories_impacts_unfiltered/{z}/{x}/{y}.pbf`,
    tilesLayer: `indigenous_territories_impacts_unfiltered`,
    timeseriesUrl: `${DATA_BASE_URL}/data/boundaries/protected_areas_and_indigenous_territories/out/indigenous_territories_yearly.json`,
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
    allowInEmbed: true,
    allowSelect: true,
  },
  {
    key: "protected-area",
    dictionaryKey: "protected_areas",
    dictionaryKeyDescription: "protected_areas_description",
    dictionaryKeySingular: "protected_area",
    url: `${DATA_BASE_URL}/data/boundaries/protected_areas_and_indigenous_territories/out/protected_areas_impacts_unfiltered_dict.json`,
    tilesUrl: `${TILES_BASE_URL}/protected_areas_impacts_unfiltered/{z}/{x}/{y}.pbf`,
    tilesLayer: `protected_areas_impacts_unfiltered`,
    timeseriesUrl: `${DATA_BASE_URL}/data/boundaries/protected_areas_and_indigenous_territories/out/protected_areas_yearly.json`,
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
    allowInEmbed: true,
    allowSelect: true,
  },
  {
    key: "hotspots",
    dictionaryKey: "hotspots",
    dictionaryKeyDescription: undefined,
    dictionaryKeySingular: "hotspot",
    url: HOTSPOTS_GEOJSON_URL,
    tilesUrl: "",
    tilesLayer: "",
    timeseriesUrl: "",
    isDefault: false,
    renderLabel: (properties: Record<string, any>) => properties.title,
    renderTitle: (properties: Record<string, any>) => properties.title,
    renderStatus: () => "",
    showCountry: false,
    useLocale: true,
    allowInEmbed: false,
    allowSelect: false,
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

export const getAreaSignificantDigits = (number: number) => {
  if (number < 10) return 1;
  if (number < 1000) return 2;
  return 3;
};

export const ECONOMIC_COST_SIGNIFICANT_DIGITS = 2;

export const ENTIRE_AMAZON_AREA_ID = "AMAZ";

// HACK: hide two specific areas, Raposa Serra do Sol IT and Apolobamba PA, because of data issues
// as reported by ACA
export const AREA_IDS_TO_HIDE = ["BOAP-0405_0", "BR37901_0"];
