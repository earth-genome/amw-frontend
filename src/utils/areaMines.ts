import {
  bbox as getBbox,
  bboxClip,
  booleanIntersects,
  featureCollection,
  flatten,
  truncate,
  union,
} from "@turf/turf";
import type { Feature, Polygon, Position } from "geojson";
import {
  getMiningVectorTilesUrl,
  MINING_VECTOR_TILES_LAYER,
} from "@/constants/map";
import {
  AreaGeometry,
  Bbox,
  COORDINATES_PRECISION,
  decodeTilePolygons,
  fetchTilesWithLimit,
  getTileBbox,
  getTileRange,
  Tile,
  tileHasFeatures,
} from "@/utils/areaGeometry";
import { formatLayerYear } from "@/utils/content";

// the mines that intersect an area, rebuilt from the mining vector tiles (the same source
// as the mines layer of the map).
//
// Large areas are covered by thousands of tiles at the zoom of the mines, most of them
// without mines, so the tiles are fetched from a lower zoom down to it, skipping the
// tiles below an empty one. The area is clipped to the tiles along the way, so each mine
// is compared with the small part of the area around it instead of the whole area

// the zoom the mines are read from. It is lower than the max zoom of the mines vector
// tiles source (14, as in MapLayers), as each zoom below it has ~4 times fewer tiles to
// fetch. The coordinates of a tile are in a grid (usually of 4096 units per side, ~2.4m
// at this zoom and ~0.6m at the max zoom) and the mines are made of straight edges, so
// little detail is lost
const MINES_TILES_ZOOM = 11;
// the lowest zoom the tiles are fetched from. A tile without mines at this zoom or above
// must mean there are no mines in the tiles below it, i.e. the tiles of the lower zooms
// can't drop all the (small) mines of a tile
const MINES_TILES_MIN_START_ZOOM = 8;
// the max number of tiles at the zoom the tiles are fetched from: small areas start at
// the zoom of the mines, large areas at lower zooms
const MAX_START_TILES = 64;
// tolerance when comparing coordinates with the tile edges
const EPSILON = 1e-9;
// relative tolerances when comparing the size of the area in a tile with the tile
const INSIDE_TOLERANCE = 1e-9;
const OUTSIDE_TOLERANCE = 1e-12;

export interface MineProperties {
  // year or quarter of the detection, e.g. 201900 or 202601
  onset_period_number: number;
  // e.g. "2019" or "2026 Q1"
  onset_period_name: string;
}

// a mine, or a piece of it, with its bbox
type MinePiece = Feature<Polygon, { year: number }> & { bbox: Bbox };

// the part of the area in the surroundings of a tile: all of the surroundings, none, or
// the area clipped to them
type AreaPart = "inside" | "outside" | AreaGeometry;

interface TileNode {
  tile: Tile;
  areaPart: AreaPart;
}

const isBboxInside = (inner: Bbox, outer: Bbox) =>
  inner[0] >= outer[0] - EPSILON &&
  inner[1] >= outer[1] - EPSILON &&
  inner[2] <= outer[2] + EPSILON &&
  inner[3] <= outer[3] + EPSILON;

const isBboxOutside = (a: Bbox, b: Bbox) =>
  a[2] <= b[0] + EPSILON ||
  a[0] >= b[2] - EPSILON ||
  a[3] <= b[1] + EPSILON ||
  a[1] >= b[3] - EPSILON;

// strictly inside, not touching the edges
const isBboxStrictlyInside = (inner: Bbox, outer: Bbox) =>
  inner[0] > outer[0] + EPSILON &&
  inner[1] > outer[1] + EPSILON &&
  inner[2] < outer[2] - EPSILON &&
  inner[3] < outer[3] - EPSILON;

const getTileKey = ({ x, y, z }: Tile) => `${z}/${x}/${y}`;

const countTilesInRange = (range: ReturnType<typeof getTileRange>) =>
  (range.maxX - range.minX + 1) * (range.maxY - range.minY + 1);

