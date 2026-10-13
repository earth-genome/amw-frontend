"use client";
import React, { useMemo } from "react";
import shared from "@/app/[lang]/components/Panorama/panorama.module.css";
import style from "./style.module.css";
import RichText from "@/app/[lang]/components/Panorama/RichText";
import MiningAreaBarChart from "@/app/[lang]/components/AreaSummary/MiningAreaBarChart";
import IllegalityBarChart from "@/app/[lang]/components/AreaSummary/IllegalityBarChart";
import StaticAreaStore from "@/app/[lang]/components/PanoramaPrint/StaticAreaStore";
import AreaMapSnapshot from "@/app/[lang]/components/PanoramaPrint/AreaMapSnapshot";
import { PrintArea } from "@/cms/panoramaPrint";
import {
  AREA_SIGNIFICANT_DIGITS,
  AREA_TYPES,
  ECONOMIC_COST_SIGNIFICANT_DIGITS,
  ENTIRE_AMAZON_AREA_ID,
  getColorsForYears,
  ILLEGALITY_KEYS,
  LAYER_YEARS,
  PERMITTED_ILLEGALITY_KEYS,
} from "@/constants/map";
import {
  displayAreaInUnits,
  formatAreaNumber,
  formatLayerYear,
  PERMITTED_LANGUAGES,
} from "@/utils/content";

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
      {area.miningUpdate && (
        <div className={style.text}>
          <span className={style.miningUpdateLabel}>
            {dictionary?.panorama?.mining_update}
          </span>
          <RichText content={area.miningUpdate} />
        </div>
      )}
    </div>
  );

  // without area data, only the text of the CMS is shown
  if (!summary) {
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
  const areaStatus = areaType?.renderStatus(areaData);
  const isQuarter = activeYear % 100 !== 0;
  const illegalityAreas = areaData.illegality_areas;
  const hasAffectedArea = affectedAreaHa != null;
  const location = area.location || areaData.country;

  const economicCostText = summary.economicCost
    ? `${formatAreaNumber(
        summary.economicCost,
        lang,
        ECONOMIC_COST_SIGNIFICANT_DIGITS,
      )} ${dictionary?.map_ui?.economic_cost_currency}`
    : "N/A";

  return (
    <StaticAreaStore lang={lang} dataSnapshot={dataSnapshot} summary={summary}>
      <article className={style.areaCard}>
        {/* ================== HEADER =================== */}
        <header className={style.header}>
          <div>
            <div className={style.eyebrow}>{eyebrow}</div>
            <h3 className={`${shared.heading} ${style.title}`}>{area.title}</h3>
            <div className={style.meta}>
              {location && <span className={style.location}>{location}</span>}
              {areaType && areaData.id !== ENTIRE_AMAZON_AREA_ID && (
                <span>
                  {location && " · "}
                  {dictionary?.map_ui?.[areaType.dictionaryKeySingular]}
                  {areaType.showCountry &&
                    areaData.country &&
                    areaData.country !== location && <> - {areaData.country}</>}
                </span>
              )}
              {areaStatus && (
                <span>
                  {" "}
                  · {dictionary?.map_ui?.area_status}: {areaStatus}
                </span>
              )}
            </div>
          </div>

          {periodAreaHa ? (
            <div className={style.change}>
              <div className={style.changeValue}>
                +{formatArea(periodAreaHa)}{" "}
                {dictionary?.panorama?.hectares_short}
              </div>
              <div className={style.changeLabel}>
                {isQuarter
                  ? dictionary?.panorama?.new_mining_this_quarter
                  : dictionary?.panorama?.new_mining_this_year}
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
                {dictionary?.panorama?.mining_until}{" "}
                {formatLayerYear(activeYear)}
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
                  {dictionary?.map_ui?.economic_cost_calculator_intro}{" "}
                  {formatLayerYear(activeYear)}
                  {", "}
                  {dictionary?.map_ui?.economic_cost_calculator_ending}
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
                  percentages={illegalityAreas.map((d) => ({
                    value: d.mining_affected_area_pct,
                    key: d.admin_illegality_max,
                    label:
                      dictionary.illegality_legend?.[
                        ILLEGALITY_KEYS?.[
                          d.admin_illegality_max as PERMITTED_ILLEGALITY_KEYS
                        ]
                      ],
                  }))}
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
    </StaticAreaStore>
  );
};

export default AreaCard;
