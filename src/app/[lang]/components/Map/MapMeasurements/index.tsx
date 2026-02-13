"use client";
import {
  displayAreaInUnits,
  formatNumber,
  squareMeterToHa,
} from "@/utils/content";
import style from "./style.module.css";
import { useContext } from "react";
import { Context } from "@/lib/Store";

interface MapMeasurementsProps {
  areaMeasure: number;
  lineMeasure: number;
  dictionary: { [key: string]: any };
}

const MapMeasurements = ({
  areaMeasure,
  lineMeasure,
  dictionary,
}: MapMeasurementsProps) => {
  const [state] = useContext(Context)!;

  const { areaUnits, lang } = state;

  return (
    <div className={style.card}>
      {areaMeasure > 0 && (
        <div>
          Area:{" "}
          {formatNumber(
            displayAreaInUnits(squareMeterToHa(areaMeasure), areaUnits),
            lang,
            3,
          )}{" "}
          {dictionary?.map_ui?.[`${areaUnits}Abbrev`] ?? ""}
        </div>
      )}
      {lineMeasure > 0 && <div>Length: {lineMeasure}</div>}
    </div>
  );
};

export default MapMeasurements;
