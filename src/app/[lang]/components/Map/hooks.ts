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

export interface BoundsPadding {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
}

// current map bounds as GeoJSON, used by the minimap. The padding, in pixels, leaves out
// the parts of the map covered by UI elements, so the bounds match the visible area
export const getBoundsGeoJSON = (
  mapRef: RefObject<MapRef>,
  padding?: BoundsPadding,
): GeoJSONType | undefined => {
  const map = mapRef.current;
  if (!map) return undefined;

  if (!padding) {
    const bounds = map.getBounds();
    if (!bounds) return undefined;
    return convertBoundsToGeoJSON(bounds);
  }

  const { width, height } = map.getContainer().getBoundingClientRect();
  const { top = 0, bottom = 0, left = 0, right = 0 } = padding;
  // fall back to the whole map if the padding leaves no room
  const minX = left < width - right ? left : 0;
  const maxX = left < width - right ? width - right : width;
  const minY = top < height - bottom ? top : 0;
  const maxY = top < height - bottom ? height - bottom : height;

  const southWest = map.unproject([minX, maxY]);
  const northEast = map.unproject([maxX, minY]);
  return convertBoundsToGeoJSON({
    getSouthWest: () => southWest,
    getNorthEast: () => northEast,
  });
};
