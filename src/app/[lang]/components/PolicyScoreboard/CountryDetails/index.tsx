"use client";

import type {
  ByCategory,
  ByDimension,
  DimensionName,
  PolicyScoreboardRow,
} from "@/app/[lang]/(map)/(content)/policy-scoreboard/types";
import {
  DIMENSION_COLORS,
  MAX_VALUE_DIMENSION,
} from "@/app/[lang]/components/PolicyScoreboard";
import StackedBarChart from "@/app/[lang]/components/PolicyScoreboard/StackedBarChart";
import CategoryQuestionsTable from "@/app/[lang]/components/PolicyScoreboard/CategoryQuestionsTable";
import { format } from "d3";
import styles from "./style.module.css";
import {
  getPolicyDimensionDescriptionLocalized,
  getPolicyDimensionLocalized,
} from "@/app/[lang]/(map)/(content)/policy-scoreboard/policy-dimensions";
import { getPolicyCategoryLocalized } from "@/app/[lang]/(map)/(content)/policy-scoreboard/policy-categories";
import { useParams } from "next/navigation";
import { PERMITTED_LANGUAGES } from "@/utils/content";

interface CountryDetailsProps {
  byCategory: ByCategory[];
  byDimension: ByDimension[];
  countryName: string;
  scoreboardData: PolicyScoreboardRow[];
  countryEnglishName: string;
  dictionary: { [key: string]: any };
}

const MAX_VALUE = 15;

const CountryDetails = ({
  byCategory,
  byDimension,
  countryName,
  scoreboardData,
  countryEnglishName,
  dictionary,
}: CountryDetailsProps) => {
  const { lang } = useParams();

  const t = dictionary?.policy_scoreboard;
  // Calculate overall country score
  const getCountryTotal = (): number =>
    byDimension.reduce(
      (acc, d) => acc + (d.countries[countryName]?.dimensionScore ?? 0),
      0,
    );

  // Create country assessment score bar item
  const countryScoreItem = {
    key: countryName,
    label: <div>{t?.overall_score}</div>,
    segments: byDimension.map((dim) => ({
      key: dim.Dimension,
      value: dim.countries[countryName]?.dimensionScore ?? 0,
      color: DIMENSION_COLORS[dim.Dimension as DimensionName],
      label: `${dim.Dimension}: ${dim.countries[countryName]?.dimensionScore ?? 0}`,
    })),
    total: getCountryTotal(),
  };

  const legend = Object.entries(DIMENSION_COLORS).map(([label, color]) => ({
    label,
    color,
  }));

  // Group categories by dimension
  const categoriesByDimension = byCategory.reduce<Record<string, ByCategory[]>>(
    (acc, category) => {
      const dimension = category.Dimension;
      if (!acc[dimension]) {
        acc[dimension] = [];
      }
      acc[dimension].push(category);
      return acc;
    },
    {},
  );

  const dimensions = Object.keys(categoriesByDimension) as DimensionName[];

  return (
    <div className={styles.container}>
      <div className={styles.countryScoreSection}>
        <div>
          <h2 className={styles.sectionTitle}>{t?.country_assessment_score}</h2>
          {/* TODO: localize */}
          <p>
            {`${countryName}'s `}
            <strong>{`overall score is ${getCountryTotal()} out of ${MAX_VALUE}`}</strong>
            {`. It represents the sum of its scores across the three dimensions listed below.`}
          </p>

          <StackedBarChart
            items={[countryScoreItem]}
            maxValue={MAX_VALUE}
            legend={legend}
            showMaxValue={true}
          />
        </div>
      </div>

      <div>
        <h2 className={styles.dimensionTitle} style={{ borderColor: "white" }}>
          {t?.assessment_dimensions}
        </h2>
        {/* TODO: localize */}
        <p>
          {
            "Below you’ll find the category assessments that comprise each dimension. Each dimension is scored from 0 to 5, based on a weighted combination of its category scores."
          }
        </p>

        {dimensions.map((dimension) => {
          // Get dimension-level score for this country
          const dimensionData = byDimension.find(
            (d) => d.Dimension === dimension,
          );
          const dimensionScore =
            dimensionData?.countries[countryName]?.dimensionScore ?? 0;
          const dimensionLocalized = getPolicyDimensionLocalized(
            dimension,
            lang as PERMITTED_LANGUAGES,
          );
          const dimensionDescriptionLocalized =
            getPolicyDimensionDescriptionLocalized(
              dimension,
              lang as PERMITTED_LANGUAGES,
            );

          // Create dimension bar item
          const dimensionItem = {
            key: dimension,
            label: <div>{""}</div>,
            segments: [
              {
                key: dimension,
                value: dimensionScore,
                color: DIMENSION_COLORS[dimension],
                label: format(".2~f")(dimensionScore),
              },
            ],
            total: dimensionScore,
            formatter: format(".2~f"),
          };

          // Create items for bar chart - one bar per category for this country
          const categoryItems = categoriesByDimension[dimension].map(
            (category) => {
              const countryScores = category.countries[countryName];
              const percentage =
                countryScores && countryScores.count > 0
                  ? countryScores.sum / countryScores.count
                  : 0;

              const localizedCategory = getPolicyCategoryLocalized(
                category.CategoryID,
                lang as PERMITTED_LANGUAGES,
              );

              return {
                key: category.Categories,
                label: (
                  <div>
                    {category.CategoryID}. {localizedCategory}
                  </div>
                ),
                segments: [
                  {
                    key: category.Categories,
                    value: percentage,
                    color: DIMENSION_COLORS[dimension],
                    label: format(".0%")(percentage),
                  },
                ],
                total: percentage,
                formatter: format(".0%"),
              };
            },
          );

          return (
            <div key={dimension} className={styles.dimensionSection}>
              <div>
                <div className={styles.dimensionSectionTitle}>
                  {dimensionLocalized}
                </div>
                <StackedBarChart
                  items={[dimensionItem]}
                  maxValue={MAX_VALUE_DIMENSION}
                  showMaxValue={true}
                  showLegend={false}
                />
                {/* TODO: localize */}
                <div style={{ lineHeight: 1.6, marginTop: 12 }}>
                  {`${countryName}'s score in the `}
                  <strong>{`${dimensionLocalized} dimension is ${dimensionScore} out of ${5}`}</strong>
                  {`. It represents a weighted combination of the category scores below.`}
                </div>
                {dimensionDescriptionLocalized.map((d) => (
                  <p key={d}>{d}</p>
                ))}
              </div>
              <div>
                <div className={styles.categoryCharts}>
                  {/* TODO: localize */}
                  <div className={styles.categoryChartsTitle}>
                    {dimensionLocalized} - {"Assessment categories"}
                  </div>
                  <StackedBarChart
                    items={categoryItems}
                    maxValue={1}
                    showLegend={false}
                    compact
                  />
                </div>
                <div className={styles.categoryQuestionsSection}>
                  <CategoryQuestionsTable
                    scoreboardData={scoreboardData}
                    countryEnglishName={countryEnglishName}
                    dimension={dimension}
                    dictionary={dictionary}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CountryDetails;
