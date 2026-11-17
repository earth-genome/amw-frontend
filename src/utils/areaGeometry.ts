import { VectorTile } from "@mapbox/vector-tile";
import Pbf from "pbf";
import {
  bboxPolygon,
  booleanIntersects,
  featureCollection,
  flatten,
  truncate,
  union,
} from "@turf/turf";
import type { Feature, MultiPolygon, Polygon } from "geojson";
import { AreaType, getAreaTilesUrl } from "@/constants/map";

// geometries rebuilt from vector tiles (the same sources as the map), so they don't depend
// on the map viewport: the geometry of an area, and the tile helpers shared with its mines

// the max zoom of the areas vector tiles source, as in MapLayers
const AREA_TILES_MAX_ZOOM = 11;
// the max number of tiles fetched for an area, the zoom is lowered for large areas
const MAX_TILES = 64;
// the number of tiles fetched at the same time
const TILES_CONCURRENCY = 16;
// ~10cm precision
export const COORDINATES_PRECISION = 6;

type AreaPolygon = Feature<Polygon | MultiPolygon>;
export type AreaGeometry = Polygon | MultiPolygon;
export type Bbox = [number, number, number, number];
export interface Tile {
  x: number;
  y: number;
  z: number;
}

const lonToTileX = (lon: number, z: number) =>
  Math.floor(((lon + 180) / 360) * 2 ** z);

const latToTileY = (lat: number, z: number) => {
  // clamp to the web mercator limits
  const latClamped = Math.max(Math.min(lat, 85.0511), -85.0511);
  const latRad = (latClamped * Math.PI) / 180;
  return Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) *
      2 ** z,
  );
};

const tileXToLon = (x: number, z: number) => (x / 2 ** z) * 360 - 180;

const tileYToLat = (y: number, z: number) => {
  const n = Math.PI - (2 * Math.PI * y) / 2 ** z;
  return (180 / Math.PI) * Math.atan(Math.sinh(n));
};

// the bbox of a tile, without its buffer
export const getTileBbox = ({ x, y, z }: Tile): Bbox => [
  tileXToLon(x, z),
  tileYToLat(y + 1, z),
  tileXToLon(x + 1, z),
  tileYToLat(y, z),
];

const clampTile = (value: number, z: number) =>
  Math.max(0, Math.min(2 ** z - 1, value));

// the x/y range of the tiles that cover a bbox at a zoom
export const getTileRange = ([minLon, minLat, maxLon, maxLat]: Bbox, z: number) => ({
  minX: clampTile(lonToTileX(minLon, z), z),
  maxX: clampTile(lonToTileX(maxLon, z), z),
  // y grows southwards
  minY: clampTile(latToTileY(maxLat, z), z),
  maxY: clampTile(latToTileY(minLat, z), z),
});

const getTilesInRange = (range: ReturnType<typeof getTileRange>, z: number) => {
  const tiles: Tile[] = [];
  for (let x = range.minX; x <= range.maxX; x++) {
    for (let y = range.minY; y <= range.maxY; y++) {
      tiles.push({ x, y, z });
    }
  }
  return tiles;
};

// the most detailed zoom whose tiles covering the bbox are not too many
export const getTilesForBbox = (bbox: Bbox) => {
  let z = AREA_TILES_MAX_ZOOM;
  let range = getTileRange(bbox, z);
  const countTiles = (r: typeof range) =>
    (r.maxX - r.minX + 1) * (r.maxY - r.minY + 1);
  while (z > 0 && countTiles(range) > MAX_TILES) {
    z -= 1;
    range = getTileRange(bbox, z);
  }
  return getTilesInRange(range, z);
};

// the tiles at a zoom that cover a geometry, not only its bbox, so irregular areas
// fetch fewer tiles
export const getTilesCoveringGeometry = (
  geometry: AreaGeometry,
  bbox: Bbox,
  z: number,
) =>
  getTilesInRange(getTileRange(bbox, z), z).filter((tile) =>
    booleanIntersects(bboxPolygon(getTileBbox(tile)), geometry),
  );

