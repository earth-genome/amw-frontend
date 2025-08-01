import { AREA_TYPES } from "@/constants/map";
import { ActionType, IState } from "@/lib/Store";

export const getAreaType = (key: string) =>
  AREA_TYPES.find((d) => key === d.key);

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
    case "SET_SELECTED_AREA_TYPE":
      return {
        ...state,
        selectedAreaType: action.selectedAreaType,
        selectedArea: undefined, // clear when area type changes
      };
    default:
      return state;
  }
};

export default Reducer;
