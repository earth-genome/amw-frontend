import { GeoJSONType } from "@/app/[lang]/components/Map/helpers";
import MiniMap from "../../MiniMap";
import Logos from "../Logos";
import Legend, { LegendProps } from "@/app/[lang]/components/Map/Legend";
import "./style.css";

interface LegendWrapperProps extends LegendProps {
  showMinimap: boolean;
  bounds?: GeoJSONType | undefined;
}

const LegendWrapper = ({
  showMinimap,
  bounds,
  years,
  activeLayer,
  setActiveLayer,
}: LegendWrapperProps) => {
  return (
    <div className="legend-wrapper">
      <Logos />
      <div
        style={{
          display: "flex",
          gap: 24,
        }}
      >
        <div
          className="legend-card"
          style={{
            opacity: showMinimap ? 1 : 0,
            transition: "opacity 0.3s ease-in-out",
            pointerEvents: "none",
          }}
        >
          <MiniMap bounds={bounds} />
        </div>
        <div className="legend-card">
          <Legend
            years={years}
            activeLayer={activeLayer}
            setActiveLayer={setActiveLayer}
          />
        </div>
      </div>
    </div>
  );
};

export default LegendWrapper;
