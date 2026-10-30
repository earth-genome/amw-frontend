"use client";
import React, { useContext, useMemo } from "react";
import { Layer, Source } from "react-map-gl";
import { Expression } from "mapbox-gl";
import {
  AREA_IDS_TO_HIDE,
  AREA_TYPES,
  generateSatelliteTiles,
  getColorsForYears,
  LAYER_YEARS,
  MAP_MISSING_DATA_COLOR,
  MINING_LAYERS,
  MINING_VECTOR_TILES_LAYER,
  getAreaTilesUrl,
  getMiningVectorTilesUrl,
  PERMITTED_AREA_TYPES_KEYS,
} from "@/constants/map";
import { Context } from "@/lib/Store";

export interface MapLayersProps {
  // the outlines of all areas of the selected type, with the hover effect
  showAreasLayers?: boolean;
  areaTypeKey: PERMITTED_AREA_TYPES_KEYS | undefined;
  // highlighted area
  selectedAreaId: string | undefined;
  dataSnapshot: string;
  // year or quarter of the satellite imagery and of the mines, e.g. "202504"
  activeYear: string;
  // shows the mines until the active year, instead of only those of the active year
  isCumulative: boolean;
  // shows only the mines of this year, e.g. while hovering the bar chart
  hoveredYear?: number;
}

// the map layers props from the map state in the Store, for the maps of the site
export const useStoreMapLayersProps = (): MapLayersProps => {
  const [state] = useContext(Context)!;
  return {
    areaTypeKey: state.selectedAreaTypeKey,
    selectedAreaId: state.selectedArea?.value,
    dataSnapshot: state.dataSnapshot,
    activeYear: state.activeYear,
    isCumulative: state.isCumulative,
    hoveredYear: state.hoveredYear,
  };
};

