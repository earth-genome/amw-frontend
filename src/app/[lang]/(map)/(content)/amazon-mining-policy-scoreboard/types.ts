import { PERMITTED_LANGUAGES } from "@/utils/content";
import { POLICY_DIMENSIONS } from "./policy-dimensions";

// Country evaluation data in CSV (per country)
export interface CountryEvaluationData {
  Evaluation: string;
  Justification: string;
  Sources: string;
}

// Raw CSV row structure with explicit country columns
export interface PolicyScoreboardRow {
  Dimension: string;
  Categories: string;
  "Category ID": string;
  "Question Number": string;
  Question: string;
  // Bolivia
  Bolivia_Evaluation: string;
  Bolivia_Justification: string;
  Bolivia_Sources: string;
  // Brazil
  Brazil_Evaluation: string;
  Brazil_Justification: string;
  Brazil_Sources: string;
  // Colombia
  Colombia_Evaluation: string;
  Colombia_Justification: string;
  Colombia_Sources: string;
  // Ecuador
  Ecuador_Evaluation: string;
  Ecuador_Justification: string;
  Ecuador_Sources: string;
  // Peru
  Peru_Evaluation: string;
  Peru_Justification: string;
  Peru_Sources: string;
}

// Country configuration
export interface PolicyCountry {
  slug: string;
  name_en: string;
  name_es: string;
  name_pt: string;
}

// Helper type to get country name key based on language
export type CountryNameKey = `name_${PERMITTED_LANGUAGES}`;

// Score data for a country within a category
export interface CategoryCountryScore {
  sum: number;
  count: number;
}

// Score data for a country within a dimension
export interface DimensionCountryScore {
  sum: number;
  count: number;
  dimensionScorePct: number;
  dimensionScore: number;
}

// Aggregated data by category
export interface ByCategory {
  Dimension: string;
  Categories: string;
  CategoryID: string;
  countries: Record<string, CategoryCountryScore>;
}

// Aggregated data by dimension
export interface ByDimension {
  Dimension: string;
  countries: Record<string, DimensionCountryScore>;
}

// Aggregated data by country
export interface ByCountry {
  country: string;
  overallScorePct: number;
  overallScore: number;
}

// Return type for getPolicyData
export interface PolicyData {
  scoreboardData: PolicyScoreboardRow[];
  byCategory: ByCategory[];
  byDimension: ByDimension[];
  byCountry: ByCountry[];
  countryNames: string[];
}

// Dimension names (keys for DIMENSION_COLORS)
export type DimensionName = (typeof POLICY_DIMENSIONS)[number]["key"];
