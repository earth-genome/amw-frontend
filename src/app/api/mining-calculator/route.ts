import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const miningLocations = await request.json();

    const BASE_URL = process.env.MINING_CALCULATOR_BASE_URL;
    const VERCEL_SHARE_ID = process.env.MINING_CALCULATOR_VERCEL_SHARE_ID;
    const API_KEY = process.env.MINING_CALCULATOR_API_KEY;

    if (!BASE_URL || !VERCEL_SHARE_ID || !API_KEY) {
      return NextResponse.json(
        { error: "Missing required environment variables" },
        { status: 500 }
      );
    }

    const apiUrl = `${BASE_URL}/api/map-locations`;
    const defaultHeaders = {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
    };

    // first request: post mining locations
    const response = await fetch(`${apiUrl}?${VERCEL_SHARE_ID}`, {
      method: "POST",
      headers: defaultHeaders,
      body: JSON.stringify(miningLocations),
      redirect: "manual",
    });

    if (response.status !== 307) {
      return NextResponse.json(
        { error: "Failed to fetch from mining calculator API" },
        { status: response.status }
      );
    }

    const setCookie = response.headers.get("set-cookie");

    if (!setCookie) {
      return NextResponse.json(
        { error: "No set-cookie found in redirect" },
        { status: response.status }
      );
    }

    // second request: follow redirect
    const redirectRes = await fetch(`${apiUrl}?${VERCEL_SHARE_ID}`, {
      method: "POST",
      headers: {
        ...defaultHeaders,
        Cookie: setCookie,
      },
      body: JSON.stringify(miningLocations),
    });
    const redirectResResult = await redirectRes.json();
    if (!redirectRes.ok) {
      return NextResponse.json(
        { error: "Failed following redirect" },
        { status: redirectRes.status }
      );
    }
    // construct calculator url
    const calculatorUrl = `${BASE_URL}/map?dataId=${redirectResResult.dataId}&${VERCEL_SHARE_ID}`;

    // third request: calculate impact
    const dataResponse = await fetch(
      // FIXME: this is using a different URL for now
      `https://miningcalculator.conservation-strategy.org/api/calculate`,
      {
        method: "POST",
        headers: defaultHeaders,
        body: JSON.stringify({ locations: miningLocations }),
      }
    );

    if (!dataResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch calculator data" },
        { status: dataResponse.status }
      );
    }

    const data = await dataResponse.json();

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
