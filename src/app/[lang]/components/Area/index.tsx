"use client";
import React, { useState } from "react";
import { Tween } from "react-gsap";
import coverageData from "../../../../../configs/coverage.json";
import style from "./style.module.css";
import Eye from "@/app/[lang]/components/Icons/Eye";

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
  const coverage: Coverage = coverageData;

  return (
    <Tween
      from={{ y: 100, opacity: 0 }}
      to={{ y: 0, opacity: 1 }}
      stagger={0.1}
      ease={"sine.out"}
      delay={0.2}
    >
      <div className={style.areaCard}>
        <div className={style.areaTitle}>
          {/* FIXME: set programatically and localize */}
          <div>Whole Amazonia</div>
          <div>{year}</div>
        </div>
        <div className={style.areaBody}>
          <div>{dictionary.coverage.total_area_affected}</div>
          <div className={style.areaKm}>
            {coverage?.[year].km} km<sup>2</sup>
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
    </Tween>
  );
};

export default Area;
