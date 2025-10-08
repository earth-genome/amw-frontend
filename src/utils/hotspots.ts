import useSWR from "swr";
import type { SWRConfiguration } from "swr";

type HotspotCollection = GeoJSON.FeatureCollection<GeoJSON.Polygon>;

// type ClosedPolygon = [number, number][];

// interface HotspotData {
//   id: number;
//   title: string;
//   bounds: ClosedPolygon;
//   description?: string;
//   createdAt: string;
//   updatedAt: string;
//   publishedAt: string | null;
// }

// interface StrapiResponse<T> {
//   data: T;
//   meta: {
//     pagination?: {
//       page: number;
//       pageSize: number;
//       pageCount: number;
//       total: number;
//     };
//   };
// }

interface StrapiError {
  error: {
    status: number;
    name: string;
    message: string;
    details?: any;
  };
}

export const API_URL: string | undefined = process.env.NEXT_PUBLIC_STRAPI_API_ENDPOINT;
const API_TOKEN: string | undefined = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;

const headers: HeadersInit = {
  "Content-Type": "application/json",
  // Authorization: `Bearer ${API_TOKEN}`,
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

export const HOTSPOTS_GEOJSON_URL = `${API_URL}/hotspots/geojson`;

// GET all hotspots hook
export function useHotspots(config?: SWRConfiguration) {
  const {
    data,
    error,
    isLoading,
    isValidating,
    mutate: refetch,
  } = useSWR<HotspotCollection>(HOTSPOTS_GEOJSON_URL, fetcher, config);

  return {
    hotspots: data,
    isLoading,
    isValidating,
    error,
    refetch,
  };
}

// // GET single hotspot by ID hook
// export function useHotspot(id: number | null, config?: SWRConfiguration) {
//   const {
//     data,
//     error,
//     isLoading,
//     isValidating,
//     mutate: refetch,
//   } = useSWR<StrapiResponse<HotspotData>>(
//     id ? `${API_URL}/hotspots/${id}` : null,
//     fetcher,
//     config
//   );

//   return {
//     hotspot: data,
//     isLoading,
//     isValidating,
//     isError: error,
//     refetch,
//   };
// }
