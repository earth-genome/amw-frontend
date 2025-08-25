import { Feature } from "geojson";

export interface AreaProperties {
  id: string;
  country: string;
  name_field: string;
  [key: string]: any;
}

export interface AreasData
  extends GeoJSON.FeatureCollection<GeoJSON.Geometry, AreaProperties> {}

export type AreaData = Feature | undefined;

export interface GeoJSONFeature {
  properties: AreaProperties;
  [key: string]: any;
}
