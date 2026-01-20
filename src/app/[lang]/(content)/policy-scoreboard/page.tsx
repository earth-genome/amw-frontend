import { NextPage } from "next";
import { getMarkdownText, PERMITTED_LANGUAGES } from "@/utils/content";
import { apiFetcher } from "@/cms/client";
import Overlay from "@/app/[lang]/components/Overlay";
import {
  POLICY_SCOREBOARD_URL,
  PolicyScoreboardResponse,
} from "@/cms/policy-scoreboard";
import { getDictionary } from "@/get-dictionary";
import * as d3 from "d3";
import { promises as fs } from "fs";
import path from "path";
import PolicyScoreboard from "@/app/[lang]/components/PolicyScoreboard";

const POLICY_COUNTRIES = [
  "Bolivia",
  "Brazil",
  "Colombia",
  "Ecuador",
  "Peru",
];

// Force dynamic rendering
export const dynamic = "force-dynamic";

interface PageProps {
  params: {
    lang: PERMITTED_LANGUAGES;
  };
}

export async function generateMetadata({ params: { lang } }: PageProps) {
  const response = await apiFetcher<PolicyScoreboardResponse>(
    POLICY_SCOREBOARD_URL,
    {
      locale: lang,
    }
  );
  const dictionary = await getDictionary(lang);
  return {
    title: `${response?.data?.title} - ${dictionary?.home?.title}`,
  };
}

const Page: NextPage<PageProps> = async ({ params: { lang } }) => {
  const response = await apiFetcher<PolicyScoreboardResponse>(
    POLICY_SCOREBOARD_URL,
    {
      locale: lang,
    }
  );

  const {
    data: { title, body },
  } = response;

  // Read CSV file from the file system
  const filePath = path.join(
    process.cwd(),
    "public/data/policy-scoreboard-data.csv"
  );
  const csvString = await fs.readFile(filePath, "utf-8");
  const round = (n: number, decimals: number) =>
    Math.round(n * 10 ** decimals) / 10 ** decimals;

  const scoreboardData = d3.csvParse(csvString);

  const byCategory = d3
    .flatRollup(
      scoreboardData,
      (rows) =>
        Object.fromEntries(
          POLICY_COUNTRIES.map((country) => [
            country,
            {
              sum: d3.sum(rows, (d) => +d[`${country}_Evaluation`]),
              count: rows.length,
            },
          ])
        ),
      (d) => d.Dimension,
      (d) => d.Categories
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
          POLICY_COUNTRIES.map((country) => {
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
          })
        ),
      (d) => d.Dimension
    )
    .map(([dimension, countries]) => ({
      Dimension: dimension,
      countries,
    }));

  const byCountry = POLICY_COUNTRIES.map((country) => ({
    country,
    overallScorePct: round(
      d3.mean(byDimension, (d) => d.countries[country].dimensionScorePct),
      3
    ),
    overallScore: round(
      d3.mean(byDimension, (d) => d.countries[country].dimensionScore),
      2
    ),
  }));

  return (
    <Overlay>
      {title && <h1>{title}</h1>}
      {body && <div dangerouslySetInnerHTML={getMarkdownText(body)} />}
      <PolicyScoreboard
        data={scoreboardData}
        byCategory={byCategory}
        byDimension={byDimension}
        byCountry={byCountry}
        countries={POLICY_COUNTRIES}
      />
    </Overlay>
  );
};

export default Page;
