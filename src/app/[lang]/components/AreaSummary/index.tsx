"use client";
import React, { useContext, useMemo } from "react";
import style from "./style.module.css";
import { Context } from "@/lib/Store";
import {
  displayAreaInUnits,
  formatLayerYear,
  formatAreaNumber,
} from "@/utils/content";
import AreaSummaryDetails from "@/app/[lang]/components/AreaSummary/AreaSummaryDetails";
import { CloseCircleFilled } from "@ant-design/icons";
import useMiningCalculator from "@/hooks/useMiningCalculator";
import { AREA_SIGNIFICANT_DIGITS } from "@/constants/map";
import {
  filterIllegalityAreas,
  formatEconomicCost,
  getAreaTypeInfo,
  getTimeseriesValues,
  isMiningCalculatorHiddenFor,
} from "@/utils/areaSummary";

interface AreaProps {
  dictionary: { [key: string]: any };
  yearsColors: string[];
  // scrollytelling mode: no close button and the chart stops at the active year
  isScrollytelling?: boolean;
  // hides the mining calculator, e.g. in a Panorama report
  hideMiningCalculator?: boolean;
  className?: string;
}

const AreaSummary: React.FC<AreaProps> = ({
  dictionary,
  yearsColors,
  isScrollytelling = false,
  hideMiningCalculator = false,
  className,
}) => {
  const [state, dispatch] = useContext(Context)!;
  const {
    selectedAreaType,
    selectedAreaData,
    areaUnits,
    selectedAreaTimeseriesData,
    selectedAreaTypeKey,
    lang,
    activeYear,
  } = state;
  // the total affected area is displayed until the selected year/quarter
  const displayYear = Number(activeYear);
  // don't use mining calculator for countries because it is not reliable for such large areas,
  // nor when it is hidden, e.g. in a Panorama report
  const isMiningCalculatorHidden = isMiningCalculatorHiddenFor(
    selectedAreaTypeKey,
    hideMiningCalculator,
  );

  const {
    calculatorData,
    calculatorUrl,
    calculatorIsLoading,
    // calculatorError,
  } = useMiningCalculator(
    isMiningCalculatorHidden
      ? []
      : selectedAreaData?.locations_per_year?.[activeYear],
  );

  const [affectedAreaHa, economicCost] = useMemo(() => {
    // use the data that is pre-calculated in the timeseries,
    // and mining calculator data that is fetched on the fly
    const { affectedAreaHa: displayYearAffectedArea } = getTimeseriesValues(
      selectedAreaTimeseriesData,
      displayYear,
    );
    return [displayYearAffectedArea, calculatorData?.totalImpact];
  }, [calculatorData?.totalImpact, displayYear, selectedAreaTimeseriesData]);
  const hasAffectedArea = affectedAreaHa != null;

  const {
    // description,
    illegality_areas: illegalityAreas,
  } = selectedAreaData ?? {};
  const areaTitle =
    selectedAreaData && selectedAreaType?.renderTitle(selectedAreaData);
  const {
    typeLabel,
    country,
    status: areaStatus,
  } = getAreaTypeInfo(selectedAreaType, selectedAreaData, dictionary);

  const handleClose = () =>
    dispatch({ type: "SET_SELECTED_AREA_BY_ID", selectedAreaId: undefined });

  return (
    <div className={`${style.areaCard} ${className ?? ""}`}>
      <div className={style.areaTitle}>
        <div>
          {/* <div className={style.areaYear}>{formatLayerYear(maxYear)}</div> */}
          {areaTitle && <div className={style.areaTitleText}>{areaTitle}</div>}
          {typeLabel ? (
            <div className={style.areaType}>
              {typeLabel}
              {country && <span> - {country}</span>}
            </div>
          ) : null}
          {areaStatus && (
            <div className={style.areaType}>
              {dictionary?.map_ui?.area_status}: {areaStatus}
            </div>
          )}
        </div>

        {!isScrollytelling && (
          <div className={style.areaTitleRight}>
            <div className={style.areaClose} onClick={handleClose}>
              <CloseCircleFilled />
            </div>
          </div>
        )}
      </div>
      <div
        className={style.areaBody}
        style={
          // if there is no affected area, we won't show the card below,
          // so we need the bottom radius here
          !hasAffectedArea
            ? {
                borderBottomLeftRadius: 12,
                borderBottomRightRadius: 12,
              }
            : {}
        }
      >
        <div>
          {dictionary.map_ui.total_area_affected} {formatLayerYear(displayYear)}
        </div>
        <div className={style.areaKm}>
          {hasAffectedArea
            ? `${formatAreaNumber(
                displayAreaInUnits(affectedAreaHa, areaUnits),
                lang,
                AREA_SIGNIFICANT_DIGITS,
              )} ${dictionary?.map_ui?.[`${areaUnits}Abbrev`] ?? ""}`
            : dictionary.map_ui.no_mining}
        </div>
      </div>
      {/* we don't show economic cost nor illegality if there are no mining impacts */}
      {hasAffectedArea && (
        <div>
          <AreaSummaryDetails
            hideMiningCalculator={isMiningCalculatorHidden}
            economicCost={
              economicCost
                ? formatEconomicCost(economicCost, lang) || undefined
                : undefined
            }
            calculatorIsLoading={calculatorIsLoading}
            calculatorUrl={calculatorUrl}
            selectedAreaTimeseriesData={selectedAreaTimeseriesData}
            // description={description}
            dictionary={dictionary}
            // removing areas which are zero pct
            illegalityAreas={filterIllegalityAreas(illegalityAreas)}
            yearsColors={yearsColors}
            displayYear={displayYear}
            hideBarsAfterActiveYear={isScrollytelling}
            isFloating={isScrollytelling}
          />
        </div>
      )}
    </div>
  );
};

export default AreaSummary;
