import { useState, useEffect, useCallback, RefObject } from "react";
import useWindowSize from "./useWindowSize";

interface ChartDimensions {
  width: number;
  height: number;
}

const LAYOUT_UPDATE_DELAY_MS = 25;

const useChartDimensions: (_elementRef: RefObject<HTMLElement>) => ChartDimensions = (elementRef) => {
  const windowSize = useWindowSize();
  const [chartDimensions, setChartDimensions] = useState<ChartDimensions>({
    width: 0,
    height: 0,
  });

  const measureElementDimensions = useCallback(() => {
    if (elementRef.current) {
      const elementRect = elementRef.current.getBoundingClientRect();
      setChartDimensions({
        width: elementRect.width,
        height: elementRect.height,
      });
    }
  }, [elementRef]);

  useEffect(() => {
    measureElementDimensions();
  }, [measureElementDimensions]);

  useEffect(() => {
    const layoutUpdateTimeoutId = setTimeout(() => {
      measureElementDimensions();
    }, LAYOUT_UPDATE_DELAY_MS);

    return () => clearTimeout(layoutUpdateTimeoutId);
  }, [windowSize?.width, windowSize?.height, measureElementDimensions]);

  return chartDimensions;
};

export default useChartDimensions;