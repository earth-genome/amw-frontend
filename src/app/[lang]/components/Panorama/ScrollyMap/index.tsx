"use client";
import "@/app/[lang]/components/Map/style.css";
import style from "./style.module.css";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Map, { NavigationControl } from "react-map-gl";
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

// exploration mode
const EXPLORE_HINT_DELAY = 400; // ms the cursor has to rest on the map to show the hint
const EXPLORE_FLY_DURATION = 500; // ms to fly to the story view when entering and exiting
const EXPLORE_BOUNDS_BUFFER = 0.5; // fraction of the story view added on each side
const EXPLORE_MAX_ZOOM_OUT = 1.5; // zoom levels the user can zoom out of the story view
// handlers enabled while exploring, rotation and pitch stay disabled
const EXPLORE_HANDLERS = [
  "scrollZoom",
  "dragPan",
  "doubleClickZoom",
  "keyboard",
  "boxZoom",
] as const;

interface ExploreBounds {
  west: number;
  east: number;
  south: number;
  north: number;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

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
  const { activeParams, activeLabel, exploreState, setExploreState } =
    useScrolly();
  const mapRef = useRef<MapRef>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [bounds, setBounds] = useState<GeoJSONType | undefined>(undefined);
  const windowSize = useWindowSize();

  const { selectedArea, selectedAreaData } = state;
  // on mobile, the area summary is displayed in the scrollytelling steps
  const isDesktop =
    windowSize !== undefined && windowSize.width > SCROLLY_MOBILE_BREAKPOINT;

  // the map can only be explored on desktop, this is set when the map is created
  // since mapbox doesn't allow changing it later
  const [canExplore] = useState(
    () =>
      typeof window !== "undefined" &&
      window.innerWidth > SCROLLY_MOBILE_BREAKPOINT,
  );
  const isStory = exploreState === "story";
  const isExploring = exploreState === "exploring";

  const exploreStateRef = useRef(exploreState);
  exploreStateRef.current = exploreState;
  // scroll position to go back to when exiting the exploration
  const scrollYRef = useRef(0);
  const exploreBoundsRef = useRef<ExploreBounds>();
  // timeout of the fly when entering or exiting the exploration
  const transitionTimeoutRef = useRef<number>();
  // the map can be moved once it has flown to the story view
  const [canMoveMap, setCanMoveMap] = useState(false);

  // hint following the cursor, positioned directly to avoid re-renders on every move
  const hintRef = useRef<HTMLDivElement>(null);
  const hintTimeoutRef = useRef<number>();
  const [isHintVisible, setIsHintVisible] = useState(false);

  const yearsColors = useMemo(() => getColorsForYears(LAYER_YEARS), []);
  const reorderLayers = useReorderLayers(mapRef);

  // camera of the active step: the position from the map link, the selected area once
  // its data is loaded, or the initial view when the step has no area
  const getStoryCamera = () => {
    const map = mapRef.current?.getMap();
    if (!map) return undefined;

    if (activeParams && hasMapPosition(activeParams)) {
      return {
        center: [activeParams.lng, activeParams.lat] as [number, number],
        zoom: activeParams.zoom,
      };
    }

    if (activeParams?.areaId) {
      if (
        selectedAreaData?.id !== activeParams.areaId ||
        !selectedAreaData.bbox
      )
        return undefined;
      const camera = map.cameraForBounds(selectedAreaData.bbox, {
        padding: getCameraPadding(window.innerWidth),
      });
      if (!camera?.center || camera.zoom === undefined) return undefined;
      return { center: camera.center, zoom: camera.zoom };
    }

    return {
      center: [INITIAL_VIEW.longitude, INITIAL_VIEW.latitude] as [
        number,
        number,
      ],
      zoom: INITIAL_VIEW.zoom,
    };
  };

  // returns whether the map flies
  const flyToStory = (duration: number) => {
    const map = mapRef.current;
    const camera = getStoryCamera();
    if (!map || !camera) return false;

    map.flyTo({ ...camera, bearing: 0, pitch: 0, duration, essential: true });
    return true;
  };

