"use client";
import "./style.css";
import React from "react";
import Map, { Layer, Source } from "react-map-gl";
import geojson from "../../data/amazon_basin.json";
import { GeoJSONType } from "../Map/helpers";

interface MiniMapProps {
  bounds?: GeoJSONType;
}

const MiniMap: React.FC<MiniMapProps> = ({ bounds }) => {
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
        zoom={1.3}
        touchZoomRotate={false}
        style={{ width: 165, height: 145 }}
        onLoad={(e) => {
          const map = e.target;
          map.doubleClickZoom.disable();
          // Disable scroll wheel zoom
          map.scrollZoom.disable();
          // Disable zooming with touch pinch gesture
          map.touchZoomRotate.disable();
        }}
        mapStyle="mapbox://styles/mikolaj-huncwot/cl1kut8iy000015onarujw9l9"
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

        <Source type="geojson" data={bounds}>
          <Layer
            id={"bounds-outline"}
            source={"bounds"}
            type={"line"}
            paint={{
              "line-color": "##ffb301",
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
      </Map>
    </div>
  );
};

export default MiniMap;
