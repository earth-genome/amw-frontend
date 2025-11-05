import CustomTooltip from "@/app/[lang]/components/CustomTooltip";
import QuestionMark from "@/app/[lang]/components/Icons/QuestionMark";
import style from "./style.module.css";

interface AreaSummaryTooltipProps {
  content: React.ReactNode;
  icon?: React.ReactNode;
}

const AreaSummaryTooltip = ({
  content,
  icon = <QuestionMark />,
}: AreaSummaryTooltipProps) => {
  return (
    <CustomTooltip content={content} placement="left">
      <button className={style.tooltipButton}>{icon}</button>
    </CustomTooltip>
  );
};

export default AreaSummaryTooltip;
