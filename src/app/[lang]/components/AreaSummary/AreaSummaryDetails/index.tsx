import AreaSummaryLineChart from "@/app/[lang]/components/AreaSummary/AreaSummaryLineChart";
import style from "./style.module.css";
import { AreasTimeseriesData } from "@/types/types";
import CustomTooltip from "@/app/[lang]/components/CustomTooltip";
import Link from "next/link";
import QuestionMark from "@/app/[lang]/components/Icons/QuestionMark";

interface AreaSummaryDetailsProps {
  dictionary: { [key: string]: any };
  economicCost: string | undefined;
  calculatorIsLoading: boolean;
  calculatorUrl?: string;
  selectedAreaTimeseriesData: AreasTimeseriesData | undefined;
}

const AreaSummaryDetails = ({
  economicCost,
  calculatorIsLoading,
  calculatorUrl,
  selectedAreaTimeseriesData,
  dictionary,
}: AreaSummaryDetailsProps) => {
  const economicCostText = calculatorIsLoading
    ? `${dictionary?.map_ui?.loading}...`
    : economicCost
    ? `${economicCost} ${dictionary?.map_ui?.economic_cost_currency}`
    : "N/A";

  const FigureTooltip = () =>
    !calculatorUrl ? null : (
      <div>
        <CustomTooltip
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
          placement="left"
        >
          <button className={style.tooltipButton}>
            <QuestionMark />
          </button>
        </CustomTooltip>
      </div>
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

      <div className={style.label}>{dictionary?.map_ui?.economic_cost}</div>
      <div className={style.figure}>
        <div className={style.figureText}>{economicCostText}</div>
        <FigureTooltip />
      </div>
    </div>
  );
};

export default AreaSummaryDetails;
