import { ActionType, IState } from "@/lib/Store";

const Reducer = (state: IState, action: ActionType) => {
  switch (action.type) {
    case "SET_AREAS_DATA":
      return {
        ...state,
        areasData: action.areasData,
      };
    case "SET_SELECTED_AREA":
      return {
        ...state,
        selectedArea: action.selectedArea,
        selectedAreaData: state.areasData?.features.find(
          (d) => String(d.properties.id) === action.selectedArea?.value
        ),
      };

    default:
      return state;
  }
};

export default Reducer;