// the most detailed zoom, up to a max, whose tiles covering the bbox are not too many
const getZoomForMaxTiles = (bbox: Bbox, maxTiles: number, maxZoom: number) => {
  let z = maxZoom;
  while (z > 0 && countTilesInRange(getTileRange(bbox, z)) > maxTiles) z -= 1;
  return z;
};

// the bbox of a tile and of a margin around it, of the size of a tile of the mines zoom.
// The tiles of the mines zoom whose surroundings touch the area are the tiles that cover
// the area and their neighbours, which are needed so the mines that cross the area
// boundary are complete (unless they are larger than a tile, ~10km). The surroundings of
// a tile contain those of the tiles below it
const getTileSurroundingsBbox = ({ x, y, z }: Tile): Bbox => {
  const scale = 2 ** (MINES_TILES_ZOOM - z);
  // the tiles of the mines zoom at the north-west and south-east of the tile
  const [west, , , north] = getTileBbox({
    x: x * scale - 1,
    y: y * scale - 1,
    z: MINES_TILES_ZOOM,
  });
  const [, south, east] = getTileBbox({
    x: (x + 1) * scale,
    y: (y + 1) * scale,
    z: MINES_TILES_ZOOM,
  });
  return [west, south, east, north];
};

// the (planar) area of a ring, with the coordinates relative to an origin for precision
const getRingArea = (ring: Position[], [originX, originY]: Bbox) => {
  let sum = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    sum +=
      (ring[i][0] - originX) * (ring[i + 1][1] - originY) -
      (ring[i + 1][0] - originX) * (ring[i][1] - originY);
  }
  return Math.abs(sum) / 2;
};

// the part of the area in a bbox, from a part of the area that contains the bbox
const clipAreaPart = (areaPart: AreaPart, bbox: Bbox): AreaPart => {
  if (areaPart === "inside" || areaPart === "outside") return areaPart;

  const clipped = bboxClip(
    { type: "Feature", geometry: areaPart, properties: {} },
    bbox,
  ).geometry as AreaGeometry;
  const bboxArea = (bbox[2] - bbox[0]) * (bbox[3] - bbox[1]);
  const polygons: Position[][][] = [];
  let isInside = false;
  (clipped.type === "Polygon"
    ? [clipped.coordinates]
    : clipped.coordinates
  ).forEach((rings) => {
    if (!rings.length) return;
    // the outer ring minus the holes
    const polygonArea = rings.reduce(
      (acc, ring, i) => acc + (i === 0 ? 1 : -1) * getRingArea(ring, bbox),
      0,
    );
    if (polygonArea <= bboxArea * OUTSIDE_TOLERANCE) return;
    if (polygonArea >= bboxArea * (1 - INSIDE_TOLERANCE)) isInside = true;
    polygons.push(rings);
  });

  if (isInside) return "inside";
  if (!polygons.length) return "outside";
  return polygons.length === 1
    ? { type: "Polygon", coordinates: polygons[0] }
    : { type: "MultiPolygon", coordinates: polygons };
};

// the 4 tiles below a tile, with the part of the area in the surroundings of each
const getChildNodes = ({ tile, areaPart }: TileNode): TileNode[] => {
  const nodes: TileNode[] = [];
  for (let dx = 0; dx <= 1; dx++) {
    for (let dy = 0; dy <= 1; dy++) {
      const child = { x: tile.x * 2 + dx, y: tile.y * 2 + dy, z: tile.z + 1 };
      nodes.push({
        tile: child,
        areaPart: clipAreaPart(areaPart, getTileSurroundingsBbox(child)),
      });
    }
  }
  return nodes;
};

