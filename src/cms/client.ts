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

export const API_URL: string | undefined =
  process.env.NEXT_PUBLIC_STRAPI_API_ENDPOINT;
const API_TOKEN: string | undefined = process.env.NEXT_PUBLIC_STRAPI_READ_ONLY_API_TOKEN;

const headers: HeadersInit = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${API_TOKEN}`,
};

interface ApiFetcherOptions {
  locale?: string;
  skipAuth?: boolean;
}

export const apiFetcher = async <T>(
  url: string,
  options?: ApiFetcherOptions
): Promise<T> => {
  const { locale, skipAuth = false } = options || {};

  const requestHeaders: HeadersInit = skipAuth
    ? { "Content-Type": "application/json" }
    : headers;

  const response = await fetch(
    locale ? `${url}${url.includes("?") ? "&" : "?"}locale=${locale}` : url,
    {
      method: "GET",
      headers: requestHeaders,
    }
  );

  if (!response.ok) {
    const error: StrapiError = await response.json();
    throw new Error(error.error.message || "An error occurred");
  }

  return response.json();
};
