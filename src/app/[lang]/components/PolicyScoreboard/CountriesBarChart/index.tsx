import { DIMENSION_COLORS } from "@/app/[lang]/components/PolicyScoreboard";
import StackedBarChart from "@/app/[lang]/components/PolicyScoreboard/StackedBarChart";

const MAX_VALUE = 15;

const CountriesBarChart = ({ byDimension, countries }) => {
  const getCountryTotal = (country) =>
    byDimension.reduce(
      (acc, d) => acc + d.countries[country].dimensionScore,
      0,
    );

  const items = countries
    .sort((a, b) => getCountryTotal(b) - getCountryTotal(a))
    .map((country) => ({
      key: country,
      label: (
        <>
          <div>{country}</div>
          <div>Details</div>
        </>
      ),
      segments: byDimension.map((dim) => ({
        key: dim.Dimension,
        value: dim.countries[country].dimensionScore,
        color: DIMENSION_COLORS[dim.Dimension],
        label: `${dim.Dimension}: ${dim.countries[country].dimensionScore}`,
      })),
      total: getCountryTotal(country),
    }));

  const legend = Object.entries(DIMENSION_COLORS).map(([label, color]) => ({
    label,
    color,
  }));

  return (
    <StackedBarChart
      items={items}
      maxValue={MAX_VALUE}
      legend={legend}
      showMaxValue={true}
    />
  );
};

export default CountriesBarChart;
