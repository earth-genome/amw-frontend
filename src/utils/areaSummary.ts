import {
  AreaType,
  ECONOMIC_COST_SIGNIFICANT_DIGITS,
  ENTIRE_AMAZON_AREA_ID,
  ILLEGALITY_KEYS,
  PERMITTED_ILLEGALITY_KEYS,
} from "@/constants/map";
import { AreaData, AreasTimeseriesData } from "@/types/types";
import { formatCurrencyNumber, formatLayerYear } from "@/utils/content";

// the rules, values and texts of the summary of an area, shared between the area summary of
// the maps and the areas of the Panorama print page, which have different layouts

type Dictionary = { [key: string]: any };
// the area data used in the summary, without the mining locations
type SummaryAreaData = Omit<AreaData, "locations_per_year">;
export type IllegalityAreaData = AreaData["illegality_areas"][number];

// the mining calculator isn't reliable for areas as large as countries, and it can be
// hidden, e.g. in a Panorama report
export const isMiningCalculatorHiddenFor = (
  areaTypeKey: string | undefined,
  hideMiningCalculator: boolean,
) => hideMiningCalculator || !areaTypeKey || areaTypeKey === "countries";

// without the illegality levels with no mining
export const filterIllegalityAreas = (
  illegalityAreas: IllegalityAreaData[] | undefined,
) => illegalityAreas?.filter((d) => d.mining_affected_area_pct > 0);

// mining areas in the timeseries of an area, at a year or quarter
export const getTimeseriesValues = (
  timeseries: AreasTimeseriesData | undefined,
  year: number,
) => {
  const yearData = timeseries?.find((d) => d.admin_year === year);
  return {
    // until the year
    affectedAreaHa: yearData?.intersected_area_ha_cumulative,
    // new in the year
    periodAreaHa: yearData?.intersected_area_ha,
  };
};

export const formatEconomicCost = (economicCost: number, lang: string) =>
  formatCurrencyNumber(economicCost, lang, ECONOMIC_COST_SIGNIFICANT_DIGITS);

export const getEconomicCostDescription = (
  dictionary: Dictionary,
  year: number,
) =>
  `${dictionary?.map_ui?.economic_cost_calculator_intro} ${formatLayerYear(
    year,
  )}, ${dictionary?.map_ui?.economic_cost_calculator_ending}`;

// the percentages of the illegality bar chart, with the labels of their levels
export const getIllegalityPercentages = (
  illegalityAreas: IllegalityAreaData[],
  dictionary: Dictionary,
) =>
  illegalityAreas.map((d) => ({
    value: d.mining_affected_area_pct,
    key: d.admin_illegality_max,
    label:
      dictionary.illegality_legend?.[
        ILLEGALITY_KEYS?.[d.admin_illegality_max as PERMITTED_ILLEGALITY_KEYS]
      ],
  }));

// the type of the area, e.g. "Indigenous territory", its country if the type shows it, and
// its status, e.g. "Titled"
export const getAreaTypeInfo = (
  areaType: AreaType | undefined,
  areaData: SummaryAreaData | undefined,
  dictionary: Dictionary,
) => {
  if (!areaType || !areaData) return {};
  return {
    // the whole Amazon has no type
    typeLabel:
      areaData.id !== ENTIRE_AMAZON_AREA_ID
        ? dictionary?.map_ui?.[areaType.dictionaryKeySingular]
        : undefined,
    country: areaType.showCountry ? areaData.country || undefined : undefined,
    status: areaType.renderStatus(areaData) || undefined,
  };
};
