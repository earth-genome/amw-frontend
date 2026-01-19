"use client";
import React, { useContext, useMemo } from "react";
import style from "./style.module.css";
// import Eye from "@/app/[lang]/components/Icons/Eye";
import { Context } from "@/lib/Store";
import {
  displayAreaInUnits,
  formatLayerYear,
  formatNumber,
} from "@/utils/content";
import AreaSummaryDetails, {
  IllegalityAreaData,
} from "@/app/[lang]/components/AreaSummary/AreaSummaryDetails";
import { CloseCircleFilled } from "@ant-design/icons";
import * as turf from "@turf/turf";
import calculateMiningAreaInBbox from "@/utils/calculateMiningAreaInBbox";
import useMiningCalculator from "@/hooks/useMiningCalculator";
import {
  ECONOMIC_COST_SIGNIFICANT_DIGITS,
  ENTIRE_AMAZON_AREA_ID,
  getAreaSignificantDigits,
} from "@/constants/map";

interface AreaProps {
  dictionary: { [key: string]: any };
  maxYear: number;
  yearsColors: string[];
}

const AreaSummary: React.FC<AreaProps> = ({
  dictionary,
  maxYear,
  yearsColors,
}) => {
  const [state, dispatch] = useContext(Context)!;
  const {
    selectedAreaType,
    selectedAreaData,
    areaUnits,
    selectedAreaTimeseriesData,
    selectedAreaTypeKey,
    miningData,
    lang,
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
    // calculatorError,
  } = useMiningCalculator(
    hideMiningCalculator ? [] : selectedAreaData?.properties?.locations,
  );

  const [affectedAreaHa, economicCost, hotspotsTimeseries] = useMemo(() => {
    if (selectedAreaTypeKey === "hotspots" && selectedAreaData) {
      // if hotspots, calculate mining affected area on the fly
      const bbox = turf.bbox(selectedAreaData) as [
        number,
        number,
        number,
        number,
      ];
      const { areaMinesHa, areaMinesHaPerYearArray } =
        calculateMiningAreaInBbox(bbox, miningData) ?? {};
      return [areaMinesHa, null, areaMinesHaPerYearArray];
    } else {
      // else use the data that is pre-calculated in the timeseries,
      // and mining calculator data that is fetched on the fly

      return [
        // always display the latest year
        selectedAreaTimeseriesData?.find((d) => d.admin_year === maxYear)
          ?.intersected_area_ha_cumulative,
        calculatorData?.totalImpact,
        null,
      ];
    }
  }, [
    calculatorData?.totalImpact,
    maxYear,
    miningData,
    selectedAreaData,
    selectedAreaTimeseriesData,
    selectedAreaTypeKey,
  ]);

  const {
    country,
    id: areaId,
    description,
    illegality_areas: illegalityAreas,
    // hotspotType,
  } = areaProperties;
  const { showCountry, renderTitle, renderStatus } = selectedAreaType || {};
  const areaTitle = renderTitle && renderTitle(areaProperties);
  const areaStatus = renderStatus && renderStatus(areaProperties);

  const handleClose = () =>
    dispatch({ type: "SET_SELECTED_AREA_BY_ID", selectedAreaId: undefined });

  return (
    <div className={style.areaCard}>
      <div className={style.areaTitle}>
        <div>
          {/* <div className={style.areaYear}>{formatLayerYear(year)}</div> */}
          <div className={style.areaYear}>{formatLayerYear(maxYear)}</div>
          {areaTitle && <div className={style.areaTitleText}>{areaTitle}</div>}
          {selectedAreaType && areaId !== ENTIRE_AMAZON_AREA_ID ? (
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
        <div>
          {/* {dictionary.coverage.total_area_affected} ({activeYear}) */}
          {dictionary.coverage.total_area_affected}
        </div>
        <div className={style.areaKm}>
          {affectedAreaHa !== undefined && affectedAreaHa !== null
            ? formatNumber(
                displayAreaInUnits(affectedAreaHa, areaUnits),
                lang,
                getAreaSignificantDigits(affectedAreaHa),
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
                ? formatNumber(
                    economicCost,
                    lang,
                    ECONOMIC_COST_SIGNIFICANT_DIGITS,
                  ) || undefined
                : undefined
            }
            calculatorIsLoading={calculatorIsLoading}
            calculatorUrl={calculatorUrl}
            // @ts-ignore
            selectedAreaTimeseriesData={
              selectedAreaTypeKey === "hotspots"
                ? hotspotsTimeseries
                : selectedAreaTimeseriesData
            }
            description={description}
            dictionary={dictionary}
            illegalityAreas={illegalityAreas?.filter(
              (d: IllegalityAreaData) =>
                // removing areas which are zero pct
                d.mining_affected_area_pct > 0,
            )}
            yearsColors={yearsColors}
            // maxYear={maxYear}
            // hotspotType={hotspotType}
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

export default AreaSummary;
