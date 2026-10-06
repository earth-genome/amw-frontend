"use client";
import "./style.css";
import React, {
  useState,
  useRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { usePathname } from "next/navigation";
import Map, { NavigationControl, ScaleControl } from "react-map-gl";
import type { MapMouseEvent, MapRef } from "react-map-gl";
import AreaSummary from "@/app/[lang]/components/AreaSummary";
import Footer from "@/app/[lang]/components/Footer";
import { convertBoundsToGeoJSON, GeoJSONType } from "./helpers";
import LegendWrapper from "@/app/[lang]/components/Map/LegendWrapper";
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
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import {
  ENTIRE_AMAZON_AREA_ID,
  getColorsForYears,
  LAYER_YEARS,
} from "@/constants/map";
import { Popup } from "mapbox-gl";
import AreaSelect from "@/app/[lang]/components/AreaSelect";
import { Context } from "@/lib/Store";
import GeocoderIcon from "@/app/[lang]/components/Icons/GeocoderIcon";
// import Hotspots from "@/app/[lang]/components/Map/Hotspots";
// import calculateMiningAreaInBbox from "@/utils/calculateMiningAreaInBbox";
import useWindowSize from "@/hooks/useWindowSize";
import Link from "next/link";
import Image from "next/image";
import Logo from "@/app/[lang]/components/Nav/logo.svg";
import useGeocoderClickOutside from "@/hooks/useClickOutsideGeocoder";
import MapShareButton from "@/app/[lang]/components/MapShareButton";
import { filterForMiningCalculator } from "@/utils/miningCalculator";
import { hasMapPosition, parseMapParams } from "@/utils/mapParams";

interface MainMapProps {
  dictionary: { [key: string]: any };
}

const filterInteractiveFeatures = (features: mapboxgl.MapboxGeoJSONFeature[]) =>
  features.filter(
    (d) =>
      // ignore entire amazon layer as it covers everything
      d?.properties?.id !== ENTIRE_AMAZON_AREA_ID &&
      // ignore layers except the areas one
      d?.layer?.id === "areas-layer-fill",
  );

const MainMap: React.FC<MainMapProps> = ({ dictionary }) => {
  const [state, dispatch] = useContext(Context)!;
  const pathname = usePathname();
  const mapRef = useRef<MapRef>(null);
  const [bounds, setBounds] = useState<GeoJSONType | undefined>(undefined);
  const [isGeocoderHidden, setIsGeocoderHidden] = useState(true);
  const hoveredFeatureRef = useRef<string | number | undefined>(undefined);
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const geocoderContainerRef = useRef<HTMLDivElement | null>(null);
  const [latitude, setLatitude] = useState<undefined | number>(undefined);
  const [longitude, setLongitude] = useState<undefined | number>(undefined);

  const {
    selectedAreaData,
    selectedArea,
    selectedAreaTypeKey,
    areaUnits,
    activeYear,
    isCumulative,
    isEmbed,
    selectedAreaType,
  } = state;

  const setMapPositionFromURL = useCallback(() => {
    const mapParams = parseMapParams(
      new URLSearchParams(window.location.search),
    );

    if (mapRef.current && hasMapPosition(mapParams)) {
      mapRef.current.jumpTo({
        center: [mapParams.lng, mapParams.lat],
        zoom: mapParams.zoom,
      });
    }
  }, []);

  const updateURLParamsMapPosition = useCallback(() => {
    if (!mapRef.current) return;

    const zoom = mapRef.current.getZoom();
    const center = mapRef.current.getCenter();
    const lng = center?.lng;
    const lat = center?.lat;

    setLatitude(lat);
    setLongitude(lng);

    if (!zoom || !lng || !lat) return;

    const params = new URLSearchParams(window.location.search);
    params.set("zoom", zoom.toFixed(2));
    params.set("lng", lng.toFixed(2));
    params.set("lat", lat.toFixed(2));

    window.history.replaceState({}, "", `${pathname}?${params.toString()}`);
  }, [pathname]);

  const yearsColors = useMemo(() => getColorsForYears(LAYER_YEARS), []);

  const windowSize = useWindowSize();
  const isMobile = windowSize?.width && windowSize.width <= 600;

  const reorderLayers = useReorderLayers(mapRef);

  const handleMouseMove = useCallback(
    (event: MapMouseEvent) => {
      if (isMobile || !mapRef.current || !popupRef.current || !event.features)
        return;

      const featuresFiltered = filterInteractiveFeatures(event.features);
      const feature = featuresFiltered?.[0];
      const map = event.target;

      if (!feature?.properties) {
        map.getCanvas().style.cursor = "";
        popupRef.current.remove();
        return;
      }

      map.getCanvas().style.cursor = "pointer";

      const properties = feature.properties;
      // // HACK: because hotspots need to show title independent
      // // of what kind of area is displaying
      // const title =
      //   (properties?.type as PERMITTED_AREA_TYPES_KEYS) === "hotspots"
      //     ? `${properties.title} ${dictionary?.map_ui?.hotspot ? `- ${dictionary?.map_ui?.hotspot}` : ""}`
      //     : selectedAreaType?.renderTitle(properties);
      const title = selectedAreaType?.renderTitle(properties);
      const status = selectedAreaType?.renderStatus(properties);
      const country = properties?.country;

      // update popup position and content directly, no zero renders
      popupRef.current
        .setLngLat(event.lngLat)
        .setHTML(
          `<div>
          <div class="map-tooltip-title">${title}</div>
          ${status ? `<div>${status}</div>` : ""}
          ${selectedAreaType?.showCountry ? `<div>${country}</div>` : ""}
        </div>`,
        )
        .addTo(map);

      if (selectedAreaTypeKey === "countries") return;
      if (hoveredFeatureRef.current === feature.id) return;

      if (hoveredFeatureRef.current != null) {
        map.setFeatureState(
          {
            source: "areas-vector-tiles",
            sourceLayer: selectedAreaType?.tilesLayer,
            id: hoveredFeatureRef.current,
          },
          { hover: false },
        );
      }
      if (feature.id != null) {
        hoveredFeatureRef.current = feature.id;
        map.setFeatureState(
          {
            source: "areas-vector-tiles",
            sourceLayer: selectedAreaType?.tilesLayer,
            id: feature.id,
          },
          { hover: true },
        );
      }
    },
    [isMobile, selectedAreaTypeKey, selectedAreaType],
  );

  const handleMouseLeaveMap = useCallback(() => {
    popupRef.current?.remove();
    if (hoveredFeatureRef.current == null || !mapRef.current) return;
    mapRef.current.setFeatureState(
      {
        source: "areas-vector-tiles",
        sourceLayer: selectedAreaType?.tilesLayer,
        id: hoveredFeatureRef.current,
      },
      { hover: false },
    );
    hoveredFeatureRef.current = undefined;
  }, [selectedAreaType?.tilesLayer]);

  const handleClick = useCallback(
    (event: MapMouseEvent) => {
      const map = event.target;
      const features = map.queryRenderedFeatures(event.point);
      const featuresFiltered = filterInteractiveFeatures(features);
      const feature = featuresFiltered[0];
      const id = feature?.properties?.id;

      if (!id) return;
      dispatch({ type: "SET_SELECTED_AREA_BY_ID", selectedAreaId: id });
    },
    [dispatch],
  );

  // clean up on unmount
  useEffect(() => {
    return () => {
      popupRef.current?.remove();
    };
  }, []);

  useEffect(() => {
    // zoom to selected area on change
    if (!selectedAreaData?.bbox || !mapRef.current) return;

    mapRef.current.fitBounds(selectedAreaData.bbox, {
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

  // click outside handler for geocoder
  useGeocoderClickOutside(
    isGeocoderHidden,
    geocoderContainerRef,
    setIsGeocoderHidden,
  );

  // in case we're in an iframe embed, this sends a post message to the parent window,
  // for the mining calculator
  const miningLocations = selectedAreaData?.locations;
  useEffect(() => {
    if (!isEmbed) return;
    const miningLocationsFiltered = filterForMiningCalculator(miningLocations);
    window.parent.postMessage({ locations: miningLocationsFiltered }, "*");
  }, [miningLocations, isEmbed]);

  return (
    <div className="main-map">
      <Map
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        ref={mapRef}
        initialViewState={INITIAL_VIEW}
        minZoom={MAP_MIN_ZOOM}
        projection={MAP_PROJECTION}
        style={{
          top: isEmbed ? 0 : "var(--top-navbar-height)",
          bottom: 0,
          width: "100hw",
        }}
        mapStyle={SATELLITE_LAYERS["yearly"]}
        onMoveEnd={() => {
          updateURLParamsMapPosition();

          const currentBounds = getBoundsGeoJSON(mapRef);
          if (!currentBounds) return;
          setBounds(currentBounds);
        }}
        onZoomEnd={() => {
          updateURLParamsMapPosition();
        }}
        onLoad={() => {
          setMapPositionFromURL();

          // popup
          popupRef.current = new Popup({
            closeButton: false,
            closeOnClick: false,
            className: "map-tooltip",
            offset: 10,
          });

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

          // store ref to the container
          geocoderContainerRef.current = geocoderContainer;

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
        interactiveLayerIds={[
          "areas-layer-fill",
          // NOTE: hiding hotspots on Feb 2026
          // "hotspots-dot",
          // "hotspots-outline",
          // "hotspots-circle",
          // "hotspots-fill",
        ]}
      >
        <MapLayers />

        {!isMobile && !isEmbed && (
          <ScaleControl
            unit={areaUnits === "imperial" ? "imperial" : "metric"}
          />
        )}

        {!isMobile && (
          <NavigationControl position={isEmbed ? "bottom-left" : "top-right"} />
        )}
      </Map>

      {/* @ts-ignore */}
      <div onMouseEnter={handleMouseLeaveMap}>
        {/* we need to check here otherwise mouseLeave only triggers on map canvas leave */}

        <Link
          href="/"
          className="amw-logo"
          style={{ top: isEmbed ? 15 : undefined }}
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

        {!isMobile && !isEmbed && (
          <MapShareButton
            latitude={latitude}
            longitude={longitude}
            dictionary={dictionary}
          />
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
            setActiveYear={(v) =>
              dispatch({ type: "SET_ACTIVE_YEAR", activeYear: v })
            }
            dictionary={dictionary}
            isCumulative={isCumulative}
            setIsCumulative={(v) =>
              dispatch({ type: "SET_IS_CUMULATIVE", isCumulative: v })
            }
          />
        )}

        {selectedArea && !isEmbed && (
          <AreaSummary
            dictionary={dictionary}
            maxYear={LAYER_YEARS[LAYER_YEARS.length - 1]}
            yearsColors={yearsColors}
          />
        )}

        {!isEmbed && <Footer dictionary={dictionary} />}
      </div>
    </div>
  );
};

export default MainMap;
