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
import AreaSummary from "@/app/[lang]/components/AreaSummary";
import Footer from "@/app/[lang]/components/Footer";
import { convertBoundsToGeoJSON, GeoJSONType } from "./helpers";
import LegendWrapper from "@/app/[lang]/components/Map/LegendWrapper";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import * as turf from "@turf/turf";
import {
  ENTIRE_AMAZON_AREA_ID,
  generateSatelliteTiles,
  getColorsForYears,
  LAYER_YEARS,
  MAP_MISSING_DATA_COLOR,
  MINING_LAYERS,
} from "@/constants/map";
import { Expression } from "mapbox-gl";
import AreaSelect from "@/app/[lang]/components/AreaSelect";
import { Context } from "@/lib/Store";
import GeocoderIcon from "@/app/[lang]/components/Icons/GeocoderIcon";
import MapPopup, { TooltipInfo } from "@/app/[lang]/components/Map/MapPopup";
// import Hotspots from "@/app/[lang]/components/Map/Hotspots";
// import calculateMiningAreaInBbox from "@/utils/calculateMiningAreaInBbox";
import useWindowSize from "@/hooks/useWindowSize";
import Link from "next/link";
import Image from "next/image";
import Logo from "@/app/[lang]/components/Nav/logo.svg";

interface MainMapProps {
  dictionary: { [key: string]: any };
}

const INITIAL_VIEW = {
  longitude: -67.78320182377449,
  latitude: -5.871455584726869,
  zoom: 3.7,
};
const SATELLITE_LAYERS = {
  yearly: "mapbox://styles/earthrise/clvwchqxi06gh01pe1huv70id",
  hiRes: "mapbox://styles/earthrise/cmdxgrceq014x01s22jfm5muv", // Mapbox satellite
};
const LAYER_ORDER = [
  // bottom to top
  ...LAYER_YEARS.map((d) => `sentinel-layer-${d}`),
  "hole-layer",
  "areas-layer",
  "areas-layer-fill",
  "selected-area-layer",
  "selected-area-layer-fill",
  "mines-layer",
  // "hotspots-fill",
  // "hotspots-outline",
  // "hotspots-circle",
  // "hotspots-dot",
  // "hotspots-labels",
];

