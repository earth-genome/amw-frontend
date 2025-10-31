import { apiFetcher } from "@/cms/client";
import { getMarkdownText, PERMITTED_LANGUAGES } from "@/utils/content";
import { NextPage } from "next";
import Overlay from "@/app/[lang]/components/Overlay";
import { METHODOLOGY_URL, MethodologyResponse } from "@/cms/methodology";

// Force dynamic rendering
export const dynamic = "force-dynamic";

interface PageProps {
  params: {
    lang: PERMITTED_LANGUAGES;
  };
}

const Page: NextPage<PageProps> = async ({ params: { lang } }) => {
  const response = await apiFetcher<MethodologyResponse>(METHODOLOGY_URL, {
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
