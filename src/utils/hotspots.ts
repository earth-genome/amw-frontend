import useSWR from "swr";
import type { SWRConfiguration } from "swr";

type ClosedPolygon = [number, number][];

interface HotspotData {
  id: number;
  title: string;
  bounds: ClosedPolygon;
  description?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

interface StrapiResponse<T> {
  data: T;
  meta: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

interface StrapiError {
  error: {
    status: number;
    name: string;
    message: string;
    details?: any;
  };
}

export const API_URL: string = "http://localhost:1337/api";
const API_TOKEN: string | undefined = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;

const headers: HeadersInit = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${API_TOKEN}`,
};

const fetcher = async <T>(url: string): Promise<T> => {
  const response = await fetch(url, {
    method: "GET",
    headers: headers,
  });

  if (!response.ok) {
    const error: StrapiError = await response.json();
    throw new Error(error.error.message || "An error occurred");
  }

  return response.json();
};

// GET all hotspots hook
export function useHotspots(config?: SWRConfiguration) {
  const {
    data,
    error,
    isLoading,
    isValidating,
    mutate: refetch,
  } = useSWR<StrapiResponse<HotspotData[]>>(
    // `${API_URL}/hotspots/geojson`,
    `${API_URL}/hotspots?populate=*&pagination[pageSize]=1000`,
    fetcher,
    config
  );

  return {
    hotspots: data?.data || [],
    meta: data?.meta,
    isLoading,
    isValidating,
    error,
    refetch,
  };
}

// GET single hotspot by ID hook
export function useHotspot(id: number | null, config?: SWRConfiguration) {
  const {
    data,
    error,
    isLoading,
    isValidating,
    mutate: refetch,
  } = useSWR<StrapiResponse<HotspotData>>(
    id ? `${API_URL}/hotspots/${id}` : null,
    fetcher,
    config
  );

  return {
    hotspot: data,
    isLoading,
    isValidating,
    isError: error,
    refetch,
  };
}
