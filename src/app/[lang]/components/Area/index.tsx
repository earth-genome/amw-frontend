"use client";
import React, { useContext, useState } from "react";
import coverageData from "../../../../../configs/coverage.json";
import style from "./style.module.css";
import Eye from "@/app/[lang]/components/Icons/Eye";
import { Context } from "@/lib/Store";

interface AreaProps {
  dictionary: { [key: string]: any };
  year: string;
}

// Define the interface for the coverage JSON structure
interface CoverageYear {
  km: string;
  acres: number;
}

interface Coverage {
  [key: string]: CoverageYear;
}

const Area: React.FC<AreaProps> = ({ dictionary, year }) => {
  const [state, dispatch] = useContext(Context)!;
  const { selectedArea, selectedAreaType, selectedAreaData } = state;

  const coverage: Coverage = coverageData;

  return (
    <div className={style.areaCard}>
      <div className={style.areaTitle}>
        {/* FIXME: set programatically and localize */}
        <div>
          <div>
            {selectedArea?.name}, {selectedArea?.country}
          </div>
          {selectedAreaType ? (
            <div className={style.areaType}>
              {dictionary?.map_ui?.[selectedAreaType?.dictionaryKeySingular]}
            </div>
          ) : null}
        </div>

        <div>{year}</div>
      </div>
      <div className={style.areaBody}>
        <div>{dictionary.coverage.total_area_affected}</div>
        <div className={style.areaKm}>
          {/* FIXME: need to set correct area */}
          {/* possible something like {selectedAreaData.properties.area_affected} */}
          {/* {coverage?.[year].km} km<sup>2</sup> */}
          {"X"} km<sup>2</sup>
        </div>
        {/* FIXME: calculate increase and display */}
      </div>
      {/* FIXME: trigger interaction */}
      <div className={style.areaFooter}>
        <div className={style.areaFooterText}>
          {dictionary.map_ui.see_more_insights}
          <Eye />
        </div>
      </div>
    </div>
  );
};

export default Area;