const MainMap: React.FC<MainMapProps> = ({ dictionary }) => {
  const [state, dispatch] = useContext(Context)!;
  const pathname = usePathname();
  const router = useRouter();
  const mapRef = useRef<MapRef>(null);
  const [bounds, setBounds] = useState<GeoJSONType | undefined>(undefined);
  const [activeYear, setActiveYear] = useState(
    String(Math.max(...LAYER_YEARS)),
  );
  const maxYear = Math.max(...LAYER_YEARS);
  const [isGeocoderHidden, setIsGeocoderHidden] = useState(true);
  const [tooltip, setTooltip] = useState<TooltipInfo | null>(null);
  const hoveredFeatureRef = useRef<string | number | undefined>(undefined);
  const orderedLayerSetRef = useRef<string>("");

  const {
    miningData,
    areasData,
    selectedAreaData,
    selectedArea,
    selectedAreaTypeKey,
    areaUnits,
    hoveredYear,
    isEmbed,
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

  // const getCurrentBounds = useCallback(() => {
  //   if (!mapRef.current) return;
  //   const currentBounds = mapRef.current.getBounds();
  //   if (!currentBounds) return;

  //   const bbox = [
  //     currentBounds.getWest(),
  //     currentBounds.getSouth(),
  //     currentBounds.getEast(),
  //     currentBounds.getNorth(),
  //   ] as [number, number, number, number];
  //   return bbox;
  // }, []);

  const yearsColors = getColorsForYears(LAYER_YEARS);

  const mineLayerColors = [
    "case",
    ...LAYER_YEARS.flatMap((year, i) => [
      ["==", ["get", "year"], year],
      yearsColors[i],
    ]),
    MAP_MISSING_DATA_COLOR,
  ] as Expression;

  const windowSize = useWindowSize();
  const isMobile = windowSize?.width && windowSize.width <= 600;

  const reorderLayers = useCallback(() => {
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
    for (let i = 1; i < LAYER_ORDER.length; i++) {
      try {
        map.moveLayer(LAYER_ORDER[i]);
      } catch (e) {
        console.error(e);
      }
    }

    // save layer set
    orderedLayerSetRef.current = layerSetKey;
  }, []);

  const handleMouseMove = useCallback(
    (event: MapMouseEvent) => {
      if (isMobile) return; // ignore hover effect on mobile
      const { features } = event;
      const map = event.target;
      const feature = features?.[0];

      if (!feature?.properties) return;

      event.target.getCanvas().style.cursor = feature ? "pointer" : "";
      setTooltip({
        longitude: event.lngLat.lng,
        latitude: event.lngLat.lat,
        properties: feature.properties as { [key: string]: any },
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
          { hover: false },
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
          { hover: true },
        );
      }
    },
    [isMobile, selectedAreaTypeKey],
  );

  const handleMouseLeaveMap = useCallback(() => {
    setTooltip(null);
    if (!hoveredFeatureRef.current || !mapRef.current) return;

    mapRef.current.setFeatureState(
      {
        source: "areas",
        id: hoveredFeatureRef.current,
      },
      { hover: false },
    );

    hoveredFeatureRef.current = undefined; // reset the ref after clearing hover state
  }, []);

  const handleClick = useCallback(
    (event: MapMouseEvent) => {
      const map = event.target;
      const features = map.queryRenderedFeatures(event.point);

      const clickedOnExcludedLayer = features?.some(
        (feature) => feature?.layer?.id === "hole-layer",
      );
      if (clickedOnExcludedLayer) return;

      const featuresFiltered = features.filter(
        (d) =>
          // ignore entire amazon layer as it covers everything
          d?.properties?.id !== ENTIRE_AMAZON_AREA_ID &&
          // ignore layers except the areas one
          d?.layer?.id === "areas-layer-fill",
      );
      const feature = featuresFiltered[0];
      const id = feature?.properties?.id;

      if (!id) return;
      dispatch({ type: "SET_SELECTED_AREA_BY_ID", selectedAreaId: id });
    },
    [dispatch],
  );

  useEffect(() => {
    // zoom to selected area on change
    if (!selectedAreaData || !mapRef.current) return;

    const bbox = turf.bbox(selectedAreaData) as [
      number,
      number,
      number,
      number,
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

  // in case we're in an iframe embed, this sends a post message to the parent window,
  // for the mining calculator
  const miningLocations = selectedAreaData?.properties?.locations;
  useEffect(() => {
    if (!isEmbed || !miningLocations?.length) return;
    window.parent.postMessage({ locations: miningLocations }, "*");
  }, [miningLocations, isEmbed]);

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
          top: isEmbed ? 0 : "var(--top-navbar-height)",
          bottom: 0,
          width: "100hw",
        }}
        mapStyle={SATELLITE_LAYERS["yearly"]}
        onMoveEnd={() => {
          updateURLParamsMapPosition();

          if (!mapRef.current) return;

          const bounds = mapRef.current.getBounds();
          if (!bounds) return;
          const currentBounds = convertBoundsToGeoJSON(bounds);
          setBounds(currentBounds);
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
              geocoder.onAdd(mapRef.current.getMap()),
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
        onMouseLeave={handleMouseLeaveMap}
        onIdle={reorderLayers}
        onSourceData={reorderLayers}
        interactiveLayerIds={[
          "areas-layer-fill",
          // NOTE: hiding hotspots on Feb 2026
          // "hotspots-dot",
          // "hotspots-outline",
          // "hotspots-circle",
          // "hotspots-fill",
        ]}
      >
        {!isMobile && (
          <NavigationControl position={isEmbed ? "bottom-left" : "top-right"} />
        )}

        {/* ================== SENTINEL2 SOURCES =================== */}
        {MINING_LAYERS.map(
          ({ yearQuarter, satelliteEndpoint, satelliteDates }) => (
            <Source
              key={`sentinel-${yearQuarter}`}
              id={`sentinel-${yearQuarter}`}
              type="raster"
              tiles={generateSatelliteTiles(satelliteEndpoint, satelliteDates)}
              tileSize={256}
            />
          ),
        )}

        {/* ================== SENTINEL2 LAYERS =================== */}
        {LAYER_YEARS.map((d) => (
          <Layer
            key={d}
            id={`sentinel-layer-${d}`}
            type="raster"
            source={`sentinel-${d}`}
            layout={{
              visibility: activeYear === String(d) ? "visible" : "none",
            }}
          />
        ))}

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
            "fill-color": "#dddddd",
            "fill-opacity": 1,
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
            // NOTE: hiding hotspots on Feb 2026
            // beforeId={!isEmbed ? getBeforeId("hotspots-fill") : undefined}
            source={"mines"}
            type="line"
            filter={[
              hoveredYear ? "==" : "<=",
              ["get", "year"],
              hoveredYear ? hoveredYear : Number(activeYear),
            ]}
            paint={{
              "line-color": mineLayerColors,
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

        {/* NOTE: hiding hotspots on Feb 2026 */}
        {/* wait for mines to load so that hotspots are layered on top of mines */}
        {/* {miningData && !isEmbed && <Hotspots />} */}

        {/* ================== POPUP =================== */}
        {tooltip && !isMobile && (
          <MapPopup tooltip={tooltip} dictionary={dictionary} />
        )}

        {!isMobile && !isEmbed && (
          <ScaleControl
            unit={areaUnits === "imperial" ? "imperial" : "metric"}
          />
        )}
      </Map>

      {/* @ts-ignore */}
      <div onMouseEnter={handleMouseLeaveMap}>
        {/* we need to check here otherwise mouseLeave only triggers on map canvas leave */}

        <Link
          href="/"
          className="amw-logo"
          style={{ top: isEmbed ? 10 : undefined }}
        >
          <Image src={Logo} alt="Logo" />
        </Link>

        <AreaSelect dictionary={dictionary} />

        {isGeocoderHidden && !isMobile && !isEmbed && (
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

        {!isEmbed && (
          <LegendWrapper
            showMinimap={true}
            showMinimapBounds={
              (mapRef.current && mapRef.current.getZoom() > 5) ?? false
            }
            bounds={bounds}
            years={LAYER_YEARS}
            activeYear={activeYear}
            setActiveYear={setActiveYear}
            dictionary={dictionary}
          />
        )}

        {selectedArea && !isEmbed && (
          <AreaSummary
            dictionary={dictionary}
            maxYear={maxYear}
            yearsColors={yearsColors}
          />
        )}

        {!isEmbed && <Footer dictionary={dictionary} />}
      </div>
    </div>
  );
};

export default MainMap;
