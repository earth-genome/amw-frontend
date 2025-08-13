import { NextPage } from "next";
import { i18n, type Locale } from "../../../../i18n-config";
import Overlay from "../components/Overlay";
import { getDictionary } from "../../../get-dictionary";
import { getMarkdown } from "../../../get-markdown";
import { marked } from "marked";
import { PERMITTED_LANGUAGES } from "@/utils/content";

interface PageProps {
  params: {
    lang: PERMITTED_LANGUAGES;
  };
}

const Page: NextPage<PageProps> = async ({ params: { lang } }) => {
  const dictionary = await getDictionary(lang);
  const content = await getMarkdown(lang, `${lang}/case-studies.md`);

  const getMarkdownText = (content: string) => {
    const rawMarkup = marked.parse(content);
    {
      /* @ts-ignore */
    }
    return { __html: rawMarkup };
  };

  return (
    <Overlay>
      <div className="case-study-images">
        {content.data.images.map((image: string, index: number) => (
          <img
            key={index + 1}
            className={`image-${index + 1}`}
            src={`/images/${image}`}
          />
        ))}
      </div>

      {/* @ts-ignore */}
      <div dangerouslySetInnerHTML={getMarkdownText(content?.content)} />
    </Overlay>
  );
};

export default Page;
