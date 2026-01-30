import { NextPage } from "next";
import {
  // getMarkdownText,
  PERMITTED_LANGUAGES,
} from "@/utils/content";
import { apiFetcher } from "@/cms/client";
import Overlay from "@/app/[lang]/components/Overlay";
import {
  POLICY_SCOREBOARD_URL,
  PolicyScoreboardResponse,
} from "@/cms/policy-scoreboard";
import { getDictionary } from "@/get-dictionary";
import PolicyScoreboard from "@/app/[lang]/components/PolicyScoreboard";
import { getPolicyData } from "@/app/[lang]/(map)/(content)/policy-scoreboard/policy-scoreboard-data";

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
  // const response = await apiFetcher<PolicyScoreboardResponse>(
  //   POLICY_SCOREBOARD_URL,
  //   {
  //     locale: lang,
  //   },
  // );

  // const {
  //   data: { title, body },
  // } = response;

  const dictionary = await getDictionary(lang);

  const { scoreboardData, byCategory, byDimension, byCountry, countryNames } =
    await getPolicyData(lang);

  return (
    <Overlay>
      {/* {title && <h1>{title}</h1>} */}
      {/* {body && <div dangerouslySetInnerHTML={getMarkdownText(body)} />} */}
      <h1>{dictionary?.policy_scoreboard?.title}</h1>
      <p>
        <strong>
          {dictionary?.policy_scoreboard?.intro}
        </strong>
      </p>
      <PolicyScoreboard
        data={scoreboardData}
        byCategory={byCategory}
        byDimension={byDimension}
        byCountry={byCountry}
        countries={countryNames}
        dictionary={dictionary}
      />
    </Overlay>
  );
};

export default Page;
