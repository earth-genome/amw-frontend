"use client";
import React, { useContext, useMemo } from "react";
import style from "./style.module.css";
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
    lang,
  } = state;
  // don't use mining calculator for countries because it is not reliable for such large areas,
  const hideMiningCalculator =
    !selectedAreaTypeKey || selectedAreaTypeKey === "countries";

  const {
    calculatorData,
    calculatorUrl,
    calculatorIsLoading,
    // calculatorError,
  } = useMiningCalculator(
    hideMiningCalculator ? [] : selectedAreaData?.locations,
  );

  const [affectedAreaHa, economicCost] = useMemo(() => {
    // use the data that is pre-calculated in the timeseries,
    // and mining calculator data that is fetched on the fly

    const latestYearAffectedArea = selectedAreaTimeseriesData?.find(
      (d) => d.admin_year === maxYear,
    )?.intersected_area_ha_cumulative;
    return [latestYearAffectedArea, calculatorData?.totalImpact];
  }, [calculatorData?.totalImpact, maxYear, selectedAreaTimeseriesData]);

  const {
    country,
    id: areaId,
    // description,
    illegality_areas: illegalityAreas,
  } = selectedAreaData ?? {};
  const { showCountry, renderTitle, renderStatus } = selectedAreaType || {};
  const areaTitle =
    selectedAreaData && renderTitle && renderTitle(selectedAreaData);
  const areaStatus =
    selectedAreaData && renderStatus && renderStatus(selectedAreaData);

  const handleClose = () =>
    dispatch({ type: "SET_SELECTED_AREA_BY_ID", selectedAreaId: undefined });

  return (
    <div className={style.areaCard}>
      <div className={style.areaTitle}>
        <div>
          {/* <div className={style.areaYear}>{formatLayerYear(maxYear)}</div> */}
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
      <div
        className={style.areaBody}
        style={
          // if there is no affected area, we won't show the card below, 
          // so we need the bottom radius here
          !affectedAreaHa
            ? {
                borderBottomLeftRadius: 12,
                borderBottomRightRadius: 12,
              }
            : {}
        }
      >
        <div>
          {dictionary.coverage.total_area_affected} {formatLayerYear(maxYear)}
        </div>
        <div className={style.areaKm}>
          {affectedAreaHa !== null && affectedAreaHa !== undefined
            ? `${formatNumber(
                displayAreaInUnits(affectedAreaHa, areaUnits),
                lang,
                getAreaSignificantDigits(affectedAreaHa),
              )} ${dictionary?.map_ui?.[`${areaUnits}Abbrev`] ?? ""}`
            : "N/A"}
        </div>
      </div>
      {/* we don't show economic cost nor illegality if there are no mining impacts */}
      {affectedAreaHa && (
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
            selectedAreaTimeseriesData={selectedAreaTimeseriesData}
            // description={description}
            dictionary={dictionary}
            illegalityAreas={illegalityAreas?.filter(
              (d: IllegalityAreaData) =>
                // removing areas which are zero pct
                d.mining_affected_area_pct > 0,
            )}
            yearsColors={yearsColors}
            maxYear={maxYear}
          />
        </div>
      )}
    </div>
  );
};

export default AreaSummary;
