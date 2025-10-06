import { PERMITTED_AREA_UNITS } from "@/app/[lang]/components/Footer";
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
  formatString = ",",
  significantDigits = 1
) => {
  const locale = formatLocale(
    localeDefinitions[language as PERMITTED_LANGUAGES]
  );

  // If number is >= 1 billion, format as millions instead of using the "giga" / "G" from d3 format
  if (Math.abs(number) >= 1_000_000_000) {
    const formatter = locale.format(",.0~f");
    const numberInMillions = number / 1_000_000;
    const numberSignificantDigits = parseFloat(
      numberInMillions.toPrecision(significantDigits)
    );
    return formatter(numberSignificantDigits) + "M";
  }

  const formatter = locale.format(formatString);
  return formatter(number || 0);
};

const haToSquareKm = (n: number) => n * 0.01;
const haToAcre = (n: number) => n * 2.471054;

export const displayAreaInUnits = (
  areaHa: number | undefined,
  units: PERMITTED_AREA_UNITS
): number => {
  if (!areaHa) return 0;
  if (units === "hectares") return areaHa;
  if (units === "squareKm") return haToSquareKm(areaHa);
  if (units === "imperial") return haToAcre(areaHa);
  return 0; // Add default return value
};