// the mines of a tile. Tiles have a buffer around their edges, so a mine near an edge is in
// more than one tile, and a mine across an edge is split between tiles
const getMinesFromTile = (buffer: ArrayBuffer, tile: Tile) => {
  const tileBbox = getTileBbox(tile);
  // whole mines, inside the tile
  const whole: MinePiece[] = [];
  // pieces of mines across the tile edges, to be merged with those of the other tiles
  const crossing: MinePiece[] = [];

  decodeTilePolygons(buffer, MINING_VECTOR_TILES_LAYER, tile).forEach(
    (piece) => {
      const year = Number(piece.properties?.year);
      const pieceBbox = getBbox(piece) as Bbox;
      const mine = { ...piece, properties: { year }, bbox: pieceBbox };
      // only in the buffer, it belongs to another tile
      if (isBboxOutside(pieceBbox, tileBbox)) return;
      if (isBboxInside(pieceBbox, tileBbox)) whole.push(mine);
      else crossing.push(mine);
    },
  );
  return { whole, crossing };
};

// groups the pieces of the same period whose bboxes overlap, i.e. the pieces that can be
// of the same mine
const groupOverlappingPieces = (pieces: MinePiece[]) => {
  // union-find
  const parents = pieces.map((_, i) => i);
  const find = (i: number) => {
    while (parents[i] !== i) {
      parents[i] = parents[parents[i]];
      i = parents[i];
    }
    return i;
  };

  // only the pieces in the same tile are compared
  const piecesPerCell = new Map<string, number[]>();
  pieces.forEach((piece, i) => {
    const range = getTileRange(piece.bbox, MINES_TILES_ZOOM);
    for (let x = range.minX; x <= range.maxX; x++) {
      for (let y = range.minY; y <= range.maxY; y++) {
        const key = `${piece.properties.year}/${x}/${y}`;
        const cell = piecesPerCell.get(key);
        if (!cell) {
          piecesPerCell.set(key, [i]);
          continue;
        }
        cell.forEach((j) => {
          if (!isBboxOutside(piece.bbox, pieces[j].bbox)) {
            parents[find(i)] = find(j);
          }
        });
        cell.push(i);
      }
    }
  });

  const groups = new Map<number, MinePiece[]>();
  pieces.forEach((piece, i) => {
    const root = find(i);
    const group = groups.get(root);
    if (group) group.push(piece);
    else groups.set(root, [piece]);
  });
  return Array.from(groups.values());
};

// merges the pieces of the mines across the tile edges, by period, removing the seams.
// Only the pieces that are close to each other are merged together, which is much faster
// than merging all the pieces at once
const mergeCrossingPieces = (pieces: MinePiece[]) => {
  const merged: MinePiece[] = [];
  groupOverlappingPieces(pieces).forEach((group) => {
    const { year } = group[0].properties;
    const groupUnion =
      group.length === 1 ? group[0] : union(featureCollection(group));
    if (!groupUnion) return;
    // each polygon is a mine
    flatten(groupUnion as Feature<AreaGeometry>).features.forEach((d) =>
      merged.push({ ...d, properties: { year }, bbox: getBbox(d) as Bbox }),
    );
  });
  return merged;
};

