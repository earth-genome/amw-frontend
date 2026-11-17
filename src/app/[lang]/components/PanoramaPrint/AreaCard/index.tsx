"use client";
import React, { useMemo } from "react";
import shared from "@/app/[lang]/components/Panorama/panorama.module.css";
import style from "./style.module.css";
import RichText from "@/app/[lang]/components/Panorama/RichText";
import MiningUpdate from "@/app/[lang]/components/Panorama/MiningUpdate";
import MiningAreaBarChart from "@/app/[lang]/components/AreaSummary/MiningAreaBarChart";
import IllegalityBarChart from "@/app/[lang]/components/AreaSummary/IllegalityBarChart";
import AreaMapSnapshot from "@/app/[lang]/components/PanoramaPrint/AreaMapSnapshot";
import { MapLayersProps } from "@/app/[lang]/components/Map/MapLayers";
import { PrintArea } from "@/cms/panoramaPrint";
import {
  AREA_SIGNIFICANT_DIGITS,
  AREA_TYPES,
  getColorsForYears,
  LAYER_YEARS,
} from "@/constants/map";
import {
  displayAreaInUnits,
  formatAreaNumber,
  formatLayerYear,
  PERMITTED_LANGUAGES,
} from "@/utils/content";
import {
  formatEconomicCost,
  getAreaTypeInfo,
  getEconomicCostDescription,
  getIllegalityPercentages,
} from "@/utils/areaSummary";

interface AreaCardProps {
  dictionary: { [key: string]: any };
  lang: PERMITTED_LANGUAGES;
  dataSnapshot: string;
  area: PrintArea;
  eyebrow: string;
}

// the print units are always hectares, as the default of the map
const AREA_UNITS = "hectares";

