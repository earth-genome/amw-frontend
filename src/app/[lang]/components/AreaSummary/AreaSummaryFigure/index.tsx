import style from "./style.module.css";

interface AreaSummaryFigureProps {
  label: string;
  figure: string;
  currency: string;
}

const AreaSummaryFigure = ({
  label,
  figure,
  currency,
}: AreaSummaryFigureProps) => {
  const figureText = figure ? `${figure} ${currency}` : "N/A"
  return (
    <div className={style.wrapper}>
      <div className={style.label}>{label}</div>
      <div className={style.figure}>
        {figureText}
      </div>
    </div>
  );
};

export default AreaSummaryFigure;