// all the sources and layers shared between the main map, the scrollytelling map and the
// maps of the print page
const MapLayers = ({
  showAreasLayers = true,
  areaTypeKey: selectedAreaTypeKey,
  selectedAreaId,
  dataSnapshot,
  activeYear,
  isCumulative,
  hoveredYear,
}: MapLayersProps) => {
  const selectedAreaType = AREA_TYPES.find(
    (d) => d.key === selectedAreaTypeKey,
  );
  const areasTilesUrl = selectedAreaType
    ? getAreaTilesUrl(selectedAreaType, dataSnapshot)
    : undefined;

  const areasLayerFilter = useMemo(() => {
    const TO_HIDE_WITHOUT_MINING = ["indigenous-territory", "protected-area"];
    const hideAreasWithoutMining =
      selectedAreaTypeKey &&
      TO_HIDE_WITHOUT_MINING.includes(selectedAreaTypeKey);

    return [
      "all",
      ...(hideAreasWithoutMining
        ? [[">", ["coalesce", ["get", "mining_affected_area_ha"], 0], 0]]
        : []),
      ["!", ["in", ["get", "id"], ["literal", AREA_IDS_TO_HIDE]]],
    ];
  }, [selectedAreaTypeKey]);

  const mineLayerColors = useMemo(() => {
    const yearsColors = getColorsForYears(LAYER_YEARS);
    return [
      "case",
      ...LAYER_YEARS.flatMap((year, i) => [
        ["==", ["get", "year"], year],
        yearsColors[i],
      ]),
      MAP_MISSING_DATA_COLOR,
    ] as Expression;
  }, []);

  return (
    <>
      {/* ================== SENTINEL2 SOURCES =================== */}
      {MINING_LAYERS.map(
        ({ yearQuarter, satelliteEndpoint, satelliteDates }) => (
          <Source
            key={`sentinel-${yearQuarter}`}
            id={`sentinel-${yearQuarter}`}
            type="raster"
            tiles={generateSatelliteTiles(satelliteEndpoint, satelliteDates)}
            tileSize={256}
          />
        ),
      )}

      {/* ================== SENTINEL2 LAYERS =================== */}
      {LAYER_YEARS.map((d) => (
        <Layer
          key={d}
          id={`sentinel-layer-${d}`}
          type="raster"
          source={`sentinel-${d}`}
          layout={{
            visibility: activeYear === String(d) ? "visible" : "none",
          }}
        />
      ))}

      {/* ================== MASK =================== */}
      <Source
        id={"hole-source"}
        type="vector"
        url="mapbox://earthrise.cw29jm21"
      />
      <Layer
        id={"hole-layer"}
        source={"hole-source"}
        source-layer={"amazon_aca_mask-6i3usc"}
        type="fill"
        paint={{
          "fill-color": "#dddddd",
          "fill-opacity": 1,
        }}
      />
      {/* ================== BORDERS =================== */}
      <Source
        id="boundaries"
        type="vector"
        url="mapbox://mapbox.country-boundaries-v1"
      />
      <Layer
        id="boundary-layer"
        source="boundaries"
        type="line"
        source-layer="country_boundaries"
        paint={{
          "line-color": "#777",
          "line-width": 0.5,
        }}
      />

      {/* ================== AREA SOURCES =================== */}
      {areasTilesUrl && (
        <Source
          id="areas-vector-tiles"
          type="vector"
          tiles={[areasTilesUrl]}
          minzoom={0}
          maxzoom={11}
          // we need this for the hover effect to work
          promoteId={showAreasLayers ? "id" : undefined}
        />
      )}

      {/* ================== AREA LAYER =================== */}
      {showAreasLayers &&
        areasTilesUrl &&
        selectedAreaType &&
        selectedAreaType.tilesLayer && (
          <>
            <Layer
              id={"areas-layer"}
              key={`areas-layer-${selectedAreaType.tilesLayer}`}
              source={"areas-vector-tiles"}
              source-layer={selectedAreaType.tilesLayer}
              // @ts-expect-error
              filter={areasLayerFilter}
              type="line"
              paint={{
                "line-color": "#ccc",
                "line-opacity": 1,
                "line-width": [
                  "interpolate",
                  ["exponential", 2],
                  ["zoom"],
                  0,
                  1,
                  10,
                  1,
                  14,
                  2.5,
                ],
              }}
            />
            <Layer
              id={"areas-layer-fill"}
              key={`areas-layer-fill-${selectedAreaType.tilesLayer}`}
              source={"areas-vector-tiles"}
              source-layer={selectedAreaType.tilesLayer}
              // @ts-expect-error
              filter={areasLayerFilter}
              type="fill"
              paint={{
                "fill-color": "#22B573",
                "fill-opacity": [
                  "case",
                  ["boolean", ["feature-state", "hover"], false],
                  0.2, // hovered
                  0, // not hovered
                ],
                "fill-outline-color": "#fff",
              }}
            />
          </>
        )}
      {areasTilesUrl &&
        selectedAreaType &&
        selectedAreaType.tilesLayer &&
        selectedAreaId && (
          <>
            <Layer
              id={"selected-area-layer-fill"}
              key={`selected-area-layer-fill-${selectedAreaType.tilesLayer}`}
              source={"areas-vector-tiles"}
              source-layer={selectedAreaType.tilesLayer}
              filter={["==", ["get", "id"], selectedAreaId]}
              type="fill"
              paint={{
                "fill-color": "#22B573",
                "fill-opacity": 0.1,
                "fill-outline-color": "#22B573",
              }}
            />
            <Layer
              id={"selected-area-layer"}
              key={`selected-area-layer-${selectedAreaType.tilesLayer}`}
              source={"areas-vector-tiles"}
              source-layer={selectedAreaType.tilesLayer}
              filter={["==", ["get", "id"], selectedAreaId]}
              type="line"
              paint={{
                "line-color": "#22B573",
                "line-opacity": 1,
                "line-width": 3,
              }}
            />
          </>
        )}

      {/* ================== MINE SOURCES =================== */}
      <Source
        id={"mines-vector-tiles"}
        type="vector"
        tiles={[getMiningVectorTilesUrl(dataSnapshot)]}
        minzoom={0}
        maxzoom={14}
      />
      {/* ================== MINE LAYER =================== */}
      <Layer
        id={"mines-layer"}
        source={"mines-vector-tiles"}
        source-layer={MINING_VECTOR_TILES_LAYER}
        type="line"
        filter={[
          hoveredYear ? "==" : isCumulative ? "<=" : "==",
          ["get", "year"],
          hoveredYear ? hoveredYear : Number(activeYear),
        ]}
        paint={{
          "line-color": mineLayerColors,
          "line-opacity": 1,
          "line-width": [
            "interpolate",
            ["exponential", 2],
            ["zoom"],
            0,
            1,
            10,
            1,
            14,
            2.5,
          ],
        }}
      />

      {/* NOTE: hiding hotspots on Feb 2026 */}
      {/* {!isEmbed && <Hotspots />} */}

      {/* ============ COUNTRY BOUNDARIES ============== */}
      <Source
        id="country-boundaries-source"
        type="vector"
        url="mapbox://mapbox.country-boundaries-v1"
      >
        <Layer
          id="country-boundaries"
          type="line"
          source-layer="country_boundaries"
          paint={{
            "line-color": "hsl(0, 0%, 48%)",
            "line-opacity": 1,
            "line-width": 0.3,
          }}
        />
      </Source>
    </>
  );
};

export default MapLayers;
