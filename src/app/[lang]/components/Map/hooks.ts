import { RefObject, useCallback, useRef } from "react";
import type { MapRef } from "react-map-gl";
import { LAYER_ORDER } from "@/app/[lang]/components/Map/config";
import {
  convertBoundsToGeoJSON,
  GeoJSONType,
} from "@/app/[lang]/components/Map/helpers";

export const useReorderLayers = (mapRef: RefObject<MapRef>) => {
  const orderedLayerSetRef = useRef<string>("");

  return useCallback(() => {
    // this ensures layer order
    const map = mapRef.current?.getMap();
    if (!map || !map.isStyleLoaded()) return;

    const existingLayers = LAYER_ORDER.filter((id) => map.getLayer(id));
    if (existingLayers?.length < 2) return;

    // key representing current layer set
    const layerSetKey = existingLayers.join(",");

    // skip if we've already ordered this exact set
    if (orderedLayerSetRef.current === layerSetKey) return;

    // place each layer on the top, in order
    for (let i = 1; i < existingLayers.length; i++) {
      try {
        map.moveLayer(existingLayers[i]);
      } catch (e) {
        console.error(e);
      }
    }

    // save layer set
    orderedLayerSetRef.current = layerSetKey;
  }, [mapRef]);
};

// current map bounds as GeoJSON, used by the minimap
export const getBoundsGeoJSON = (
  mapRef: RefObject<MapRef>,
): GeoJSONType | undefined => {
  const bounds = mapRef.current?.getBounds();
  if (!bounds) return undefined;
  return convertBoundsToGeoJSON(bounds);
};
