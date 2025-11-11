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
  hotspotType?: string;
  maxYear: number;
  yearsColors: string[];
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
  hotspotType,
  maxYear,
  yearsColors,
}: AreaSummaryDetailsProps) => {
  const [state, dispatch] = useContext(Context)!;

  const { areaUnits } = state;

  const economicCostText = calculatorIsLoading
    ? `${dictionary?.map_ui?.loading}...`
    : economicCost
    ? `${economicCost} ${dictionary?.map_ui?.economic_cost_currency}`
    : "N/A";

  const EconomicCostTooltip = () =>
    !calculatorUrl ? null : (
      <AreaSummaryTooltip
        content={
          <div>
            <p>{dictionary?.map_ui?.economic_cost_calculator_intro}</p>
          </div>
        }
      />
    );

  const EconomicCostLink = () =>
    !calculatorUrl ? null : (
      <AreaSummaryTooltip
        icon={
          <Link
            href={calculatorUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ marginLeft: -6 }}
            title={dictionary?.map_ui?.detailed_analysis_link}
          >
            <ExternalLink />
          </Link>
        }
        content={
          <div>
            <p>
              {dictionary?.map_ui?.see_detailed_analysis}{" "}
              {dictionary?.map_ui?.detailed_analysis_link}.
            </p>
          </div>
        }
      />
    );

  return (
    <div className={style.wrapper}>
      {selectedAreaTimeseriesData?.length ? (
        <>
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
        </>
      ) : null}

      {!hideMiningCalculator && (
        <>
          <div className={style.label}>
            <div>
              {/* {dictionary?.map_ui?.economic_cost} ({maxYear}) */}
              {dictionary?.map_ui?.economic_cost}
            </div>
            <div>{economicCost && <EconomicCostTooltip />}</div>
          </div>
          <div className={style.figure}>
            <div className={style.figureText}>
              {economicCostText} {calculatorUrl && <EconomicCostLink />}
            </div>
          </div>
        </>
      )}

      {illegalityAreas?.length ? (
        <>
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
        </>
      ) : null}

      {/* {hotspotType ? (
        <>
          <div className={style.label}>
            {dictionary?.map_ui?.type_of_mining}
          </div>
          <div className={style.paragraph}>
            {dictionary?.types_of_mining?.[hotspotType]}
          </div>
        </>
      ) : null} */}

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
