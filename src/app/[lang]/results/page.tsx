import { NextPage } from "next";
import { getMarkdownText, PERMITTED_LANGUAGES } from "@/utils/content";
import { apiFetcher } from "@/cms/client";
import Overlay from "@/app/[lang]/components/Overlay";
import { RESULTS_URL, ResultsResponse } from "@/cms/results";

interface PageProps {
  params: {
    lang: PERMITTED_LANGUAGES;
  };
}

const Page: NextPage<PageProps> = async ({ params: { lang } }) => {
  const response = await apiFetcher<ResultsResponse>(RESULTS_URL, {
    locale: lang,
  });

  const {
    data: { title, body },
  } = response;

  return (
    <Overlay>
      {title && <h1>{title}</h1>}
      {body && <div dangerouslySetInnerHTML={getMarkdownText(body)} />}
    </Overlay>
  );
};

export default Page;
