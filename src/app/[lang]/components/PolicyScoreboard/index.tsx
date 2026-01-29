"use client";
import CountriesBarChart from "@/app/[lang]/components/PolicyScoreboard/CountriesBarChart";
import DimensionsBarChart from "@/app/[lang]/components/PolicyScoreboard/DimensionsBarChart";
import type {
  PolicyScoreboardRow,
  ByCategory,
  ByDimension,
  ByCountry,
  DimensionName,
} from "@/app/[lang]/(map)/(content)/policy-scoreboard/types";
import styles from "./style.module.css";

export const DIMENSION_COLORS: Record<DimensionName, string> = {
  "I. Legal Frameworks": "#4CAF50",
  "II. Mining policies": "#2196F3",
  "III. Investigation and enforcement": "#FF9800",
};
export const MAX_VALUE_DIMENSION = 5;

interface PolicyScoreboardProps {
  data: PolicyScoreboardRow[];
  byCountry: ByCountry[];
  byDimension: ByDimension[];
  byCategory: ByCategory[];
  countries: string[];
  dictionary: { [key: string]: any };
}

const PolicyScoreboard = ({
  // data,
  // byCountry,
  byDimension,
  // byCategory,
  countries,
  dictionary,
}: PolicyScoreboardProps) => {
  const t = dictionary?.policy_scoreboard;

  return (
    <div>
      <h2 className={styles.sectionTitle}>{t?.country_rankings}</h2>
      {/* TODO: localize */}
      <p>
        {
          "Countries are evaluated across three key dimensions, each worth up to five points, for a total possible score of 15."
        }
      </p>
      <CountriesBarChart
        byDimension={byDimension}
        countries={countries}
        dictionary={dictionary}
      />

      <h2 className={styles.sectionTitle}>{t?.assessment_dimensions}</h2>
      {/* TODO: localize */}
      <p>
        {
          "Each assessment dimension is made up of multiple categories and criteria. Visit the details page for each dimension to see how the score is calculated."
        }
      </p>
      <DimensionsBarChart byDimension={byDimension} dictionary={dictionary} />
    </div>
  );
};

export default PolicyScoreboard;
