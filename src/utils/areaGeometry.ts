import { VectorTile } from "@mapbox/vector-tile";
import Pbf from "pbf";
import { featureCollection, flatten, truncate, union } from "@turf/turf";
import type { Feature, MultiPolygon, Polygon } from "geojson";
import { AreaType, getAreaTilesUrl } from "@/constants/map";

// the geometry of an area, rebuilt from the vector tiles of its area type (the same source
// as the areas of the map), so it doesn't depend on the map viewport

// the max zoom of the areas vector tiles source, as in MapLayers
const AREA_TILES_MAX_ZOOM = 11;
// the max number of tiles fetched for an area, the zoom is lowered for large areas
const MAX_TILES = 64;
// ~10cm precision
const COORDINATES_PRECISION = 6;

type AreaPolygon = Feature<Polygon | MultiPolygon>;
type Bbox = [number, number, number, number];

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

const clampTile = (value: number, z: number) =>
  Math.max(0, Math.min(2 ** z - 1, value));

// the x/y range of the tiles that cover a bbox at a zoom
const getTileRange = ([minLon, minLat, maxLon, maxLat]: Bbox, z: number) => ({
  minX: clampTile(lonToTileX(minLon, z), z),
  maxX: clampTile(lonToTileX(maxLon, z), z),
  // y grows southwards
  minY: clampTile(latToTileY(maxLat, z), z),
  maxY: clampTile(latToTileY(minLat, z), z),
});

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

  const tiles: { x: number; y: number; z: number }[] = [];
  for (let x = range.minX; x <= range.maxX; x++) {
    for (let y = range.minY; y <= range.maxY; y++) {
      tiles.push({ x, y, z });
    }
  }
  return tiles;
};

// the polygons of an area in a tile, an area can have many features in a tile, e.g. a
// multipolygon area or an area whose parts were split
export const getAreaPiecesFromTile = (
  buffer: ArrayBuffer,
  tilesLayer: string,
  areaId: string,
  { x, y, z }: { x: number; y: number; z: number },
) => {
  const tile = new VectorTile(new Pbf(new Uint8Array(buffer)));
  const layer = tile.layers[tilesLayer];
  if (!layer) return [];

  const pieces: Feature<Polygon>[] = [];
  for (let i = 0; i < layer.length; i++) {
    const feature = layer.feature(i);
    if (String(feature.properties.id) !== areaId) continue;
    const geojson = feature.toGeoJSON(x, y, z);
    if (
      geojson.geometry.type !== "Polygon" &&
      geojson.geometry.type !== "MultiPolygon"
    ) {
      continue;
    }
    // each polygon of a multipolygon becomes a piece
    flatten(geojson as AreaPolygon).features.forEach((d) => pieces.push(d));
  }
  return pieces;
};

// merges the pieces of an area from all its tiles, removing the seams between the tiles.
// The result is a Polygon, or a MultiPolygon if the area has disjoint parts
export const mergeAreaPieces = (pieces: Feature<Polygon>[]) => {
  if (!pieces.length) return undefined;
  const merged =
    pieces.length === 1 ? pieces[0] : union(featureCollection(pieces));
  if (!merged) return undefined;
  return truncate(merged, {
    precision: COORDINATES_PRECISION,
    mutate: true,
  }).geometry as Polygon | MultiPolygon;
};

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

export const fetchAreaGeometry = async (
  areaType: AreaType,
  dataSnapshot: string,
  areaId: string,
  bbox: Bbox,
) => {
  const tilesUrl = getAreaTilesUrl(areaType, dataSnapshot);
  const tiles = getTilesForBbox(bbox);

  const piecesPerTile = await Promise.all(
    tiles.map(async (tile) => {
      const buffer = await fetchTile(
        tilesUrl
          .replace("{z}", String(tile.z))
          .replace("{x}", String(tile.x))
          .replace("{y}", String(tile.y)),
      );
      return buffer
        ? getAreaPiecesFromTile(buffer, areaType.tilesLayer, areaId, tile)
        : [];
    }),
  );

  const geometry = mergeAreaPieces(piecesPerTile.flat());
  if (!geometry) {
    throw new Error(`No geometry found for area ${areaId}`);
  }
  return geometry;
};
