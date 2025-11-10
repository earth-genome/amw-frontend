import { Context } from "@/lib/Store";
import { useContext } from "react";
import { Popup } from "react-map-gl";
import "./style.css";
import { PERMITTED_AREA_TYPES_KEYS } from "@/constants/map";

export interface TooltipInfo {
  longitude: number;
  latitude: number;
  properties: {
    [key: string]: any;
  };
}

interface MapPopupProps {
  tooltip: TooltipInfo;
  dictionary: { [key: string]: any };
}

const MapPopup = ({ tooltip, dictionary }: MapPopupProps) => {
  const [state] = useContext(Context)!;

  const { properties, longitude, latitude } = tooltip;

  // HACK: because hotspots need to show title independent
  // of what kind of area is displaying
  const title =
    (properties?.type as PERMITTED_AREA_TYPES_KEYS) === "hotspots"
      ? `${properties.title} ${dictionary?.map_ui?.hotspot ? `- ${dictionary?.map_ui?.hotspot}` : ""}`
      : state.selectedAreaType?.renderTitle(properties);
  const status = state.selectedAreaType?.renderStatus(properties);
  const country = properties?.country;
  return (
    <Popup
      longitude={longitude}
      latitude={latitude}
      closeButton={false}
      closeOnClick={false}
      anchor="bottom"
      offset={[0, -10] as [number, number]}
      className="map-tooltip"
    >
      {title && (
        <div
          style={{
            fontWeight: 700,
            fontSize: "16px",
          }}
        >
          {title}
        </div>
      )}
      {status && <div>{status}</div>}
      {state.selectedAreaType?.showCountry && <div>{country}</div>}
    </Popup>
  );
};

export default MapPopup;
