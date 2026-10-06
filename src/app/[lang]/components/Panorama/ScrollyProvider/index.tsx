"use client";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Context } from "@/lib/Store";
import { applyMapParams, MapParams } from "@/utils/mapParams";

interface ScrollyContextType {
  activeParams: MapParams | undefined;
  setActiveParams: (_params: MapParams) => void;
}

const ScrollyContext = createContext<ScrollyContextType | undefined>(undefined);

// holds the map params of the active scrollytelling step and syncs them to the map store
const ScrollyProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useContext(Context)!;
  const [activeParams, setActiveParams] = useState<MapParams | undefined>(
    undefined,
  );

  // keep a ref to the latest state, so we only apply params when the active step changes
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    if (!activeParams) return;
    applyMapParams(dispatch, stateRef.current, activeParams);
  }, [activeParams, dispatch]);

  return (
    <ScrollyContext.Provider value={{ activeParams, setActiveParams }}>
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
