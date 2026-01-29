"use client";

import type {
  ByCategory,
  ByDimension,
  CategoryCountryScore,
  DimensionName,
} from "@/app/[lang]/(map)/(content)/policy-scoreboard/types";
import { DIMENSION_COLORS } from "@/app/[lang]/components/PolicyScoreboard";
import StackedBarChart from "@/app/[lang]/components/PolicyScoreboard/StackedBarChart";
import { format } from "d3";
import styles from "./style.module.css";
import DimensionsBarChart from "../DimensionsBarChart";
import { getPolicyCategoryLocalized } from "@/app/[lang]/(map)/(content)/policy-scoreboard/policy-categories";
import { useParams } from "next/navigation";
import { PERMITTED_LANGUAGES } from "@/utils/content";
import { getPolicyDimensionDescriptionLocalized } from "@/app/[lang]/(map)/(content)/policy-scoreboard/policy-dimensions";

interface DimensionDetailsProps {
  dimensionKey: DimensionName;
  dimensionName: string;
  byDimension: ByDimension[];
  byCategory: ByCategory[];
  countries: string[];
  dictionary: { [key: string]: any };
}

const DimensionDetails = ({
  dimensionKey,
  dimensionName,
  byDimension,
  byCategory,
  countries,
  dictionary,
}: DimensionDetailsProps) => {
  const { lang } = useParams();
  const t = dictionary?.policy_scoreboard;
  const dimensionColor = DIMENSION_COLORS[dimensionKey];

  // Filter categories for this dimension
  const dimensionCategories = byCategory.filter(
    (c) => c.Dimension === dimensionKey,
  );

  // Build per-category country comparison bar charts
  const categoryCharts = dimensionCategories.map((category) => {
    const items = countries
      .map((country) => {
        const scores = category.countries[country] as
          | CategoryCountryScore
          | undefined;
        const pct = scores && scores.count > 0 ? scores.sum / scores.count : 0;

        return {
          key: country,
          label: <div>{country}</div>,
          segments: [
            {
              key: country,
              value: pct,
              color: dimensionColor,
              label: format("0.1~%")(pct),
            },
          ],
          total: pct,
          formatter: format("0.1~%"),
        };
      })
      .sort((a, b) => b.total - a.total);

    const localizedCategory = getPolicyCategoryLocalized(
      category.CategoryID,
      lang as PERMITTED_LANGUAGES,
    );

    return {
      categoryLabel: `${category.CategoryID}. ${localizedCategory}`,
      items,
    };
  });

  const dimensionDescriptionLocalized = getPolicyDimensionDescriptionLocalized(
    dimensionName,
    lang as PERMITTED_LANGUAGES,
  );

  return (
    <div className={styles.container}>
      <div>
        {dimensionDescriptionLocalized.map((d) => (
          <p key={d}>{d}</p>
        ))}
      </div>
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>
          {dimensionName} - {t?.country_comparison}
        </h2>
        <DimensionsBarChart
          byDimension={byDimension.filter((d) => d.Dimension === dimensionKey)}
          hideTitle
        />
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>
          {dimensionName} - {t?.categories}
        </h2>
        {categoryCharts.map((chart) => (
          <div key={chart.categoryLabel} className={styles.categorySection}>
            <h3 className={styles.categoryTitle}>{chart.categoryLabel}</h3>
            <StackedBarChart
              items={chart.items}
              maxValue={1}
              showLegend={false}
              compact
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default DimensionDetails;
