import { PERMITTED_AREA_UNITS } from "@/app/[lang]/components/Footer";
import { formatLocale } from "d3";
import { marked } from "marked";

export type PERMITTED_LANGUAGES = "en" | "es" | "pt";

export const LOCALES = [
  { code: "en", localizedName: "English", exploreIn: "Explore in English" },
  { code: "es", localizedName: "Español", exploreIn: "Explorar en Español" },
  {
    code: "pt",
    localizedName: "Português",
    exploreIn: "Explorar em Português",
  },
];

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

export const numberToSignificantDigits = (
  number: number,
  significantDigits: number,
) => parseFloat(number.toPrecision(significantDigits));

export const formatNumber = (
  number: number,
  language: string,
  significantDigits: number,
): string => {
  const locale = formatLocale(
    localeDefinitions[language as PERMITTED_LANGUAGES],
  );

  // If number is <1, display it "<1"
  if (number < 1 && number > 0) return `<1`;

  // If number is >= 1 billion, format as millions instead of using the "giga" / "G" from d3 format
  if (Math.abs(number) >= 1_000_000_000) {
    const formatter = locale.format(",.0~f");
    const numberInMillions = number / 1_000_000;
    const numberSignificantDigits = numberToSignificantDigits(
      numberInMillions,
      significantDigits,
    );
    return formatter(numberSignificantDigits) + "M";
  }

  const formatString = `,.${significantDigits}~s`;
  const formatter = locale.format(formatString);
  return formatter(number || 0);
};

const haToSquareKm = (n: number) => n * 0.01;
const haToAcre = (n: number) => n * 2.471054;

export const displayAreaInUnits = (
  areaHa: number | undefined,
  units: PERMITTED_AREA_UNITS,
): number => {
  if (!areaHa) return 0;
  if (units === "hectares") return areaHa;
  if (units === "squareKm") return haToSquareKm(areaHa);
  if (units === "imperial") return haToAcre(areaHa);
  return 0; // Add default return value
};

export const getMarkdownText = (content: string) => {
  const rawMarkup = marked.parse(content);
  {
    /* @ts-ignore */
  }
  return { __html: rawMarkup };
};

export const formatLayerYear = (year: number): string => {
  // formats year codes: YYYY00 → "YYYY", YYYY01-04 → "YYYY-Q1" through "YYYY-Q4"
  const yearStr = Math.floor(year / 100).toString();
  const quarter = year % 100;

  if (quarter === 0) {
    return yearStr;
  }

  // HACK: 2025Q2 also covers Q1
  if (year === 202502 || year === 202501) {
    return `${yearStr} Q1-Q2`;
  }

  return `${yearStr} Q${quarter}`;
};
