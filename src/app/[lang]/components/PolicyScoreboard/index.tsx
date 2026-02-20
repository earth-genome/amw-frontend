"use client";
import { useState } from "react";
import CountriesBarChart from "@/app/[lang]/components/PolicyScoreboard/CountriesBarChart";
import DimensionsBarChart from "@/app/[lang]/components/PolicyScoreboard/DimensionsBarChart";
import DetailPanel from "@/app/[lang]/components/PolicyScoreboard/DetailPanel";
import CountryDetails from "@/app/[lang]/components/PolicyScoreboard/CountryDetails";
import DimensionDetails from "@/app/[lang]/components/PolicyScoreboard/DimensionDetails";
import { POLICY_COUNTRIES } from "@/app/[lang]/(map)/(content)/amazon-mining-policy-scoreboard/policy-countries";
import { POLICY_DIMENSIONS } from "@/app/[lang]/(map)/(content)/amazon-mining-policy-scoreboard/policy-dimensions";
import type {
  PolicyScoreboardRow,
  ByCategory,
  ByDimension,
  ByCountry,
  DimensionName,
} from "@/app/[lang]/(map)/(content)/amazon-mining-policy-scoreboard/types";
import { useParams } from "next/navigation";
import styles from "./style.module.css";
import Link from "next/link";
import { Button, ConfigProvider } from "antd";

export const DIMENSION_COLORS: Record<DimensionName, string> = {
  "I. Legal Frameworks": "#4CAF50",
  "II. Mining policies": "#2196F3",
  "III. Investigation and enforcement": "#FF9800",
};
export const MAX_VALUE_DIMENSION = 5;

type PanelSelection =
  | { type: "country"; slug: string; dimensionSlug?: string }
  | { type: "dimension"; slug: string }
  | null;

interface PolicyScoreboardProps {
  data: PolicyScoreboardRow[];
  byCountry: ByCountry[];
  byDimension: ByDimension[];
  byCategory: ByCategory[];
  countries: string[];
  dictionary: { [key: string]: any };
}

const PolicyScoreboard = ({
  data,
  byDimension,
  byCategory,
  countries,
  dictionary,
}: PolicyScoreboardProps) => {
  const { lang } = useParams();
  const t = dictionary?.policy_scoreboard;
  const [panelSelection, setPanelSelection] = useState<PanelSelection>(null);

  const handleCountryClick = (countrySlug: string, dimensionSlug?: string) => {
    setPanelSelection({ type: "country", slug: countrySlug, dimensionSlug });
  };

  const handleDimensionClick = (dimensionSlug: string) => {
    setPanelSelection({ type: "dimension", slug: dimensionSlug });
  };

  const handleClose = () => {
    setPanelSelection(null);
  };

  let panelTitle = "";
  let panelContent: React.ReactNode = null;

  if (panelSelection?.type === "country") {
    const country = POLICY_COUNTRIES.find(
      (c) => c.slug === panelSelection.slug,
    );
    const nameKey = `name_${lang}` as keyof typeof country;
    const countryName = (country?.[nameKey] ?? panelSelection.slug) as string;
    const countryEnglishName = country?.name_en ?? panelSelection.slug;
    panelTitle = countryName;
    panelContent = (
      <CountryDetails
        byCategory={byCategory}
        byDimension={byDimension}
        countryName={countryName}
        scoreboardData={data}
        countryEnglishName={countryEnglishName}
        dictionary={dictionary}
        scrollToDimensionSlug={panelSelection.dimensionSlug}
      />
    );
  } else if (panelSelection?.type === "dimension") {
    const dimension = POLICY_DIMENSIONS.find(
      (d) => d.slug === panelSelection.slug,
    );
    const nameKey = `name_${lang}` as keyof typeof dimension;
    const dimensionName = (dimension?.[nameKey] ??
      panelSelection.slug) as string;
    const dimensionKey = dimension?.key as DimensionName;
    panelTitle = dimensionName;
    panelContent = (
      <DimensionDetails
        dimensionKey={dimensionKey}
        dimensionName={dimensionName}
        byDimension={byDimension}
        byCategory={byCategory}
        countries={countries}
        dictionary={dictionary}
        onCountryClick={handleCountryClick}
      />
    );
  }

  return (
    <div>
      <Link href={"#"}>
        <ConfigProvider
          theme={{
            components: {
              Button: {
                colorPrimaryHover: "var(--green-dark)",
              },
            },
            token: {
              colorPrimaryHover: "var(--green-dark)",
            },
          }}
        >
          <Button>{t?.download_report}</Button>
        </ConfigProvider>
      </Link>

      <h2 className={styles.sectionTitle}>{t?.country_rankings}</h2>
      <p>{t?.country_rankings_desc}</p>
      <CountriesBarChart
        byDimension={byDimension}
        countries={countries}
        dictionary={dictionary}
        onCountryClick={handleCountryClick}
      />

      <h2 className={styles.sectionTitle}>{t?.assessment_dimensions}</h2>
      <p>{t?.assessment_dimensions_desc}</p>
      <DimensionsBarChart
        byDimension={byDimension}
        dictionary={dictionary}
        onDimensionClick={handleDimensionClick}
      />

      <DetailPanel
        isOpen={panelSelection !== null}
        onClose={handleClose}
        title={panelTitle}
        backLabel={t?.back_to_scoreboard}
      >
        {panelContent}
      </DetailPanel>

      <div className={styles.footerSection}>
        <p>{t?.attribution_intro}:</p>
        <Link
          className="ac-logo"
          href="https://www.amazonconservation.org/"
          target="_blank"
          rel="nofollow noopener"
        >
          Amazon Conservation
        </Link>
      </div>
    </div>
  );
};

export default PolicyScoreboard;
