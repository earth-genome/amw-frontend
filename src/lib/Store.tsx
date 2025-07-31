import { createContext, useReducer, Dispatch } from "react";
import { AreasData, GeoJSONFeature } from "@/types/types";
import Reducer from "@/lib/Reducer";
import { SingleValue } from "react-select";
import { AllGeoJSON } from "@turf/turf";
import { AreaSelectOption } from "@/app/[lang]/components/AreaSelect";

export interface IState {
  areasData: AreasData | undefined;
  selectedArea: SingleValue<AreaSelectOption> | undefined;
  selectedAreaData: AllGeoJSON | undefined;
}

export type ActionType =
  | { type: "SET_AREAS_DATA"; areasData: AreasData | undefined }
  | {
      type: "SET_SELECTED_AREA";
      selectedArea: SingleValue<AreaSelectOption> | undefined;
    };

export const Context = createContext<
  [IState, Dispatch<ActionType>] | undefined
>(undefined);

const Store = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  const initialState: IState = {
    areasData: undefined,
    selectedArea: undefined,
    selectedAreaData: undefined,
  };

  const [state, dispatch] = useReducer(Reducer, initialState);

  return (
    <Context.Provider value={[state, dispatch]}>{children}</Context.Provider>
  );
};

export default Store;
