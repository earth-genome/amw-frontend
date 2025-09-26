import { Feature } from "geojson";

export interface AreaProperties {
  id: string;
  country: string;
  name_field: string;
  [key: string]: any;
}

export interface AreasData
  extends GeoJSON.FeatureCollection<GeoJSON.Geometry, AreaProperties> {}

export interface AreasTimeseriesDataItem {
  id: string;
  admin_year: number;
  intersected_area_ha: number;
  intersected_area_ha_cumulative: number;
}

export interface AreasTimeseriesData extends Array<AreasTimeseriesDataItem> {}

export type AreaData = Feature | undefined;

export interface GeoJSONFeature {
  properties: AreaProperties;
  [key: string]: any;
}
