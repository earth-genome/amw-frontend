"use client";
import "./style.css";
import React, {
  useState,
  useRef,
  useCallback,
  useContext,
  useEffect,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import Map, {
  Layer,
  Source,
  NavigationControl,
  ScaleControl,
} from "react-map-gl";
import type { MapMouseEvent, MapRef } from "react-map-gl";
import AreaSummary from "../AreaSummary";
import Footer from "../Footer";
import { convertBoundsToGeoJSON, GeoJSONType } from "./helpers";
import LegendWrapper from "./LegendWrapper";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import * as turf from "@turf/turf";
import {
  createYearsColorScale,
  MAP_LATEST_YEAR_COLOR,
  MAP_MISSING_DATA_COLOR,
  PERMITTED_AREA_TYPES_KEYS,
} from "@/constants/map";
import { Expression } from "mapbox-gl";
import AreaSelect from "@/app/[lang]/components/AreaSelect";
import { Context } from "@/lib/Store";
import GeocoderIcon from "@/app/[lang]/components/Icons/GeocoderIcon";
import { PERMITTED_LANGUAGES } from "@/utils/content";
import MapPopup, { TooltipInfo } from "@/app/[lang]/components/Map/MapPopup";
import Hotspots from "@/app/[lang]/components/Map/Hotspots";
import calculateMiningAreaInBbox from "@/utils/calculateMiningAreaInBbox";
import useWindowSize from "@/hooks/useWindowSize";

interface MainMapProps {
  dictionary: { [key: string]: any };
  lang: PERMITTED_LANGUAGES;
}

const LAYER_YEARS = [2024, 2023, 2022, 2021, 2020, 2019, 2018];
const INITIAL_VIEW = {
  longitude: -67.78320182377449,
  latitude: -5.871455584726869,
  zoom: 3.7,
};
const SATELLITE_LAYERS = {
  yearly: "mapbox://styles/earthrise/clvwchqxi06gh01pe1huv70id",
  hiRes: "mapbox://styles/earthrise/cmdxgrceq014x01s22jfm5muv", // Mapbox satellite
};

const MainMap: React.FC<MainMapProps> = ({ dictionary, lang }) => {
  const [state, dispatch] = useContext(Context)!;
  const pathname = usePathname();
  const router = useRouter();
  const mapRef = useRef<MapRef>(null);
  const [bounds, setBounds] = useState<GeoJSONType | undefined>(undefined);
  const [yearly, setYearly] = useState(true);
  const [activeLayer, setActiveLayer] = useState("2024");
  const [mapStyle, setMapStyle] = useState(SATELLITE_LAYERS["yearly"]);
  const [isGeocoderHidden, setIsGeocoderHidden] = useState(true);
  const [tooltip, setTooltip] = useState<TooltipInfo | null>(null);
  const hoveredFeatureRef = useRef<string | number | undefined>(undefined);

  const {
    miningData,
    areasData,
    selectedAreaData,
    selectedArea,
    selectedAreaTypeKey,
    areaUnits,
  } = state;

  const setMapPositionFromURL = useCallback(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const zoom = searchParams.get("zoom");
    const lng = searchParams.get("lng");
    const lat = searchParams.get("lat");

    if (mapRef.current && zoom && lng && lat) {
      mapRef.current.jumpTo({
        center: lng && lat ? [Number(lng), Number(lat)] : undefined,
        zoom: zoom ? Number(zoom) : undefined,
      });
    }
  }, []);

  const updateURLParamsMapPosition = useCallback(() => {
    if (!mapRef.current) return;

    const zoom = mapRef.current.getZoom();
    const center = mapRef.current.getCenter();
    const lng = center?.lng;
    const lat = center?.lat;

    if (!zoom || !lng || !lat) return;

    const params = new URLSearchParams(window.location.search);
    params.set("zoom", zoom.toFixed(2));
    params.set("lng", lng.toFixed(2));
    params.set("lat", lat.toFixed(2));

    router.replace(`${pathname}?${params.toString()}`);
  }, [pathname, router]);

  const getCurrentBounds = useCallback(() => {
    if (!mapRef.current) return;
    const currentBounds = mapRef.current.getBounds();
    if (!currentBounds) return;

    const bbox = [
      currentBounds.getWest(),
      currentBounds.getSouth(),
      currentBounds.getEast(),
      currentBounds.getNorth(),
    ] as [number, number, number, number];
    return bbox;
  }, []);

  const getSatelliteOpacity = (layerId: string) => {
    if (yearly && layerId === `sentinel-layer-${activeLayer}`) {
      return 1;
    }
    return 0;
  };

  const getMineLayerColor = () => {
    const getColorsForYears = (years: number[]) => {
      const colorScale = createYearsColorScale(years);
      return years.map((_, index) =>
        index === years.length - 1 ? MAP_LATEST_YEAR_COLOR : colorScale(index)
      );
    };
    const colors = getColorsForYears(LAYER_YEARS);

    return [
      "case",
      ...LAYER_YEARS.flatMap((year, i) => [
        ["==", ["get", "year"], year],
        colors[i],
      ]),
      MAP_MISSING_DATA_COLOR,
    ] as Expression;
  };

  const handleMouseMove = useCallback(
    (event: MapMouseEvent) => {
      const { features } = event;
      const map = event.target;
      const feature = features && features[0];

      if (!feature?.properties) return;

      event.target.getCanvas().style.cursor = feature ? "pointer" : "";
      setTooltip({
        longitude: event.lngLat.lng,
        latitude: event.lngLat.lat,
        properties: feature.properties as [key: string],
      });

      // don't use hover effect for countries, it is too distracting
      if (selectedAreaTypeKey === "countries") return;

      // remove hover state from previous feature
      if (hoveredFeatureRef.current) {
        map.setFeatureState(
          {
            source: "areas",
            id: hoveredFeatureRef.current,
          },
          { hover: false }
        );
      }

      // set hover state on current feature
      if (feature.id) {
        hoveredFeatureRef.current = feature.id;
        map.setFeatureState(
          {
            source: "areas",
            id: feature.id,
          },
          { hover: true }
        );
      }
    },
    [selectedAreaTypeKey]
  );

  const handleMouseLeave = useCallback((event: MapMouseEvent) => {
    setTooltip(null);
    if (!hoveredFeatureRef.current) return;

    const map = event.target;
    map.setFeatureState(
      {
        source: "areas",
        id: hoveredFeatureRef.current,
      },
      { hover: false }
    );
  }, []);

  const handleClick = useCallback(
    (event: MapMouseEvent) => {
      const map = event.target;
      const features = map.queryRenderedFeatures(event.point);

      const clickedOnExcludedLayer = features.some(
        (feature) => feature?.layer?.id === "hole-layer"
      );
      if (clickedOnExcludedLayer) return;

      const feature = features[0];
      const id = feature?.properties?.id;
      const type = feature?.properties?.type as PERMITTED_AREA_TYPES_KEYS;

      if (!id) return;

      if (type === "hotspots") {
        dispatch({
          type: "SET_SELECTED_AREA_TYPE_BY_KEY",
          selectedAreaTypeKey: "hotspots",
        });
        // because this will trigger a change in area type, we need to wait
        // for the data to load, so we set it as pending
        dispatch({
          type: "SET_PENDING_SELECTED_AREA_ID",
          pendingSelectedAreaId: id,
        });
        return;
      }

      dispatch({ type: "SET_SELECTED_AREA_BY_ID", selectedAreaId: id });
    },
    [dispatch]
  );

  const windowSize = useWindowSize();
  const isMobile = windowSize?.width && windowSize.width <= 600;

  useEffect(() => {
    // zoom to selected area on change
    if (!selectedAreaData || !mapRef.current) return;

    const bbox = turf.bbox(selectedAreaData) as [
      number,
      number,
      number,
      number
    ];

    mapRef.current.fitBounds(bbox, {
      padding: { top: 70, bottom: isMobile ? 300 : 70, left: 20, right: 20 },
      duration: 2000,
      essential: true,
    });
  }, [isMobile, selectedAreaData]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // check if Shift is pressed and the key is 'C' or 'c'
      if (e.shiftKey && (e.key === "C" || e.key === "c")) {
        e.preventDefault();

        if (!mapRef.current) return;

        const bounds = mapRef.current.getBounds();
        if (!bounds) return;

        const currentBounds = convertBoundsToGeoJSON(bounds);
        const coordinates = currentBounds?.geometry?.coordinates;
        // copy to clipboard
        if (coordinates) {
          navigator.clipboard
            .writeText(JSON.stringify(coordinates, null, 2))
            .then(() => {
              alert("Coordinates copied to clipboard!");
            });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const getBeforeId = (targetLayerId: string) =>
    // make sure the layer exists to avoid errors
    mapRef.current?.getLayer(targetLayerId) ? targetLayerId : undefined;

  return (
    <div className="main-map">
      <Map
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        ref={mapRef}
        initialViewState={INITIAL_VIEW}
        minZoom={3.5}
        projection={{
          name: "naturalEarth",
          center: [183, 40],
          parallels: [30, 30],
        }}
        style={{
          top: "var(--top-navbar-height)",
          bottom: 0,
          width: "100hw",
        }}
        mapStyle={mapStyle}
        onIdle={() => {
          if (!mapRef.current) return;
          if (mapRef.current.getZoom() <= 11) return; // don't run if too zoomed out

          let bbox = getCurrentBounds();
          if (!bbox) return;
          // FIXME: we're not using the mining areas yet
          const miningArea = calculateMiningAreaInBbox(
            bbox,
            activeLayer,
            miningData
          );
          console.log("using viewport, mining area in ha", miningArea);
        }}
        onMoveEnd={() => {
          updateURLParamsMapPosition();

          if (!mapRef.current) return;

          const bounds = mapRef.current.getBounds();
          if (!bounds) return;
          const currentBounds = convertBoundsToGeoJSON(bounds);
          setBounds(currentBounds);

          // FIXME: allow to use this for CMS
          console.log(currentBounds?.geometry?.coordinates);
        }}
        onZoomEnd={() => {
          updateURLParamsMapPosition();
        }}
        onLoad={() => {
          setMapPositionFromURL();

          // geocoder
          if (!mapRef.current) return;
          const geocoder = new MapboxGeocoder({
            accessToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string,
            /* @ts-ignore */
            mapboxgl: mapRef.current.getMap(),
            marker: false,
            placeholder: dictionary.map_ui.search_for_a_place,
            proximity: INITIAL_VIEW,
          });

          // Add the geocoder to a container
          const geocoderContainer = document.createElement("div");
          geocoderContainer.className = "geocoder-hidden";
          geocoderContainer.style.position = "absolute";
          geocoderContainer.style.top = "calc(var(--top-navbar-height) + 10px)";
          geocoderContainer.style.right = "10px";
          geocoderContainer.style.zIndex = "1000";

          const mapContainer = document.querySelector(".main-map");
          if (mapContainer) {
            mapContainer.appendChild(geocoderContainer);
            geocoderContainer.appendChild(
              geocoder.onAdd(mapRef.current.getMap())
            );
          }

          // Event listeners
          geocoder.on("result", (e) => {
            if (!mapRef.current) return;
            const bbox = e.result.bbox;
            const map = mapRef.current.getMap();
            map.fitBounds(bbox, {
              padding: { top: 20, bottom: 20, left: 20, right: 20 },
              duration: 2000,
            });
          });
        }}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        interactiveLayerIds={["areas-layer-fill", "hotspots-fill"]}
      >
        {!isMobile && <NavigationControl position={"top-right"} />}

        {/* ================== SENTINEL2 SOURCES =================== */}
        <Source
          id="sentinel-2018"
          type="raster"
          tiles={[
            `${process.env.NEXT_PUBLIC_SENTINEL2_URL_1}/2018-01-01/2019-01-01/rgb/{z}/{x}/{y}.webp`,
            `${process.env.NEXT_PUBLIC_SENTINEL2_URL_2}/2018-01-01/2019-01-01/rgb/{z}/{x}/{y}.webp`,
            `${process.env.NEXT_PUBLIC_SENTINEL2_URL_3}/2018-01-01/2019-01-01/rgb/{z}/{x}/{y}.webp`,
            `${process.env.NEXT_PUBLIC_SENTINEL2_URL_4}/2018-01-01/2019-01-01/rgb/{z}/{x}/{y}.webp`,
          ]}
          tileSize={256}
          bounds={[-80.0, -20.0, -50.0, 20.0]}
        />
        <Source
          id="sentinel-2019"
          type="raster"
          tiles={[
            `${process.env.NEXT_PUBLIC_SENTINEL2_URL_1}/2019-01-01/2020-01-01/rgb/{z}/{x}/{y}.webp`,
            `${process.env.NEXT_PUBLIC_SENTINEL2_URL_2}/2019-01-01/2020-01-01/rgb/{z}/{x}/{y}.webp`,
            `${process.env.NEXT_PUBLIC_SENTINEL2_URL_3}/2019-01-01/2020-01-01/rgb/{z}/{x}/{y}.webp`,
            `${process.env.NEXT_PUBLIC_SENTINEL2_URL_4}/2019-01-01/2020-01-01/rgb/{z}/{x}/{y}.webp`,
          ]}
          tileSize={256}
          bounds={[-80.0, -20.0, -50.0, 20.0]}
        />
        <Source
          id="sentinel-2020"
          type="raster"
          tiles={[
            `${process.env.NEXT_PUBLIC_SENTINEL2_URL_1}/2020-01-01/2021-01-01/rgb/{z}/{x}/{y}.webp`,
            `${process.env.NEXT_PUBLIC_SENTINEL2_URL_2}/2020-01-01/2021-01-01/rgb/{z}/{x}/{y}.webp`,
            `${process.env.NEXT_PUBLIC_SENTINEL2_URL_3}/2020-01-01/2021-01-01/rgb/{z}/{x}/{y}.webp`,
            `${process.env.NEXT_PUBLIC_SENTINEL2_URL_4}/2020-01-01/2021-01-01/rgb/{z}/{x}/{y}.webp`,
          ]}
          tileSize={256}
          bounds={[-80.0, -20.0, -50.0, 20.0]}
        />
        <Source
          id="sentinel-2021"
          type="raster"
          tiles={[
            `${process.env.NEXT_PUBLIC_SENTINEL2_URL_1}/2021-01-01/2022-01-01/rgb/{z}/{x}/{y}.webp`,
            `${process.env.NEXT_PUBLIC_SENTINEL2_URL_2}/2021-01-01/2022-01-01/rgb/{z}/{x}/{y}.webp`,
            `${process.env.NEXT_PUBLIC_SENTINEL2_URL_3}/2021-01-01/2022-01-01/rgb/{z}/{x}/{y}.webp`,
            `${process.env.NEXT_PUBLIC_SENTINEL2_URL_4}/2021-01-01/2022-01-01/rgb/{z}/{x}/{y}.webp`,
          ]}
          tileSize={256}
          bounds={[-80.0, -20.0, -50.0, 20.0]}
        />
        <Source
          id="sentinel-2022"
          type="raster"
          tiles={[
            `${process.env.NEXT_PUBLIC_SENTINEL2_URL_1}/2022-01-01/2023-01-01/rgb/{z}/{x}/{y}.webp`,
            `${process.env.NEXT_PUBLIC_SENTINEL2_URL_2}/2022-01-01/2023-01-01/rgb/{z}/{x}/{y}.webp`,
            `${process.env.NEXT_PUBLIC_SENTINEL2_URL_3}/2022-01-01/2023-01-01/rgb/{z}/{x}/{y}.webp`,
            `${process.env.NEXT_PUBLIC_SENTINEL2_URL_4}/2022-01-01/2023-01-01/rgb/{z}/{x}/{y}.webp`,
          ]}
          tileSize={256}
          bounds={[-80.0, -20.0, -50.0, 20.0]}
        />
        <Source
          id="sentinel-2023"
          type="raster"
          tiles={[
            `${process.env.NEXT_PUBLIC_SENTINEL2_V2_URL_1}/2023-01-01/2024-01-01/rgb/{z}/{x}/{y}.webp`,
            `${process.env.NEXT_PUBLIC_SENTINEL2_V2_URL_2}/2023-01-01/2024-01-01/rgb/{z}/{x}/{y}.webp`,
            `${process.env.NEXT_PUBLIC_SENTINEL2_V2_URL_3}/2023-01-01/2024-01-01/rgb/{z}/{x}/{y}.webp`,
            `${process.env.NEXT_PUBLIC_SENTINEL2_V2_URL_4}/2023-01-01/2024-01-01/rgb/{z}/{x}/{y}.webp`,
          ]}
          tileSize={256}
        />
        <Source
          id="sentinel-2024"
          type="raster"
          tiles={[
            `${process.env.NEXT_PUBLIC_SENTINEL2_V2_URL_4}/2024-01-01/2025-01-01/rgb/{z}/{x}/{y}.webp`,
            `${process.env.NEXT_PUBLIC_SENTINEL2_V2_URL_4}/2024-01-01/2025-01-01/rgb/{z}/{x}/{y}.webp`,
            `${process.env.NEXT_PUBLIC_SENTINEL2_V2_URL_4}/2024-01-01/2025-01-01/rgb/{z}/{x}/{y}.webp`,
            `${process.env.NEXT_PUBLIC_SENTINEL2_V2_URL_4}/2024-01-01/2025-01-01/rgb/{z}/{x}/{y}.webp`,
          ]}
          tileSize={256}
          bounds={[-80.0, -20.0, -50.0, 20.0]}
        />
        {/* ================== SENTINEL2 LAYERS =================== */}
        <Layer
          id="sentinel-layer-2018"
          type="raster"
          source={`sentinel-2018`}
          paint={{
            "raster-opacity": getSatelliteOpacity(`sentinel-layer-2018`),
          }}
        />
        <Layer
          id="sentinel-layer-2019"
          type="raster"
          source={`sentinel-2019`}
          paint={{
            "raster-opacity": getSatelliteOpacity(`sentinel-layer-2019`),
          }}
        />
        <Layer
          id="sentinel-layer-2020"
          type="raster"
          source={`sentinel-2020`}
          paint={{
            "raster-opacity": getSatelliteOpacity(`sentinel-layer-2020`),
          }}
        />
        <Layer
          id="sentinel-layer-2021"
          type="raster"
          source={`sentinel-2021`}
          paint={{
            "raster-opacity": getSatelliteOpacity(`sentinel-layer-2021`),
          }}
        />
        <Layer
          id="sentinel-layer-2022"
          type="raster"
          source={`sentinel-2022`}
          paint={{
            "raster-opacity": getSatelliteOpacity(`sentinel-layer-2022`),
          }}
        />
        <Layer
          id="sentinel-layer-2023"
          type="raster"
          source={`sentinel-2023`}
          paint={{
            "raster-opacity": getSatelliteOpacity(`sentinel-layer-2023`),
          }}
        />
        <Layer
          id="sentinel-layer-2024"
          type="raster"
          source={`sentinel-2024`}
          paint={{
            "raster-opacity": getSatelliteOpacity(`sentinel-layer-2024`),
          }}
        />
        {/* ================== MASK =================== */}
        <Source
          id={"hole-source"}
          type="vector"
          url="mapbox://earthrise.cw29jm21"
        />
        <Layer
          id={"hole-layer"}
          source={"hole-source"}
          source-layer={"amazon_aca_mask-6i3usc"}
          type="fill"
          paint={{
            "fill-color": yearly ? "#dddddd" : "#ffffff",
            "fill-opacity": yearly ? 1 : 0.6,
          }}
        />
        {/* ================== BORDERS =================== */}
        <Source
          id="boundaries"
          type="vector"
          url="mapbox://mapbox.country-boundaries-v1"
        />
        <Layer
          id="boundary-layer"
          source="boundaries"
          type="line"
          source-layer="country_boundaries"
          paint={{
            "line-color": "#777",
            "line-width": 0.5,
          }}
        />

        {/* ================== AREA SOURCES =================== */}
        {areasData && (
          <Source
            id={"areas"}
            type="geojson"
            tolerance={0.05}
            data={areasData}
            promoteId={"id"} // we need this for the hover effect to work
          />
        )}
        {selectedAreaData && (
          <Source
            id={"selected-area"}
            type="geojson"
            tolerance={0.05}
            data={selectedAreaData}
          />
        )}

        {/* ================== AREA LAYER =================== */}
        {areasData && (
          <>
            <Layer
              id={"areas-layer"}
              beforeId={getBeforeId("mines-layer")}
              source={"areas"}
              type="line"
              paint={{
                "line-color": "#ccc",
                "line-opacity": 1,
                "line-width": [
                  "interpolate",
                  ["exponential", 2],
                  ["zoom"],
                  0,
                  1,
                  10,
                  1,
                  14,
                  2.5,
                ],
              }}
            />
            <Layer
              id={"areas-layer-fill"}
              beforeId={getBeforeId("areas-layer")}
              source={"areas"}
              type="fill"
              paint={{
                "fill-color": "#22B573",
                "fill-opacity": [
                  "case",
                  ["boolean", ["feature-state", "hover"], false],
                  0.2, // hovered
                  0, // not hovered
                ],
                "fill-outline-color": "#fff",
              }}
            />
          </>
        )}
        {selectedAreaData && selectedArea && (
          <>
            <Layer
              id={"selected-area-layer-fill"}
              beforeId={getBeforeId("areas-layer")}
              source={"selected-area"}
              type="fill"
              paint={{
                "fill-color": "#22B573",
                "fill-opacity": 0.1,
                "fill-outline-color": "#22B573",
              }}
            />
            <Layer
              id={"selected-area-layer"}
              beforeId={getBeforeId("selected-area-layer-fill")}
              source={"selected-area"}
              type="line"
              paint={{
                "line-color": "#22B573",
                "line-opacity": 1,
                "line-width": 3,
              }}
            />
          </>
        )}

        {/* ================== MINE SOURCES =================== */}
        {miningData && (
          <Source
            id={"mines"}
            type="geojson"
            tolerance={0.05}
            data={miningData}
          />
        )}
        {/* ================== MINE LAYER =================== */}
        {miningData && (
          <Layer
            id={"mines-layer"}
            beforeId={getBeforeId("hotspots-fill")}
            source={"mines"}
            type="line"
            filter={["<=", ["get", "year"], Number(activeLayer)]}
            paint={{
              "line-color": getMineLayerColor(),
              "line-opacity": 1,
              "line-width": [
                "interpolate",
                ["exponential", 2],
                ["zoom"],
                0,
                1,
                10,
                1,
                14,
                2.5,
              ],
            }}
          />
        )}
        {/* ================== LABELS =================== */}
        <Layer
          id="country-labels"
          type="symbol"
          source="amazon-cover-water"
          source-layer="place_label"
          filter={[
            "all",
            [
              "<=",
              ["string", ["get", "class"]],
              "settlement, settlement_subdivision",
            ],
          ]}
          minzoom={6}
          layout={{
            "text-field": ["coalesce", ["get", "name_en"], ["get", "name"]],
          }}
          paint={{
            "text-color": "#ffffff",
          }}
        />

        {/* wait for mines to load so that hotspots are layered on top of mines */}
        {miningData && <Hotspots lang={lang} />}

        {/* ================== POPUP =================== */}
        {tooltip && !isMobile && <MapPopup tooltip={tooltip} />}

        {!isMobile && (
          <ScaleControl
            unit={areaUnits === "imperial" ? "imperial" : "metric"}
          />
        )}
      </Map>

      <AreaSelect dictionary={dictionary} />

      {isGeocoderHidden && !isMobile && (
        <div className="geocoder-toggle">
          <button
            onClick={() => {
              const element = document.querySelector(".geocoder-hidden");
              if (!element) return;
              element.classList.remove("geocoder-hidden");
              setIsGeocoderHidden(false);
            }}
          >
            <GeocoderIcon />
          </button>
        </div>
      )}

      <LegendWrapper
        showMinimap={true}
        showMinimapBounds={
          (mapRef.current && mapRef.current.getZoom() > 5) ?? false
        }
        bounds={bounds}
        years={LAYER_YEARS}
        activeLayer={activeLayer}
        setActiveLayer={setActiveLayer}
        dictionary={dictionary}
      />

      {selectedArea && (
        <AreaSummary
          dictionary={dictionary}
          year={activeLayer}
          lang={lang}
          activeLayer={activeLayer}
        />
      )}

      <Footer dictionary={dictionary} />
    </div>
  );
};

export default MainMap;
