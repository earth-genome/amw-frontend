import CustomTooltip from "@/app/[lang]/components/CustomTooltip";
import QuestionMark from "@/app/[lang]/components/Icons/QuestionMark";
import style from "./style.module.css";

interface AreaSummaryTooltipProps {
  content: React.ReactNode;
}

const AreaSummaryTooltip = ({ content }: AreaSummaryTooltipProps) => {
  return (
    <CustomTooltip content={content} placement="left">
      <button className={style.tooltipButton}>
        <QuestionMark />
      </button>
    </CustomTooltip>
  );
};

export default AreaSummaryTooltip;