// a highlighted area of the report on its own page, with a large map and the same data
// as the area summary of the scrollytelling map
const AreaCard = ({
  dictionary,
  lang,
  dataSnapshot,
  area,
  eyebrow,
}: AreaCardProps) => {
  const yearsColors = useMemo(() => getColorsForYears(LAYER_YEARS), []);
  const { summary } = area;
  const unitsAbbrev = dictionary?.map_ui?.[`${AREA_UNITS}Abbrev`] ?? "";

  // the same layers as the map of the area in the scrollytelling report
  const mapLayers = useMemo<MapLayersProps | undefined>(
    () =>
      summary && {
        areaTypeKey: summary.areaTypeKey,
        selectedAreaId: summary.areaData.id,
        dataSnapshot,
        activeYear: String(summary.activeYear),
        isCumulative: summary.isCumulative,
      },
    [dataSnapshot, summary],
  );

  // small areas are common in the report, e.g. new incursions, so they keep a decimal
  // instead of being rounded, e.g. to "<1"
  const formatArea = (areaHa: number) =>
    areaHa > 0 && areaHa < 10
      ? areaHa.toLocaleString(lang, { maximumFractionDigits: 1 })
      : formatAreaNumber(
          displayAreaInUnits(areaHa, AREA_UNITS),
          lang,
          AREA_SIGNIFICANT_DIGITS,
        );

  const texts = (
    <div className={style.texts}>
      <RichText className={style.text} content={area.text} />
      <MiningUpdate
        dictionary={dictionary}
        content={area.miningUpdate}
        className={style.text}
        labelClassName={style.miningUpdateLabel}
      />
    </div>
  );

  // without area data, only the text of the CMS is shown
  if (!summary || !mapLayers) {
    return (
      <article className={style.areaCard}>
        <header className={style.header}>
          <div>
            <div className={style.eyebrow}>{eyebrow}</div>
            <h3 className={`${shared.heading} ${style.title}`}>{area.title}</h3>
            {area.location && (
              <div className={style.meta}>
                <span className={style.location}>{area.location}</span>
              </div>
            )}
          </div>
        </header>
        {texts}
      </article>
    );
  }

  const { areaData, activeYear, affectedAreaHa, periodAreaHa } = summary;
  const areaType = AREA_TYPES.find((d) => d.key === summary.areaTypeKey);
  const { typeLabel, country, status } = getAreaTypeInfo(
    areaType,
    areaData,
    dictionary,
  );
  const illegalityAreas = areaData.illegality_areas;
  const hasAffectedArea = affectedAreaHa != null;
  const location = area.location || areaData.country;

  const economicCostText = summary.economicCost
    ? `${formatEconomicCost(summary.economicCost, lang)} ${
        dictionary?.map_ui?.economic_cost_currency
      }`
    : "N/A";

  return (
    <article className={style.areaCard}>
      {/* ================== HEADER =================== */}
      <header className={style.header}>
        <div>
          <div className={style.eyebrow}>{eyebrow}</div>
          <h3 className={`${shared.heading} ${style.title}`}>{area.title}</h3>
          <div className={style.meta}>
            {location && <span className={style.location}>{location}</span>}
            {typeLabel && (
              <span>
                {location && " · "}
                {typeLabel}
                {/* the location is usually the country */}
                {country && country !== location && <> - {country}</>}
              </span>
            )}
            {status && (
              <span>
                {" "}
                · {dictionary?.map_ui?.area_status}: {status}
              </span>
            )}
          </div>
        </div>

        {periodAreaHa ? (
          <div className={style.change}>
            <div className={style.changeValue}>
              +{formatArea(periodAreaHa)} {dictionary?.panorama?.hectares_short}
            </div>
            <div className={style.changeLabel}>
              {dictionary?.panorama?.new_mining_in}{" "}
              {formatLayerYear(activeYear)}
            </div>
          </div>
        ) : null}
      </header>

      {/* ================== MAP =================== */}
      {areaData.bbox && (
        <AreaMapSnapshot
          className={style.map}
          mapId={String(area.id)}
          bbox={areaData.bbox}
          layers={mapLayers}
          view={summary.mapView}
        />
      )}

      {/* ================== AREA SUMMARY =================== */}
      <div className={style.summary}>
        <div>
          {summary.timeseries.length ? (
            <>
              <div className={style.label}>
                {dictionary?.map_ui?.area_over_time} ({unitsAbbrev})
              </div>
              <MiningAreaBarChart
                dictionary={dictionary}
                data={summary.timeseries}
                yearsColors={yearsColors}
                chartHeight={80}
                hideBarsAfterActiveYear
                xAxisEndLabelsOnly
                areaUnits={AREA_UNITS}
                lang={lang}
                activeYear={mapLayers.activeYear}
                isCumulative={mapLayers.isCumulative}
              />
            </>
          ) : null}
        </div>

        <div className={style.figures}>
          <div>
            <div className={style.label}>
              {dictionary?.panorama?.total_area_affected}
            </div>
            <div className={style.figure}>
              {hasAffectedArea
                ? `${formatArea(affectedAreaHa)} ${unitsAbbrev}`
                : dictionary?.map_ui?.no_mining}
            </div>
            <div className={style.caption}>
              {dictionary?.panorama?.mining_until} {formatLayerYear(activeYear)}
            </div>
          </div>

          {/* we don't show economic cost nor illegality if there are no mining impacts */}
          {hasAffectedArea && !summary.isMiningCalculatorHidden && (
            <div>
              <div className={style.label}>
                {dictionary?.map_ui?.economic_cost}{" "}
                {formatLayerYear(activeYear)}
              </div>
              <div className={style.figure}>{economicCostText}</div>
              <div className={style.caption}>
                {getEconomicCostDescription(dictionary, activeYear)}
                {summary.calculatorUrl && (
                  <>
                    {" "}
                    <a
                      href={summary.calculatorUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {dictionary?.map_ui?.more_details}
                    </a>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <div>
          {hasAffectedArea && illegalityAreas?.length ? (
            <>
              <div className={style.label}>
                {dictionary?.map_ui?.presumption_of_illegality}
              </div>
              <IllegalityBarChart
                dictionary={dictionary}
                percentages={getIllegalityPercentages(
                  illegalityAreas,
                  dictionary,
                )}
              />
              <div className={style.caption}>
                {dictionary?.map_ui?.presumption_of_illegality_tooltip}
              </div>
            </>
          ) : null}
        </div>
      </div>

      {/* ================== TEXT =================== */}
      {texts}
    </article>
  );
};

export default AreaCard;