export const getTileUrl = (tilesUrl: string, { x, y, z }: Tile) =>
  tilesUrl
    .replace("{z}", String(z))
    .replace("{x}", String(x))
    .replace("{y}", String(y));

const fetchTile = async (url: string) => {
  const response = await fetch(url);
  // tiles without data may not exist
  if (response.status === 404 || response.status === 204) return undefined;
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const buffer = await response.arrayBuffer();
  return buffer.byteLength ? buffer : undefined;
};

// fetches the tiles a few at a time, so a large area doesn't make thousands of requests at once
export const fetchTilesWithLimit = async <T>(
  tilesUrl: string,
  tiles: Tile[],
  // what to keep from each tile
  processTile: (_buffer: ArrayBuffer, _tile: Tile) => T,
  concurrency = TILES_CONCURRENCY,
) => {
  const results: T[] = [];
  let nextIndex = 0;
  const worker = async () => {
    while (nextIndex < tiles.length) {
      const tile = tiles[nextIndex++];
      const buffer = await fetchTile(getTileUrl(tilesUrl, tile));
      if (buffer) results.push(processTile(buffer, tile));
    }
  };
  await Promise.all(
    Array.from({ length: Math.min(concurrency, tiles.length) }, worker),
  );
  return results;
};

// if a tile has any feature in a layer, without decoding the geometries
export const tileHasFeatures = (buffer: ArrayBuffer, layerName: string) => {
  const tile = new VectorTile(new Pbf(new Uint8Array(buffer)));
  return (tile.layers[layerName]?.length ?? 0) > 0;
};

// the polygons of a tile layer, each polygon of a multipolygon becomes a piece with the
// properties of its feature
export const decodeTilePolygons = (
  buffer: ArrayBuffer,
  layerName: string,
  { x, y, z }: Tile,
  filter?: (_properties: Record<string, unknown>) => boolean,
) => {
  const tile = new VectorTile(new Pbf(new Uint8Array(buffer)));
  const layer = tile.layers[layerName];
  if (!layer) return [];

  const pieces: Feature<Polygon>[] = [];
  for (let i = 0; i < layer.length; i++) {
    const feature = layer.feature(i);
    if (filter && !filter(feature.properties)) continue;
    const geojson = feature.toGeoJSON(x, y, z);
    if (
      geojson.geometry.type !== "Polygon" &&
      geojson.geometry.type !== "MultiPolygon"
    ) {
      continue;
    }
    flatten(geojson as AreaPolygon).features.forEach((d) => pieces.push(d));
  }
  return pieces;
};

// the polygons of an area in a tile, an area can have many features in a tile, e.g. a
// multipolygon area or an area whose parts were split
export const getAreaPiecesFromTile = (
  buffer: ArrayBuffer,
  tilesLayer: string,
  areaId: string,
  tile: Tile,
) =>
  decodeTilePolygons(
    buffer,
    tilesLayer,
    tile,
    (properties) => String(properties.id) === areaId,
  );

// merges the pieces of a geometry from all its tiles, removing the seams between the tiles.
// The result is a Polygon, or a MultiPolygon if it has disjoint parts
export const mergeAreaPieces = (pieces: Feature<Polygon>[]) => {
  if (!pieces.length) return undefined;
  const merged =
    pieces.length === 1 ? pieces[0] : union(featureCollection(pieces));
  if (!merged) return undefined;
  return truncate(merged, {
    precision: COORDINATES_PRECISION,
    mutate: true,
  }).geometry as AreaGeometry;
};

export const fetchAreaGeometry = async (
  areaType: AreaType,
  dataSnapshot: string,
  areaId: string,
  bbox: Bbox,
) => {
  const tiles = getTilesForBbox(bbox);
  const piecesPerTile = await fetchTilesWithLimit(
    getAreaTilesUrl(areaType, dataSnapshot),
    tiles,
    (buffer, tile) =>
      getAreaPiecesFromTile(buffer, areaType.tilesLayer, areaId, tile),
  );

  const geometry = mergeAreaPieces(piecesPerTile.flat());
  if (!geometry) {
    throw new Error(`No geometry found for area ${areaId}`);
  }
  return geometry;
};
