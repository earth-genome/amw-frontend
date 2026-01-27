import { PERMITTED_POLICY_COUNTRY_SLUGS } from "@/app/[lang]/(map)/(content)/policy-scoreboard/page";
import { getDictionary } from "@/get-dictionary";
import { PERMITTED_LANGUAGES } from "@/utils/content";
import Overlay from "@/app/[lang]/components/Overlay";
import { NextPage } from "next";
import { getPolicyData } from "@/app/[lang]/(map)/(content)/policy-scoreboard/policy-scoreboard-data";
import CountryDetails from "@/app/[lang]/components/PolicyScoreboard/CountryDetails";

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

  const { scoreboardData, byCategory, byDimension, byCountry, countryNames } =
    await getPolicyData(lang);


  return (
    <Overlay>
      {countrySlug && <h1>{countrySlug}</h1>}
      <CountryDetails byCategory={byCategory} />
    </Overlay>
  );
};

export default Page;
