"use client";
import "./style.css";
import React, { useMemo } from "react";
import Map, { Layer, Source } from "react-map-gl";
import geojson from "@/app/[lang]/data/amazon_aca.json";
import { GeoJSONType } from "@/app/[lang]/components/Map/helpers";

interface MiniMapProps {
  bounds?: GeoJSONType;
  showMinimapBounds: boolean;
  width?: number;
  height?: number;
  // a circle at the center of the bounds stays visible when the bounds are tiny
  boundsMarker?: "rectangle" | "circle";
}

const DEFAULT_WIDTH = 165;
const DEFAULT_HEIGHT = 100;
const DEFAULT_ZOOM = 1;

const MiniMap: React.FC<MiniMapProps> = ({
  bounds,
  showMinimapBounds,
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
  boundsMarker = "rectangle",
}) => {
  // scale the zoom with the width, so the whole Amazon fits at any size
  const zoom = DEFAULT_ZOOM + Math.log2(width / DEFAULT_WIDTH);

  const boundsCenter = useMemo<
    GeoJSON.Feature<GeoJSON.Point> | undefined
  >(() => {
    const ring = bounds?.geometry?.coordinates?.[0];
    if (!ring) return undefined;
    // southwest and northeast corners of the bounds polygon
    const [swLng, swLat] = ring[0];
    const [neLng, neLat] = ring[2];
    return {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [(swLng + neLng) / 2, (swLat + neLat) / 2],
      },
      properties: {},
    };
  }, [bounds]);

  return (
    <div className="mini-map">
      <Map
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        initialViewState={{
          longitude: -62,
          latitude: -4.5,
        }}
        projection={{
          name: "naturalEarth",
          center: [183, 40],
          parallels: [30, 30],
        }}
        dragPan={false}
        scrollZoom={false}
        zoom={zoom}
        touchZoomRotate={false}
        style={{ width, height }}
        onLoad={(e) => {
          const map = e.target;
          map.doubleClickZoom.disable();
          // Disable scroll wheel zoom
          map.scrollZoom.disable();
          // Disable zooming with touch pinch gesture
          map.touchZoomRotate.disable();
        }}
        mapStyle="mapbox://styles/earthrise/clvwchqxi06gh01pe1huv70id"
      >
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

        <Source
          id={"amazon-source"}
          type="geojson"
          data={geojson as GeoJSON.FeatureCollection}
        />
        <Layer
          id={"amazon-layer"}
          source={"amazon-source"}
          type="fill"
          paint={{
            "fill-color": "#22B573",
            "fill-opacity": 1,
          }}
        />

        {showMinimapBounds && boundsMarker === "circle" && boundsCenter && (
          <Source type="geojson" data={boundsCenter} id="bounds-center-source">
            <Layer
              id={"bounds-circle"}
              type={"circle"}
              paint={{
                "circle-color": "#ffb301",
                "circle-opacity": 0.5,
                "circle-radius": 5,
                "circle-stroke-color": "#ffb301",
                "circle-stroke-width": 2,
                "circle-stroke-opacity": 0.9,
              }}
            />
          </Source>
        )}

        {showMinimapBounds && boundsMarker === "rectangle" && (
          <Source type="geojson" data={bounds} id="bounds-source">
            <Layer
              id={"bounds-outline"}
              source={"bounds"}
              type={"line"}
              paint={{
                "line-color": "#ffb301",
                "line-width": 2,
                "line-opacity": 0.9,
              }}
            />
            <Layer
              id={"bounds-fill"}
              source={"bounds"}
              type={"fill"}
              paint={{
                "fill-color": "#ffb301",
                "fill-opacity": 0.5,
              }}
            />
          </Source>
        )}
      </Map>
    </div>
  );
};

export default MiniMap;
