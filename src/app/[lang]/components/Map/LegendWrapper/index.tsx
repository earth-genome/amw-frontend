import { GeoJSONType } from "@/app/[lang]/components/Map/helpers";
import MiniMap from "../../MiniMap";
import Logos from "../Logos";
import Legend, { LegendProps } from "@/app/[lang]/components/Map/Legend";
import "./style.css";

interface LegendWrapperProps extends LegendProps {
  showMinimap: boolean;
  showMinimapBounds: boolean;
  bounds?: GeoJSONType | undefined;
}

const LegendWrapper = ({
  showMinimap,
  showMinimapBounds,
  bounds,
  years,
  activeYear,
  setActiveYear,
  dictionary,
}: LegendWrapperProps) => {
  return (
    <div className="legend-wrapper">
      <Logos />
      <div className="legend-container">
        <div
          className="legend-card mini-map-wrapper"
          style={{
            opacity: showMinimap ? 1 : 0,
            transition: "opacity 0.3s ease-in-out",
            pointerEvents: "none",
          }}
        >
          <MiniMap bounds={bounds} showMinimapBounds={showMinimapBounds} />
        </div>
        <div className="legend-card">
          <Legend
            years={years}
            activeYear={activeYear}
            setActiveYear={setActiveYear}
            dictionary={dictionary}
          />
        </div>
      </div>
    </div>
  );
};

export default LegendWrapper;
