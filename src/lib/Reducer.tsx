import { ActionType, IState } from "@/lib/Store";

const Reducer = (state: IState, action: ActionType) => {
  switch (action.type) {
    case "SET_AREAS_DATA":
      return {
        ...state,
        areasData: action.areasData,
      };
    case "SET_ACTIVE_AREA":
      return {
        ...state,
        activeArea: action.activeArea,
      };

    default:
      return state;
  }
};

export default Reducer;
