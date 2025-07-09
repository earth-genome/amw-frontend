"use client";
import "./style.css";
import React, { useRef, useEffect } from "react";
import Map, { Layer, Source } from "react-map-gl";
import geojson from "../../data/amazon_basin.json";
import { GeoJSONType } from "../Map/helpers";

interface MiniMapProps {
  bounds?: GeoJSONType;
}

const MiniMap: React.FC<MiniMapProps> = ({ bounds }) => {
  const boundsLayer = {
    id: "bounds",
    type: "line",
    source: "bounds",
    layout: {},
    paint: {
      "line-color": "#ffb301",
      "line-width": 2,
      "line-opacity": 0.9,
    },
  };

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
        zoom={1.7}
        touchZoomRotate={false}
        style={{ width: 220, height: 220 }}
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
          id={"amazon-source"}
          type="geojson"
          // @ts-ignore
          data={geojson}
        />
        <Layer
          id={"amazon-layer"}
          source={"amazon-source"}
          type="fill"
          paint={{
            "fill-color": "#22B573",
            "fill-opacity": 0.7,
          }}
        />

        <Source type="geojson" data={bounds}>
          {/* @ts-ignore */}
          <Layer {...boundsLayer} />
        </Source>
      </Map>
    </div>
  );
};

export default MiniMap;
