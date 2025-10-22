import { API_URL, StrapiResponse } from "@/cms/client";

export const CASE_STUDIES_URL = `${API_URL}/case-studies-page?populate=images`;

export interface PageData {
  title: string;
  body: string;
  images: Array<{
    id: number;
    name: string;
    alternativeText: string | null;
    caption: string | null;
    width: number;
    height: number;
    formats: {
      thumbnail?: ImageFormat;
      small?: ImageFormat;
      medium?: ImageFormat;
      large?: ImageFormat;
    };
    hash: string;
    ext: string;
    mime: string;
    size: number;
    url: string;
    previewUrl: string | null;
    provider: string;
    createdAt: string;
    updatedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export type CaseStudiesResponse = StrapiResponse<PageData>;

interface ImageFormat {
  name: string;
  hash: string;
  ext: string;
  mime: string;
  width: number;
  height: number;
  size: number;
  url: string;
}
