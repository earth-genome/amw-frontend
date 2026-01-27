"use client";
import CountriesBarChart from "@/app/[lang]/components/PolicyScoreboard/CountriesBarChart";
import DimensionsBarChart from "@/app/[lang]/components/PolicyScoreboard/DimensionsBarChart";
import * as d3 from "d3";

export const DIMENSION_COLORS = {
  "I. Legal Frameworks": "#4CAF50",
  "II. Mining policies": "#2196F3",
  "III. Investigation and enforcement": "#FF9800",
};

const PolicyScoreboard = ({
  data,
  byCountry,
  byDimension,
  byCategory,
  countries,
}) => {
  console.log(byCountry, byDimension, byCategory);

  return (
    <div>
      <CountriesBarChart byDimension={byDimension} countries={countries} />

      <DimensionsBarChart byDimension={byDimension} />
    </div>
  );
};

export default PolicyScoreboard;
