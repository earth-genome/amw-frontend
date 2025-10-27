import debounce from "lodash.debounce";
import { useState, useEffect } from "react";

interface WindowSize {
  width: number;
  height: number;
}

const useWindowSize = (debounceDelayMs: number = 250): WindowSize | undefined => {
  const [windowSize, setWindowSize] = useState<WindowSize | undefined>(undefined);

  useEffect(() => {
    const getCurrentWindowSize = (): WindowSize => {
      const { innerWidth: width, innerHeight: height } = window;
      return {
        width,
        height,
      };
    };

    const handleWindowResize = () => setWindowSize(getCurrentWindowSize());
    const debouncedHandleWindowResize = debounce(handleWindowResize, debounceDelayMs);

    window.addEventListener("resize", debouncedHandleWindowResize);

    setWindowSize(getCurrentWindowSize());

    return () => window.removeEventListener("resize", debouncedHandleWindowResize);
  }, [debounceDelayMs]);

  return windowSize;
};

export default useWindowSize;