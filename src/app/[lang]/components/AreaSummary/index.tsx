"use client";
import React, { useContext, useMemo, useState } from "react";
import style from "./style.module.css";
// import Eye from "@/app/[lang]/components/Icons/Eye";
import { Context } from "@/lib/Store";
import {
  displayAreaInUnits,
  formatNumber,
  PERMITTED_LANGUAGES,
} from "@/utils/content";
import AreaSummaryDetails, {
  IllegalityAreaData,
} from "@/app/[lang]/components/AreaSummary/AreaSummaryDetails";
import { CloseCircleFilled } from "@ant-design/icons";
import * as turf from "@turf/turf";
import calculateMiningAreaInBbox from "@/utils/calculateMiningAreaInBbox";
import useMiningCalculator from "@/hooks/useMiningCalculator";

interface AreaProps {
  dictionary: { [key: string]: any };
  year: string;
  lang: PERMITTED_LANGUAGES;
  activeLayer: string;
}

const Area: React.FC<AreaProps> = ({ dictionary, year, lang, activeLayer }) => {
  const [state, dispatch] = useContext(Context)!;
  const {
    selectedAreaType,
    selectedAreaData,
    // showAreaSummaryMoreInsights: showMoreInsights,
    areaUnits,
    selectedAreaTimeseriesData,
    selectedAreaTypeKey,
    miningData,
  } = state;
  const areaProperties = selectedAreaData?.properties || {};
  const showMoreInsights = true;
  // don't use mining calculator for countries because it is not reliable for such large areas,
  // also don't show for hotspots because we don't calculate economic cost for these on the fly
  const hideMiningCalculator =
    !selectedAreaTypeKey ||
    ["countries", "hotspots"].includes(selectedAreaTypeKey);

  const {
    calculatorData,
    calculatorUrl,
    calculatorIsLoading,
    calculatorError,
  } = useMiningCalculator(
    hideMiningCalculator ? [] : selectedAreaData?.properties?.locations
  );

  const [affectedAreaHa, economicCost] = useMemo(() => {
    if (selectedAreaTypeKey === "hotspots" && selectedAreaData) {
      // if hotspots, calculate mining affected area on the fly
      const bbox = turf.bbox(selectedAreaData) as [
        number,
        number,
        number,
        number
      ];
      const affectedAreaHa = calculateMiningAreaInBbox(
        bbox,
        activeLayer,
        miningData
      );
      return [affectedAreaHa, null];
    } else {
      // else use the data that is pre-calculated and baked into the geojson,
      // and mining calculator data that is fetched on the fly
      return [
        areaProperties?.mining_affected_area_ha,
        calculatorData?.totalImpact,
      ];
    }
  }, [
    activeLayer,
    areaProperties?.mining_affected_area_ha,
    calculatorData?.totalImpact,
    miningData,
    selectedAreaData,
    selectedAreaTypeKey,
  ]);

  const {
    country,
    id: areaId,
    description,
    illegality_areas: illegalityAreas,
    hotspotType,
  } = areaProperties;
  const { showCountry, renderTitle, renderStatus } = selectedAreaType || {};
  const areaTitle = renderTitle && renderTitle(areaProperties);
  const areaStatus = renderStatus && renderStatus(areaProperties);

  const setShowMoreInsights = (value: boolean) =>
    dispatch({
      type: "SHOW_AREA_SUMMARY_MORE_INSIGHTS",
      showAreaSummaryMoreInsights: value,
    });

  const toggleShowMoreInsights = () => setShowMoreInsights(!showMoreInsights);

  const handleClose = () =>
    dispatch({ type: "SET_SELECTED_AREA_BY_ID", selectedAreaId: undefined });

  return (
    <div className={style.areaCard}>
      <div className={style.areaTitle}>
        <div>
          <div className={style.areaYear}>{year}</div>
          {areaTitle && <div className={style.areaTitleText}>{areaTitle}</div>}
          {selectedAreaType && areaId !== "AMAZ" ? (
            <div className={style.areaType}>
              {dictionary?.map_ui?.[selectedAreaType?.dictionaryKeySingular]}
              {showCountry && country && <span> - {country}</span>}
            </div>
          ) : null}
          {areaStatus && (
            <div className={style.areaType}>
              {dictionary?.map_ui?.area_status}: {areaStatus}
            </div>
          )}
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
          {affectedAreaHa !== undefined
            ? formatNumber(
                displayAreaInUnits(affectedAreaHa, areaUnits),
                lang,
                ",.1~s",
                1
              )
            : 0}{" "}
          {dictionary?.map_ui?.[`${areaUnits}Abbrev`]}
        </div>
      </div>
      {showMoreInsights && (
        <div>
          <AreaSummaryDetails
            hideMiningCalculator={hideMiningCalculator}
            economicCost={
              economicCost
                ? formatNumber(economicCost, lang, ",.2~s", 2) || undefined
                : undefined
            }
            calculatorIsLoading={calculatorIsLoading}
            calculatorUrl={calculatorUrl}
            selectedAreaTimeseriesData={selectedAreaTimeseriesData}
            description={description}
            dictionary={dictionary}
            illegalityAreas={illegalityAreas?.filter(
              (d: IllegalityAreaData) =>
                // removing areas which are zero pct
                d.mining_affected_area_pct > 0
            )}
            hotspotType={hotspotType}
          />
        </div>
      )}
      {/* <div className={style.areaFooter}>
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
      </div> */}
    </div>
  );
};

export default Area;
