import { useHotspots } from "@/cms/hotspots";
import { PERMITTED_LANGUAGES } from "@/utils/content";
import { centroid, polygon } from "@turf/turf";
import { SymbolLayer } from "mapbox-gl";
import { FillLayer } from "mapbox-gl";
import { CircleLayer } from "mapbox-gl";
import { LineLayer } from "mapbox-gl";
import { Fragment, useMemo } from "react";
import { Layer, Source } from "react-map-gl";

interface HotspotsProps {
  lang: PERMITTED_LANGUAGES;
}

const darkRed = "#FF3C00";
const lightRed = "#FF6347";
const darkBlue = "#0047AB";
const lightBlue = "#4169E1";

const Hotspots = ({ lang }: HotspotsProps) => {
  const { hotspots: hotspotsData, isLoading, error } = useHotspots(lang);

  const hotspotsCentroidsData = useMemo(() => {
    /* @ts-ignore */
    const calculateCentroid = (feature) => {
      try {
        return centroid(polygon(feature.geometry.coordinates)).geometry;
      } catch (error) {
        console.error("Error calculating centroid for this feature:", feature);
      }
    };
    // the centroid of the polygons
    return {
      type: "FeatureCollection",
      features: hotspotsData?.features?.map((hotspot) => ({
        type: "Feature",
        geometry: calculateCentroid(hotspot),
        properties: hotspot.properties,
      })),
    };
  }, [hotspotsData]);

  const labelData = useMemo(
    // label is a point to be places on the NW corner of the polygon
    () => ({
      type: "FeatureCollection",
      features: hotspotsData?.features.map((hotspot) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: hotspot.geometry.coordinates[0][1], // NW corner
        },
        properties: hotspot.properties,
      })),
    }),
    [hotspotsData]
  );

  const circleLayer: CircleLayer = {
    source: "hotspots-points",
    id: "hotspots-circle",
    type: "circle",
    paint: {
      "circle-radius": [
        "interpolate",
        ["linear"],
        ["zoom"],
        4,
        30,
        10,
        60,
        16,
        140,
      ],
      "circle-color": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        [
          "case",
          ["==", ["get", "hotspotType"], "river_mining"],
          darkBlue,
          darkRed,
        ],
        [
          "case",
          ["==", ["get", "hotspotType"], "river_mining"],
          lightBlue,
          lightRed,
        ],
      ],
      "circle-opacity": [
        "interpolate",
        ["linear"],
        ["zoom"],
        4,
        1,
        7,
        0.8,
        9,
        0,
      ],
      "circle-blur": 1,
    },
  };

  const dotLayer: CircleLayer = {
    source: "hotspots-points",
    id: "hotspots-dot",
    type: "circle",
    paint: {
      "circle-radius": [
        "interpolate",
        ["linear"],
        ["zoom"],
        4,
        3,
        10,
        5,
        16,
        8,
      ],
      "circle-color": "#ffffff",
      "circle-opacity": [
        "interpolate",
        ["linear"],
        ["zoom"],
        4,
        1,
        7,
        0.9,
        9,
        0,
      ],
    },
  };

  const outlineLayer: LineLayer = {
    source: "hotspots-polygon",
    id: "hotspots-outline",
    type: "line",
    paint: {
      "line-color": [
        "case",
        ["==", ["get", "hotspotType"], "river_mining"],
        darkBlue,
        darkRed,
      ],
      "line-width": 4,
      "line-opacity": ["interpolate", ["linear"], ["zoom"], 4, 0, 7, 0, 9, 1],
    },
  };

  const fillLayer: FillLayer = {
    source: "hotspots-polygon",
    id: "hotspots-fill",
    type: "fill",
    paint: {
      "fill-color": [
        "case",
        ["==", ["get", "hotspotType"], "river_mining"],
        darkBlue,
        darkRed,
      ],
      "fill-opacity": [
        "interpolate",
        ["linear"],
        ["zoom"],
        4,
        0,
        7,
        0,
        16,
        0.05,
      ],
    },
  };

  const polygonLabelLayer: SymbolLayer = {
    source: "hotspots-polygon",
    id: "hotspots-labels",
    type: "symbol",
    layout: {
      "text-field": ["get", "title"],
      "text-size": 16,
      "text-anchor": "top-left",
      "text-offset": [1, 1],
      "text-justify": "left",
      "text-font": ["Urbanist", "Open Sans Bold", "Arial Unicode MS Bold"],
    },
    paint: {
      "text-color": "#ffffff",
      "text-halo-color": [
        "case",
        ["==", ["get", "hotspotType"], "river_mining"],
        darkBlue,
        darkRed,
      ],
      "text-halo-width": 2,
      "text-halo-blur": 0,
      "text-opacity": ["interpolate", ["linear"], ["zoom"], 4, 0, 8, 0, 9, 1],
    },
  };

  if (!hotspotsData?.features?.length) return null;

  return (
    <Fragment>
      {hotspotsCentroidsData?.features?.length && (
        <Source
          id="hotspots-points"
          type="geojson"
          data={hotspotsCentroidsData}
        >
          <Layer {...circleLayer} />
          <Layer {...dotLayer} />
        </Source>
      )}
      <Source id="hotspots-polygon" type="geojson" data={hotspotsData}>
        <Layer {...outlineLayer} />
        <Layer {...fillLayer} beforeId={"hotspots-outline"} />
      </Source>

      <Source id="hotspots-labels" type="geojson" data={labelData}>
        <Layer {...polygonLabelLayer} />
      </Source>
    </Fragment>
  );
};

export default Hotspots;
