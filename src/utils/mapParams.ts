import { Dispatch } from "react";
import {
  AREA_TYPES,
  LAYER_YEARS,
  PERMITTED_AREA_TYPES_KEYS,
} from "@/constants/map";
import type { ActionType, IState } from "@/lib/Store";

// map state that can be described by query parameters, e.g. in a shared map link
export interface MapParams {
  areaTypeKey?: PERMITTED_AREA_TYPES_KEYS;
  areaId?: string;
  activeYear?: string;
  isCumulative?: boolean;
  zoom?: number;
  lng?: number;
  lat?: number;
}

const getIsValidAreaTypeKey = (
  key: string | null | undefined,
): key is PERMITTED_AREA_TYPES_KEYS =>
  !!key && AREA_TYPES.some((at) => at.key === key);

const parseNumberParam = (value: string | null): number | undefined => {
  if (value === null || value.trim() === "") return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
};

export const parseMapParams = (
  searchParams: Pick<URLSearchParams, "get">,
): MapParams => {
  const areaTypeKeyParam = searchParams.get("areaType");
  const areaIdParam = searchParams.get("areaId");
  // falls back to legacy "yearEnd" for old shared links
  const activeYearParam =
    searchParams.get("activeYear") ?? searchParams.get("yearEnd");
  const cumulativeParam = searchParams.get("cumulative");

  return {
    areaTypeKey: getIsValidAreaTypeKey(areaTypeKeyParam)
      ? areaTypeKeyParam
      : undefined,
    areaId: areaIdParam || undefined,
    activeYear:
      activeYearParam && LAYER_YEARS.includes(Number(activeYearParam))
        ? activeYearParam
        : undefined,
    isCumulative:
      cumulativeParam === "true"
        ? true
        : cumulativeParam === "false"
          ? false
          : undefined,
    zoom: parseNumberParam(searchParams.get("zoom")),
    lng: parseNumberParam(searchParams.get("lng")),
    lat: parseNumberParam(searchParams.get("lat")),
  };
};

// parses a map link (absolute or relative, e.g. "/en?areaType=...&areaId=...") into map params
export const parseMapLink = (mapLink: string | null | undefined): MapParams => {
  if (!mapLink) return {};
  try {
    const url = new URL(mapLink, "http://localhost");
    return parseMapParams(url.searchParams);
  } catch (_e) {
    return {};
  }
};

// keeps only the query parameters of a map link, pointing to the main map of the
// current domain and locale, e.g. "https://example.com/es?areaId=1" -> "/en?areaId=1"
export const getLocalMapHref = (
  mapLink: string | null | undefined,
  lang: string,
): string | undefined => {
  if (!mapLink) return undefined;
  try {
    const url = new URL(mapLink, "http://localhost");
    return url.search ? `/${lang}${url.search}` : undefined;
  } catch (_e) {
    return undefined;
  }
};

export const hasMapPosition = (
  params: MapParams,
): params is MapParams & { zoom: number; lng: number; lat: number } =>
  params.zoom !== undefined &&
  params.lng !== undefined &&
  params.lat !== undefined;

// applies map params to the store, the selected area is set as pending so it is
// resolved once the data for the area type finishes loading
export const applyMapParams = (
  dispatch: Dispatch<ActionType>,
  state: IState,
  params: MapParams,
) => {
  const { areaTypeKey, areaId, activeYear, isCumulative } = params;
  const isAreaTypeChange =
    !!areaTypeKey && areaTypeKey !== state.selectedAreaTypeKey;

  if (isAreaTypeChange) {
    dispatch({
      type: "SET_SELECTED_AREA_TYPE_BY_KEY",
      selectedAreaTypeKey: areaTypeKey,
    });
  }

  if (areaId) {
    if (isAreaTypeChange || areaId !== state.selectedArea?.value) {
      dispatch({
        type: "SET_PENDING_SELECTED_AREA_ID",
        pendingSelectedAreaId: areaId,
      });
    }
  } else {
    dispatch({
      type: "SET_PENDING_SELECTED_AREA_ID",
      pendingSelectedAreaId: undefined,
    });
    if (!isAreaTypeChange && state.selectedArea) {
      dispatch({ type: "SET_SELECTED_AREA_BY_ID", selectedAreaId: undefined });
    }
  }

  if (activeYear && activeYear !== state.activeYear) {
    dispatch({ type: "SET_ACTIVE_YEAR", activeYear });
  }

  if (isCumulative !== undefined && isCumulative !== state.isCumulative) {
    dispatch({ type: "SET_IS_CUMULATIVE", isCumulative });
  }
};
