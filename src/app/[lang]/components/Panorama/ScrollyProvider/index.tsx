"use client";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Context } from "@/lib/Store";
import { applyMapParams, MapParams } from "@/utils/mapParams";

// "story": the map follows the scroll, "exploring": the user moves the map freely,
// "exiting": the map flies back to the story view before the story is shown again
type ExploreState = "story" | "exploring" | "exiting";

interface ScrollyContextType {
  activeParams: MapParams | undefined;
  // title of the active step, e.g. the area name
  activeLabel: string | undefined;
  setActiveParams: (_params: MapParams, _label?: string) => void;
  exploreState: ExploreState;
  setExploreState: (_exploreState: ExploreState) => void;
}

const ScrollyContext = createContext<ScrollyContextType | undefined>(undefined);

// holds the map params of the active scrollytelling step and syncs them to the map store
const ScrollyProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useContext(Context)!;
  const [activeStep, setActiveStep] = useState<
    { params: MapParams; label?: string } | undefined
  >(undefined);
  const [exploreState, setExploreState] = useState<ExploreState>("story");

  // keep a ref to the latest state, so we only apply params when the active step changes
  const stateRef = useRef(state);
  stateRef.current = state;

  const exploreStateRef = useRef(exploreState);
  exploreStateRef.current = exploreState;

  // the active step can't change while exploring, the story resumes where it was left
  const setActiveParams = useCallback((params: MapParams, label?: string) => {
    if (exploreStateRef.current !== "story") return;
    setActiveStep({ params, label });
  }, []);

  const activeParams = activeStep?.params;

  useEffect(() => {
    if (!activeParams) return;
    applyMapParams(dispatch, stateRef.current, activeParams);
  }, [activeParams, dispatch]);

  return (
    <ScrollyContext.Provider
      value={{
        activeParams,
        activeLabel: activeStep?.label,
        setActiveParams,
        exploreState,
        setExploreState,
      }}
    >
      {children}
    </ScrollyContext.Provider>
  );
};

export const useScrolly = (): ScrollyContextType => {
  const context = useContext(ScrollyContext);
  if (context === undefined) {
    throw new Error("useScrolly must be used within a ScrollyProvider");
  }
  return context;
};

export default ScrollyProvider;
