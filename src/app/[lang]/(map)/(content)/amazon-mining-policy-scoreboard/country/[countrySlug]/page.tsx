import {
  POLICY_COUNTRIES,
  PERMITTED_POLICY_COUNTRY_SLUGS,
} from "@/app/[lang]/(map)/(content)/amazon-mining-policy-scoreboard/policy-countries";
import { getDictionary } from "@/get-dictionary";
import { PERMITTED_LANGUAGES } from "@/utils/content";
import { NextPage } from "next";
import Link from "next/link";
import { getPolicyData } from "@/app/[lang]/(map)/(content)/amazon-mining-policy-scoreboard/policy-scoreboard-data";
import CountryDetails from "@/app/[lang]/components/PolicyScoreboard/CountryDetails";
import { ROUTES } from "@/constants/routes";

// Force dynamic rendering
export const dynamic = "force-dynamic";

interface PageProps {
  params: {
    lang: PERMITTED_LANGUAGES;
    countrySlug: PERMITTED_POLICY_COUNTRY_SLUGS;
  };
}

const Page: NextPage<PageProps> = async ({ params: { lang, countrySlug } }) => {
  const dictionary = await getDictionary(lang);

  const { byCategory, byDimension, scoreboardData } = await getPolicyData(lang);

  // Find country and get localized name + English name for CSV column lookup
  const country = POLICY_COUNTRIES.find((c) => c.slug === countrySlug);
  const nameKey = `name_${lang}` as keyof typeof country;
  const countryName = (country?.[nameKey] ?? countrySlug) as string;
  const countryEnglishName = country?.name_en ?? countrySlug;

  return (
    <div>
      <Link
        href={`/${lang}/${ROUTES["policy-scoreboard"].url}`}
        style={{ color: "#fff", fontSize: 16 }}
      >
        {dictionary?.policy_scoreboard?.back_to_scoreboard ??
          "← Back to Policy Scoreboard"}
      </Link>
      <h1>{countryName}</h1>
      <CountryDetails
        byCategory={byCategory}
        byDimension={byDimension}
        countryName={countryName}
        scoreboardData={scoreboardData}
        countryEnglishName={countryEnglishName}
        dictionary={dictionary}
      />
    </div>
  );
};

export default Page;
