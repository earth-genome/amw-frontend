import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { IState } from "@/lib/Store";
import { slugify } from "@/utils/slugify";

interface Props {
  state: IState;
  dispatch: React.Dispatch<any>;
}

export const useQueryParams = ({ state, dispatch }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // sync state changes to URL (outbound)
  useEffect(() => {
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

    if (shouldUpdate) {
      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [
    pathname,
    router,
    state?.isQueryChecked,
    state?.pendingSelectedAreaId,
    state.selectedArea?.title,
    state.selectedArea?.value,
    state.selectedAreaTypeKey,
  ]);

  // load initial state from URL (inbound) - only runs once on mount
  useEffect(() => {
    const areaTypeKey = searchParams.get("areaType");
    const pendingAreaId = searchParams.get("areaId");

    // only dispatch if we have URL params and they're different from current state
    if (areaTypeKey && areaTypeKey !== state.selectedAreaTypeKey) {
      dispatch({
        type: "SET_SELECTED_AREA_TYPE_BY_KEY",
        selectedAreaTypeKey: areaTypeKey,
      });
    }

    if (pendingAreaId && pendingAreaId !== state.selectedArea?.value) {
      dispatch({
        type: "SET_PENDING_SELECTED_AREA_ID",
        pendingSelectedAreaId: pendingAreaId,
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