  // move the camera when the active step changes, to an explicit position from the map
  // link or to the initial view when the step has no area
  useEffect(() => {
    if (!isMapLoaded || !activeParams) return;
    if (exploreStateRef.current !== "story") return;
    if (hasMapPosition(activeParams) || !activeParams.areaId) {
      flyToStory(FLY_DURATION);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeParams, isMapLoaded]);

  // otherwise, zoom to the selected area once its data is loaded
  useEffect(() => {
    if (!isMapLoaded || !activeParams?.areaId) return;
    if (exploreStateRef.current !== "story") return;
    if (hasMapPosition(activeParams)) return;
    flyToStory(FLY_DURATION);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeParams, isMapLoaded, selectedAreaData, windowSize]);

  // ================== EXPLORATION MODE ==================

  const hideHint = useCallback(() => {
    window.clearTimeout(hintTimeoutRef.current);
    setIsHintVisible(false);
  }, []);

  const setExploreHandlers = (enabled: boolean) => {
    const map = mapRef.current?.getMap();
    if (!map) return;
    EXPLORE_HANDLERS.forEach((handler) => {
      if (enabled) map[handler].enable();
      else map[handler].disable();
    });
  };

  // once at the story view, let the user move the map around it
  const startExploring = () => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    const storyBounds = map.getBounds();
    if (storyBounds) {
      const lngBuffer =
        (storyBounds.getEast() - storyBounds.getWest()) * EXPLORE_BOUNDS_BUFFER;
      const latBuffer =
        (storyBounds.getNorth() - storyBounds.getSouth()) *
        EXPLORE_BOUNDS_BUFFER;
      exploreBoundsRef.current = {
        west: storyBounds.getWest() - lngBuffer,
        east: storyBounds.getEast() + lngBuffer,
        south: Math.max(-85, storyBounds.getSouth() - latBuffer),
        north: Math.min(85, storyBounds.getNorth() + latBuffer),
      };
    }
    map.setMinZoom(
      Math.max(MAP_MIN_ZOOM, map.getZoom() - EXPLORE_MAX_ZOOM_OUT),
    );
    setExploreHandlers(true);
    setCanMoveMap(true);
  };

  const enterExploration = () => {
    if (!mapRef.current || !canExplore || !isDesktop || !isStory) return;

    // the page doesn't scroll while exploring, so the wheel zooms the map and the active
    // step doesn't change
    scrollYRef.current = window.scrollY;
    document.documentElement.style.scrollbarGutter = "stable";
    document.documentElement.style.overflow = "hidden";

    hideHint();
    setExploreState("exploring");

    // first fly to the story view, in case the map was still moving towards it. The
    // handlers are only enabled after it, so the user can't stop it halfway
    const isFlying = flyToStory(EXPLORE_FLY_DURATION);
    transitionTimeoutRef.current = window.setTimeout(
      startExploring,
      isFlying ? EXPLORE_FLY_DURATION : 0,
    );
  };

  const exitExploration = () => {
    const map = mapRef.current?.getMap();
    if (!map || exploreStateRef.current !== "exploring") return;

    window.clearTimeout(transitionTimeoutRef.current);
    setExploreState("exiting");
    setExploreHandlers(false);
    setCanMoveMap(false);
    map.setMinZoom(MAP_MIN_ZOOM);
    exploreBoundsRef.current = undefined;

    // fly back to the story view, then show the story where it was left
    const isFlying = flyToStory(EXPLORE_FLY_DURATION);
    transitionTimeoutRef.current = window.setTimeout(
      () => {
        document.documentElement.style.overflow = "";
        document.documentElement.style.scrollbarGutter = "";
        window.scrollTo(0, scrollYRef.current);
        setExploreState("story");
      },
      isFlying ? EXPLORE_FLY_DURATION : 0,
    );
  };

  // keep the center within the exploration bounds
  const constrainExploration = () => {
    const map = mapRef.current;
    const exploreBounds = exploreBoundsRef.current;
    if (!map || !exploreBounds || exploreStateRef.current !== "exploring")
      return;

    const center = map.getCenter();
    const lng = clamp(center.lng, exploreBounds.west, exploreBounds.east);
    const lat = clamp(center.lat, exploreBounds.south, exploreBounds.north);
    if (lng !== center.lng || lat !== center.lat) {
      map.easeTo({ center: [lng, lat], duration: 300 });
    }
  };

