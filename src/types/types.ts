import { MiningLocation } from "@/hooks/useMiningCalculator";

interface MiningProperties {
  id: string;
  country: string;
  name_field: string;
  [key: string]: any;
}

export interface MiningData extends GeoJSON.FeatureCollection<
  GeoJSON.Geometry,
  MiningProperties
> {}

export interface AreaData {
  country: string;
  country_code: string;
  id_field: string;
  name_field: string;
  type_field: string;
  status_field: string | null;
  source_field: string | null;
  area_field: number | null;
  area_units: string;
  ethnicities_field: string | null;
  id: string;
  locations: MiningLocation[];
  mining_affected_area_ha: number;
  illegality_areas: {
    admin_illegality_max: number;
    mining_affected_area: number;
    mining_affected_area_pct: number;
  }[];
  bbox: [number, number, number, number];
}

export interface AreasData extends Array<AreaData> {}

export interface AreasTimeseriesDataItem {
  id: string;
  admin_year: number;
  intersected_area_ha: number;
  intersected_area_ha_cumulative: number;
}

export interface AreasTimeseriesData extends Array<AreasTimeseriesDataItem> {}
