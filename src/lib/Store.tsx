import { createContext, useReducer, Dispatch } from "react";
import { AreaData, AreasData, PERMITTED_AREA_UNITS } from "@/types/types";
import Reducer from "@/lib/Reducer";
import { SingleValue } from "react-select";
import { AreaSelectOption } from "@/app/[lang]/components/AreaSelect";
import { AREA_TYPES, AreaType } from "@/constants/map";
import { useQueryParams } from "../../hooks/useQueryParams";
import useAreasData from "../../hooks/useAreasData";
import { MapRef } from "react-map-gl";

export interface IState {
  map: MapRef | null;
  isQueryChecked: boolean;
  areasData: AreasData | undefined;
  areasDataIsLoading: boolean;
  areasOptions: AreaSelectOption[] | undefined;
  selectedArea: SingleValue<AreaSelectOption> | undefined;
  selectedAreaData: AreaData;
  pendingSelectedAreaId: string | undefined;
  selectedAreaTypeKey: string | undefined;
  selectedAreaType: AreaType | undefined;
  showAreaSummaryMoreInsights: boolean;
  areaUnits: PERMITTED_AREA_UNITS;
}

export type ActionType =
  | { type: "SET_MAP_REF"; map: MapRef | null }
  | { type: "SET_IS_QUERY_CHECKED"; isQueryChecked: boolean }
  | {
      type: "SET_AREAS_DATA";
      areasData: AreasData | undefined;
      areasDataIsLoading: boolean;
    }
  | { type: "SET_SELECTED_AREA_BY_ID"; selectedAreaId: string | undefined }
  | {
      type: "SET_PENDING_SELECTED_AREA_ID";
      pendingSelectedAreaId: string | undefined;
    }
  | {
      type: "SET_SELECTED_AREA_TYPE_BY_KEY";
      selectedAreaTypeKey: string | undefined;
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

const Store = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  const initialState: IState = {
    map: null,
    isQueryChecked: false,
    areasData: undefined,
    areasDataIsLoading: false,
    areasOptions: undefined,
    selectedArea: undefined,
    pendingSelectedAreaId: undefined,
    selectedAreaData: undefined,
    selectedAreaTypeKey: AREA_TYPES[0].key,
    selectedAreaType: AREA_TYPES[0],
    showAreaSummaryMoreInsights: false,
    areaUnits: "hectares",
  };

  const [state, dispatch] = useReducer(Reducer, initialState);

  useQueryParams({ state, dispatch });
  useAreasData({ state, dispatch });

  return (
    <Context.Provider value={[state, dispatch]}>{children}</Context.Provider>
  );
};

export default Store;
