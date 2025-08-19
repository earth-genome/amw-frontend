export interface AreaProperties {
  id: number;
  country: string;
  name_field: string;
  [key: string]: any;
}

export interface AreasData
  extends GeoJSON.FeatureCollection<GeoJSON.Geometry, AreaProperties> {}

export interface GeoJSONFeature {
  properties: AreaProperties;
  [key: string]: any;
}
