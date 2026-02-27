import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getDefaultAreaType, IState } from "@/lib/Store";
import { slugify } from "@/utils/slugify";
import {
  AREA_TYPES,
  ENTIRE_AMAZON_AREA_ID,
  LAYER_YEARS,
} from "@/constants/map";

interface Props {
  state: IState;
  dispatch: React.Dispatch<any>;
  ignore: boolean;
}

const getIsValidAreaTypeKey = (key: string | null): key is string =>
  !!key && AREA_TYPES.some((at) => at.key === key);

export const useQueryParams = ({ state, dispatch, ignore }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // sync state changes to URL (outbound)
  useEffect(() => {
    if (ignore) {
      dispatch({
        type: "SET_IS_QUERY_CHECKED",
        isQueryChecked: true,
      });
      return;
    }
    if (!state?.isQueryChecked) return; // wait for query to be checked

    const params = new URLSearchParams(window.location.search);
    let shouldUpdate = false;

    // sync areaType
    const currentAreaTypeKey = params.get("areaType");
    if (state.selectedAreaTypeKey !== currentAreaTypeKey) {
      if (state.selectedAreaTypeKey) {
        params.set("areaType", state.selectedAreaTypeKey);
      } else {
        params.delete("areaType");
      }
      shouldUpdate = true;
    }

    // Sync areaId
    const currentSelectedAreaId = params.get("areaId");
    if (
      state.selectedArea?.value !== currentSelectedAreaId &&
      !state?.pendingSelectedAreaId
    ) {
      if (state.selectedArea?.value) {
        params.set("areaId", String(state.selectedArea?.value));
      } else {
        params.delete("areaId");
      }
      shouldUpdate = true;
    }

    // sync areaName - this is not used in state, just to make the url look prettier
    const currentAreaName = params.get("areaName");
    const stateAreaName = state.selectedArea?.title;
    if (stateAreaName !== currentAreaName) {
      if (stateAreaName) {
        params.set("areaName", encodeURIComponent(slugify(stateAreaName)));
      } else {
        params.delete("areaName");
      }
      shouldUpdate = true;
    }

    // sync yearStart
    if (params.get("yearStart") !== state.activeYearStart) {
      params.set("yearStart", state.activeYearStart);
      shouldUpdate = true;
    }

    // sync yearEnd
    if (params.get("yearEnd") !== state.activeYearEnd) {
      params.set("yearEnd", state.activeYearEnd);
      shouldUpdate = true;
    }

    if (shouldUpdate) {
      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [
    dispatch,
    ignore,
    pathname,
    router,
    state?.isQueryChecked,
    state?.pendingSelectedAreaId,
    state.selectedArea?.title,
    state.selectedArea?.value,
    state.selectedAreaTypeKey,
    state.activeYearStart,
    state.activeYearEnd,
  ]);

  // load initial state from URL (inbound) - only runs once on mount
  useEffect(() => {
    if (ignore) return;

    const areaTypeKeyParam = searchParams.get("areaType");
    const isValidAreaTypeKey = getIsValidAreaTypeKey(areaTypeKeyParam);

    if (!isValidAreaTypeKey) {
      // if invalid area type, clear query, set defaults, and return early
      router.replace(pathname);
      dispatch({
        type: "SET_SELECTED_AREA_TYPE_BY_KEY",
        selectedAreaTypeKey: getDefaultAreaType()?.key,
      });
      dispatch({
        type: "SET_PENDING_SELECTED_AREA_ID",
        pendingSelectedAreaId: ENTIRE_AMAZON_AREA_ID,
      });
      dispatch({
        type: "SET_IS_QUERY_CHECKED",
        isQueryChecked: true,
      });
      return;
    }

    // only dispatch if we have URL params and they're different from current state
    if (areaTypeKeyParam !== state.selectedAreaTypeKey) {
      dispatch({
        type: "SET_SELECTED_AREA_TYPE_BY_KEY",
        selectedAreaTypeKey: areaTypeKeyParam,
      });
    }

    const pendingAreaId = searchParams.get("areaId");

    if (pendingAreaId && pendingAreaId !== state.selectedArea?.value) {
      dispatch({
        type: "SET_PENDING_SELECTED_AREA_ID",
        pendingSelectedAreaId: pendingAreaId,
      });
    }

    // restore year range from URL params
    const yearStart = searchParams.get("yearStart");
    const yearEnd = searchParams.get("yearEnd");
    if (yearStart && LAYER_YEARS.includes(Number(yearStart))) {
      dispatch({
        type: "SET_ACTIVE_YEAR_START",
        activeYearStart: yearStart,
      });
    }
    if (yearEnd && LAYER_YEARS.includes(Number(yearEnd))) {
      dispatch({
        type: "SET_ACTIVE_YEAR_END",
        activeYearEnd: yearEnd,
      });
    }

    // if there is no area set and it's the countries level, set entire amazon as default area
    if (
      !pendingAreaId &&
      !state.selectedArea?.value &&
      state.selectedAreaTypeKey === "countries" &&
      !state.isEmbed
    ) {
      dispatch({
        type: "SET_PENDING_SELECTED_AREA_ID",
        pendingSelectedAreaId: ENTIRE_AMAZON_AREA_ID,
      });
    }

    dispatch({
      type: "SET_IS_QUERY_CHECKED",
      isQueryChecked: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // only runs on mount

  return null;
};
