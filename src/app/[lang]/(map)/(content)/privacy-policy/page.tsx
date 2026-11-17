import { readFile } from "fs/promises";
import path from "path";
import { NextPage } from "next";
import { getMarkdownText, PERMITTED_LANGUAGES } from "@/utils/content";
import Overlay from "@/app/[lang]/components/Overlay";
import { getDictionary } from "@/get-dictionary";
import "./style.css";

// Content lives in src/content/privacy-policy/*.md, rendered at build time
export const dynamic = "force-static";
export const dynamicParams = false;

interface PageProps {
  params: {
    lang: PERMITTED_LANGUAGES;
  };
}

const LANGUAGES: PERMITTED_LANGUAGES[] = ["en", "es", "pt"];

const getPolicy = async (lang: PERMITTED_LANGUAGES): Promise<string> => {
  const safeLang = LANGUAGES.includes(lang) ? lang : "en";
  return readFile(
    path.join(process.cwd(), "src/content/privacy-policy", `${safeLang}.md`),
    "utf8",
  );
};

export function generateStaticParams() {
  return LANGUAGES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params: { lang } }: PageProps) {
  const dictionary = await getDictionary(lang);
  return {
    title: `${dictionary?.menu?.privacy_policy} - ${dictionary?.home?.title}`,
  };
}

const Page: NextPage<PageProps> = async ({ params: { lang } }) => {
  const policy = await getPolicy(lang);

  return (
    <Overlay>
      <div
        className="privacy-policy"
        dangerouslySetInnerHTML={getMarkdownText(policy)}
      />
    </Overlay>
  );
};

export default Page;
