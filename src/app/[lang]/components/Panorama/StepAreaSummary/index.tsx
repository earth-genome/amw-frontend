"use client";
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import AreaSummary from "@/app/[lang]/components/AreaSummary";
import { useScrolly } from "@/app/[lang]/components/Panorama/ScrollyProvider";
import { SCROLLY_MOBILE_BREAKPOINT } from "@/app/[lang]/components/Panorama/constants";
import { Context } from "@/lib/Store";
import { getColorsForYears, LAYER_YEARS } from "@/constants/map";
import { MapParams } from "@/utils/mapParams";
import useWindowSize from "@/hooks/useWindowSize";

interface StepAreaSummaryProps {
  dictionary: { [key: string]: any };
  params: MapParams;
  className?: string;
  summaryClassName?: string;
}

// on mobile, the area summary of the active step flows with the scroll, below its card
const StepAreaSummary = ({
  dictionary,
  params,
  className,
  summaryClassName,
}: StepAreaSummaryProps) => {
  const [state] = useContext(Context)!;
  const { activeParams } = useScrolly();
  const windowSize = useWindowSize();
  const yearsColors = useMemo(() => getColorsForYears(LAYER_YEARS), []);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [placeholderHeight, setPlaceholderHeight] = useState(0);

  const isMobile =
    windowSize !== undefined && windowSize.width <= SCROLLY_MOBILE_BREAKPOINT;
  // the store only holds the data of the active step's area
  const isShown =
    isMobile &&
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

  if (!isMobile) return null;

  return (
    <div
      ref={wrapperRef}
      className={className}
      style={isShown ? undefined : { height: placeholderHeight }}
    >
      {isShown && (
        <AreaSummary
          dictionary={dictionary}
          maxYear={LAYER_YEARS[LAYER_YEARS.length - 1]}
          yearsColors={yearsColors}
          isScrollytelling
          className={summaryClassName}
        />
      )}
    </div>
  );
};

export default StepAreaSummary;
