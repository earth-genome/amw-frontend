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
  url: string;
  isDefault?: boolean;
  renderLabel: (properties: Record<string, any>) => string;
  renderTitle: (properties: Record<string, any>) => string;
  renderStatus: (properties: Record<string, any>) => string;
  showCountry: boolean;
}

const AREA_TYPES_BASE_URL =
  "https://raw.githubusercontent.com/earthrise-media/mining-detector/4af28dbf850ed2254412a9ac7196c5d174797b07/data/boundaries";

export const AREA_TYPES = [
  {
    key: "countries",
    dictionaryKey: "countries",
    dictionaryKeySingular: "country",
    url: `${AREA_TYPES_BASE_URL}/national_admin/out/national_admin_impacts.geojson`,
    isDefault: true,
    renderLabel: (properties: Record<string, any>) => properties.country,
    renderTitle: (properties: Record<string, any>) => properties.country,
    renderStatus: () => "",
    showCountry: false,
  },
  {
    key: "indigenous-territory",
    dictionaryKey: "indigenous_territories",
    dictionaryKeySingular: "indigenous_territory",
    url: `${AREA_TYPES_BASE_URL}/protected_areas_and_indigenous_territories/out/indigenous_territories_impacts.geojson`,
    isDefault: false,
    renderLabel: (properties: Record<string, any>) =>
      `${properties.name_field} - ${properties.status_field} - ${properties.country}`,
    renderTitle: (properties: Record<string, any>) => properties.name_field,
    renderStatus: (properties: Record<string, any>) => properties.status_field,
    showCountry: true,
  },
  {
    key: "protected-area",
    dictionaryKey: "protected_areas",
    dictionaryKeySingular: "protected_area",
    url: `${AREA_TYPES_BASE_URL}/protected_areas_and_indigenous_territories/out/protected_areas_impacts.geojson`,
    isDefault: false,
    renderLabel: (properties: Record<string, any>) =>
      `${properties.name_field} - ${properties.status_field} - ${properties.country}`,
    renderTitle: (properties: Record<string, any>) => properties.name_field,
    renderStatus: (properties: Record<string, any>) => properties.status_field,
    showCountry: true,
  },
] as const;
