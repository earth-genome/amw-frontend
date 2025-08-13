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
  return (
    <div className={style.wrapper}>
      <div className={style.label}>{label}</div>
      <div className={style.figure}>
        {figure} {currency}
      </div>
    </div>
  );
};

export default AreaSummaryFigure;
