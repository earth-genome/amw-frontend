"use client";
import "@/app/[lang]/components/Map/style.css";
import style from "./style.module.css";
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import Map from "react-map-gl";
import type { MapRef } from "react-map-gl";
import AreaSummary from "@/app/[lang]/components/AreaSummary";
import MiniMap from "@/app/[lang]/components/MiniMap";
import MapLayers from "@/app/[lang]/components/Map/MapLayers";
import {
  INITIAL_VIEW,
  MAP_MIN_ZOOM,
  MAP_PROJECTION,
  SATELLITE_LAYERS,
} from "@/app/[lang]/components/Map/config";
import {
  getBoundsGeoJSON,
  useReorderLayers,
} from "@/app/[lang]/components/Map/hooks";
import { GeoJSONType } from "@/app/[lang]/components/Map/helpers";
import { useScrolly } from "@/app/[lang]/components/Panorama/ScrollyProvider";
import { Context } from "@/lib/Store";
import { getColorsForYears, LAYER_YEARS } from "@/constants/map";
import { hasMapPosition } from "@/utils/mapParams";
import useWindowSize from "@/hooks/useWindowSize";
import { SCROLLY_MOBILE_BREAKPOINT } from "@/app/[lang]/components/Panorama/constants";

interface ScrollyMapProps {
  dictionary: { [key: string]: any };
}

const FLY_DURATION = 2500;
const MINI_MAP_WIDTH = 115;
const MINI_MAP_HEIGHT = 70;

// leaves room for the step cards on the left and the area summary on the right,
// on mobile they flow with the scroll so the area can be centered
const getCameraPadding = (width: number) =>
  width <= SCROLLY_MOBILE_BREAKPOINT
    ? { top: 60, bottom: 60, left: 20, right: 20 }
    : {
        top: 80,
        bottom: 80,
        left: Math.min(560, Math.round(width * 0.4)),
        right: width <= 1000 ? 40 : 440,
      };

// a barebones version of the main map, driven by the active scrollytelling step
const ScrollyMap = ({ dictionary }: ScrollyMapProps) => {
  const [state] = useContext(Context)!;
  const { activeParams } = useScrolly();
  const mapRef = useRef<MapRef>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [bounds, setBounds] = useState<GeoJSONType | undefined>(undefined);
  const windowSize = useWindowSize();

  const { selectedArea, selectedAreaData } = state;
  // on mobile, the area summary is displayed in the scrollytelling steps
  const isDesktop =
    windowSize !== undefined && windowSize.width > SCROLLY_MOBILE_BREAKPOINT;

  const yearsColors = useMemo(() => getColorsForYears(LAYER_YEARS), []);
  const reorderLayers = useReorderLayers(mapRef);

  // move the camera to an explicit position from the map link, or to the initial view
  // when the step has no area
  useEffect(() => {
    const map = mapRef.current;
    if (!isMapLoaded || !map || !activeParams) return;

    if (hasMapPosition(activeParams)) {
      map.flyTo({
        center: [activeParams.lng, activeParams.lat],
        zoom: activeParams.zoom,
        duration: FLY_DURATION,
        essential: true,
      });
    } else if (!activeParams.areaId) {
      map.flyTo({
        center: [INITIAL_VIEW.longitude, INITIAL_VIEW.latitude],
        zoom: INITIAL_VIEW.zoom,
        duration: FLY_DURATION,
        essential: true,
      });
    }
  }, [activeParams, isMapLoaded]);

  // otherwise, zoom to the selected area once its data is loaded
  useEffect(() => {
    const map = mapRef.current;
    if (!isMapLoaded || !map || !activeParams?.areaId) return;
    if (hasMapPosition(activeParams)) return;
    if (selectedAreaData?.id !== activeParams.areaId || !selectedAreaData.bbox)
      return;

    map.fitBounds(selectedAreaData.bbox, {
      padding: getCameraPadding(windowSize?.width ?? window.innerWidth),
      duration: FLY_DURATION,
      essential: true,
    });
  }, [activeParams, isMapLoaded, selectedAreaData, windowSize]);

  return (
    <div className={style.scrollyMap}>
      <Map
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        ref={mapRef}
        initialViewState={INITIAL_VIEW}
        minZoom={MAP_MIN_ZOOM}
        projection={MAP_PROJECTION}
        style={{ width: "100%", height: "100%" }}
        mapStyle={SATELLITE_LAYERS["yearly"]}
        // the map follows the scroll, so it is not interactive
        interactive={false}
        onLoad={() => setIsMapLoaded(true)}
        onMoveEnd={() => setBounds(getBoundsGeoJSON(mapRef))}
        onIdle={reorderLayers}
      >
        {/* no area outlines nor hover effect, only the selected area */}
        <MapLayers showAreasLayers={false} />
      </Map>

      <div className={style.miniMap}>
        <MiniMap
          bounds={bounds}
          showMinimapBounds={
            (mapRef.current && mapRef.current.getZoom() > 5) ?? false
          }
          width={MINI_MAP_WIDTH}
          height={MINI_MAP_HEIGHT}
          boundsMarker="circle"
        />
      </div>

      {selectedArea && isDesktop && (
        <AreaSummary
          dictionary={dictionary}
          maxYear={LAYER_YEARS[LAYER_YEARS.length - 1]}
          yearsColors={yearsColors}
          isScrollytelling
          className={style.areaSummary}
        />
      )}
    </div>
  );
};

export default ScrollyMap;
