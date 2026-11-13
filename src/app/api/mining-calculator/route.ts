import { NextRequest, NextResponse } from "next/server";
import {
  fetchMiningCalculator,
  MiningCalculatorError,
} from "@/utils/miningCalculatorServer";

export async function POST(request: NextRequest) {
  try {
    const miningLocations = await request.json();

    const { data, calculatorUrl } = await fetchMiningCalculator(miningLocations);

    // return only the data and calculatorurl
    return NextResponse.json({
      data,
      calculatorUrl,
    });
  } catch (error) {
    if (error instanceof MiningCalculatorError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }
    console.error("Mining calculator proxy error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
