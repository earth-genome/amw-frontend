import { DIMENSION_COLORS } from "@/app/[lang]/components/PolicyScoreboard";
import StackedBarChart from "@/app/[lang]/components/PolicyScoreboard/StackedBarChart";
import { POLICY_COUNTRIES } from "@/app/[lang]/(map)/(content)/amazon-mining-policy-scoreboard/policy-countries";
import type {
  ByDimension,
  DimensionName,
} from "@/app/[lang]/(map)/(content)/amazon-mining-policy-scoreboard/types";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getPolicyDimensionLocalized } from "@/app/[lang]/(map)/(content)/amazon-mining-policy-scoreboard/policy-dimensions";
import { PERMITTED_LANGUAGES } from "@/utils/content";
import { ROUTES } from "@/constants/routes";

const MAX_VALUE = 15;

interface CountriesBarChartProps {
  byDimension: ByDimension[];
  countries: string[];
  dictionary: { [key: string]: any };
}

const CountriesBarChart = ({
  byDimension,
  countries,
  dictionary,
}: CountriesBarChartProps) => {
  const { lang } = useParams();
  const t = dictionary?.policy_scoreboard;

  const getCountryTotal = (country: string): number =>
    byDimension.reduce(
      (acc, d) => acc + d.countries[country].dimensionScore,
      0,
    );

  const getCountrySlug = (localizedName: string): string => {
    const country = POLICY_COUNTRIES.find(
      (c) =>
        c.name_en === localizedName ||
        c.name_es === localizedName ||
        c.name_pt === localizedName,
    );
    return country?.slug || localizedName.toLowerCase();
  };

  const items = countries
    .sort((a, b) => getCountryTotal(b) - getCountryTotal(a))
    .map((country) => ({
      key: country,
      label: (
        <>
          <div>{country}</div>
          <Link
            href={`/${lang}/${ROUTES["policy-scoreboard"].url}/country/${getCountrySlug(country)}`}
            style={{ color: "#fff", fontWeight: 400, fontSize: 16 }}
          >
            {t?.details}
          </Link>
        </>
      ),
      segments: byDimension.map((dim) => ({
        key: dim.Dimension,
        value: dim.countries[country].dimensionScore,
        color: DIMENSION_COLORS[dim.Dimension as DimensionName],
        label: `${dim.Dimension}: ${dim.countries[country].dimensionScore}`,
      })),
      total: getCountryTotal(country),
    }));

  const legend = Object.entries(DIMENSION_COLORS).map(([label, color]) => ({
    label: getPolicyDimensionLocalized(label, lang as PERMITTED_LANGUAGES),
    color: color,
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
