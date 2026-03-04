import {
  DIMENSION_COLORS,
  MAX_VALUE_DIMENSION,
} from "@/app/[lang]/components/PolicyScoreboard";
import StackedBarChart from "@/app/[lang]/components/PolicyScoreboard/StackedBarChart";
import type {
  ByDimension,
  DimensionCountryScore,
} from "@/app/[lang]/(map)/(content)/amazon-mining-policy-scoreboard/types";
import {
  getPolicyDimensionLocalized,
  POLICY_DIMENSIONS,
} from "@/app/[lang]/(map)/(content)/amazon-mining-policy-scoreboard/policy-dimensions";
import { POLICY_COUNTRIES } from "@/app/[lang]/(map)/(content)/amazon-mining-policy-scoreboard/policy-countries";
import { format } from "d3";
import { useParams } from "next/navigation";
import styles from "./style.module.css";
import { PERMITTED_LANGUAGES } from "@/utils/content";

interface DimensionsBarChartProps {
  byDimension: ByDimension[];
  hideTitle?: boolean;
  dictionary?: { [key: string]: any };
  onDimensionClick?: (_dimensionSlug: string) => void;
  onCountryClick?: (_countrySlug: string, _dimensionSlug: string) => void;
}

const DimensionsBarChart = ({
  byDimension,
  hideTitle,
  dictionary,
  onDimensionClick,
  onCountryClick,
}: DimensionsBarChartProps) => {
  const { lang } = useParams();
  const t = dictionary?.policy_scoreboard;

  const getDimensionSlug = (dimensionName: string) => {
    const dimension = POLICY_DIMENSIONS.find((d) => d.key === dimensionName);
    return dimension?.slug ?? "";
  };

  const getCountrySlug = (localizedName: string): string => {
    const country = POLICY_COUNTRIES.find(
      (c) =>
        c.name_en === localizedName ||
        c.name_es === localizedName ||
        c.name_pt === localizedName,
    );
    return country?.slug || localizedName.toLowerCase();
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
            {onCountryClick && (
              <button
                className={styles.dimensionLink}
                onClick={() => onCountryClick(getCountrySlug(country), getDimensionSlug(dim.Dimension))}
              >
                {t?.details}
              </button>
            )}
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
                <button
                  className={styles.dimensionLink}
                  onClick={() =>
                    onDimensionClick?.(getDimensionSlug(dimensionName))
                  }
                >
                  {t?.details}
                </button>
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
