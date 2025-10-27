import { NextPage } from "next";
import { getMarkdownText, PERMITTED_LANGUAGES } from "@/utils/content";
import { ABOUT_URL, AboutResponse } from "@/cms/about";
import { apiFetcher } from "@/cms/client";
import Overlay from "@/app/[lang]/components/Overlay";

interface PageProps {
  params: {
    lang: PERMITTED_LANGUAGES;
  };
}

const Page: NextPage<PageProps> = async ({ params: { lang } }) => {
  const response = await apiFetcher<AboutResponse>(ABOUT_URL, {
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
