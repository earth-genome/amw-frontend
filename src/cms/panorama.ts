import { API_URL, apiFetcher, StrapiResponse } from "@/cms/client";

// const PANORAMA_STRAPI_ORIGIN = "http://localhost:1337";
// const API_URL = `${PANORAMA_STRAPI_ORIGIN}/api`;

// options for apiFetcher, the local instance needs public find/findOne permissions
export const PANORAMA_FETCH_OPTIONS = { skipAuth: true };

// ================== URLS ==================

const buildUrl = (path: string, params: string[]) =>
  `${API_URL}/${path}?${params.join("&")}`;

export const getPanoramaReportUrl = (issueNumber: number) =>
  buildUrl("panorama-reports", [
    `filters[issueNumber][$eq]=${issueNumber}`,
    "populate[pdfReport]=true",
    "populate[heroImage][populate][image]=true",
    "populate[introduction]=true",
    "populate[keyFindings][populate][highlights]=true",
    "populate[keyFindings][populate][breakdown]=true",
    // NOTE: beforeAndAfter images are not displayed for now, so they are not populated
    "populate[highlightedAreas][populate][sections][populate][areas]=true",
    "populate[conclusion]=true",
  ]);

// the plain fields (title, issueNumber, summary, etc.) and the hero image for the thumbnails
export const PANORAMA_REPORTS_LIST_URL = buildUrl("panorama-reports", [
  "populate[heroImage][populate][image]=true",
  "sort=issueNumber:desc",
  "pagination[pageSize]=100",
]);

export const PANORAMA_HOME_URL = buildUrl("panorama-home", [
  "populate[hero][populate][backgroundImage]=true",
  "populate[intro]=true",
  "populate[methodology]=true",
  "populate[acknowledgements]=true",
  "populate[viewMapCallToAction]=true",
  "populate[signUp]=true",
]);

const STRAPI_ORIGIN = (() => {
  try {
    return API_URL ? new URL(API_URL).origin : "";
  } catch (_e) {
    return "";
  }
})();

// Strapi uploads with the local provider have relative urls, e.g. "/uploads/image.jpg"
export const getPanoramaMediaUrl = (url: string | null | undefined) => {
  if (!url) return undefined;
  return url.startsWith("/") ? `${STRAPI_ORIGIN}${url}` : url;
};

export const getPanoramaHomePath = (lang: string) => `/${lang}/panorama`;

// report pages are at /[lang]/panorama/issue-[issueNumber]
export const getPanoramaReportPath = (lang: string, issueNumber: number) =>
  `/${lang}/panorama/issue-${issueNumber}`;

// PDF version of a report, generated on demand from its print page
export const getPanoramaPdfPath = (lang: string, issueNumber: number) =>
  `/api/panorama-pdf/${lang}/issue-${issueNumber}`;

// print-friendly page of a report, used to generate the PDF
export const getPanoramaPrintPath = (lang: string, issueNumber: number) =>
  `${getPanoramaReportPath(lang, issueNumber)}/print`;

export const parsePanoramaIssueParam = (issue: string): number | undefined => {
  const match = issue.match(/^issue-(\d+)$/);
  if (!match) return undefined;
  const issueNumber = Number(match[1]);
  return issueNumber >= 1 ? issueNumber : undefined;
};

// ================== TYPES ==================

export interface StrapiMedia {
  id: number;
  documentId?: string;
  name: string;
  alternativeText: string | null;
  caption: string | null;
  width: number | null;
  height: number | null;
  ext: string;
  mime: string;
  size: number;
  url: string;
}

export interface TextSection {
  id: number;
  title: string;
  text: string;
}

export interface Hero {
  id: number;
  title: string;
  subtitle: string | null;
  backgroundImage?: StrapiMedia | null;
}

export interface ImageWithCaption {
  id: number;
  image: StrapiMedia | null;
  caption: string | null;
}

interface Highlight {
  id: number;
  title: string;
  subtitle: string | null;
  text: string | null;
}

interface BreakdownItem {
  id: number;
  title: string;
  text: string | null;
  mapLink: string | null;
}

export interface KeyFindings {
  id: number;
  title: string;
  highlights: Highlight[];
  breakdownTitle: string | null;
  breakdown: BreakdownItem[];
  // summary of the breakdown list, in markdown
  breakdownText?: string | null;
}

interface Area {
  id: number;
  title: string;
  location: string | null;
  text: string | null;
  miningUpdate: string | null;
  mapLink: string;
}

interface AreaSection {
  id: number;
  title: string;
  shortTitle: string;
  text: string | null;
  areas: Area[];
}

export interface HighlightedAreas {
  id: number;
  title: string;
  text: string | null;
  sections: AreaSection[];
}

export interface SignUp {
  id: number;
  title: string;
  text: string | null;
  callToAction: string | null;
  link: string | null;
}

export interface ViewMapCta {
  id: number;
  text: string;
  buttonLabel: string | null;
  link: string | null;
}

interface StrapiDocument {
  id: number;
  documentId: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  locale?: string;
}

export interface PanoramaReport extends StrapiDocument {
  title: string;
  // short description of the issue, used in the home page
  summary?: string | null;
  issueNumber: number;
  // YYYYMMDD snapshot of the map data, the main map one when empty
  dataSnapshot?: string | null;
  // hides the mining calculator in the area summaries
  hideMiningCalculator?: boolean | null;
  datePublished: string;
  dateCoverage: string;
  pdfReport: StrapiMedia | null;
  heroImage: ImageWithCaption | null;
  introduction: TextSection | null;
  keyFindings: KeyFindings | null;
  highlightedAreas: HighlightedAreas | null;
  conclusion: TextSection | null;
}

export type PanoramaReportListItem = Pick<
  PanoramaReport,
  | "id"
  | "documentId"
  | "title"
  | "summary"
  | "issueNumber"
  | "dateCoverage"
  | "datePublished"
  | "heroImage"
>;

interface PanoramaHome extends StrapiDocument {
  hero: Hero | null;
  intro: TextSection | null;
  methodology: TextSection | null;
  acknowledgements: TextSection | null;
  viewMapCallToAction: ViewMapCta | null;
  signUp: SignUp | null;
  // shows the latest issue section, hidden when empty
  displayLatestIssuesSection?: boolean | null;
}

export type PanoramaReportsResponse = StrapiResponse<PanoramaReport[]>;
export type PanoramaReportsListResponse = StrapiResponse<
  PanoramaReportListItem[]
>;
export type PanoramaHomeResponse = StrapiResponse<PanoramaHome>;

// ================== FETCHERS ==================

export const fetchPanoramaReport = async (issue: string, lang: string) => {
  const issueNumber = parsePanoramaIssueParam(issue);
  if (!issueNumber) return undefined;

  const response = await apiFetcher<PanoramaReportsResponse>(
    getPanoramaReportUrl(issueNumber),
    { ...PANORAMA_FETCH_OPTIONS, locale: lang },
  );
  return response?.data?.[0];
};

// for content that is not essential to the report, e.g. the home content (methodology,
// sign up, etc.) and the issues list
export const fetchPanoramaOptional = async <T>(
  url: string,
  lang: string,
): Promise<T | undefined> => {
  try {
    return await apiFetcher<T>(url, {
      ...PANORAMA_FETCH_OPTIONS,
      locale: lang,
    });
  } catch (error) {
    console.error(`Error fetching ${url}`, error);
    return undefined;
  }
};
