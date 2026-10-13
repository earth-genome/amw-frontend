"use client";
import React, { useContext, useLayoutEffect, useRef } from "react";
import style from "./style.module.css";
import { usePrint } from "@/app/[lang]/components/PanoramaPrint/PrintDocument";
import PrintMiniMap from "@/app/[lang]/components/PanoramaPrint/PrintMiniMap";
import { Context } from "@/lib/Store";

interface AreaMapSnapshotProps {
  mapId: string;
  bbox: [number, number, number, number];
  className?: string;
}

// a map of the selected area of the store, with the same layers as the scrollytelling
// map. Once the pages are laid out, a snapshot of the map is rendered at its final size
// by the map renderer of the document
const AreaMapSnapshot = ({ mapId, bbox, className }: AreaMapSnapshotProps) => {
  const [state] = useContext(Context)!;
  const { isLaidOut, mapSnapshots, requestMapSnapshot } = usePrint();
  const containerRef = useRef<HTMLDivElement>(null);
  const snapshot = mapSnapshots[mapId];

  useLayoutEffect(() => {
    const element = containerRef.current;
    if (!isLaidOut || !element) return;
    const { width, height } = element.getBoundingClientRect();
    requestMapSnapshot({
      mapId,
      state,
      bbox,
      width: Math.round(width),
      height: Math.round(height),
    });
  }, [bbox, isLaidOut, mapId, requestMapSnapshot, state]);

  return (
    <div ref={containerRef} className={`${style.areaMap} ${className ?? ""}`}>
      {snapshot && (
        // eslint-disable-next-line @next/next/no-img-element
        <img className={style.image} src={snapshot} alt="" />
      )}

      <div className={style.miniMap}>
        <PrintMiniMap bbox={bbox} />
      </div>
      {/* the map attribution control is not part of the snapshot */}
      <div className={style.attribution}>© Mapbox © OpenStreetMap</div>
    </div>
  );
};

export default AreaMapSnapshot;
