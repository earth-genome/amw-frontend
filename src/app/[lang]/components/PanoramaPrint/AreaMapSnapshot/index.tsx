"use client";
import React, { useLayoutEffect, useMemo, useRef } from "react";
import style from "./style.module.css";
import { usePrint } from "@/app/[lang]/components/PanoramaPrint/PrintDocument";
import MiniMap from "@/app/[lang]/components/MiniMap";
import { MapLayersProps } from "@/app/[lang]/components/Map/MapLayers";
import { convertBboxToGeoJSON } from "@/app/[lang]/components/Map/helpers";
import { MapPosition } from "@/utils/mapParams";

interface AreaMapSnapshotProps {
  mapId: string;
  bbox: [number, number, number, number];
  // the layers of the map, the same as the scrollytelling map
  layers: MapLayersProps;
  // custom view of the map, e.g. from the map link, otherwise it fits the bbox
  view?: MapPosition;
  className?: string;
}

const MINI_MAP_WIDTH = 112;
const MINI_MAP_HEIGHT = 76;

// a map of an area, with the same layers as the scrollytelling map. Once the pages are laid
// out, a snapshot of the map is rendered at its final size by the map renderer of the
// document
const AreaMapSnapshot = ({
  mapId,
  bbox,
  layers,
  view,
  className,
}: AreaMapSnapshotProps) => {
  const { isLaidOut, mapSnapshots, requestMapSnapshot } = usePrint();
  const containerRef = useRef<HTMLDivElement>(null);
  const snapshot = mapSnapshots[mapId];
  const bounds = useMemo(() => convertBboxToGeoJSON(bbox), [bbox]);

  useLayoutEffect(() => {
    const element = containerRef.current;
    if (!isLaidOut || !element) return;
    const { width, height } = element.getBoundingClientRect();
    requestMapSnapshot({
      mapId,
      layers,
      bbox,
      view,
      width: Math.round(width),
      height: Math.round(height),
    });
  }, [bbox, isLaidOut, layers, mapId, requestMapSnapshot, view]);

  return (
    <div ref={containerRef} className={`${style.areaMap} ${className ?? ""}`}>
      {snapshot && (
        // eslint-disable-next-line @next/next/no-img-element
        <img className={style.image} src={snapshot} alt="" />
      )}

      <div className={style.miniMap}>
        <MiniMap
          bounds={bounds}
          showMinimapBounds
          width={MINI_MAP_WIDTH}
          height={MINI_MAP_HEIGHT}
        />
      </div>
      {/* the map attribution control is not part of the snapshot */}
      <div className={style.attribution}>© Mapbox © OpenStreetMap</div>
    </div>
  );
};

export default AreaMapSnapshot;
