"use client";
import CountriesBarChart from "@/app/[lang]/components/PolicyScoreboard/CountriesBarChart";
import * as d3 from "d3";

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
    </div>
  );
};

export default PolicyScoreboard;
