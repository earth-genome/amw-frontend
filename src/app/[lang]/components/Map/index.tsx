"use client";
import "./style.css";
import React, { useState, useRef, useCallback, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { message, Radio, Select, ConfigProvider } from "antd";
import Map, { Layer, Source, Popup, NavigationControl } from "react-map-gl";
import type { MapRef } from "react-map-gl";
import Area from "../Area";
import Footer from "../Footer";
import { convertBoundsToGeoJSON, GeoJSONType } from "./helpers";
import { CopyOutlined } from "@ant-design/icons";
import LegendWrapper from "./LegendWrapper";
const { Option } = Select;
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

interface MainMapProps {
  dictionary: { [key: string]: any };
}

const LAYER_YEARS = [2024, 2023, 2022, 2021, 2020, 2019, 2018];
const INITIAL_VIEW = {
  longitude: -67.78320182377449,
  latitude: -5.871455584726869,
  zoom: 3.7,
};
export const MAP_COLOR_SCALE = [
  "#F7E4BC",
  "#F5CD7E",
  "#F1B53F",
  "#ED9E00",
  "#F37D00",
  "#F95D00",
  "#FF3C00",
];

const MainMap: React.FC<MainMapProps> = ({ dictionary }) => {
  const [popupInfo, setPopupInfo] = useState<{
    latitude: number;
    longitude: number;
    zoom: number;
  } | null>(null);
  const [popupVisible, setPopupVisible] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [areaVisible, setAreaVisible] = useState(true);
  const mapRef = useRef<MapRef>(null);
  const [bounds, setBounds] = useState<GeoJSONType | undefined>(undefined);
  const [yearly, setYearly] = useState(true);
  const [activeLayer, setActiveLayer] = useState("2024");
  /*  
  mapbox://styles/earthrise/ckxht1jfm2h9k15m7wrv5wz5w
  */
  const [mapStyle, setMapStyle] = useState(
    "mapbox://styles/earthrise/clvwchqxi06gh01pe1huv70id"
  );

  const setMapPositonFromURL = useCallback(() => {
    if (window.location.hash) {
      const split = window.location.hash.split("/");
      const lng = split[1];
      const lat = split[2];
      const zoomRaw = split[0];
      const zoom = zoomRaw.split("#")[1];
      if (!mapRef.current) return;
      mapRef.current.jumpTo({
        center: lng && lat ? [Number(lng), Number(lat)] : undefined,
        zoom: zoom ? Number(zoom) : undefined,
      });
    }
  }, [mapRef]);

  const updateURLHash = useCallback(() => {
    if (!mapRef.current) return;
    const zoom = mapRef.current.getZoom();
    const center = mapRef.current.getCenter();
    const lng = center?.lng;
    const lat = center?.lat;
    if (!zoom || !lng || !lat) return;
    router.replace(
      `${pathname}/#${zoom.toFixed(2)}/${lng.toFixed(2)}/${lat.toFixed(2)}`,
      undefined
    );
  }, [pathname, router]);

  const copyToClipboard = async (text: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const getOpacity = (layerId: string) => {
    if (layerId === `mines-layer-${activeLayer}`) {
      return 1;
    }
    return 0;
  };

  const getSatelliteOpacity = (layerId: string) => {
    if (yearly && layerId === `sentinel-layer-${activeLayer}`) {
      return 1;
    }
    return 0;
  };

  return (
    <div className="main-map">
      <Map
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        ref={mapRef}
        initialViewState={INITIAL_VIEW}
        minZoom={3.5}
        // FIXME: the projection was not working with fitBounds
        // projection={{
        //   name: "naturalEarth",
        //   center: [183, 40],
        //   parallels: [30, 30],
        // }}
        style={{
          top: "var(--top-navbar-height)",
          bottom: 0,
          width: "100hw",
        }}
        mapStyle={mapStyle}
        onMove={(e) => {
          if (!mapRef.current) return;
          if (mapRef.current.getZoom() > 4) {
            setAreaVisible(false);
          } else {
            setAreaVisible(true);
          }

          const currentBounds = convertBoundsToGeoJSON(
            mapRef.current.getBounds()
          );
          setBounds(currentBounds);
        }}
        onMoveEnd={() => {
          updateURLHash();
        }}
        onZoomEnd={() => {
          updateURLHash();
        }}
        onLoad={() => {
          setMapPositonFromURL();

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
            // mapRef.current.flyTo({
            //   center: e.result.center,
            //   duration: 1000,
            // });
            const bbox = e.result.bbox;
            const map = mapRef.current.getMap();
            map.fitBounds(bbox, {
              padding: { top: 20, bottom: 20, left: 20, right: 20 },
              duration: 2000,
            });
          });
        }}
        onClick={(e) => {
          const { lngLat } = e;
          const map = e.target;
          const features = map.queryRenderedFeatures(e.point);
          const clickedOnExcludedLayer = features.some(
            (feature) => feature.layer.id === "hole-layer"
          );
          if (!clickedOnExcludedLayer) {
            popupVisible ? setPopupVisible(false) : setPopupVisible(true);
            setPopupInfo({
              latitude: lngLat.lat,
              longitude: lngLat.lng,
              zoom: map?.getZoom(),
            });
          }
        }}
      >
        <NavigationControl position={"top-right"} />

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
          url="mapbox://dmccarey.3pur462h"
        />
        <Layer
          id={"hole-layer"}
          source={"hole-source"}
          source-layer={"amazon-hole-0asofs"}
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

        {/* ================== MINE SOURCES =================== */}
        <Source
          id={"mines-2024"}
          type="geojson"
          tolerance={0.05}
          data={`${process.env.NEXT_PUBLIC_MINES_URL}/amazon_basin_48px_v3.2-3.7ensemble_dissolved-0.6_2018-2024cumulative.geojson`}
        />
        <Source
          id={"mines-2023"}
          type="geojson"
          tolerance={0.05}
          data={`${process.env.NEXT_PUBLIC_MINES_URL}/amazon_basin_48px_v3.2-3.7ensemble_dissolved-0.6_2018-2023cumulative.geojson`}
        />
        <Source
          id={"mines-2022"}
          type="geojson"
          tolerance={0.05}
          data={`${process.env.NEXT_PUBLIC_MINES_URL}/amazon_basin_48px_v3.2-3.7ensemble_dissolved-0.6_2018-2022cumulative.geojson`}
        />
        <Source
          id={"mines-2021"}
          type="geojson"
          tolerance={0.05}
          data={`${process.env.NEXT_PUBLIC_MINES_URL}/amazon_basin_48px_v3.2-3.7ensemble_dissolved-0.6_2018-2021cumulative.geojson`}
        />
        <Source
          id={"mines-2020"}
          type="geojson"
          tolerance={0.05}
          data={`${process.env.NEXT_PUBLIC_MINES_URL}/amazon_basin_48px_v3.2-3.7ensemble_dissolved-0.6_2018-2020cumulative.geojson`}
        />
        <Source
          id={"mines-2019"}
          type="geojson"
          tolerance={0.05}
          data={`${process.env.NEXT_PUBLIC_MINES_URL}/amazon_basin_48px_v3.2-3.7ensemble_dissolved-0.6_2018-2019cumulative.geojson`}
        />
        <Source
          id={"mines-2018"}
          type="geojson"
          tolerance={0.05}
          data={`${process.env.NEXT_PUBLIC_MINES_URL}/amazon_basin_48px_v3.2-3.7ensemble_dissolved-0.6_2018-2018cumulative.geojson`}
        />

        {/* ================== MINE LAYERS =================== */}
        <Layer
          id={"mines-layer-2024"}
          source={"mines-2024"}
          type="line"
          paint={{
            "line-color": "#ffb301",
            "line-opacity": getOpacity(`mines-layer-2024`),
            "line-width": 1,
          }}
        />
        <Layer
          id={"mines-layer-2023"}
          source={"mines-2023"}
          type="line"
          paint={{
            "line-color": "#ffb301",
            "line-opacity": getOpacity(`mines-layer-2023`),
            "line-width": 1,
          }}
        />
        <Layer
          id={"mines-layer-2022"}
          source={"mines-2022"}
          type="line"
          paint={{
            "line-color": "#ffb301",
            "line-opacity": getOpacity(`mines-layer-2022`),
            "line-width": 1,
          }}
        />
        <Layer
          id={"mines-layer-2021"}
          source={"mines-2021"}
          type="line"
          paint={{
            "line-color": "#ffb301",
            "line-opacity": getOpacity(`mines-layer-2021`),
            "line-width": 1,
          }}
        />
        <Layer
          id={"mines-layer-2020"}
          source={"mines-2020"}
          type="line"
          paint={{
            "line-color": "#ffb301",
            "line-opacity": getOpacity(`mines-layer-2020`),
            "line-width": 1,
          }}
        />
        <Layer
          id={"mines-layer-2019"}
          source={"mines-2019"}
          type="line"
          paint={{
            "line-color": "#ffb301",
            "line-opacity": getOpacity(`mines-layer-2019`),
            "line-width": 1,
          }}
        />
        <Layer
          id={"mines-layer-2018"}
          source={"mines-2018"}
          type="line"
          paint={{
            "line-color": "#ffb301",
            "line-opacity": getOpacity(`mines-layer-2018`),
            "line-width": 1,
          }}
        />

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

        {/* ================== POPUP =================== */}
        {popupVisible && popupInfo && (
          <Popup
            longitude={popupInfo?.longitude}
            latitude={popupInfo?.latitude}
            closeButton={false}
            closeOnClick={false}
            onClose={() => setPopupInfo(null)}
          >
            <table>
              <tbody>
                <tr>
                  <td className="number-value">
                    {popupInfo.longitude.toFixed(3)}
                  </td>
                  <td className="number-value">
                    {popupInfo?.latitude.toFixed(3)}
                  </td>
                </tr>
                <tr>
                  <td>Longitude</td>
                  <td>Latitude</td>
                </tr>
              </tbody>
            </table>

            <a
              className="copy-url"
              onClick={async (e) => {
                e.preventDefault();
                copyToClipboard(
                  `${process.env.NEXT_PUBLIC_DOMAIN}/#${popupInfo.zoom.toFixed(
                    2
                  )}/${popupInfo.longitude.toFixed(
                    3
                  )}/${popupInfo?.latitude.toFixed(3)}`
                ).then(() => {
                  message.success("URL copied");
                });
              }}
              href="#copy"
            >
              <CopyOutlined style={{ fontSize: "16px" }} /> Copy URL
            </a>
          </Popup>
        )}

        <div className="map-scale-control"></div>
      </Map>

      <div className="year-pills">
        <Radio.Group
          options={LAYER_YEARS.sort((a, b) => a - b).map((d) => ({
            value: String(d),
            label: String(d),
          }))}
          value={activeLayer}
          onChange={({ target: { value } }) => {
            setActiveLayer(value);
          }}
          optionType="button"
          buttonStyle="solid"
        />
      </div>

      <div className="year-dropdown">
        <ConfigProvider
          theme={{
            components: {
              Select: {
                selectorBg: "rgb(11, 95, 58)",
                optionSelectedColor: "rgba(242, 236, 236, 0.88)",
                colorIconHover: "rgba(250, 246, 246, 0.88)",
                colorBgContainer: "rgb(11, 95, 58)",
                colorBgElevated: "rgb(11, 95, 58)",
                colorPrimary: "rgb(242, 237, 237)",
                colorIcon: "rgb(255,255,255)",
                colorBorder: "rgb(6, 89, 36)",
                optionSelectedBg: "rgb(76, 97, 77)",
                colorText: "rgba(250, 249, 249, 0.88)",
                colorFillTertiary: "rgba(242, 234, 234, 0.04)",
                colorFillSecondary: "rgba(241, 228, 228, 0.06)",
                colorTextQuaternary: "rgba(249, 249, 249, 0.25)",
                colorTextTertiary: "rgba(244, 236, 236, 0.9)",
                colorTextDescription: "rgba(255, 253, 253, 0.45)",
                colorTextDisabled: "rgba(239, 233, 233, 0.25)",
                colorTextPlaceholder: "rgba(255, 255, 255, 0.9)",
              },
            },
          }}
        >
          <Select
            style={{ width: "100px" }}
            value={activeLayer}
            onChange={(value) => {
              setActiveLayer(value);
            }}
          >
            {LAYER_YEARS.map((d) => (
              <Option key={d} value={d}>
                {d}
              </Option>
            ))}
          </Select>
        </ConfigProvider>
      </div>

      <div className="imagery-pills">
        <Radio.Group
          size="small"
          options={[
            {
              label: dictionary?.map_ui.latest,
              value: true,
            },
            {
              label: dictionary?.map_ui.hi_res,
              value: false,
            },
          ]}
          value={yearly}
          onChange={({ target: { value } }) => {
            setYearly(value);
            if (value === false) {
              setMapStyle(
                `mapbox://styles/earthrise/ckxht1jfm2h9k15m7wrv5wz5w`
              );
            } else {
              setMapStyle(
                "mapbox://styles/earthrise/clvwchqxi06gh01pe1huv70id"
              );
            }
          }}
          optionType="button"
          buttonStyle="solid"
        />
      </div>

      <LegendWrapper
        showMinimap={(mapRef.current && mapRef.current.getZoom() > 5) ?? false}
        bounds={bounds}
        years={LAYER_YEARS}
        activeLayer={activeLayer}
        setActiveLayer={setActiveLayer}
        dictionary={dictionary}
      />

      {areaVisible && <Area dictionary={dictionary} year={activeLayer} />}
      <Footer
        year={activeLayer}
        zoom={(mapRef.current && mapRef.current.getZoom()) || 4}
        dictionary={dictionary}
      />
    </div>
  );
};

export default MainMap;
