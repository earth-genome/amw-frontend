import { createContext, useReducer, Dispatch } from "react";
import {
  AreaData,
  AreasData,
  AreasTimeseriesData,
  MiningData,
} from "@/types/types";
import Reducer from "@/lib/Reducer";
import { AreaSelectOption } from "@/app/[lang]/components/AreaSelect";
import {
  AREA_TYPES,
  AreaType,
  LAYER_YEARS,
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
  lang: PERMITTED_LANGUAGES;
  isQueryChecked: boolean;
  miningData: MiningData | undefined;
  miningDataIsLoading: boolean;
  areasData: AreasData | undefined;
  areasDataIsLoading: boolean;
  areasDataError: boolean;
  areasTimeseriesData: AreasTimeseriesData | undefined;
  areasTimeseriesDataIsLoading: boolean;
  areasOptions: AreaSelectOption[] | undefined;
  selectedArea: AreaSelectOption | undefined;
  selectedAreaData: AreaData | undefined;
  selectedAreaTimeseriesData: AreasTimeseriesData | undefined;
  pendingSelectedAreaId: string | undefined;
  selectedAreaTypeKey: PERMITTED_AREA_TYPES_KEYS | undefined;
  selectedAreaType: AreaType | undefined;
  areaUnits: PERMITTED_AREA_UNITS;
  hoveredYear: number | undefined;
  activeYearStart: string;
  activeYearEnd: string;
  isEmbed: boolean;
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
      areasDataError: boolean;
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
      type: "SET_AREA_UNITS";
      areaUnits: PERMITTED_AREA_UNITS;
    }
  | {
      type: "SET_HOVERED_YEAR";
      hoveredYear: number | undefined;
    }
  | {
      type: "SET_ACTIVE_YEAR_START";
      activeYearStart: string;
    }
  | {
      type: "SET_ACTIVE_YEAR_END";
      activeYearEnd: string;
    };

export const Context = createContext<
  [IState, Dispatch<ActionType>] | undefined
>(undefined);

const Store = ({
  children,
  lang,
  isBaseRoute,
  isEmbed = false,
}: Readonly<{
  children: React.ReactNode;
  lang: PERMITTED_LANGUAGES;
  isBaseRoute: boolean;
  isEmbed?: boolean;
}>) => {
  const defaultAreaType = isEmbed
    ? AREA_TYPES.filter((d) => d.allowInEmbed)[0]
    : AREA_TYPES[0];
  const initialState: IState = {
    map: null,
    lang: lang,
    isQueryChecked: false,
    miningData: undefined,
    miningDataIsLoading: false,
    areasData: undefined,
    areasDataIsLoading: false,
    areasDataError: false,
    areasTimeseriesData: undefined,
    areasTimeseriesDataIsLoading: false,
    areasOptions: undefined,
    selectedArea: undefined,
    pendingSelectedAreaId: undefined,
    selectedAreaData: undefined,
    selectedAreaTimeseriesData: undefined,
    selectedAreaTypeKey: defaultAreaType.key,
    selectedAreaType: defaultAreaType,
    areaUnits: AREA_UNITS_OPTIONS[0].value as PERMITTED_AREA_UNITS,
    hoveredYear: undefined,
    activeYearStart: String(Math.min(...LAYER_YEARS)),
    activeYearEnd: String(Math.max(...LAYER_YEARS)),
    isEmbed: isEmbed,
  };

  const [state, dispatch] = useReducer(Reducer, initialState);

  useQueryParams({
    state,
    dispatch,
    ignore: !isBaseRoute, // don't use query params in the content pages
  });
  useMiningData({ state, dispatch });
  useAreasData({ state, dispatch, lang });

  return (
    <Context.Provider value={[state, dispatch]}>{children}</Context.Provider>
  );
};

export default Store;
