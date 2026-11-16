import type { FeatureCollection, MultiPolygon, Polygon } from "geojson";
import { csvFormat } from "d3";
import {
  AreaType,
  ILLEGALITY_DATA_UPDATED_AT,
  ILLEGALITY_KEYS,
  PERMITTED_ILLEGALITY_KEYS,
} from "@/constants/map";
import { AreaData, AreasTimeseriesData } from "@/types/types";
import { getAreaTypeInfo } from "@/utils/areaSummary";
import { formatLayerYear } from "@/utils/content";
import { slugify } from "@/utils/slugify";

// the files with the data of an area that can be downloaded from its summary: a GeoJSON
// for GIS / mapping and a CSV for spreadsheets

type Dictionary = { [key: string]: any };

export interface AreaDownloadData {
  areaData: AreaData;
  areaType: AreaType;
  timeseries: AreasTimeseriesData | undefined;
  dataSnapshot: string;
  dictionary: Dictionary;
}

// e.g. 2018 => "2018", 202501 => "2025_q1"
const formatPeriodKey = (year: number) =>
  formatLayerYear(year).toLowerCase().replace(" ", "_");

// e.g. 1234.5678 => 1234.57
const roundTo2Decimals = (value: number | null | undefined) =>
  value == null ? null : Math.round(value * 100) / 100;

// the period the illegality data was calculated for, e.g. 202503
const ILLEGALITY_PERIOD = Number(ILLEGALITY_DATA_UPDATED_AT);

const sortTimeseries = (timeseries: AreasTimeseriesData | undefined) =>
  [...(timeseries ?? [])].sort((a, b) => a.admin_year - b.admin_year);

// the area properties shared by both files
const getAreaProperties = ({
  areaData,
  areaType,
  dictionary,
}: AreaDownloadData) => {
  const { typeLabel, status } = getAreaTypeInfo(areaType, areaData, dictionary);
  return {
    amw_id: areaData.id,
    name: areaType.renderTitle(areaData) ?? null,
    type: typeLabel ?? null,
    country: areaData.country || null,
    country_code: areaData.country_code || null,
    status: status ?? null,
  };
};

// the illegality breakdown of the mined area, by level, e.g. illegality_high_pct
const getIllegalityProperties = (areaData: AreaData) => {
  const properties: Record<string, number> = {};
  Object.entries(ILLEGALITY_KEYS).forEach(([key, level]) => {
    const levelData = areaData.illegality_areas?.find(
      (d) =>
        d.admin_illegality_max === (Number(key) as PERMITTED_ILLEGALITY_KEYS),
    );
    properties[`illegality_${level}_pct`] =
      levelData?.mining_affected_area_pct ?? 0;
  });
  return properties;
};

export const buildAreaGeoJSON = (
  geometry: Polygon | MultiPolygon,
  data: AreaDownloadData,
): FeatureCollection<Polygon | MultiPolygon> => {
  const { areaData, timeseries } = data;
  const sortedTimeseries = sortTimeseries(timeseries);

  // flat properties, so they can be read by GIS tools
  const minedAreaProperties: Record<string, number | null> = {};
  sortedTimeseries.forEach((d) => {
    minedAreaProperties[`mined_ha_${formatPeriodKey(d.admin_year)}`] =
      roundTo2Decimals(d.intersected_area_ha_cumulative);
  });

  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry,
        properties: {
          ...getAreaProperties(data),
          // cumulative, until each period
          ...minedAreaProperties,
          ...getIllegalityProperties(areaData),
          data_snapshot: data.dataSnapshot,
        },
      },
    ],
  };
};

export const buildAreaCSV = (data: AreaDownloadData) => {
  const { areaData, timeseries } = data;
  const areaProperties = getAreaProperties(data);
  const illegalityProperties = getIllegalityProperties(areaData);
  // the same columns, empty
  const emptyIllegalityProperties = Object.fromEntries(
    Object.keys(illegalityProperties).map((key) => [key, null]),
  );

  const rows = sortTimeseries(timeseries).map((d) => ({
    ...areaProperties,
    period: formatLayerYear(d.admin_year),
    period_code: d.admin_year,
    new_mined_area_ha: roundTo2Decimals(d.intersected_area_ha),
    cumulative_mined_area_ha: roundTo2Decimals(
      d.intersected_area_ha_cumulative,
    ),
    // only for the period the illegality was calculated for
    ...(d.admin_year === ILLEGALITY_PERIOD
      ? illegalityProperties
      : emptyIllegalityProperties),
    data_snapshot: data.dataSnapshot,
  }));

  if (!rows.length) return "";
  // the columns are in the order of the row keys, null values are empty
  // BOM so spreadsheets read the UTF-8 accents
  return `\uFEFF${csvFormat(rows)}`;
};

export const getAreaDownloadFilename = (
  { areaData, areaType, dataSnapshot }: AreaDownloadData,
  extension: "geojson" | "csv",
) =>
  `${slugify(areaType.renderTitle(areaData) || areaData.id)}_${dataSnapshot}.${extension}`;

export const downloadFile = (
  content: string,
  filename: string,
  mimeType: string,
) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // let the download start before revoking the url
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
