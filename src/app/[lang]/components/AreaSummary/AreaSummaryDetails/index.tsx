import AreaSummaryLineChart from "@/app/[lang]/components/AreaSummary/AreaSummaryLineChart";
import style from "./style.module.css";
import { AreasTimeseriesData } from "@/types/types";
import Link from "next/link";
import IllegalityBarChart from "@/app/[lang]/components/AreaSummary/IllegalityBarChart";
import { ILLEGALITY_KEYS, PERMITTED_ILLEGALITY_KEYS } from "@/constants/map";
import AreaSummaryTooltip from "@/app/[lang]/components/AreaSummary/AreaSummaryTooltip";

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
}: AreaSummaryDetailsProps) => {
  const economicCostText = calculatorIsLoading
    ? `${dictionary?.map_ui?.loading}...`
    : economicCost
    ? `${economicCost} ${dictionary?.map_ui?.economic_cost_currency}`
    : "N/A";

  const FigureTooltip = () =>
    !calculatorUrl ? null : (
      <AreaSummaryTooltip
        content={
          <div>
            <p>{dictionary?.map_ui?.economic_cost_calculator_intro}</p>
            <p>
              {dictionary?.map_ui?.see_detailed_analysis}{" "}
              <Link
                href={calculatorUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#ecaf00" }}
              >
                {dictionary?.map_ui?.detailed_analysis_link}
              </Link>
              .
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
            {dictionary?.map_ui?.area_over_time}
          </div>
          <AreaSummaryLineChart data={selectedAreaTimeseriesData} />
        </>
      ) : null}

      {!hideMiningCalculator && (
        <>
          <div className={style.label}>{dictionary?.map_ui?.economic_cost}</div>
          <div className={style.figure}>
            <div className={style.figureText}>
              {economicCostText} {economicCost && <FigureTooltip />}
            </div>
          </div>
        </>
      )}

      {illegalityAreas?.length ? (
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
        </>
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
