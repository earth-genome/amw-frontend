"use client";
import React, { useContext, useMemo } from "react";
import { Layer, Source } from "react-map-gl";
import { Expression } from "mapbox-gl";
import {
  AREA_IDS_TO_HIDE,
  generateSatelliteTiles,
  getColorsForYears,
  LAYER_YEARS,
  MAP_MISSING_DATA_COLOR,
  MINING_LAYERS,
  MINING_VECTOR_TILES_LAYER,
  MINING_VECTOR_TILES_URL,
} from "@/constants/map";
import { Context } from "@/lib/Store";

interface MapLayersProps {
  // the outlines of all areas of the selected type, with the hover effect
  showAreasLayers?: boolean;
}

// all the sources and layers shared between the main map and the scrollytelling map,
// driven by the map state in the Store
const MapLayers = ({ showAreasLayers = true }: MapLayersProps) => {
  const [state] = useContext(Context)!;
  const {
    selectedArea,
    selectedAreaTypeKey,
    selectedAreaType,
    hoveredYear,
    activeYear,
    isCumulative,
  } = state;

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
      {selectedAreaType?.tilesUrl && (
        <Source
          id="areas-vector-tiles"
          type="vector"
          tiles={[selectedAreaType.tilesUrl]}
          minzoom={0}
          maxzoom={11}
          // we need this for the hover effect to work
          promoteId={showAreasLayers ? "id" : undefined}
        />
      )}

      {/* ================== AREA LAYER =================== */}
      {showAreasLayers &&
        selectedAreaType?.tilesUrl &&
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
      {selectedAreaType?.tilesUrl &&
        selectedAreaType.tilesLayer &&
        selectedArea && (
          <>
            <Layer
              id={"selected-area-layer-fill"}
              key={`selected-area-layer-fill-${selectedAreaType.tilesLayer}`}
              source={"areas-vector-tiles"}
              source-layer={selectedAreaType.tilesLayer}
              filter={["==", ["get", "id"], selectedArea.value]}
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
              filter={["==", ["get", "id"], selectedArea.value]}
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
        tiles={[MINING_VECTOR_TILES_URL]}
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
