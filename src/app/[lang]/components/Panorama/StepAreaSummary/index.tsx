"use client";
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import AreaSummary from "@/app/[lang]/components/AreaSummary";
import { useScrolly } from "@/app/[lang]/components/Panorama/ScrollyProvider";
import { Context } from "@/lib/Store";
import { getColorsForYears, LAYER_YEARS } from "@/constants/map";
import { MapParams } from "@/utils/mapParams";

interface StepAreaSummaryProps {
  dictionary: { [key: string]: any };
  params: MapParams;
  className?: string;
  summaryClassName?: string;
}

// the area summary of the active step flows with the scroll, below its card, so the map
// on the right is kept clear
const StepAreaSummary = ({
  dictionary,
  params,
  className,
  summaryClassName,
}: StepAreaSummaryProps) => {
  const [state] = useContext(Context)!;
  const { activeParams, hideMiningCalculator } = useScrolly();
  const yearsColors = useMemo(() => getColorsForYears(LAYER_YEARS), []);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [placeholderHeight, setPlaceholderHeight] = useState(0);

  // the store only holds the data of the active step's area
  const isShown =
    activeParams === params &&
    !!params.areaId &&
    state.selectedArea?.value === params.areaId;

  // keep track of the summary height, so its space is kept after it is hidden,
  // otherwise the content would jump when the summary above the viewport is removed
  useEffect(() => {
    const element = wrapperRef.current;
    if (!isShown || !element) return;
    const observer = new ResizeObserver(() =>
      setPlaceholderHeight(element.offsetHeight),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [isShown]);

  return (
    <div
      ref={wrapperRef}
      className={className}
      style={isShown ? undefined : { height: placeholderHeight }}
    >
      {isShown && (
        <AreaSummary
          dictionary={dictionary}
          yearsColors={yearsColors}
          isScrollytelling
          hideMiningCalculator={hideMiningCalculator}
          className={summaryClassName}
        />
      )}
    </div>
  );
};

export default StepAreaSummary;
