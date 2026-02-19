import MapboxDraw, {
  DrawEvent,
  DrawModeChangeEvent,
} from "@mapbox/mapbox-gl-draw";
import { area, length } from "@turf/turf";
import { MapRef } from "react-map-gl";
import { MutableRefObject } from "react";

interface addDrawToMapProps {
  setAreaMeasure: (_value: number) => void;
  setLineMeasure: (_value: number) => void;
  mapRef: MapRef;
  isDrawingRef: MutableRefObject<boolean>;
}

export const addDrawToMap = ({
  setAreaMeasure,
  setLineMeasure,
  mapRef,
  isDrawingRef,
}: addDrawToMapProps): MapboxDraw => {
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
    setAreaMeasure(0);
    setLineMeasure(0);
    isDrawingRef.current = false;
  });

  // Find the draw controls container and add the button
  const controls = document.querySelectorAll(".mapboxgl-ctrl-group");
  if (controls.length) {
    const drawControls = controls[controls.length - 1];
    drawControls.appendChild(clearAllButton);
    drawControls.classList.add("draw-controls");
  }

  // Track drawing state — when leaving a drawing mode, defer the reset
  // so that handleClick (which fires in the same event loop tick) still
  // sees isDrawingRef as true and can bail out for the final click.
  mapRef.on("draw.modechange", (e: DrawModeChangeEvent) => {
    const mode = e.mode;
    const isDrawing = mode === "draw_polygon" || mode === "draw_line_string";
    if (isDrawing) {
      isDrawingRef.current = true;
    } else {
      setTimeout(() => {
        isDrawingRef.current = false;
      }, 0);
    }
  });

  mapRef.on("draw.create", updateMeasurements);
  mapRef.on("draw.delete", updateMeasurements);
  mapRef.on("draw.update", updateMeasurements);

  return draw;

  function updateMeasurements(e: DrawEvent) {
    const data = draw.getAll();

    // Drawing is complete when create event fires — defer the reset
    // so handleClick still sees isDrawingRef as true for this click
    if (e.type === "draw.create") {
      setTimeout(() => {
        isDrawingRef.current = false;
      }, 0);
    }

    if (data.features.length > 0) {
      let totalArea = 0;
      let totalLength = 0;

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
      setAreaMeasure(0);
      setLineMeasure(0);
    }
  }
};
