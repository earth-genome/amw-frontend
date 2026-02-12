import MapboxDraw, {
  DrawEvent,
  DrawModeChangeEvent,
} from "@mapbox/mapbox-gl-draw";
import { area, length } from "@turf/turf";
import { MapRef } from "react-map-gl";
import { MutableRefObject } from "react";

interface addDrawToMapProps {
  setAreaMeasure: (_value: number | undefined) => void;
  setLineMeasure: (_value: number | undefined) => void;
  mapRef: MapRef;
  isDrawingRef: MutableRefObject<boolean>;
}

export const addDrawToMap = ({
  setAreaMeasure,
  setLineMeasure,
  mapRef,
  isDrawingRef,
}: addDrawToMapProps) => {
  const draw = new MapboxDraw({
    displayControlsDefault: false,
    controls: {
      polygon: true,
      line_string: true,
      trash: false, // Disable default trash button
    },
  });
  // @ts-ignore
  mapRef.addControl(draw);

  // Add custom clear all button
  const clearAllButton = document.createElement("button");
  clearAllButton.className =
    "mapbox-gl-draw_ctrl-draw-btn mapbox-gl-draw_trash";
  clearAllButton.title = "Clear all";
  clearAllButton.addEventListener("click", () => {
    draw.deleteAll();
    setAreaMeasure(undefined);
    setLineMeasure(undefined);
    isDrawingRef.current = false;
  });

  // Find the draw controls container and add the button
  const controls = document.querySelectorAll(".mapboxgl-ctrl-group");
  if (controls.length) {
    const drawControls = controls[controls.length - 1];
    drawControls.appendChild(clearAllButton);
    drawControls.classList.add("draw-controls");
  }

  // Track drawing state
  mapRef.on("draw.modechange", (e: DrawModeChangeEvent) => {
    const mode = e.mode;
    isDrawingRef.current =
      mode === "draw_polygon" || mode === "draw_line_string";
  });

  mapRef.on("draw.create", updateMeasurements);
  mapRef.on("draw.delete", updateMeasurements);
  mapRef.on("draw.update", updateMeasurements);

  function updateMeasurements(e: DrawEvent) {
    const data = draw.getAll();

    // console.log(data);

    // Drawing is complete when create event fires
    if (e.type === "draw.create") {
      isDrawingRef.current = false;
    }

    if (data.features.length > 0) {
      let totalArea = 0;
      let totalLength = 0;

      // TODO: fix units
      data.features.forEach((feature) => {
        if (
          feature.geometry.type === "Polygon" ||
          feature.geometry.type === "MultiPolygon"
        ) {
          totalArea += area(feature);
        } else if (
          feature.geometry.type === "LineString" ||
          feature.geometry.type === "MultiLineString"
        ) {
          totalLength += length(feature, { units: "meters" });
        }
      });

      setAreaMeasure(Math.round(totalArea * 100) / 100);
      setLineMeasure(Math.round(totalLength * 100) / 100);
    } else {
      setAreaMeasure(undefined);
      setLineMeasure(undefined);
    }
  }
};
