"use client";
import "./style.css";
import React from "react";
import Map, { Layer, Source } from "react-map-gl";
import geojson from "@/app/[lang]/data/amazon_aca.json";
import { GeoJSONType } from "@/app/[lang]/components/Map/helpers";

interface MiniMapProps {
  bounds?: GeoJSONType;
  showMinimapBounds: boolean;
}

const MiniMap: React.FC<MiniMapProps> = ({ bounds, showMinimapBounds }) => {
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
        zoom={1}
        touchZoomRotate={false}
        style={{ width: 165, height: 100 }}
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

        {showMinimapBounds && (
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
