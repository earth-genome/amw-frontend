import { PERMITTED_LANGUAGES } from "@/utils/content";
import * as d3 from "d3";
import { promises as fs } from "fs";
import path from "path";
import { cache } from "react";

export const POLICY_COUNTRIES = [
  // TODO: add other names
  { slug: "bolivia", name_en: "Bolivia" },
  { slug: "brazil", name_en: "Brazil" },
  { slug: "colombia", name_en: "Colombia" },
  { slug: "ecuador", name_en: "Ecuador" },
  { slug: "peru", name_en: "Peru" },
];
export const POLICY_COUNTRY_SLUGS = POLICY_COUNTRIES.map((d) => d.slug);
export type PERMITTED_POLICY_COUNTRY_SLUGS = typeof POLICY_COUNTRY_SLUGS;

export const getPolicyData = cache(async (lang: PERMITTED_LANGUAGES) => {
  // Read CSV file from the file system
  const filePath = path.join(
    process.cwd(),
    "public/data/policy-scoreboard-data.csv",
  );
  const csvString = await fs.readFile(filePath, "utf-8");
  const round = (n: number, decimals: number) =>
    Math.round(n * 10 ** decimals) / 10 ** decimals;

  const scoreboardData = d3.csvParse(csvString);

  const countryNames = POLICY_COUNTRIES.map((d) => d[`name_${lang}`]);

  const byCategory = d3
    .flatRollup(
      scoreboardData,
      (rows) =>
        Object.fromEntries(
          countryNames.map((country) => [
            country,
            {
              sum: d3.sum(rows, (d) => +d[`${country}_Evaluation`]),
              count: rows.length,
            },
          ]),
        ),
      (d) => d.Dimension,
      (d) => d.Categories,
    )
    .map(([dimension, category, countries]) => ({
      Dimension: dimension,
      Categories: category,
      countries,
    }));

  const byDimension = d3
    .flatRollup(
      scoreboardData,
      (rows) =>
        Object.fromEntries(
          countryNames.map((country) => {
            const sum = d3.sum(rows, (d) => +d[`${country}_Evaluation`] || 0);
            const count = rows.length;
            return [
              country,
              {
                sum,
                count,
                dimensionScorePct: round(sum / count, 3),
                dimensionScore: round((sum / count) * 5, 2),
              },
            ];
          }),
        ),
      (d) => d.Dimension,
    )
    .map(([dimension, countries]) => ({
      Dimension: dimension,
      countries,
    }));

  const byCountry = countryNames.map((country) => ({
    country,
    overallScorePct: round(
      d3.mean(byDimension, (d) => d.countries[country].dimensionScorePct),
      3,
    ),
    overallScore: round(
      d3.mean(byDimension, (d) => d.countries[country].dimensionScore),
      2,
    ),
  }));

  return { scoreboardData, byCategory, byDimension, byCountry, countryNames };
});
