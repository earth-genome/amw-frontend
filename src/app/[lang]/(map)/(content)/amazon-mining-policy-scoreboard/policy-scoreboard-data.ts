import { PERMITTED_LANGUAGES } from "@/utils/content";
import * as d3 from "d3";
import { promises as fs } from "fs";
import path from "path";
import { cache } from "react";

import { POLICY_COUNTRIES } from "./policy-countries";
import type {
  PolicyData,
  PolicyScoreboardRow,
  ByCategory,
  ByDimension,
  ByCountry,
  CategoryCountryScore,
  DimensionCountryScore,
} from "./types";

export {
  POLICY_COUNTRIES,
  POLICY_COUNTRY_SLUGS,
  type PERMITTED_POLICY_COUNTRY_SLUGS,
} from "./policy-countries";

export type {
  PolicyData,
  PolicyScoreboardRow,
  ByCategory,
  ByDimension,
  ByCountry,
} from "./types";

// Map from localized country name to English name (used in CSV columns)
const getCountryEnglishName = (localizedName: string): string => {
  const country = POLICY_COUNTRIES.find(
    (c) =>
      c.name_en === localizedName ||
      c.name_es === localizedName ||
      c.name_pt === localizedName,
  );
  return country?.name_en ?? localizedName;
};

export const getPolicyData = cache(
  async (lang: PERMITTED_LANGUAGES): Promise<PolicyData> => {
    // Read CSV file from the file system
    const filePath = path.join(
      process.cwd(),
      "public/data/policy-scoreboard-data.csv",
    );
    const csvString = await fs.readFile(filePath, "utf-8");
    const round = (n: number, decimals: number): number =>
      Math.round(n * 10 ** decimals) / 10 ** decimals;

    const scoreboardData = d3.csvParse(
      csvString,
    ) as unknown as PolicyScoreboardRow[];

    const nameKey = `name_${lang}` as keyof (typeof POLICY_COUNTRIES)[number];
    const countryNames: string[] = POLICY_COUNTRIES.map(
      (d) => d[nameKey] as string,
    ).filter((name): name is string => name !== undefined);

    const byCategory: ByCategory[] = d3
      .flatRollup(
        scoreboardData,
        (
          rows: PolicyScoreboardRow[],
        ): {
          categoryID: string;
          countries: Record<string, CategoryCountryScore>;
        } => ({
          categoryID: rows[0]?.["Category ID"] ?? "",
          countries: Object.fromEntries(
            countryNames.map((country) => {
              const englishName = getCountryEnglishName(country);
              const evalKey =
                `${englishName}_Evaluation` as keyof PolicyScoreboardRow;
              return [
                country,
                {
                  sum: d3.sum(
                    rows,
                    (d: PolicyScoreboardRow) => +d[evalKey] || 0,
                  ),
                  count: rows.length,
                },
              ];
            }),
          ),
        }),
        (d: PolicyScoreboardRow) => d.Dimension,
        (d: PolicyScoreboardRow) => d.Categories,
      )
      .map(
        ([dimension, category, data]: [
          string,
          string,
          {
            categoryID: string;
            countries: Record<string, CategoryCountryScore>;
          },
        ]) => ({
          Dimension: dimension,
          Categories: category,
          CategoryID: data.categoryID,
          countries: data.countries,
        }),
      );

    const byDimension: ByDimension[] = d3
      .flatRollup(
        scoreboardData,
        (rows: PolicyScoreboardRow[]): Record<string, DimensionCountryScore> =>
          Object.fromEntries(
            countryNames.map((country) => {
              const englishName = getCountryEnglishName(country);
              const evalKey =
                `${englishName}_Evaluation` as keyof PolicyScoreboardRow;
              const sum = d3.sum(
                rows,
                (d: PolicyScoreboardRow) => +d[evalKey] || 0,
              );
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
        (d: PolicyScoreboardRow) => d.Dimension,
      )
      .map(
        ([dimension, countries]: [
          string,
          Record<string, DimensionCountryScore>,
        ]) => ({
          Dimension: dimension,
          countries,
        }),
      );

    const byCountry: ByCountry[] = countryNames.map((country) => ({
      country,
      overallScorePct: round(
        d3.mean(
          byDimension,
          (d: ByDimension) => d.countries[country].dimensionScorePct,
        ) ?? 0,
        3,
      ),
      overallScore: round(
        d3.mean(
          byDimension,
          (d: ByDimension) => d.countries[country].dimensionScore,
        ) ?? 0,
        2,
      ),
    }));

    return { scoreboardData, byCategory, byDimension, byCountry, countryNames };
  },
);
