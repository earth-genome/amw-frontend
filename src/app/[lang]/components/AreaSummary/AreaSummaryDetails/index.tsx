import MiningAreaBarChart from "@/app/[lang]/components/AreaSummary/MiningAreaBarChart";
import style from "./style.module.css";
import { AreasTimeseriesData } from "@/types/types";
import Link from "next/link";
import IllegalityBarChart from "@/app/[lang]/components/AreaSummary/IllegalityBarChart";
import { ILLEGALITY_KEYS, PERMITTED_ILLEGALITY_KEYS } from "@/constants/map";
import AreaSummaryTooltip from "@/app/[lang]/components/AreaSummary/AreaSummaryTooltip";
import ExternalLink from "@/app/[lang]/components/Icons/ExternalLink";
import { useContext } from "react";
import { Context } from "@/lib/Store";
import { formatLayerYear } from "@/utils/content";

export type IllegalityAreaData = {
  admin_illegality_max: number;
  mining_affected_area: number;
  mining_affected_area_pct: number;
};

interface AreaSummaryDetailsProps {
  dictionary: { [key: string]: any };
  illegalityAreas: IllegalityAreaData[];
  economicCost: string | undefined;
  calculatorIsLoading: boolean;
  calculatorUrl?: string;
  selectedAreaTimeseriesData: AreasTimeseriesData | undefined;
  hideMiningCalculator: boolean;
  description?: string;
  yearsColors: string[];
  maxYear: number;
}

const AreaSummaryDetails = ({
  economicCost,
  calculatorIsLoading,
  calculatorUrl,
  selectedAreaTimeseriesData,
  dictionary,
  hideMiningCalculator,
  description,
  illegalityAreas,
  yearsColors,
  maxYear,
}: AreaSummaryDetailsProps) => {
  // eslint-disable-next-line no-unused-vars
  const [state, dispatch] = useContext(Context)!;

  const { areaUnits } = state;

  const economicCostText = calculatorIsLoading
    ? `${dictionary?.map_ui?.loading}...`
    : economicCost
      ? `${economicCost} ${dictionary?.map_ui?.economic_cost_currency}`
      : "N/A";

  const EconomicCostTooltip = () => (
    <AreaSummaryTooltip
      content={
        <div>
          <p>
            {dictionary?.map_ui?.economic_cost_calculator_intro}{" "}
            {formatLayerYear(maxYear)}{", "}
            {dictionary?.map_ui?.economic_cost_calculator_ending}
          </p>
        </div>
      }
    />
  );

  const EconomicCostLink = () =>
    !calculatorUrl ? null : (
      <AreaSummaryTooltip
        content={
          <div>
            <p>
              {dictionary?.map_ui?.see_detailed_analysis}{" "}
              {dictionary?.map_ui?.detailed_analysis_link}.
            </p>
          </div>
        }
      >
        <Link
          href={calculatorUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={style.moreDetails}
          title={dictionary?.map_ui?.detailed_analysis_link}
        >
          <span>
            {dictionary?.map_ui?.more_details} <ExternalLink height={10} />
          </span>
        </Link>
      </AreaSummaryTooltip>
    );

  return (
    <div className={style.wrapper}>
      {selectedAreaTimeseriesData?.length ? (
        <div>
          <div className={style.label}>
            {dictionary?.map_ui?.area_over_time} (
            {dictionary?.map_ui?.[`${areaUnits}Abbrev`]})
          </div>
          <MiningAreaBarChart
            dictionary={dictionary}
            data={selectedAreaTimeseriesData}
            yearsColors={yearsColors}
            chartHeight={90}
          />
        </div>
      ) : null}

      {!hideMiningCalculator && (
        <div>
          <div className={style.label}>
            <div>
              {dictionary?.map_ui?.economic_cost} {formatLayerYear(maxYear)}
            </div>
            <div>
              <EconomicCostTooltip />
            </div>
          </div>
          <div className={style.figure}>
            <div className={style.figureText}>
              {economicCostText} {calculatorUrl && <EconomicCostLink />}
            </div>
          </div>
        </div>
      )}

      {illegalityAreas?.length ? (
        <div>
          <div className={style.label}>
            <div>{dictionary?.map_ui?.presumption_of_illegality}</div>
            <div>
              <AreaSummaryTooltip
                content={
                  <div>
                    {dictionary?.map_ui?.presumption_of_illegality_tooltip}
                  </div>
                }
              />
            </div>
          </div>
          <div className={style.subLabel}>
            {dictionary?.map_ui?.presumption_of_illegality_breakdown}
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
        </div>
      ) : null}

      {description ? (
        <>
          <div className={style.label}>{dictionary?.map_ui?.description}</div>
          <div className={style.paragraph}>{description}</div>
        </>
      ) : null}
    </div>
  );
};

export default AreaSummaryDetails;
