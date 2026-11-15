import { API_URL, PageData, StrapiResponse } from "@/cms/client";

export const METHODOLOGY_URL = `${API_URL}/methodology`;

// Write-only endpoint, used by the /api/methodology-contact route with a token
// scoped to "create" on this collection
export const METHODOLOGY_CONTACTS_URL = `${API_URL}/methodology-contacts`;

export interface MethodologyData extends PageData {
  dataUrl?: string | null;
  dataButtonLabel?: string | null;
  codeUrl?: string | null;
  codeButtonLabel?: string | null;
}

export interface MethodologyResponse extends StrapiResponse<MethodologyData> {}
