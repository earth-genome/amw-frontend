"use client";
import "@/app/[lang]/components/Map/style.css";
import style from "./style.module.css";
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import Map, { NavigationControl } from "react-map-gl";
import type { MapRef } from "react-map-gl";
import MiniMap from "@/app/[lang]/components/MiniMap";
import MapLayers from "@/app/[lang]/components/Map/MapLayers";
import Legend from "@/app/[lang]/components/Map/Legend";
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
import { LAYER_YEARS } from "@/constants/map";
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

// period of the story, restored when exiting the exploration
interface StoryPeriod {
  activeYear: string;
  isCumulative: boolean;
}

interface ExploreBounds {
  west: number;
  east: number;
  south: number;
  north: number;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

type Padding = { top: number; bottom: number; left: number; right: number };

const NO_PADDING: Padding = { top: 0, bottom: 0, left: 0, right: 0 };

// padding of the map while following the steps with cards: on desktop the step cards and
// area summaries cover the left of the map, so the camera is centered on the remaining area
// on the right. On mobile they flow with the scroll over the whole map
const getStepPadding = (width: number): Padding =>
  width <= SCROLLY_MOBILE_BREAKPOINT
    ? NO_PADDING
    : { ...NO_PADDING, left: Math.min(560, Math.round(width * 0.4)) };

// margins around the area, within the map padding
const getAreaMargins = (width: number): Padding =>
  width <= SCROLLY_MOBILE_BREAKPOINT
    ? { top: 60, bottom: 60, left: 20, right: 20 }
    : { top: 80, bottom: 80, left: 40, right: 40 };

// a barebones version of the main map, driven by the active scrollytelling step
const ScrollyMap = ({ dictionary }: ScrollyMapProps) => {
  const [state, dispatch] = useContext(Context)!;
  const { activeParams, activeLabel, exploreState, setExploreState } =
    useScrolly();
  const mapRef = useRef<MapRef>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [bounds, setBounds] = useState<GeoJSONType | undefined>(undefined);
  const windowSize = useWindowSize();

  const { selectedAreaData, activeYear, isCumulative } = state;
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
  // the period can be changed with the legend while exploring
  const storyPeriodRef = useRef<StoryPeriod>();
  // timeout of the fly when entering or exiting the exploration
  const transitionTimeoutRef = useRef<number>();
  // the map can be moved once it has flown to the story view
  const [canMoveMap, setCanMoveMap] = useState(false);

  // hint following the cursor, positioned directly to avoid re-renders on every move
  const hintRef = useRef<HTMLDivElement>(null);
  const hintTimeoutRef = useRef<number>();
  const [isHintVisible, setIsHintVisible] = useState(false);

  const reorderLayers = useReorderLayers(mapRef);

  // camera of the active step: the position from the map link, the selected area once
  // its data is loaded, or the initial view when the step has no area. The padding is
  // animated by the fly, so the camera is centered on the area not covered by the cards
  const getStoryCamera = () => {
    const map = mapRef.current?.getMap();
    if (!map) return undefined;
    const width = window.innerWidth;

    if (activeParams && hasMapPosition(activeParams)) {
      return {
        center: [activeParams.lng, activeParams.lat] as [number, number],
        zoom: activeParams.zoom,
        padding: getStepPadding(width),
      };
    }

    if (activeParams?.areaId) {
      if (
        selectedAreaData?.id !== activeParams.areaId ||
        !selectedAreaData.bbox
      )
        return undefined;

      const padding = getStepPadding(width);
      const margins = getAreaMargins(width);
      // the zoom fits the area within the margins, in the part of the map left by the
      // padding. cameraForBounds already accounts for the current padding of the map,
      // so it only gets the difference with the padding the map will have after the fly
      const currentPadding = map.getPadding();
      const fitPadding = {
        top: Math.max(0, margins.top + padding.top - currentPadding.top),
        bottom: Math.max(
          0,
          margins.bottom + padding.bottom - currentPadding.bottom,
        ),
        left: Math.max(0, margins.left + padding.left - currentPadding.left),
        right: Math.max(
          0,
          margins.right + padding.right - currentPadding.right,
        ),
      };
      const camera = map.cameraForBounds(selectedAreaData.bbox, {
        padding: fitPadding,
      });
      if (camera?.zoom === undefined) return undefined;

      // the center of the area, which the padding of the fly places in the middle of the
      // part of the map left by the cards
      const [west, south, east, north] = selectedAreaData.bbox;
      const southWest = map.project([west, south]);
      const northEast = map.project([east, north]);
      const center = map.unproject([
        (southWest.x + northEast.x) / 2,
        (southWest.y + northEast.y) / 2,
      ]);
      return {
        center: [center.lng, center.lat] as [number, number],
        zoom: camera.zoom,
        padding,
      };
    }

    // the intro of the highlighted areas is centered on the map
    return {
      center: [INITIAL_VIEW.longitude, INITIAL_VIEW.latitude] as [
        number,
        number,
      ],
      zoom: INITIAL_VIEW.zoom,
      padding: NO_PADDING,
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

  // bounds of the minimap, they leave out the padding of the map covered by the step
  // cards on the left, except while exploring since the report content is hidden
  const updateBounds = () => {
    const map = mapRef.current;
    if (!map) return;
    setBounds(
      getBoundsGeoJSON(
        mapRef,
        exploreStateRef.current === "exploring" ? undefined : map.getPadding(),
      ),
    );
  };

  // the report content is hidden or shown again without the map moving
  useEffect(() => {
    if (!isMapLoaded) return;
    updateBounds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exploreState, isMapLoaded]);

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
    storyPeriodRef.current = { activeYear, isCumulative };
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

    // go back to the period of the story, if it was changed with the legend
    const storyPeriod = storyPeriodRef.current;
    if (storyPeriod) {
      if (storyPeriod.activeYear !== activeYear) {
        dispatch({
          type: "SET_ACTIVE_YEAR",
          activeYear: storyPeriod.activeYear,
        });
      }
      if (storyPeriod.isCumulative !== isCumulative) {
        dispatch({
          type: "SET_IS_CUMULATIVE",
          isCumulative: storyPeriod.isCumulative,
        });
      }
      storyPeriodRef.current = undefined;
    }

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
            updateBounds();
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

          {/* the period can be changed while exploring, it goes back to the
              period of the story when exiting */}
          <div className={style.legend}>
            <Legend
              years={LAYER_YEARS}
              activeYear={activeYear}
              setActiveYear={(value) =>
                dispatch({ type: "SET_ACTIVE_YEAR", activeYear: value })
              }
              dictionary={dictionary}
              isCumulative={isCumulative}
              setIsCumulative={(value) =>
                dispatch({ type: "SET_IS_CUMULATIVE", isCumulative: value })
              }
            />
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
