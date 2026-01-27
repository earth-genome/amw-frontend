import { DIMENSION_COLORS } from "@/app/[lang]/components/PolicyScoreboard";
import StackedBarChart from "@/app/[lang]/components/PolicyScoreboard/StackedBarChart";
import { format } from "d3";
import styles from "./style.module.css";

const MAX_VALUE = 1;

const DimensionsBarChart = ({ byDimension }) => {
  const dimensionsItems = byDimension.map((dim) => {
    const dimensionCountries = Object.entries(dim.countries);
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
            value: values.dimensionScorePct,
            color: DIMENSION_COLORS[dim.Dimension],
            label: format("0.1~%")(values.dimensionScorePct),
          },
        ],
        total: values.dimensionScorePct,
        formatter: format("0.1~%"),
      }))
      .sort((a, b) => b.total - a.total);
    return { dimensionName: dim.Dimension, items: items };
  });

  console.log(dimensionsItems);

  return (
    <div className={styles.dimensionSections}>
      {byDimension.map((dimension) => {
        const dimensionName = dimension.Dimension;
        const items = dimensionsItems.find(
          (d) => d.dimensionName === dimensionName,
        ).items;

        return (
          <div key={dimensionName}>
            <div className={styles.dimensionTitle}>{dimensionName}</div>
            <StackedBarChart items={items} maxValue={MAX_VALUE} />
          </div>
        );
      })}
    </div>
  );
};

export default DimensionsBarChart;
