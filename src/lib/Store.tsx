import { createContext, useReducer, Dispatch } from "react";
import {
  AreaData,
  AreasData,
  AreasTimeseriesData,
  MiningData,
} from "@/types/types";
import Reducer from "@/lib/Reducer";
import { SingleValue } from "react-select";
import { AreaSelectOption } from "@/app/[lang]/components/AreaSelect";
import {
  AREA_TYPES,
  AreaType,
  PERMITTED_AREA_TYPES_KEYS,
} from "@/constants/map";
import { useQueryParams } from "@/hooks/useQueryParams";
import useAreasData from "@/hooks/useAreasData";
import { MapRef } from "react-map-gl";
import {
  AREA_UNITS_OPTIONS,
  PERMITTED_AREA_UNITS,
} from "@/app/[lang]/components/Footer";
import useMiningData from "@/hooks/useMiningData";
import { PERMITTED_LANGUAGES } from "@/utils/content";

export interface IState {
  map: MapRef | null;
  isQueryChecked: boolean;
  miningData: MiningData | undefined;
  miningDataIsLoading: boolean;
  areasData: AreasData | undefined;
  areasDataIsLoading: boolean;
  areasTimeseriesData: AreasTimeseriesData | undefined;
  areasTimeseriesDataIsLoading: boolean;
  areasOptions: AreaSelectOption[] | undefined;
  selectedArea: SingleValue<AreaSelectOption> | undefined;
  selectedAreaData: AreaData;
  selectedAreaTimeseriesData: AreasTimeseriesData | undefined;
  pendingSelectedAreaId: string | undefined;
  selectedAreaTypeKey: PERMITTED_AREA_TYPES_KEYS | undefined;
  selectedAreaType: AreaType | undefined;
  showAreaSummaryMoreInsights: boolean;
  areaUnits: PERMITTED_AREA_UNITS;
}

export type ActionType =
  | { type: "SET_MAP_REF"; map: MapRef | null }
  | { type: "SET_IS_QUERY_CHECKED"; isQueryChecked: boolean }
  | {
      type: "SET_MINING_DATA";
      miningData: MiningData | undefined;
      miningDataIsLoading: boolean;
    }
  | {
      type: "SET_AREAS_DATA";
      areasData: AreasData | undefined;
      areasDataIsLoading: boolean;
    }
  | {
      type: "SET_AREAS_TIMESERIES_DATA";
      areasTimeseriesData: AreasTimeseriesData | undefined;
      areasTimeseriesDataIsLoading: boolean;
    }
  | { type: "SET_SELECTED_AREA_BY_ID"; selectedAreaId: string | undefined }
  | {
      type: "SET_PENDING_SELECTED_AREA_ID";
      pendingSelectedAreaId: string | undefined;
    }
  | {
      type: "SET_SELECTED_AREA_TYPE_BY_KEY";
      selectedAreaTypeKey: PERMITTED_AREA_TYPES_KEYS | undefined;
    }
  | {
      type: "SHOW_AREA_SUMMARY_MORE_INSIGHTS";
      showAreaSummaryMoreInsights: boolean;
    }
  | {
      type: "SET_AREA_UNITS";
      areaUnits: PERMITTED_AREA_UNITS;
    };

export const Context = createContext<
  [IState, Dispatch<ActionType>] | undefined
>(undefined);

const Store = ({
  children,
  lang,
}: Readonly<{ children: React.ReactNode; lang: PERMITTED_LANGUAGES }>) => {
  const initialState: IState = {
    map: null,
    isQueryChecked: false,
    miningData: undefined,
    miningDataIsLoading: false,
    areasData: undefined,
    areasDataIsLoading: false,
    areasTimeseriesData: undefined,
    areasTimeseriesDataIsLoading: false,
    areasOptions: undefined,
    selectedArea: undefined,
    pendingSelectedAreaId: undefined,
    selectedAreaData: undefined,
    selectedAreaTimeseriesData: undefined,
    selectedAreaTypeKey: AREA_TYPES[0].key,
    selectedAreaType: AREA_TYPES[0],
    showAreaSummaryMoreInsights: false,
    areaUnits: AREA_UNITS_OPTIONS[0].value as PERMITTED_AREA_UNITS,
  };

  const [state, dispatch] = useReducer(Reducer, initialState);

  useQueryParams({ state, dispatch });
  useMiningData({ state, dispatch });
  useAreasData({ state, dispatch, lang });

  return (
    <Context.Provider value={[state, dispatch]}>{children}</Context.Provider>
  );
};

export default Store;
