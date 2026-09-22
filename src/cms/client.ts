interface StrapiError {
  error: {
    status: number;
    name: string;
    message: string;
    details?: any;
  };
}

export interface StrapiResponse<T> {
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

export interface PageData {
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export type PageResponse = StrapiResponse<PageData>;

export const API_URL: string | undefined = process.env.STRAPI_API_ENDPOINT;
const API_TOKEN: string | undefined = process.env.STRAPI_READ_ONLY_API_TOKEN;
const STRAPI_DISPLAY_DRAFTS: boolean =
  process.env.STRAPI_DISPLAY_DRAFTS === "true";

const headers: HeadersInit = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${API_TOKEN}`,
};

interface ApiFetcherOptions {
  locale?: string;
  skipAuth?: boolean;
  drafts?: boolean; // overrides STRAPI_DISPLAY_DRAFTS for a single request
}

export const apiFetcher = async <T>(
  url: string,
  options?: ApiFetcherOptions,
): Promise<T> => {
  const {
    locale,
    skipAuth = false,
    drafts = STRAPI_DISPLAY_DRAFTS,
  } = options || {};

  const requestHeaders: HeadersInit = skipAuth
    ? { "Content-Type": "application/json" }
    : headers;

  const params: string[] = [];
  if (locale) params.push(`locale=${locale}`);
  // Strapi 5. For Strapi 4, use "publicationState=preview" instead
  if (drafts) params.push("status=draft");

  const requestUrl = params.length
    ? `${url}${url.includes("?") ? "&" : "?"}${params.join("&")}`
    : url;

  const response = await fetch(requestUrl, {
    method: "GET",
    headers: requestHeaders,
    cache: "no-store",
  });

  if (!response.ok) {
    const error: StrapiError = await response.json();
    throw new Error(error.error.message || "An error occurred");
  }

  return response.json();
};
