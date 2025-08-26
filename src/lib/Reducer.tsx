import { AREA_TYPES } from "@/constants/map";
import { ActionType, IState } from "@/lib/Store";
import { GeoJSONFeature } from "@/types/types";

export const getAreaType = (key: string) =>
  AREA_TYPES.find((d) => key === d.key);

const Reducer = (state: IState, action: ActionType): IState => {
  switch (action.type) {
    case "SET_MAP_REF":
      return {
        ...state,
        map: action.map,
      };
    case "SET_IS_QUERY_CHECKED":
      return {
        ...state,
        isQueryChecked: action.isQueryChecked,
      };
    case "SET_AREAS_DATA":
      return {
        ...state,
        areasData: action.areasData,
        areasDataIsLoading: action.areasDataIsLoading,
        areasOptions: action.areasData?.features
          ?.filter((d: GeoJSONFeature) => d.properties?.id !== undefined)
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
          ?.sort((a, b) => {
            // place "Whole Amazon" first
            if (a?.value === "AMAZ" && b?.value !== "AMAZ") return -1;
            if (b?.value === "AMAZ" && a?.value !== "AMAZ") return 1;

            // sort by country, then title
            return (
              a?.country?.localeCompare(b?.country) ||
              a?.title?.localeCompare(b?.title)
            );
          }),
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
    case "SET_PENDING_SELECTED_AREA_ID":
      // set it as pending so it will wait for the area data to finish loading to be set
      return {
        ...state,
        pendingSelectedAreaId: action.pendingSelectedAreaId,
      };
    case "SET_SELECTED_AREA_TYPE_BY_KEY":
      return {
        ...state,
        selectedAreaTypeKey: action.selectedAreaTypeKey,
        selectedAreaType: action.selectedAreaTypeKey
          ? getAreaType(action.selectedAreaTypeKey)
          : undefined,
        selectedArea: undefined, // clear when area type changes
        selectedAreaData: undefined,
      };
    case "SHOW_AREA_SUMMARY_MORE_INSIGHTS":
      return {
        ...state,
        showAreaSummaryMoreInsights: action.showAreaSummaryMoreInsights,
      };
    default:
      return state;
  }
};

export default Reducer;
