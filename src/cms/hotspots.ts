import { API_URL, apiFetcher } from "@/cms/client";
import { PERMITTED_LANGUAGES } from "@/utils/content";
import useSWR from "swr";
import type { SWRConfiguration } from "swr";

type HotspotCollection = GeoJSON.FeatureCollection<GeoJSON.Polygon>;

export const HOTSPOTS_GEOJSON_URL = `${API_URL}/hotspots/geojson`;

// GET all hotspots hook
export function useHotspots(
  locale: PERMITTED_LANGUAGES,
  config?: SWRConfiguration
) {
  const {
    data,
    error,
    isLoading,
    isValidating,
    mutate: refetch,
  } = useSWR<HotspotCollection>(
    HOTSPOTS_GEOJSON_URL,
    (url) => apiFetcher(url, { skipAuth: true, locale: locale }),
    config
  );

  return {
    hotspots: data,
    isLoading,
    isValidating,
    error,
    refetch,
  };
}
