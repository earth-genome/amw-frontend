import { createContext, useReducer, Dispatch } from "react";
import { AreasData } from "@/types/types";
import { Feature } from "geojson";
import Reducer from "@/lib/Reducer";
import { SingleValue } from "react-select";
import { AreaSelectOption } from "@/app/[lang]/components/AreaSelect";
import { AREA_TYPES, AreaType } from "@/constants/map";

export interface IState {
  areasData: AreasData | undefined;
  areasOptions: AreaSelectOption[] | undefined;
  selectedArea: SingleValue<AreaSelectOption> | undefined;
  selectedAreaData: Feature | undefined;
  selectedAreaType: AreaType | undefined;
}

export type ActionType =
  | { type: "SET_AREAS_DATA"; areasData: AreasData | undefined }
  | {
      type: "SET_SELECTED_AREA";
      selectedArea: SingleValue<AreaSelectOption> | undefined;
    }
  | { type: "SET_SELECTED_AREA_BY_ID"; selectedAreaId: number | undefined }
  | { type: "SET_SELECTED_AREA_TYPE"; selectedAreaType: AreaType | undefined };

export const Context = createContext<
  [IState, Dispatch<ActionType>] | undefined
>(undefined);

const Store = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  const initialState: IState = {
    areasData: undefined,
    areasOptions: undefined,
    selectedArea: undefined,
    selectedAreaData: undefined,
    selectedAreaType: AREA_TYPES[0],
  };

  const [state, dispatch] = useReducer(Reducer, initialState);

  return (
    <Context.Provider value={[state, dispatch]}>{children}</Context.Provider>
  );
};

export default Store;
