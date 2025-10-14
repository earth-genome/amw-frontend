import useSWR from "swr";

interface MiningLocation {
  country: string;
  regionId: number;
  affectedArea: number;
}

type CalculatorData = {
  totalImpact: number;
};

interface MiningCalculatorResponse {
  calculatorData: CalculatorData;
  calculatorUrl: string;
}

const fetcher = async (
  url: string,
  locations: MiningLocation[]
): Promise<MiningCalculatorResponse> => {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(locations),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();
  const { data: calculatorData, calculatorUrl } = result;

  return { calculatorData, calculatorUrl };
};

interface UseMiningCalculatorReturn {
  calculatorData: CalculatorData | undefined;
  calculatorUrl: string | undefined;
  calculatorIsLoading: boolean;
  calculatorError: Error | undefined;
  mutate: () => void;
}

export const useMiningCalculator = (
  miningLocations: MiningLocation[] | null
): UseMiningCalculatorReturn => {
  // calculator doesn't include Venezuela and French Guyana
  const miningLocationsFiltered = miningLocations?.filter(
    (d) => !["VE", "GF"].includes(d.country)
  );
  const { data, error, isLoading, mutate } = useSWR<
    MiningCalculatorResponse,
    Error
  >(
    miningLocationsFiltered
      ? ["/api/mining-calculator", miningLocationsFiltered]
      : null,
    ([url, locations]: [string, MiningLocation[]]) => fetcher(url, locations),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return {
    calculatorData: data?.calculatorData,
    calculatorUrl: data?.calculatorUrl,
    calculatorIsLoading: isLoading,
    calculatorError: error,
    mutate,
  };
};

export default useMiningCalculator;
