import AreaSummaryLineChart from "@/app/[lang]/components/AreaSummary/AreaSummaryLineChart";
import style from "./style.module.css";
import { AreasTimeseriesData } from "@/types/types";
import CustomTooltip from "@/app/[lang]/components/CustomTooltip";
import Link from "next/link";
import QuestionMark from "@/app/[lang]/components/Icons/QuestionMark";

interface AreaSummaryFigureProps {
  dictionary: { [key: string]: any };
  label: string;
  figure: string | undefined;
  calculatorIsLoading: boolean;
  calculatorUrl?: string;
  currency: string;
  selectedAreaTimeseriesData: AreasTimeseriesData | undefined;
}

const AreaSummaryFigure = ({
  label,
  figure,
  calculatorIsLoading,
  calculatorUrl,
  currency,
  selectedAreaTimeseriesData,
  dictionary,
}: AreaSummaryFigureProps) => {
  const figureText = calculatorIsLoading
    ? `${dictionary?.map_ui?.loading}...`
    : figure
    ? `${figure} ${currency}`
    : "N/A";

  const FigureTooltip = () =>
    !calculatorUrl ? null : (
      <div>
        <CustomTooltip
          content={
            <div>
              <p>
                Economic cost is estimated using the Mining Impacts Calculator.
              </p>
              <p>
                See the{" "}
                <Link
                  href={calculatorUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#ecaf00" }}
                >
                  detailed analysis here
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
      <div className={style.label}>{dictionary?.map_ui?.area_over_time}</div>
      {selectedAreaTimeseriesData && (
        <AreaSummaryLineChart data={selectedAreaTimeseriesData} />
      )}

      <div className={style.label}>{label}</div>
      <div className={style.figure}>
        <div className={style.figureText}>{figureText}</div>
        <FigureTooltip />
      </div>
    </div>
  );
};

export default AreaSummaryFigure;
