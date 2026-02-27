import { NextPage } from "next";
import { getMarkdownText, PERMITTED_LANGUAGES } from "@/utils/content";
import { apiFetcher } from "@/cms/client";
import {
  POLICY_SCOREBOARD_URL,
  PolicyScoreboardResponse,
} from "@/cms/policy-scoreboard";
import { getDictionary } from "@/get-dictionary";
import PolicyScoreboard from "@/app/[lang]/components/PolicyScoreboard";
import { getPolicyData } from "@/app/[lang]/(map)/(content)/amazon-mining-policy-scoreboard/policy-scoreboard-data";
import Logo from "@/app/[lang]/components/Nav/logo.svg";
import Image from "next/image";
import Link from "next/link";

// Force dynamic rendering
export const dynamic = "force-dynamic";

interface PageProps {
  params: {
    lang: PERMITTED_LANGUAGES;
  };
}

export async function generateMetadata({ params: { lang } }: PageProps) {
  const response = await apiFetcher<PolicyScoreboardResponse>(
    POLICY_SCOREBOARD_URL,
    {
      locale: lang,
    },
  );
  const dictionary = await getDictionary(lang);
  return {
    title: `${response?.data?.title} - ${dictionary?.home?.title}`,
  };
}

const Page: NextPage<PageProps> = async ({ params: { lang } }) => {
  const response = await apiFetcher<PolicyScoreboardResponse>(
    POLICY_SCOREBOARD_URL,
    {
      locale: lang,
    },
  );

  const {
    data: { title, body },
  } = response;

  const dictionary = await getDictionary(lang);

  const { scoreboardData, byCategory, byDimension, byCountry, countryNames } =
    await getPolicyData(lang);

  return (
    <div>
      <Link href="/">
        <Image
          src={Logo}
          alt="Logo"
          width={114}
          height={68}
          style={{
            margin: 0,
            width: 114,
          }}
        />
      </Link>

      {title && <h1>{title}</h1>}
      {body && <div dangerouslySetInnerHTML={getMarkdownText(body)} />}
      <PolicyScoreboard
        data={scoreboardData}
        byCategory={byCategory}
        byDimension={byDimension}
        byCountry={byCountry}
        countries={countryNames}
        dictionary={dictionary}
      />
    </div>
  );
};

export default Page;
