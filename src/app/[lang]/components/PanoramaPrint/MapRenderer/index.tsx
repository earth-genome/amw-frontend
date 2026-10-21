"use client";
import "@/app/[lang]/components/Map/style.css";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Map from "react-map-gl";
import type { ErrorEvent, MapRef } from "react-map-gl";
import style from "./style.module.css";
import MapLayers, {
  MapLayersProps,
} from "@/app/[lang]/components/Map/MapLayers";
import {
  MAP_PROJECTION,
  SATELLITE_LAYERS,
} from "@/app/[lang]/components/Map/config";
import { useReorderLayers } from "@/app/[lang]/components/Map/hooks";
import { MapPosition } from "@/utils/mapParams";

export interface MapJob {
  mapId: string;
  // the layers of the map of the area
  layers: MapLayersProps;
  bbox: [number, number, number, number];
  // custom view, e.g. from the map link, otherwise the map fits the bbox
  view?: MapPosition;
  // final size of the map in the page
  width: number;
  height: number;
}

interface MapRendererProps {
  job: MapJob | undefined;
  onSnapshot: (_mapId: string, _snapshot: string | null) => void;
}

const FIT_PADDING = 24;
// ms without new idle events before taking the snapshot, e.g. after reordering the layers
const SNAPSHOT_DELAY = 600;
// gives up on maps that don't finish loading, and keeps whatever was rendered
const JOB_TIMEOUT = 15000;
const SNAPSHOT_QUALITY = 0.92;

// a single hidden map that renders the maps of the document one by one, resized to their
// final size, and takes a snapshot of each. The map stays mounted, so its style is loaded
// only once, and to avoid a mapbox-gl error when maps are removed while its telemetry
// request is pending ("this.errorCb is not a function")
const MapRenderer = ({ job, onSnapshot }: MapRendererProps) => {
  const mapRef = useRef<MapRef>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);
  const snapshotTimeoutRef = useRef<number>();
  // the job being rendered, read by the map events
  const jobRef = useRef<MapJob>();
  const reorderLayers = useReorderLayers(mapRef);

  const takeSnapshot = useCallback(
    (mapJob: MapJob) => {
      if (jobRef.current !== mapJob) return;
      jobRef.current = undefined;
      window.clearTimeout(snapshotTimeoutRef.current);

      let snapshot: string | null = null;
      try {
        const canvas = mapRef.current?.getMap()?.getCanvas();
        snapshot = canvas
          ? canvas.toDataURL("image/jpeg", SNAPSHOT_QUALITY)
          : null;
      } catch (error) {
        // e.g. a tainted canvas or a lost WebGL context. The map is left empty, otherwise
        // the job would never finish and the PDF would wait until it times out
        console.error(
          `Error taking the snapshot of map ${mapJob.mapId}`,
          error,
        );
      }
      onSnapshot(mapJob.mapId, snapshot);
    },
    [onSnapshot],
  );

  // the map can't be rendered, e.g. without a token, so none of the maps can
  useEffect(() => {
    if (hasFailed && job) onSnapshot(job.mapId, null);
  }, [hasFailed, job, onSnapshot]);

  // move to each job once the map is loaded, its size and layers are already updated
  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!job || !isLoaded || !map) return;

    jobRef.current = job;
    window.clearTimeout(snapshotTimeoutRef.current);
    map.resize();
    // the same camera as the scrollytelling map
    if (job.view) {
      map.jumpTo({
        center: [job.view.lng, job.view.lat],
        zoom: job.view.zoom,
        bearing: 0,
        pitch: 0,
      });
    } else {
      map.fitBounds(job.bbox, { padding: FIT_PADDING, duration: 0 });
    }
    // make sure an idle event follows, even if nothing changed
    map.triggerRepaint();

    const timeout = window.setTimeout(() => takeSnapshot(job), JOB_TIMEOUT);
    return () => window.clearTimeout(timeout);
  }, [isLoaded, job, takeSnapshot]);

  useEffect(() => () => window.clearTimeout(snapshotTimeoutRef.current), []);

  const handleIdle = () => {
    reorderLayers();
    const mapJob = jobRef.current;
    if (!mapJob) return;
    window.clearTimeout(snapshotTimeoutRef.current);
    snapshotTimeoutRef.current = window.setTimeout(
      () => takeSnapshot(mapJob),
      SNAPSHOT_DELAY,
    );
  };

  // errors before the map loads that aren't from a source, e.g. a missing token or style,
  // are fatal. Errors of the sources, e.g. a missing tile, are not
  const handleError = (event: ErrorEvent) => {
    const { sourceId, tile } = event as ErrorEvent & {
      sourceId?: string;
      tile?: unknown;
    };
    if (!isLoaded && !sourceId && !tile) setHasFailed(true);
  };

  // keep the last job when done, so the map isn't removed
  const lastJobRef = useRef<MapJob>();
  if (job) lastJobRef.current = job;
  const currentJob = job ?? lastJobRef.current;
  if (!currentJob || hasFailed) return null;

  return (
    <div
      className={style.mapRenderer}
      style={{ width: currentJob.width, height: currentJob.height }}
      aria-hidden="true"
    >
      <Map
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        ref={mapRef}
        initialViewState={{
          bounds: currentJob.bbox,
          fitBoundsOptions: { padding: FIT_PADDING },
        }}
        projection={MAP_PROJECTION}
        style={{ width: "100%", height: "100%" }}
        mapStyle={SATELLITE_LAYERS["yearly"]}
        interactive={false}
        attributionControl={false}
        preserveDrawingBuffer
        fadeDuration={0}
        onLoad={() => setIsLoaded(true)}
        onError={handleError}
        onIdle={handleIdle}
      >
        {/* no area outlines, only the selected area */}
        <MapLayers {...currentJob.layers} showAreasLayers={false} />
      </Map>
    </div>
  );
};

export default MapRenderer;
