import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const miningLocations = await request.json();

    const BASE_URL = process.env.MINING_CALCULATOR_BASE_URL;
    const API_KEY = process.env.MINING_CALCULATOR_API_KEY;

    if (!BASE_URL || !API_KEY) {
      return NextResponse.json(
        { error: "Missing required environment variables" },
        { status: 500 }
      );
    }

    const apiUrl = `${BASE_URL}/api`;
    const defaultHeaders = {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
    };

    const response = await fetch(
      `${apiUrl}/calculate`,
      {
        method: "POST",
        headers: defaultHeaders,
        body: JSON.stringify({ locations: miningLocations }),
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch calculator data" },
        { status: response.status }
      );
    }

    const data = await response.json();

    // construct calculator url
    const calculatorUrl = `${BASE_URL}/map?dataId=${data.dataId}`;

    // return only the data and calculatorurl
    return NextResponse.json({
      data,
      calculatorUrl,
    });
  } catch (error) {
    console.error("Mining calculator proxy error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
