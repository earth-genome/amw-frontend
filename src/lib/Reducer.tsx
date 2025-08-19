import { AREA_TYPES } from "@/constants/map";
import { ActionType, IState } from "@/lib/Store";
import { GeoJSONFeature } from "@/types/types";

export const getAreaType = (key: string) =>
  AREA_TYPES.find((d) => key === d.key);

const Reducer = (state: IState, action: ActionType): IState => {
  switch (action.type) {
    case "SET_AREAS_DATA":
      return {
        ...state,
        areasData: action.areasData,
        areasOptions: action.areasData?.features
          ?.filter((d: GeoJSONFeature) => d.properties?.id)
          ?.map((d: GeoJSONFeature) => d.properties)
          ?.map((d) => ({
            value: d.id,
            // label is used for searching
            label: state.selectedAreaType?.renderLabel
              ? state.selectedAreaType.renderLabel(d)
              : String(d.id),
            title: state.selectedAreaType?.renderTitle
              ? state.selectedAreaType.renderTitle(d) ||
                // dictionary?.map_ui?.unknown
                "N/A"
              : String(d.id),
            status: state.selectedAreaType?.renderStatus
              ? state.selectedAreaType.renderStatus(d)
              : undefined,
            country: d.country,
            showCountry: state.selectedAreaType?.showCountry,
          }))
          ?.sort(
            (a, b) =>
              a?.country?.localeCompare(b?.country) ||
              a?.title?.localeCompare(b?.title)
          ),
      };
    case "SET_SELECTED_AREA_BY_ID":
      return {
        ...state,
        selectedArea: state.areasOptions?.find(
          (d) => d?.value === action.selectedAreaId
        ),
        selectedAreaData: state.areasData?.features.find(
          (d) => d.properties.id === action.selectedAreaId
        ),
      };
    case "SET_SELECTED_AREA":
      return {
        ...state,
        selectedArea: action.selectedArea,
        selectedAreaData: state.areasData?.features.find(
          (d) => d.properties.id === action.selectedArea?.value
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
