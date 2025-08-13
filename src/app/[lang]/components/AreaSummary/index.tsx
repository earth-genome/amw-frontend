"use client";
import React, { useContext, useState } from "react";
import coverageData from "../../../../../configs/coverage.json";
import style from "./style.module.css";
import Eye from "@/app/[lang]/components/Icons/Eye";
import { Context } from "@/lib/Store";
import { formatNumber, PERMITTED_LANGUAGES } from "@/utils/content";
import AreaSummaryFigure from "@/app/[lang]/components/AreaSummary/AreaSummaryFigure";

interface AreaProps {
  dictionary: { [key: string]: any };
  year: string;
  lang: PERMITTED_LANGUAGES;
}

// Define the interface for the coverage JSON structure
interface CoverageYear {
  km: string;
  acres: number;
}

interface Coverage {
  [key: string]: CoverageYear;
}

const Area: React.FC<AreaProps> = ({ dictionary, year, lang }) => {
  const [state, dispatch] = useContext(Context)!;
  const [showMoreInsights, setShowMoreInsights] = useState(false);
  const { selectedArea, selectedAreaType, selectedAreaData } = state;

  const coverage: Coverage = coverageData;
  const affectedArea = selectedAreaData?.properties?.totalAffectedArea;
  const economicCost = selectedAreaData?.properties?.totalImpact;

  const toggleShowMoreInsights = () => setShowMoreInsights(!showMoreInsights);

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
          {affectedArea ? (
            <>
              {formatNumber(affectedArea, lang)} km<sup>2</sup>
            </>
          ) : null}
        </div>
        {/* FIXME: calculate increase and display */}
      </div>
      {showMoreInsights && (
        <div>
          {economicCost && (
            <AreaSummaryFigure
              label={dictionary.map_ui.economic_cost}
              figure={formatNumber(economicCost, lang)}
              currency={dictionary.map_ui.economic_cost_currency}
            />
          )}
        </div>
      )}
      <div className={style.areaFooter}>
        <div className={style.areaFooterText}>
          <button
            className={style.showMoreButton}
            onClick={toggleShowMoreInsights}
          >
            {!showMoreInsights
              ? dictionary.map_ui.see_more_insights
              : dictionary.map_ui.hide_more_insights}
            <Eye hide={showMoreInsights} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Area;
