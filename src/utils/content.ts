import { PERMITTED_AREA_UNITS } from "@/types/types";
import { formatLocale } from "d3";

export type PERMITTED_LANGUAGES = "en" | "es" | "pt";

const localeDefinitions = {
  en: {
    decimal: ".",
    thousands: ",",
    grouping: [3],
    currency: ["$", ""] as [string, string],
    percent: "%",
  },
  es: {
    decimal: ",",
    thousands: ".",
    grouping: [3],
    currency: ["$", ""] as [string, string],
    percent: "%",
  },
  pt: {
    decimal: ",",
    thousands: ".",
    grouping: [3],
    currency: ["$", ""] as [string, string],
    percent: "%",
  },
};

export const formatNumber = (
  number: number,
  language: string,
  formatString = ","
) => {
  const locale = formatLocale(
    localeDefinitions[language as PERMITTED_LANGUAGES]
  );

  // If number is >= 1 billion, format as millions instead
  if (Math.abs(number) >= 1_000_000_000) {
    const formatter = locale.format(",.0~f");
    return formatter(number / 1_000_000) + "M";
  }

  const formatter = locale.format(formatString);
  return formatter(number || 0);
};

const haToSquareKm = (n: number) => n * 0.01;
const haToAcre = (n: number) => n * 2.471054;

export const displayAreaInUnits = (area: number | undefined, units: PERMITTED_AREA_UNITS): number => {
  if (!area) return 0;
  if (units === "hectares") return area;
  if (units === "squareKm") return haToSquareKm(area);
  if (units === "acres") return haToAcre(area);
  return 0; // Add default return value
}
