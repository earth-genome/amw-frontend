import "server-only";
import {
  AREA_IDS_TO_HIDE,
  AREA_TYPES,
  AreaType,
  getAreaDataUrl,
  getAreaTimeseriesUrl,
  getDataSnapshot,
  LAYER_YEARS,
  PERMITTED_AREA_TYPES_KEYS,
} from "@/constants/map";
import {
  fetchPanoramaOptional,
  fetchPanoramaReport,
  PANORAMA_HOME_URL,
  PanoramaHomeResponse,
  PanoramaReport,
} from "@/cms/panorama";
import { AreaData, AreasData, AreasTimeseriesData } from "@/types/types";
import { hasMapPosition, MapPosition, parseMapLink } from "@/utils/mapParams";
import { filterForMiningCalculator } from "@/utils/miningCalculator";
import { fetchMiningCalculator } from "@/utils/miningCalculatorServer";
import {
  filterIllegalityAreas,
  getTimeseriesValues,
  isMiningCalculatorHiddenFor,
} from "@/utils/areaSummary";

// the area data needed by the print page, without the heavy mining locations
type PrintAreaData = Omit<AreaData, "locations_per_year">;

// the same data the area summary of the scrollytelling map displays
export interface PrintAreaSummary {
  areaTypeKey: PERMITTED_AREA_TYPES_KEYS;
  activeYear: number;
  isCumulative: boolean;
  areaData: PrintAreaData;
  timeseries: AreasTimeseriesData;
  // cumulative mining area until the active year
  affectedAreaHa: number | undefined;
  // new mining area in the active year or quarter
  periodAreaHa: number | undefined;
  isMiningCalculatorHidden: boolean;
  economicCost: number | undefined;
  calculatorUrl: string | undefined;
  // custom view of the map from the map link, like the scrollytelling map, instead of
  // fitting the area
  mapView: MapPosition | undefined;
}

export interface PrintArea {
  id: number;
  title: string;
  location: string | null;
  text: string | null;
  miningUpdate: string | null;
  // undefined when the map link has no area or its data can't be loaded
  summary: PrintAreaSummary | undefined;
}

interface PrintSection {
  id: number;
  title: string;
  shortTitle: string;
  text: string | null;
  areas: PrintArea[];
}

interface PanoramaPrintData {
  report: PanoramaReport;
  home: PanoramaHomeResponse["data"] | undefined;
  sections: PrintSection[];
}

const fetchJson = async <T>(url: string): Promise<T | undefined> => {
  try {
    // the files can be larger than the fetch cache limit, and the PDF is cached instead
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return (await response.json()) as T;
  } catch (error) {
    console.error(`Error fetching ${url}`, error);
    return undefined;
  }
};

// loads the data and timeseries of an area type only once, even if several areas use it
const getAreaTypeDataLoader = (dataSnapshot: string, lang: string) => {
  const cache = new Map<
    string,
    Promise<[AreasData | undefined, AreasTimeseriesData | undefined]>
  >();

  return (areaType: AreaType) => {
    if (!cache.has(areaType.key)) {
      const areasDataUrl = getAreaDataUrl(areaType, dataSnapshot);
      cache.set(
        areaType.key,
        Promise.all([
          fetchJson<AreasData>(
            areaType.useLocale
              ? `${areasDataUrl}?locale=${lang}`
              : areasDataUrl,
          ),
          fetchJson<AreasTimeseriesData>(
            getAreaTimeseriesUrl(areaType, dataSnapshot),
          ),
        ]),
      );
    }
    return cache.get(areaType.key)!;
  };
};

const getEconomicCost = async (
  areaData: AreaData,
  activeYear: number,
): Promise<{ economicCost?: number; calculatorUrl?: string }> => {
  const miningLocations = filterForMiningCalculator(
    areaData.locations_per_year?.[String(activeYear)],
  );
  if (!miningLocations.length) return {};
  try {
    const { data, calculatorUrl } =
      await fetchMiningCalculator(miningLocations);
    return { economicCost: data?.totalImpact, calculatorUrl };
  } catch (error) {
    console.error(
      `Error fetching the mining calculator for ${areaData.id}`,
      error,
    );
    return {};
  }
};

const getAreaSummary = async (
  mapLink: string,
  loadAreaTypeData: ReturnType<typeof getAreaTypeDataLoader>,
  hideMiningCalculator: boolean,
  fitToAreaBounds: boolean, // fits the map view to the bounds of the geojson area
): Promise<PrintAreaSummary | undefined> => {
  const params = parseMapLink(mapLink);
  const areaType = AREA_TYPES.find((d) => d.key === params.areaTypeKey);
  if (!areaType || !params.areaId || AREA_IDS_TO_HIDE.includes(params.areaId))
    return undefined;

  const [areasData, areasTimeseriesData] = await loadAreaTypeData(areaType);
  const areaData = areasData?.find((d) => d?.id === params.areaId);
  if (!areaData) return undefined;

  // same defaults as the map store
  const activeYear = Number(params.activeYear ?? Math.max(...LAYER_YEARS));
  const isCumulative = params.isCumulative ?? true;
  const timeseries =
    areasTimeseriesData?.filter((d) => d?.id === params.areaId) ?? [];

  // same rules as the area summary: no calculator for countries, nor when hidden in the CMS
  const isMiningCalculatorHidden = isMiningCalculatorHiddenFor(
    areaType.key,
    hideMiningCalculator,
  );
  const { economicCost, calculatorUrl } = isMiningCalculatorHidden
    ? {}
    : await getEconomicCost(areaData, activeYear);

  // eslint-disable-next-line no-unused-vars
  const { locations_per_year, ...areaDataWithoutLocations } = areaData;

  return {
    areaTypeKey: areaType.key,
    activeYear,
    isCumulative,
    areaData: {
      ...areaDataWithoutLocations,
      // removing areas which are zero pct, as in the area summary
      illegality_areas: filterIllegalityAreas(areaData.illegality_areas) ?? [],
    },
    timeseries,
    ...getTimeseriesValues(timeseries, activeYear),
    isMiningCalculatorHidden,
    economicCost,
    calculatorUrl,
    mapView:
      !fitToAreaBounds && hasMapPosition(params)
        ? { lng: params.lng, lat: params.lat, zoom: params.zoom }
        : undefined,
  };
};

// everything the print page of a report needs, fetched on the server
export const loadPanoramaPrintData = async (
  issue: string,
  lang: string,
): Promise<PanoramaPrintData | undefined> => {
  const [report, homeResponse] = await Promise.all([
    fetchPanoramaReport(issue, lang),
    fetchPanoramaOptional<PanoramaHomeResponse>(PANORAMA_HOME_URL, lang),
  ]);
  if (!report) return undefined;

  const loadAreaTypeData = getAreaTypeDataLoader(
    getDataSnapshot(report.dataSnapshot),
    lang,
  );

  const sections = await Promise.all(
    (report.highlightedAreas?.sections ?? []).map(async (section) => ({
      id: section.id,
      title: section.title,
      shortTitle: section.shortTitle,
      text: section.text,
      areas: await Promise.all(
        (section.areas ?? []).map(async (area) => ({
          id: area.id,
          title: area.title,
          location: area.location,
          text: area.text,
          miningUpdate: area.miningUpdate,
          summary: await getAreaSummary(
            area.mapLink,
            loadAreaTypeData,
            !!report.hideMiningCalculator,
            true,
          ),
        })),
      ),
    })),
  );

  return { report, home: homeResponse?.data, sections };
};
