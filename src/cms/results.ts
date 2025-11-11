import { API_URL, PageResponse } from "@/cms/client";

export const RESULTS_URL = `${API_URL}/results-page`;

export interface ResultsResponse extends PageResponse {}
