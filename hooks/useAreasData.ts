import { IState } from "@/lib/Store";
import { AreasData } from "@/types/types";
import { useEffect } from "react";
import useSWR from "swr";

const fetcher = (...args: Parameters<typeof fetch>) =>
  fetch(...args).then((res) => res.json());

interface Props {
  state: IState;
  dispatch: React.Dispatch<any>;
}

const useAreasData = ({ state, dispatch }: Props) => {
  const { selectedAreaType, pendingSelectedAreaId, isQueryChecked } = state;
  // wait for query to be checked before loading data
  const areasDataUrl =
    selectedAreaType && isQueryChecked ? selectedAreaType.url : null;

  const {
    data: areasData,
    error: areasDataError,
    isLoading: areasDataIsLoading,
  } = useSWR<AreasData>(areasDataUrl, fetcher);

  useEffect(() => {
    if (areasDataIsLoading || areasDataError) {
      dispatch({
        type: "SET_AREAS_DATA",
        areasData: undefined,
        areasDataIsLoading: areasDataIsLoading,
      });
      return;
    }
    dispatch({
      type: "SET_AREAS_DATA",
      areasData: areasData,
      areasDataIsLoading: areasDataIsLoading,
    });

    // if there is a pending area id to be set from the query parameters
    if (pendingSelectedAreaId) {
      dispatch({
        type: "SET_SELECTED_AREA_BY_ID",
        selectedAreaId: pendingSelectedAreaId,
      });
      dispatch({
        type: "SET_PENDING_SELECTED_AREA_ID",
        pendingSelectedAreaId: undefined,
      });
    }
  }, [
    areasData,
    areasDataError,
    areasDataIsLoading,
    dispatch,
    pendingSelectedAreaId,
  ]);

  return null;
};

export default useAreasData;
