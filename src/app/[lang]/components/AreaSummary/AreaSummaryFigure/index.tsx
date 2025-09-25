import AreaSummaryLineChart from "@/app/[lang]/components/AreaSummary/AreaSummaryLineChart";
import style from "./style.module.css";
import { AreasTimeseriesData } from "@/types/types";

interface AreaSummaryFigureProps {
  label: string;
  figure: string;
  currency: string;
  selectedAreaTimeseriesData: AreasTimeseriesData | undefined;
}

const AreaSummaryFigure = ({
  label,
  figure,
  currency,
  selectedAreaTimeseriesData,
}: AreaSummaryFigureProps) => {
  const figureText = figure ? `${figure} ${currency}` : "N/A";
  return (
    <div className={style.wrapper}>
      <AreaSummaryLineChart data={selectedAreaTimeseriesData} />

      <div className={style.label}>{label}</div>
      <div className={style.figure}>{figureText}</div>
    </div>
  );
};

export default AreaSummaryFigure;
