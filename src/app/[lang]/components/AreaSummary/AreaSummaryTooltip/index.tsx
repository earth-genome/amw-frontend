import CustomTooltip from "@/app/[lang]/components/CustomTooltip";
import QuestionMark from "@/app/[lang]/components/Icons/QuestionMark";
import style from "./style.module.css";

interface AreaSummaryTooltipProps {
  content: React.ReactNode;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

const AreaSummaryTooltip = ({
  content,
  icon = <QuestionMark />,
  children,
}: AreaSummaryTooltipProps) => {
  if (children)
    return (
      <CustomTooltip content={content} placement="top">
        {children}
      </CustomTooltip>
    );

  return (
    <CustomTooltip content={content} placement="top">
      <button className={style.tooltipButton}>{icon}</button>
    </CustomTooltip>
  );
};

export default AreaSummaryTooltip;
