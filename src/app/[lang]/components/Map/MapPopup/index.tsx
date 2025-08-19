import { Context } from "@/lib/Store";
import { useContext } from "react";
import { Popup } from "react-map-gl";
import "./style.css";

export interface TooltipInfo {
  longitude: number;
  latitude: number;
  properties: {
    [key: string]: any;
  };
}

interface MapPopupProps {
  tooltip: TooltipInfo;
}

const MapPopup = ({ tooltip }: MapPopupProps) => {
  const [state] = useContext(Context)!;

  const { properties, longitude, latitude } = tooltip;

  const title = state.selectedAreaType?.renderTitle
    ? state.selectedAreaType.renderTitle(properties)
    : "N/A";
  const status = state.selectedAreaType?.renderStatus
    ? state.selectedAreaType.renderStatus(properties)
    : "N/A";
  const country = properties?.country;
  return (
    <Popup
      longitude={longitude}
      latitude={latitude}
      closeButton={false}
      closeOnClick={false}
      anchor="bottom"
      offset={[0, -10]}
      className="map-tooltip"
    >
      <div
        style={{
          fontWeight: 700,
          fontSize: "16px",
        }}
      >
        {title}
      </div>
      <div>{status}</div>
      {state.selectedAreaType?.showCountry && <div>{country}</div>}
    </Popup>
  );
};

export default MapPopup;
