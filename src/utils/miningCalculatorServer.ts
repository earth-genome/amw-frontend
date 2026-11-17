import type { MiningLocation } from "@/hooks/useMiningCalculator";

// server only: the api key must not reach the client

interface MiningCalculatorResult {
  data: { totalImpact: number; dataId?: string; [key: string]: any };
  calculatorUrl: string;
}

export class MiningCalculatorError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

// calls the Mining Impacts Calculator with the mining locations of an area
export const fetchMiningCalculator = async (
  miningLocations: MiningLocation[],
): Promise<MiningCalculatorResult> => {
  const BASE_URL = process.env.MINING_CALCULATOR_BASE_URL;
  const API_KEY = process.env.MINING_CALCULATOR_API_KEY;

  if (!BASE_URL || !API_KEY) {
    throw new MiningCalculatorError(
      "Missing required environment variables",
      500,
    );
  }

  const apiUrl = `${BASE_URL}/api`;
  const defaultHeaders = {
    "Content-Type": "application/json",
    "x-api-key": API_KEY,
  };

  const response = await fetch(`${apiUrl}/calculate`, {
    method: "POST",
    headers: defaultHeaders,
    body: JSON.stringify({ locations: miningLocations }),
  });

  if (!response.ok) {
    throw new MiningCalculatorError(
      "Failed to fetch calculator data",
      response.status,
    );
  }

  const data = await response.json();

  // construct calculator url
  const calculatorUrl = `${BASE_URL}/map?dataId=${data.dataId}`;

  return { data, calculatorUrl };
};
