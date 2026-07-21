import {
  POLICY_DIMENSIONS,
  PolicyDimensionSlug,
} from "@/app/[lang]/(map)/(content)/amazon-mining-policy-scoreboard/policy-dimensions";
import type { DimensionName } from "@/app/[lang]/(map)/(content)/amazon-mining-policy-scoreboard/types";
import { getDictionary } from "@/get-dictionary";
import { PERMITTED_LANGUAGES } from "@/utils/content";
import { NextPage } from "next";
import Link from "next/link";
import { getPolicyData } from "@/app/[lang]/(map)/(content)/amazon-mining-policy-scoreboard/policy-scoreboard-data";
import DimensionDetails from "@/app/[lang]/components/PolicyScoreboard/DimensionDetails";
import { ROUTES } from "@/constants/routes";

// Force dynamic rendering
export const dynamic = "force-dynamic";

interface PageProps {
  params: {
    lang: PERMITTED_LANGUAGES;
    dimensionSlug: PolicyDimensionSlug;
  };
}

const Page: NextPage<PageProps> = async ({
  params: { lang, dimensionSlug },
}) => {
  const dictionary = await getDictionary(lang);

  const { byCategory, byDimension, countryNames } = await getPolicyData(lang);

  const dimension = POLICY_DIMENSIONS.find((d) => d.slug === dimensionSlug);
  const nameKey = `name_${lang}` as keyof typeof dimension;
  const dimensionName = (dimension?.[nameKey] ?? dimensionSlug) as string;
  const dimensionKey = dimension?.key as DimensionName;

  return (
    <div>
      <Link
        href={`/${lang}/${ROUTES["policy-scoreboard"].url}`}
        style={{ color: "#fff", fontSize: 16 }}
      >
        {dictionary?.policy_scoreboard?.back_to_scoreboard ??
          "← Back to Policy Scoreboard"}
      </Link>
      <h1>{dimensionName}</h1>
      <DimensionDetails
        dimensionKey={dimensionKey}
        dimensionName={dimensionName}
        byDimension={byDimension}
        byCategory={byCategory}
        countries={countryNames}
        dictionary={dictionary}
      />
    </div>
  );
};

export default Page;