  // exit with the escape key, through a ref to use the latest story camera
  const exitExplorationRef = useRef(exitExploration);
  exitExplorationRef.current = exitExploration;
  useEffect(() => {
    if (!isExploring) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") exitExplorationRef.current();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isExploring]);

  // the content moves under the cursor when scrolling, so hide the hint
  useEffect(() => {
    window.addEventListener("scroll", hideHint, { passive: true });
    return () => window.removeEventListener("scroll", hideHint);
  }, [hideHint]);

  // clean up if leaving the page while exploring
  useEffect(
    () => () => {
      window.clearTimeout(transitionTimeoutRef.current);
      window.clearTimeout(hintTimeoutRef.current);
      document.documentElement.style.overflow = "";
      document.documentElement.style.scrollbarGutter = "";
    },
    [],
  );

  const handlePointerMove = (event: React.PointerEvent) => {
    if (!canExplore || !isDesktop || !isStory || event.pointerType !== "mouse")
      return;

    // the hint follows the cursor once it is shown
    if (hintRef.current) {
      hintRef.current.style.transform = `translate(${event.clientX + 16}px, ${
        event.clientY + 16
      }px)`;
    }
    // it is shown when the cursor rests on the map
    if (!isHintVisible) {
      window.clearTimeout(hintTimeoutRef.current);
      hintTimeoutRef.current = window.setTimeout(
        () => setIsHintVisible(true),
        EXPLORE_HINT_DELAY,
      );
    }
  };

  const handlePointerDown = (event: React.PointerEvent) => {
    if (event.button !== 0 || event.pointerType !== "mouse") return;
    enterExploration();
  };

  return (
    <div
      className={`${style.scrollyMap} ${isStory ? "" : style.scrollyMapExploring} ${
        // the grab cursor only while the map can be moved
        isExploring ? "" : style.cursorPointer
      }`}
    >
      <div
        className={style.mapWrapper}
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        onPointerLeave={hideHint}
      >
        <Map
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
          ref={mapRef}
          initialViewState={INITIAL_VIEW}
          minZoom={MAP_MIN_ZOOM}
          projection={MAP_PROJECTION}
          style={{ width: "100%", height: "100%" }}
          mapStyle={SATELLITE_LAYERS["yearly"]}
          // the map follows the scroll, its handlers are only enabled while exploring
          interactive={canExplore}
          scrollZoom={false}
          dragPan={false}
          dragRotate={false}
          keyboard={false}
          doubleClickZoom={false}
          touchZoomRotate={false}
          touchPitch={false}
          boxZoom={false}
          onLoad={() => setIsMapLoaded(true)}
          onMoveEnd={() => {
            setBounds(getBoundsGeoJSON(mapRef));
            constrainExploration();
          }}
          onIdle={reorderLayers}
        >
          {/* no area outlines nor hover effect, only the selected area */}
          <MapLayers showAreasLayers={false} />

          {isExploring && canMoveMap && (
            <NavigationControl position="top-right" showCompass={false} />
          )}
        </Map>
      </div>

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
          className={`${style.areaSummary} ${isStory ? "" : style.hidden}`}
        />
      )}

      {canExplore && isDesktop && (
        <div
          ref={hintRef}
          className={`${style.hint} ${
            isHintVisible && isStory ? style.hintVisible : ""
          }`}
          aria-hidden="true"
        >
          <span className={style.dot} />
          {dictionary?.panorama?.explore_hint}
        </div>
      )}

      {isExploring && (
        <>
          <div className={style.status}>
            <span className={style.dot} />
            <span className={style.statusLabel}>
              {dictionary?.panorama?.exploring}
            </span>
            {activeLabel && (
              <span className={style.statusTitle}>{activeLabel}</span>
            )}
          </div>

          <div className={style.exploreControls}>
            <span className={style.escHint}>{dictionary?.panorama?.esc}</span>
            <button
              type="button"
              className={style.backButton}
              onClick={exitExploration}
            >
              × {dictionary?.panorama?.back_to_report}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ScrollyMap;
