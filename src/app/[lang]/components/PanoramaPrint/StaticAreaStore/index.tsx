"use client";
import React, { ReactNode, useMemo } from "react";
import { Context, getInitialState, IState } from "@/lib/Store";
import { AREA_TYPES } from "@/constants/map";
import { PrintAreaSummary } from "@/cms/panoramaPrint";
import { AreaData } from "@/types/types";
import { PERMITTED_LANGUAGES } from "@/utils/content";

interface StaticAreaStoreProps {
  children: ReactNode;
  lang: PERMITTED_LANGUAGES;
  dataSnapshot: string;
  summary: PrintAreaSummary;
}

const noop = () => {};

// a read-only map store with a single selected area, so the area components that read the
// store (e.g. the charts and the map layers) can be reused for each area of the print page
const StaticAreaStore = ({
  children,
  lang,
  dataSnapshot,
  summary,
}: StaticAreaStoreProps) => {
  const state = useMemo<IState>(() => {
    const areaType = AREA_TYPES.find((d) => d.key === summary.areaTypeKey);
    // the print data doesn't include the mining locations
    const areaData = {
      ...summary.areaData,
      locations_per_year: {},
    } as AreaData;
    const title = areaType?.renderTitle(areaData) ?? "";

    return {
      ...getInitialState({ lang, dataSnapshot }),
      isQueryChecked: true,
      areasData: [areaData],
      areasTimeseriesData: summary.timeseries,
      selectedAreaTypeKey: summary.areaTypeKey,
      selectedAreaType: areaType,
      selectedArea: { value: areaData.id, label: title, title },
      selectedAreaData: areaData,
      selectedAreaTimeseriesData: summary.timeseries,
      activeYear: String(summary.activeYear),
      isCumulative: summary.isCumulative,
    };
  }, [dataSnapshot, lang, summary]);

  return <Context.Provider value={[state, noop]}>{children}</Context.Provider>;
};

export default StaticAreaStore;
