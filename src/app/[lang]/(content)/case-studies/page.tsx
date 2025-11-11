import { NextPage } from "next";
import Overlay from "@/app/[lang]/components/Overlay";
import { getMarkdownText, PERMITTED_LANGUAGES } from "@/utils/content";
import { apiFetcher } from "@/cms/client";
import { CASE_STUDIES_URL, CaseStudiesResponse } from "@/cms/case-studies";
import { getDictionary } from "@/get-dictionary";

// Force dynamic rendering
export const dynamic = "force-dynamic";

interface PageProps {
  params: {
    lang: PERMITTED_LANGUAGES;
  };
}

export async function generateMetadata({ params: { lang } }: PageProps) {
  const response = await apiFetcher<CaseStudiesResponse>(CASE_STUDIES_URL, {
    locale: lang,
  });
  const dictionary = await getDictionary(lang);
  return {
    title: `${response?.data?.title} - ${dictionary?.home?.title}`,
  };
}

const Page: NextPage<PageProps> = async ({ params: { lang } }) => {
  const response = await apiFetcher<CaseStudiesResponse>(CASE_STUDIES_URL, {
    locale: lang,
  });

  const {
    data: { title, body, images },
  } = response;

  return (
    <Overlay>
      <div className="case-study-images">
        {images?.map((image, index: number) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={image.id}
            className={`image-${index + 1}`}
            src={image.url}
            alt={image.alternativeText || `Case study image ${index + 1}`}
          />
        ))}
      </div>

      {title && <h1>{title}</h1>}
      {body && <div dangerouslySetInnerHTML={getMarkdownText(body)} />}
    </Overlay>
  );
};

export default Page;
