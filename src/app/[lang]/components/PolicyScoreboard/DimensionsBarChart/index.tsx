import {
  DIMENSION_COLORS,
  MAX_VALUE_DIMENSION,
} from "@/app/[lang]/components/PolicyScoreboard";
import StackedBarChart from "@/app/[lang]/components/PolicyScoreboard/StackedBarChart";
import type {
  ByDimension,
  DimensionCountryScore,
} from "@/app/[lang]/(map)/(content)/policy-scoreboard/types";
import {
  getPolicyDimensionLocalized,
  POLICY_DIMENSIONS,
} from "@/app/[lang]/(map)/(content)/policy-scoreboard/policy-dimensions";
import { format } from "d3";
import { useParams } from "next/navigation";
import Link from "next/link";
import styles from "./style.module.css";
import { PERMITTED_LANGUAGES } from "@/utils/content";

interface DimensionsBarChartProps {
  byDimension: ByDimension[];
  hideTitle?: boolean;
  dictionary?: { [key: string]: any };
}

const DimensionsBarChart = ({
  byDimension,
  hideTitle,
  dictionary,
}: DimensionsBarChartProps) => {
  const { lang } = useParams();
  const t = dictionary?.policy_scoreboard;

  const getDimensionSlug = (dimensionName: string) => {
    const dimension = POLICY_DIMENSIONS.find((d) => d.key === dimensionName);
    return dimension?.slug ?? "";
  };

  const dimensionsItems = byDimension.map((dim) => {
    const dimensionCountries = Object.entries(dim.countries) as [
      string,
      DimensionCountryScore,
    ][];
    const items = dimensionCountries
      .map(([country, values]) => ({
        key: country,
        label: (
          <>
            <div>{country}</div>
          </>
        ),
        segments: [
          {
            key: country,
            value: values.dimensionScore,
            color: DIMENSION_COLORS[dim.Dimension],
            label: format(".2~f")(values.dimensionScore),
          },
        ],
        total: values.dimensionScore,
        formatter: format(".2~f"),
      }))
      .sort((a, b) => b.total - a.total);
    return { dimensionName: dim.Dimension, items: items };
  });

  return (
    <div className={!hideTitle ? styles.dimensionSections : ""}>
      {byDimension.map((dimension) => {
        const dimensionName = dimension.Dimension;
        const items = dimensionsItems.find(
          (d) => d.dimensionName === dimensionName,
        )!.items;

        return (
          <div key={dimensionName}>
            {!hideTitle && (
              <div className={styles.dimensionTitle}>
                <span>
                  {getPolicyDimensionLocalized(
                    dimensionName,
                    lang as PERMITTED_LANGUAGES,
                  )}
                </span>
                <Link
                  href={`/${lang}/policy-scoreboard/dimension/${getDimensionSlug(dimensionName)}`}
                  className={styles.dimensionLink}
                >
                  {t?.details}
                </Link>
              </div>
            )}
            <StackedBarChart
              items={items}
              maxValue={MAX_VALUE_DIMENSION}
              showMaxValue={true}
            />
          </div>
        );
      })}
    </div>
  );
};

export default DimensionsBarChart;
