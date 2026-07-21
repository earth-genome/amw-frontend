import { AREA_IDS_TO_HIDE } from "@/constants/map";
import { IState } from "@/lib/Store";
import { AreasData } from "@/types/types";
import { PERMITTED_LANGUAGES } from "@/utils/content";
import { useEffect } from "react";
import useSWR from "swr";

// route any upstream URL through our same-origin API proxy so the browser
// never makes a cross-origin request (avoids the CloudFront CORS/preflight issue)
const proxied = (url: string | null) =>
  url ? `/api/proxy?src=${encodeURIComponent(url)}` : null;

const fetcher = async (...args: Parameters<typeof fetch>) => {
  const res = await fetch(...args);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
};

interface Props {
  state: IState;
  dispatch: React.Dispatch<any>;
  lang: PERMITTED_LANGUAGES;
}

const swrConfig = {
  revalidateOnFocus: false, // don’t refetch when window regains focus
  revalidateOnReconnect: false, // don’t refetch when reconnecting
  refreshInterval: 0, // don’t poll automatically
};

const useAreasData = ({ state, dispatch, lang }: Props) => {
  const { selectedAreaType, pendingSelectedAreaId, isQueryChecked } = state;
  // wait for query to be checked before loading data
  const areasDataUrl =
    selectedAreaType && isQueryChecked ? selectedAreaType.url : null;
  const areasTimeseriesDataUrl =
    selectedAreaType && isQueryChecked ? selectedAreaType.timeseriesUrl : null;

  // build the real upstream URL first (with locale if needed), then proxy it
  const areasDataKey = proxied(
    areasDataUrl
      ? selectedAreaType?.useLocale
        ? `${areasDataUrl}?locale=${lang}`
        : areasDataUrl
      : null,
  );

  const {
    data: areasData,
    error: areasDataError,
    isLoading: areasDataIsLoading,
  } = useSWR<AreasData>(areasDataKey, fetcher, swrConfig);

  useEffect(() => {
    if (areasDataIsLoading || areasDataError) {
      dispatch({
        type: "SET_AREAS_DATA",
        areasData: undefined,
        areasDataIsLoading: areasDataIsLoading,
        areasDataError: areasDataError,
      });
      return;
    }

    const areasDataFiltered = areasData?.filter(
      (d) =>
        // HACK: filter out two specific areas, Raposa Serra do Sol IT and Apolobamba PA
        !AREA_IDS_TO_HIDE.includes(d.id),
    );

    dispatch({
      type: "SET_AREAS_DATA",
      areasData: areasDataFiltered,
      areasDataIsLoading: areasDataIsLoading,
      areasDataError: areasDataError,
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

  const {
    data: areasTimeseriesData,
    error: areasTimeseriesDataError,
    isLoading: areasTimeseriesDataIsLoading,
  } = useSWR<AreasData>(proxied(areasTimeseriesDataUrl), fetcher, swrConfig);

  useEffect(() => {
    if (areasTimeseriesDataIsLoading || areasTimeseriesDataError) {
      dispatch({
        type: "SET_AREAS_TIMESERIES_DATA",
        areasTimeseriesData: undefined,
        areasTimeseriesDataIsLoading: areasTimeseriesDataIsLoading,
      });
      return;
    }
    dispatch({
      type: "SET_AREAS_TIMESERIES_DATA",
      areasTimeseriesData: areasTimeseriesData,
      areasTimeseriesDataIsLoading: areasTimeseriesDataIsLoading,
    });
  }, [
    areasTimeseriesData,
    areasTimeseriesDataError,
    areasTimeseriesDataIsLoading,
    dispatch,
  ]);

  return null;
};

export default useAreasData;