export const fetchAreaMines = async (
  areaGeometry: AreaGeometry,
  areaBbox: Bbox,
  dataSnapshot: string,
): Promise<Feature<Polygon, MineProperties>[]> => {
  const tilesUrl = getMiningVectorTilesUrl(dataSnapshot);
  // the area bbox with a margin of (at least) a tile of the mines zoom, for the neighbours
  // of the tiles that cover the area
  const margin = 360 / 2 ** MINES_TILES_ZOOM;
  const searchBbox: Bbox = [
    areaBbox[0] - margin,
    areaBbox[1] - margin,
    areaBbox[2] + margin,
    areaBbox[3] + margin,
  ];
  // the zoom the tiles are fetched from
  const startZoom = Math.max(
    getZoomForMaxTiles(searchBbox, MAX_START_TILES, MINES_TILES_ZOOM),
    MINES_TILES_MIN_START_ZOOM,
  );
  // the zoom the area is clipped from, with only a few tiles, so the whole area is
  // clipped only a few times and the tiles below clip smaller and smaller parts of it
  const rootZoom = getZoomForMaxTiles(searchBbox, 4, startZoom);

  // the part of the area around each tile, for all the tiles from the root zoom that are
  // reached. The tiles below a tile without mines are not reached
  const areaParts = new Map<string, AreaPart>();
  const keepNodesInArea = (nodes: TileNode[]) => {
    nodes.forEach((d) => areaParts.set(getTileKey(d.tile), d.areaPart));
    return nodes.filter((d) => d.areaPart !== "outside");
  };

  const rootRange = getTileRange(searchBbox, rootZoom);
  const rootNodes: TileNode[] = [];
  for (let x = rootRange.minX; x <= rootRange.maxX; x++) {
    for (let y = rootRange.minY; y <= rootRange.maxY; y++) {
      const tile = { x, y, z: rootZoom };
      rootNodes.push({
        tile,
        areaPart: clipAreaPart(areaGeometry, getTileSurroundingsBbox(tile)),
      });
    }
  }
  let nodes = keepNodesInArea(rootNodes);
  for (let z = rootZoom; z < startZoom; z++) {
    nodes = keepNodesInArea(nodes.flatMap(getChildNodes));
  }

  // down to the mines zoom, only through the tiles with mines
  for (let z = startZoom; z < MINES_TILES_ZOOM; z++) {
    const tilesWithMines = await fetchTilesWithLimit(
      tilesUrl,
      nodes.map((d) => d.tile),
      (buffer, tile) =>
        tileHasFeatures(buffer, MINING_VECTOR_TILES_LAYER) ? tile : undefined,
    );
    nodes = keepNodesInArea(
      tilesWithMines.flatMap((tile) =>
        tile
          ? getChildNodes({
              tile,
              areaPart: areaParts.get(getTileKey(tile)) as AreaPart,
            })
          : [],
      ),
    );
  }

  const minesPerTile = await fetchTilesWithLimit(
    tilesUrl,
    nodes.map((d) => d.tile),
    getMinesFromTile,
  );

  const mines = [
    ...minesPerTile.flatMap((d) => d.whole),
    ...mergeCrossingPieces(minesPerTile.flatMap((d) => d.crossing)),
  ];

  // if a mine touches the area, comparing it with the part of the area around the
  // smallest tile whose surroundings contain the mine
  const intersectsArea = (mine: MinePiece) => {
    if (isBboxOutside(mine.bbox, areaBbox)) return false;
    // the tile of the mines zoom at the center of the mine
    const center = getTileRange(
      [
        (mine.bbox[0] + mine.bbox[2]) / 2,
        (mine.bbox[1] + mine.bbox[3]) / 2,
        (mine.bbox[0] + mine.bbox[2]) / 2,
        (mine.bbox[1] + mine.bbox[3]) / 2,
      ],
      MINES_TILES_ZOOM,
    );
    for (let z = MINES_TILES_ZOOM; z >= rootZoom; z--) {
      const scale = 2 ** (MINES_TILES_ZOOM - z);
      const tile = {
        x: Math.floor(center.minX / scale),
        y: Math.floor(center.minY / scale),
        z,
      };
      const areaPart = areaParts.get(getTileKey(tile));
      // a tile that was not reached, or that doesn't contain the whole mine
      if (
        !areaPart ||
        !isBboxStrictlyInside(mine.bbox, getTileSurroundingsBbox(tile))
      ) {
        continue;
      }
      if (areaPart === "inside") return true;
      if (areaPart === "outside") return false;
      return booleanIntersects(mine, areaPart);
    }
    // a mine across the root tiles
    return booleanIntersects(mine, areaGeometry);
  };

  return (
    mines
      // the whole mines that touch the area, not clipped to it
      .filter(intersectsArea)
      .sort((a, b) => a.properties.year - b.properties.year)
      .map((mine) => ({
        type: "Feature" as const,
        geometry: truncate(mine.geometry, {
          precision: COORDINATES_PRECISION,
        }),
        properties: {
          onset_period_number: mine.properties.year,
          onset_period_name: formatLayerYear(mine.properties.year),
        },
      }))
  );
};
