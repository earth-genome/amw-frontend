"use client";
import React, { useContext, useState } from "react";
// import coverageData from "../../../../../configs/coverage.json";
import style from "./style.module.css";
import Eye from "@/app/[lang]/components/Icons/Eye";
import { Context } from "@/lib/Store";
import { formatNumber, PERMITTED_LANGUAGES } from "@/utils/content";
import AreaSummaryFigure from "@/app/[lang]/components/AreaSummary/AreaSummaryFigure";
import { CloseCircleFilled } from "@ant-design/icons";

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

// interface Coverage {
//   [key: string]: CoverageYear;
// }

const Area: React.FC<AreaProps> = ({ dictionary, year, lang }) => {
  const [state, dispatch] = useContext(Context)!;
  const [showMoreInsights, setShowMoreInsights] = useState(false);
  const { selectedAreaType, selectedAreaData } = state;
  const areaProperties = selectedAreaData?.properties || {};

  // const coverage: Coverage = coverageData;
  const affectedAreaHa = areaProperties?.mining_affected_area_ha;
  const economicCost = areaProperties?.economic_impact_usd;

  const toggleShowMoreInsights = () => setShowMoreInsights(!showMoreInsights);

  const handleClose = () =>
    dispatch({ type: "SET_SELECTED_AREA_BY_ID", selectedAreaId: undefined });

  return (
    <div className={style.areaCard}>
      <div className={style.areaTitle}>
        {/* FIXME: set programatically and localize */}
        <div>
          <div className={style.areaYear}>
            {year}
          </div>
          <div>
            {selectedAreaType?.renderTitle && areaProperties
              ? selectedAreaType?.renderTitle(areaProperties)
              : null}
          </div>
          {selectedAreaType ? (
            <div className={style.areaType}>
              {dictionary?.map_ui?.[selectedAreaType?.dictionaryKeySingular]}
              {selectedAreaType?.showCountry && areaProperties?.country ? (
                <span> - {areaProperties.country}</span>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className={style.areaTitleRight}>
          <div className={style.areaClose} onClick={handleClose}>
            <CloseCircleFilled />
          </div>
        </div>
      </div>
      <div className={style.areaBody}>
        <div>{dictionary.coverage.total_area_affected}</div>
        <div className={style.areaKm}>
          {affectedAreaHa ? (
            <>
              {formatNumber(affectedAreaHa * 0.01, lang)} km<sup>2</sup>
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
