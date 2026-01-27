import { MINING_DATA_URLS } from "@/constants/map";
import { IState } from "@/lib/Store";
import { useEffect } from "react";
import useSWR from "swr";

const fetcher = (urls: string[]) =>
  Promise.all(
    urls.map((url) =>
      fetch(url)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Failed to fetch: ${url}`);
          }
          return res.json();
        })
        .catch((error) => {
          console.error(`Error fetching ${url}:`, error);
          return null; // return null on error, so we don’t break the whole Promise.all
        })
    )
  );

interface Props {
  state: IState;
  dispatch: React.Dispatch<any>;
}

const swrConfig = {
  revalidateOnFocus: false, // don’t refetch when window regains focus
  revalidateOnReconnect: false, // don’t refetch when reconnecting
  refreshInterval: 0, // don’t poll automatically
};

// eslint-disable-next-line no-unused-vars
const useMiningData = ({ state, dispatch }: Props) => {
  const {
    data: miningDataArray,
    error: miningDataError,
    isLoading: miningDataIsLoading,
  } = useSWR(MINING_DATA_URLS, fetcher, swrConfig);

  useEffect(() => {
    if (miningDataIsLoading || miningDataError) {
      dispatch({
        type: "SET_MINING_DATA",
        miningData: undefined,
        miningDataIsLoading,
      });
      return;
    }

    // combine all geojson features together
    if (miningDataArray) {
      const combinedFeatures = miningDataArray.flatMap(
        (geojson) => geojson?.features || [] // safe access with fallback to empty array
      );
      const combinedGeoJSON = {
        type: "FeatureCollection",
        features: combinedFeatures,
      };

      dispatch({
        type: "SET_MINING_DATA",
        miningData: combinedGeoJSON,
        miningDataIsLoading,
      });
    }
  }, [dispatch, miningDataArray, miningDataError, miningDataIsLoading]);

  return null;
};

export default useMiningData;
