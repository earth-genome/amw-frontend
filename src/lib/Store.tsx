import { createContext, useReducer, Dispatch } from "react";
import { AreasData } from "@/types/types";
import Reducer from "@/lib/Reducer";

// Define the state interface with all properties from the reducer
export interface IState {
  areasData: AreasData | undefined;
  activeArea: string | undefined;
}

export type ActionType =
  | { type: "SET_AREAS_DATA"; areasData: AreasData | undefined }
  | { type: "SET_ACTIVE_AREA"; activeArea: string | undefined };

// Create the context with proper typing
export const Context = createContext<
  [IState, Dispatch<ActionType>] | undefined
>(undefined);

const Store = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  const initialState: IState = {
    areasData: undefined,
    activeArea: undefined,
  };

  const [state, dispatch] = useReducer(Reducer, initialState);

  return (
    <Context.Provider value={[state, dispatch]}>{children}</Context.Provider>
  );
};

export default Store;
