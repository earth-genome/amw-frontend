"use client";
import {
  displayAreaInUnits,
  formatNumber,
  squareMeterToHa,
} from "@/utils/content";
import style from "./style.module.css";
import { useContext } from "react";
import { Context } from "@/lib/Store";
import { CloseCircleFilled } from "@ant-design/icons";
import { PERMITTED_AREA_UNITS } from "@/app/[lang]/components/Footer";

interface MapMeasurementsProps {
  areaMeasure: number;
  lineMeasure: number;
  dictionary: { [key: string]: any };
  onClose: () => void;
}

const metersToKm = (m: number) => m / 1000;
const metersToFeet = (m: number) => m * 3.28084;
const metersToMiles = (m: number) => m / 1609.344;

const displayLengthInUnits = (
  meters: number,
  units: PERMITTED_AREA_UNITS,
): { value: number; abbrev: string } => {
  if (units === "imperial") {
    if (meters >= 1609.344) {
      return { value: metersToMiles(meters), abbrev: "mi" };
    }
    return { value: metersToFeet(meters), abbrev: "ft" };
  }
  // metric for both hectares and squareKm
  if (meters >= 1000) {
    return { value: metersToKm(meters), abbrev: "km" };
  }
  return { value: meters, abbrev: "m" };
};

const MapMeasurements = ({
  areaMeasure,
  lineMeasure,
  dictionary,
  onClose,
}: MapMeasurementsProps) => {
  const [state] = useContext(Context)!;

  const { areaUnits, lang } = state;

  const length = displayLengthInUnits(lineMeasure, areaUnits);
  const area = displayAreaInUnits(squareMeterToHa(areaMeasure), areaUnits);

  return (
    <div className={style.card}>
      <div className={style.cardHeader}>
        <span>{dictionary?.map_ui?.measurements}</span>
        <div className={style.closeButton} onClick={onClose}>
          <CloseCircleFilled />
        </div>
      </div>
      <div className={style.cardBody}>
        {areaMeasure > 0 && (
          <div>
            <div className={style.measureLabel}>
              {dictionary?.map_ui?.measure_area}
            </div>
            <div className={style.measureValue}>
              {formatNumber(area, lang, 3)}{" "}
              {dictionary?.map_ui?.[`${areaUnits}Abbrev`] ?? ""}
            </div>
          </div>
        )}
        {lineMeasure > 0 && (
          <div>
            <div className={style.measureLabel}>
              {dictionary?.map_ui?.measure_length}
            </div>
            <div className={style.measureValue}>
              {formatNumber(length.value, lang, 3)} {length.abbrev}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapMeasurements;
