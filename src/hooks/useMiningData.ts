import { MINING_DATA_URL } from "@/constants/map";
import { IState } from "@/lib/Store";
import { useEffect } from "react";
import useSWR from "swr";

const fetcher = (...args: Parameters<typeof fetch>) =>
  fetch(...args).then((res) => res.json());

interface Props {
  state: IState;
  dispatch: React.Dispatch<any>;
}

const useMiningData = ({ state, dispatch }: Props) => {
  const {
    data: miningData,
    error: miningDataError,
    isLoading: miningDataIsLoading,
  } = useSWR(MINING_DATA_URL, fetcher);

  useEffect(() => {
    if (miningDataIsLoading || miningDataError) {
      dispatch({
        type: "SET_MINING_DATA",
        miningData: undefined,
        miningDataIsLoading: miningDataIsLoading,
      });
      return;
    }
    dispatch({
      type: "SET_MINING_DATA",
      miningData: miningData,
      miningDataIsLoading: miningDataIsLoading,
    });
  }, [dispatch, miningData, miningDataError, miningDataIsLoading]);

  return null;
};

export default useMiningData;
